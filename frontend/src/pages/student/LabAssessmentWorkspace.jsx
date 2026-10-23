// ──────────────────────────────────────────────
// Student: Lab Assessment Coding Workspace
// ──────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Select,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Textarea,
  SimpleGrid,
  Flex,
  Icon,
  Tag,
  Divider,
  useToast,
  Code,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertDescription,
  Progress,
  Card,
  CardBody,
  Radio,
  RadioGroup,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  TimeIcon,
  CheckCircleIcon,
  WarningIcon,
  CloseIcon,
  CopyIcon,
  CheckIcon,
  ArrowForwardIcon,
  RepeatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import {
  startOrResumeLabApi,
  getStudentQuestionsApi,
  labRunCodeApi,
  labSubmitQuestionApi,
  getLabSubmissionStatusApi,
  submitLabAssessmentApi,
  submitLabMcqApi,
} from '../../api/labApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { parseCompilerErrors } from '../../utils/compilerDiagnostics';

const STARTER_TEMPLATES = {
  cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Read input and implement solution
    int n;
    if (cin >> n) {
        cout << n << "\\n";
    }

    return 0;
}
`,
  c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        printf("%d\\n", n);
    }
    return 0;
}
`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextInt()) {
            int n = scanner.nextInt();
            System.out.println(n);
        }
    }
}
`,
  python: `import sys

def main():
    lines = sys.stdin.read().split()
    if lines:
        print(lines[0])

if __name__ == '__main__':
    main()
`,
};

const MONACO_LANG_MAP = {
  cpp: 'cpp',
  c: 'c',
  java: 'java',
  python: 'python',
};

const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const LabAssessmentWorkspace = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Responsive theme tokens: crisp light surfaces in light mode, sleek dark surfaces in dark mode
  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#171918');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#A3B19B');
  const accentColor = useColorModeValue('#2F8D46', '#A3E635');
  const monacoTheme = useColorModeValue('vs', 'vs-dark');

  const timerCriticalBg = useColorModeValue('#FEE2E2', '#3D1515');
  const timerCriticalBorder = useColorModeValue('#FCA5A5', '#7F1D1D');
  const timerCriticalText = useColorModeValue('#991B1B', '#FCA5A5');
  const timerWarningBg = useColorModeValue('#FFEDD5', '#3D2510');
  const timerWarningBorder = useColorModeValue('#FDBA74', '#7C2D12');
  const timerWarningText = useColorModeValue('#9A3412', '#FDBA74');
  const timerNormalBg = useColorModeValue('#E8F5E9', '#1A3323');
  const timerNormalBorder = useColorModeValue('#A5D6A7', '#2E7D32');
  const timerNormalText = useColorModeValue('#174723', '#A5D6A7');

  const [isLoading, setIsLoading] = useState(true);
  const [lab, setLab] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Per-question state: codeMap[questionId][language]
  const [codeStore, setCodeStore] = useState({});
  const [langStore, setLangStore] = useState({});
  const [inputStore, setInputStore] = useState({});
  const [language, setLanguage] = useState('cpp');
  const [customInput, setCustomInput] = useState('');

  // Submissions map: questionSubmissions[questionId] = { status, marks_obtained, ... }
  const [submissionMap, setSubmissionMap] = useState({});

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const [runResultStore, setRunResultStore] = useState({});
  const [evalResultStore, setEvalResultStore] = useState({});
  const [activeOutputTab, setActiveOutputTab] = useState(0); // 0 = Run, 1 = Eval

  // Fullscreen & Editor Refs
  const workspaceRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Draggable Split Pane (Sliding Window)
  const defaultSplitPct = 42;
  const [splitPct, setSplitPct] = useState(() => {
    try {
      const saved = localStorage.getItem('wce_lab_split_ratio');
      const parsed = saved ? parseFloat(saved) : defaultSplitPct;
      return isNaN(parsed) || parsed < 20 || parsed > 80 ? defaultSplitPct : parsed;
    } catch {
      return defaultSplitPct;
    }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isConsoleMinimized, setIsConsoleMinimized] = useState(false);
  const splitContainerRef = useRef(null);

  const triggerEditorLayout = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, []);

  // Split-pane dragging handlers
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      if (typeof clientX !== 'number') return;
      const offsetX = clientX - rect.left;
      const totalWidth = rect.width;
      if (totalWidth <= 0) return;

      let newPct = (offsetX / totalWidth) * 100;
      if (newPct < 20) newPct = 20;
      if (newPct > 80) newPct = 80;

      setSplitPct(newPct);
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      try {
        localStorage.setItem('wce_lab_split_ratio', splitPct.toString());
      } catch {}
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.layout();
        }
      }, 60);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, splitPct]);

  // Window resize listener to keep Monaco perfectly sized
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSplitterMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleSplitterDoubleClick = () => {
    setSplitPct(defaultSplitPct);
    try {
      localStorage.setItem('wce_lab_split_ratio', defaultSplitPct.toString());
    } catch {}
    setTimeout(triggerEditorLayout, 60);
  };

  // Timer
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef(null);

  // Submit assessment modal
  const { isOpen: isFinishOpen, onOpen: onFinishOpen, onClose: onFinishClose } = useDisclosure();
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);

  // Fullscreen change handler
  useEffect(() => {
    const handleFsChange = () => {
      const fs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(fs);
      setTimeout(() => {
        editorRef.current?.layout();
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const elem = workspaceRef.current;
    if (!elem) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  // Anti-cheat clipboard prevention
  const notifyCopyPasteDisabled = () => {
    if (!toast.isActive('clipboard-blocked-alert')) {
      toast({
        id: 'clipboard-blocked-alert',
        title: 'Action Disabled',
        description: 'Copying and pasting is disabled in the IDE during assessments.',
        status: 'warning',
        duration: 2500,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Intercept keyboard shortcuts: Ctrl+C, Ctrl+V, Ctrl+X, Cmd+C, Cmd+V, Cmd+X, Shift+Insert
    editor.onKeyDown((e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (
        (isCtrlOrCmd && (e.keyCode === monaco.KeyCode.KeyC || e.keyCode === monaco.KeyCode.KeyV || e.keyCode === monaco.KeyCode.KeyX)) ||
        (e.shiftKey && e.keyCode === monaco.KeyCode.Insert)
      ) {
        e.preventDefault();
        e.stopPropagation();
        notifyCopyPasteDisabled();
      }
    });

    // Override Monaco internal commands for clipboard
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      notifyCopyPasteDisabled();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
      notifyCopyPasteDisabled();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
      notifyCopyPasteDisabled();
    });
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Insert, () => {
      notifyCopyPasteDisabled();
    });
  };

  // Initialize and load assessment attempt & questions
  useEffect(() => {
    let isMounted = true;

    const initAssessment = async () => {
      try {
        setIsLoading(true);

        // 1. Start or resume
        const startRes = await startOrResumeLabApi(labId);
        const startData = startRes.data?.data || {};
        const { attempt: att, alreadySubmitted } = startData;

        if (!isMounted) return;

        // If the assessment is already submitted or expired, redirect to result page immediately
        if (alreadySubmitted || att?.status === 'submitted' || att?.status === 'timed_out' || att?.status === 'expired') {
          navigate(`/student/lab-assessments/${labId}/result`, { replace: true });
          return;
        }

        setAttempt(att);

        // Fetch detailed questions with public test cases and MCQs
        const qRes = await getStudentQuestionsApi(labId);
        const qData = qRes.data?.data || {};

        // Extract ONLY coding questions
        const codingList =
          qData.codingQuestions ||
          startData.codingQuestions ||
          (qData.questions || startData.questions || []).filter(
            (q) => q.question_type === 'coding' || (!q.mcq_id && q.lab_question_id)
          );

        // Extract ONLY MCQs
        const mcqList =
          qData.mcqs ||
          startData.mcqs ||
          (qData.questions || startData.questions || []).filter(
            (q) => q.question_type === 'mcq' || Boolean(q.mcq_id)
          );

        const initialMcqSubs = qData.mcqSubmissions || startData.mcqSubmissions || {};

        setQuestions(codingList);
        setMcqs(mcqList);
        setMcqAnswers(initialMcqSubs);

        // 2. Fetch submission status to prefill saved code
        const statusRes = await getLabSubmissionStatusApi(labId);
        const subs = statusRes.data?.data?.submissions || [];
        const subLookup = {};
        const initialCode = {};

        subs.forEach((s) => {
          subLookup[s.lab_question_id] = s;
          if (s.source_code && s.language) {
            if (!initialCode[s.lab_question_id]) initialCode[s.lab_question_id] = {};
            initialCode[s.lab_question_id][s.language] = s.source_code;
          }
        });

        setSubmissionMap(subLookup);
        setCodeStore(initialCode);

        // Calculate timer
        if (att?.effective_deadline) {
          const deadline = new Date(att.effective_deadline).getTime();
          const now = Date.now();
          const diff = Math.max(0, Math.floor((deadline - now) / 1000));
          setRemainingSeconds(diff);
        }
      } catch (err) {
        if (!isMounted) return;
        const errMsg = err.response?.data?.message || '';
        if (errMsg.toLowerCase().includes('already submitted') || errMsg.toLowerCase().includes('expired')) {
          navigate(`/student/lab-assessments/${labId}/result`, { replace: true });
          return;
        }
        toast({
          title: 'Assessment Access Error',
          description: errMsg || 'Failed to start or resume assessment.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/student/lab-assessments');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAssessment();

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [labId, navigate, toast]);

  const handleTimeExpired = useCallback(() => {
    toast({
      title: 'Time Expired!',
      description: 'The allocated assessment duration has ended. Finalizing submissions...',
      status: 'warning',
      duration: 6000,
      isClosable: true,
    });
    // Auto-navigate to results
    navigate(`/student/lab-assessments/${labId}/result`);
  }, [labId, navigate, toast]);

  // Live countdown timer synced to server effective_deadline
  useEffect(() => {
    if (!attempt?.effective_deadline) return;

    const tick = () => {
      const deadline = new Date(attempt.effective_deadline).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((deadline - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        handleTimeExpired();
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [attempt?.effective_deadline, handleTimeExpired]);

  const codingItems = useMemo(
    () =>
      (questions || [])
        .filter((q) => q.question_type === 'coding' || (!q.mcq_id && q.lab_question_id))
        .map((q, idx) => ({ ...q, itemType: 'coding', questionNumber: idx + 1 })),
    [questions]
  );

  const mcqItems = useMemo(
    () =>
      (mcqs || [])
        .filter((m) => m.question_type === 'mcq' || Boolean(m.mcq_id))
        .map((m, idx) => ({ ...m, itemType: 'mcq', questionNumber: codingItems.length + idx + 1 })),
    [mcqs, codingItems.length]
  );

  const allQuestions = useMemo(() => [...codingItems, ...mcqItems], [codingItems, mcqItems]);

  const currentQuestion = allQuestions[selectedIndex] || allQuestions[0] || null;
  const isCoding = currentQuestion?.itemType === 'coding';
  const currentQId = isCoding ? currentQuestion?.lab_question_id : null;

  const handleSaveMcqAnswer = async (mcqId, option) => {
    setMcqAnswers((prev) => ({ ...prev, [mcqId]: option }));
    try {
      await submitLabMcqApi(labId, {
        mcq_id: mcqId,
        selected_option: option,
      });
      toast({
        title: `Option ${option} Saved`,
        status: 'success',
        duration: 1500,
        position: 'bottom-right',
      });
    } catch (err) {
      toast({
        title: 'Failed to save MCQ answer',
        description: err.response?.data?.message || 'Please retry.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Track previous question ID so we restore per-question code, inputs, and previous test results
  const prevQIdRef = useRef(null);

  useEffect(() => {
    if (currentQId && currentQId !== prevQIdRef.current) {
      prevQIdRef.current = currentQId;

      // Restore custom input for this question
      if (inputStore[currentQId] !== undefined) {
        setCustomInput(inputStore[currentQId]);
      } else if (isCoding && currentQuestion?.sample_input) {
        setCustomInput(currentQuestion.sample_input);
      } else {
        setCustomInput('');
      }

      // Restore past execution results for this question
      setRunResult(runResultStore[currentQId] || null);
      setEvalResult(evalResultStore[currentQId] || null);

      // Restore selected language for this question
      const savedLang = langStore[currentQId] || submissionMap[currentQId]?.language || 'cpp';
      setLanguage(savedLang);

      // Clear editor diagnostic markers on switch
      if (monacoRef.current && editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          monacoRef.current.editor.setModelMarkers(model, 'compiler', []);
        }
      }
    }
  }, [currentQId, isCoding, currentQuestion?.sample_input, submissionMap, langStore, inputStore, runResultStore, evalResultStore]);

  // Current editor code
  const currentCode =
    codeStore[currentQId]?.[language] ||
    STARTER_TEMPLATES[language] ||
    '';

  const handleCodeChange = (val) => {
    if (!currentQId) return;
    const newCode = val ?? '';
    setCodeStore((prev) => ({
      ...prev,
      [currentQId]: {
        ...(prev[currentQId] || {}),
        [language]: newCode,
      },
    }));

    try {
      localStorage.setItem(`wce_la_${labId}_code_${currentQId}_${language}`, newCode);
    } catch {}

    // Clear stale compiler markers as student writes new code
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, 'compiler', []);
      }
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (currentQId) {
      setLangStore((prev) => ({ ...prev, [currentQId]: newLang }));
    }
  };

  const handleCustomInputChange = (val) => {
    setCustomInput(val);
    if (currentQId) {
      setInputStore((prev) => ({ ...prev, [currentQId]: val }));
    }
  };

  const handleResetCode = () => {
    if (!currentQId) return;
    setCodeStore((prev) => ({
      ...prev,
      [currentQId]: {
        ...(prev[currentQId] || {}),
        [language]: STARTER_TEMPLATES[language],
      },
    }));
    toast({
      title: 'Code Reset',
      description: `Starter template restored for ${language.toUpperCase()}.`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // ── Previous & Next Question Navigation ───────
  const handlePrevQuestion = () => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setSelectedIndex((prev) => Math.min(allQuestions.length - 1, prev + 1));
  };

  // ── Run Code (Dry Run) ────────────────────────
  const handleRunCode = async () => {
    if (!currentQId) return;
    setIsRunning(true);
    setActiveOutputTab(0);

    try {
      const res = await labRunCodeApi(labId, {
        lab_question_id: currentQId,
        language,
        code: currentCode,
        input: customInput,
      });

      const runData = res.data?.data || {};
      setRunResult(runData);
      setRunResultStore((prev) => ({ ...prev, [currentQId]: runData }));

      // Set Monaco error markers if there is a compilation error or runtime error
      if (!runData.success && runData.error && monacoRef.current && editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const markers = parseCompilerErrors(runData.error, monacoRef.current);
          monacoRef.current.editor.setModelMarkers(model, 'compiler', markers);
        }
      }

      toast({
        title: 'Run Complete',
        status: runData.success ? 'success' : 'warning',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Execution Failed',
        description: err.response?.data?.message || 'Dry run failed.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // ── Submit Answer for Question ────────────────
  const handleSubmitQuestion = async () => {
    if (!currentQId) return;
    setIsSubmitting(true);
    setActiveOutputTab(1);

    try {
      const res = await labSubmitQuestionApi(labId, {
        lab_question_id: currentQId,
        language,
        code: currentCode,
      });

      const evaluation = res.data?.data || {};
      setEvalResult(evaluation);
      setEvalResultStore((prev) => ({ ...prev, [currentQId]: evaluation }));

      // If compilation error or runtime error during test cases, highlight in editor
      if (evaluation.error && monacoRef.current && editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const markers = parseCompilerErrors(evaluation.error, monacoRef.current);
          monacoRef.current.editor.setModelMarkers(model, 'compiler', markers);
        }
      }

      // Update local submissionMap
      setSubmissionMap((prev) => ({
        ...prev,
        [currentQId]: {
          status: evaluation.status,
          marks_obtained: evaluation.score,
          passed_test_cases: evaluation.passedTestCases,
          total_test_cases: evaluation.totalTestCases,
        },
      }));

      const isAccepted = evaluation.status === 'accepted';
      toast({
        title: isAccepted ? 'Question Accepted! 🎉' : `Evaluation: ${evaluation.status.replace(/_/g, ' ')}`,
        description: `Passed ${evaluation.passedTestCases}/${evaluation.totalTestCases} test cases (${evaluation.score}/${evaluation.totalMarks} marks).`,
        status: isAccepted ? 'success' : 'info',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Submission Failed',
        description: err.response?.data?.message || 'Could not evaluate question.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Final Assessment Submit ────────────────────
  const handleFinalSubmit = async () => {
    try {
      setIsFinalSubmitting(true);
      await submitLabAssessmentApi(labId);
      toast({
        title: 'Assessment Submitted Successfully! 🎉',
        description: 'Your final marks have been recorded.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        try {
          if (document.exitFullscreen) await document.exitFullscreen();
          else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
        } catch (_) {}
      }
      onFinishClose();
      navigate(`/student/lab-assessments/${labId}/result`);
    } catch (err) {
      toast({
        title: 'Final Submission Error',
        description: err.response?.data?.message || 'Failed to submit assessment.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsFinalSubmitting(false);
    }
  };

  const handleCopyInput = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <LoadingSpinner label="Setting up your sandboxed practical workspace..." />;
  }

  // Timer alert styling
  const isTimerCritical = remainingSeconds <= 180;
  const isTimerWarning = remainingSeconds <= 600;

  const codingAttemptedCount = Object.values(submissionMap).filter(
    (s) => s.status && s.status !== 'not_attempted'
  ).length;
  const mcqAnsweredCount = Object.keys(mcqAnswers).length;
  const attemptedCount = codingAttemptedCount + mcqAnsweredCount;

  return (
    <Flex
      ref={workspaceRef}
      direction="column"
      w="full"
      h={isFullscreen ? '100vh' : { base: 'auto', lg: 'calc(100vh - 84px)' }}
      maxH={isFullscreen ? '100vh' : 'none'}
      minH={isFullscreen ? '100vh' : { base: 'auto', lg: '650px' }}
      bg={isFullscreen ? surfaceBg : 'transparent'}
      p={isFullscreen ? 2 : 0}
      overflow={isFullscreen ? 'hidden' : { base: 'visible', lg: 'hidden' }}
      boxSizing="border-box"
      gap={2.5}
      position="relative"
    >
      {/* Global dragging overlay shield to ensure smooth slider operation over Monaco */}
      {isDragging && (
        <Box
          position="fixed"
          inset={0}
          zIndex={99999}
          cursor="col-resize"
          userSelect="none"
        />
      )}

      {/* Top Bar: Assessment Title, Timer, Question Navigation, Finish Button */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" px={4} py={2} borderRadius="xl" boxShadow="sm" flexShrink={0}>
        <Flex
          justify="space-between"
          align="center"
          direction={{ base: 'column', md: 'row' }}
          gap={3}
        >
          {/* Title & Attempt Info */}
          <VStack align="start" spacing={0}>
            <HStack>
              <Heading size="md" color={textColor} fontWeight="800">
                Practical Assessment
              </Heading>
              <Badge colorScheme="green" px={2} py={0.5} borderRadius="md">
                {allQuestions.length} Questions ({codingItems.length} Coding + {mcqItems.length} MCQs)
              </Badge>
            </HStack>
            <Text fontSize="xs" color={mutedText}>
              Hybrid practical assessment • All responses automatically synced
            </Text>
          </VStack>

          {/* Question Navigator with Previous & Next Buttons */}
          <HStack spacing={2} wrap="wrap" justify="center">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ChevronLeftIcon />}
              isDisabled={selectedIndex === 0}
              onClick={handlePrevQuestion}
              borderRadius="lg"
              px={3}
              fontSize="xs"
              color={textColor}
              borderColor={cardBorder}
              _hover={{ bg: surfaceBg }}
            >
              Prev
            </Button>

            {allQuestions.map((q, idx) => {
              const isCurrent = idx === selectedIndex;
              if (q.itemType === 'coding') {
                const sub = submissionMap[q.lab_question_id];
                const subStatus = sub?.status;

                let btnColorScheme = 'gray';
                if (subStatus === 'accepted') btnColorScheme = 'green';
                else if (subStatus === 'partially_correct') btnColorScheme = 'yellow';
                else if (
                  subStatus === 'wrong_answer' ||
                  subStatus === 'compilation_error' ||
                  subStatus === 'runtime_error'
                )
                  btnColorScheme = 'orange';

                return (
                  <Button
                    key={`c_${q.lab_question_id || idx}`}
                    size="sm"
                    variant={isCurrent ? 'solid' : 'outline'}
                    colorScheme={isCurrent ? 'green' : btnColorScheme}
                    onClick={() => setSelectedIndex(idx)}
                    borderRadius="lg"
                    px={3}
                    fontSize="xs"
                  >
                    Q{idx + 1}
                    {subStatus === 'accepted' && (
                      <Icon as={CheckCircleIcon} color={isCurrent ? 'white' : 'green.500'} ml={1} boxSize={3} />
                    )}
                  </Button>
                );
              } else {
                const hasAnswer = Boolean(mcqAnswers[q.mcq_id]);
                return (
                  <Button
                    key={`m_${q.mcq_id || idx}`}
                    size="sm"
                    variant={isCurrent ? 'solid' : 'outline'}
                    colorScheme={isCurrent ? 'purple' : hasAnswer ? 'green' : 'gray'}
                    onClick={() => setSelectedIndex(idx)}
                    borderRadius="lg"
                    px={3}
                    fontSize="xs"
                  >
                    Q{idx + 1}
                    {hasAnswer && (
                      <Badge ml={1} colorScheme="green" fontSize="2xs" px={1} borderRadius="sm">
                        {mcqAnswers[q.mcq_id]}
                      </Badge>
                    )}
                  </Button>
                );
              }
            })}

            <Button
              size="sm"
              variant="outline"
              rightIcon={<ChevronRightIcon />}
              isDisabled={selectedIndex === allQuestions.length - 1}
              onClick={handleNextQuestion}
              borderRadius="lg"
              px={3}
              fontSize="xs"
              color={textColor}
              borderColor={cardBorder}
              _hover={{ bg: surfaceBg }}
            >
              Next
            </Button>
          </HStack>

          {/* Timer and Finish Button */}
          <HStack spacing={4}>
            {/* Live Timer */}
            <HStack
              bg={isTimerCritical ? timerCriticalBg : isTimerWarning ? timerWarningBg : timerNormalBg}
              border="1px solid"
              borderColor={isTimerCritical ? timerCriticalBorder : isTimerWarning ? timerWarningBorder : timerNormalBorder}
              px={4}
              py={2}
              borderRadius="xl"
              boxShadow="sm"
            >
              <Icon
                as={TimeIcon}
                color={isTimerCritical ? timerCriticalText : isTimerWarning ? timerWarningText : accentColor}
                boxSize={4}
              />
              <Text
                fontFamily="mono"
                fontWeight="bold"
                fontSize="md"
                color={isTimerCritical ? timerCriticalText : isTimerWarning ? timerWarningText : timerNormalText}
              >
                {formatTimeRemaining(remainingSeconds)}
              </Text>
            </HStack>

            <Button
              colorScheme="brand"
              variant="outline"
              size="sm"
              onClick={onFinishOpen}
            >
              Finish Assessment
            </Button>
          </HStack>
        </Flex>
      </Card>

      {/* Main Workspace: 2 Sliding Columns for Coding, or Single Focused Card for MCQ */}
      {isCoding ? (
        <Flex
          ref={splitContainerRef}
          flex="1"
          w="full"
          minH="0"
          direction={{ base: 'column', lg: 'row' }}
          overflow="hidden"
          position="relative"
          gap={0}
        >
          {/* Left Panel: Problem Statement & Test Cases */}
          <Box
            w={{ base: '100%', lg: `${splitPct}%` }}
            h="100%"
            minH="0"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            pr={{ base: 0, lg: 1 }}
          >
            <Card
              bg={cardBg}
              borderColor={cardBorder}
              borderWidth="1px"
              h="100%"
              display="flex"
              flexDirection="column"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="sm"
            >
              {/* Scrollable Question Content */}
              <Box flex="1" minH="0" overflowY="auto" p={4}>
                {currentQuestion ? (
                  <VStack align="stretch" spacing={5}>
                  {/* Question Header */}
                  <VStack align="start" spacing={1}>
                    <HStack justify="space-between" w="full">
                      <HStack>
                        <Badge colorScheme="green" px={2} py={0.5} borderRadius="md">
                          Coding Question {selectedIndex + 1} of {allQuestions.length}
                        </Badge>
                        {currentQuestion.topic_title && (
                          <Badge colorScheme="cyan" variant="subtle" px={2} py={0.5} borderRadius="md" fontSize="2xs">
                            {currentQuestion.topic_title}
                          </Badge>
                        )}
                      </HStack>
                    </HStack>

                  <Heading size="md" color={textColor} pt={1} fontWeight="800">
                    {currentQuestion.title || `Problem #${selectedIndex + 1}`}
                  </Heading>
                </VStack>

                {/* Submission Status Alert for this question */}
                {submissionMap[currentQId] && (
                  <Alert
                    status={
                      submissionMap[currentQId].status === 'accepted'
                        ? 'success'
                        : submissionMap[currentQId].status === 'partially_correct'
                        ? 'info'
                        : 'warning'
                    }
                    borderRadius="lg"
                    fontSize="xs"
                    p={3}
                  >
                    <AlertIcon />
                    <AlertDescription>
                      Submitted Status: <strong>{submissionMap[currentQId].status.replace(/_/g, ' ').toUpperCase()}</strong> • Score: <strong>{submissionMap[currentQId].marks_obtained} / {currentQuestion.marks || 10}</strong>
                    </AlertDescription>
                  </Alert>
                )}

                <Divider borderColor={cardBorder} />

                {/* Problem Statement */}
                <Box>
                  <Text fontWeight="700" color={accentColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                    Problem Statement
                  </Text>
                  <Text color={textColor} fontSize="sm" whiteSpace="pre-wrap" lineHeight="tall">
                    {currentQuestion.problem_statement || 'No detailed problem statement provided for this question.'}
                  </Text>
                </Box>

                {/* Input Format */}
                {currentQuestion.input_format && (
                  <Box>
                    <Text fontWeight="700" color={accentColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                      Input Format
                    </Text>
                    <Text color={textColor} fontSize="sm" whiteSpace="pre-wrap">
                      {currentQuestion.input_format}
                    </Text>
                  </Box>
                )}

                {/* Output Format */}
                {currentQuestion.output_format && (
                  <Box>
                    <Text fontWeight="700" color={accentColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                      Output Format
                    </Text>
                    <Text color={textColor} fontSize="sm" whiteSpace="pre-wrap">
                      {currentQuestion.output_format}
                    </Text>
                  </Box>
                )}

                {/* Constraints */}
                {currentQuestion.constraints && (
                  <Box>
                    <Text fontWeight="700" color={accentColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                      Constraints
                    </Text>
                    <Code p={2.5} borderRadius="md" w="full" bg={surfaceBg} color={textColor} borderColor={cardBorder} borderWidth="1px" fontSize="xs" whiteSpace="pre-wrap">
                      {currentQuestion.constraints}
                    </Code>
                  </Box>
                )}

                {/* Sample Input / Output */}
                {currentQuestion.sample_input && (
                  <Box>
                    <Text fontWeight="700" color={accentColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                      Sample Input
                    </Text>
                    <Code p={3} borderRadius="md" w="full" bg={surfaceBg} color={textColor} borderColor={cardBorder} borderWidth="1px" fontSize="xs" whiteSpace="pre-wrap">
                      {currentQuestion.sample_input}
                    </Code>
                  </Box>
                )}

                {currentQuestion.sample_output && (
                  <Box>
                    <Text fontWeight="700" color={accentColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                      Sample Output
                    </Text>
                    <Code p={3} borderRadius="md" w="full" bg={surfaceBg} color={textColor} borderColor={cardBorder} borderWidth="1px" fontSize="xs" whiteSpace="pre-wrap">
                      {currentQuestion.sample_output}
                    </Code>
                  </Box>
                )}

                {/* Explanation */}
                {currentQuestion.explanation && (
                  <Box>
                    <Text fontWeight="700" color={accentColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                      Explanation
                    </Text>
                    <Text color={textColor} fontSize="xs" whiteSpace="pre-wrap">
                      {currentQuestion.explanation}
                    </Text>
                  </Box>
                )}

                {/* Public Test Cases Preview */}
                {currentQuestion.publicTestCases && currentQuestion.publicTestCases.length > 0 && (
                  <Box>
                    <Text fontWeight="700" color={accentColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider" mb={2}>
                      Visible Test Cases ({currentQuestion.publicTestCases.length})
                    </Text>
                    <VStack spacing={2} align="stretch">
                      {currentQuestion.publicTestCases.map((tc, idx) => (
                        <Box key={tc.lab_testcase_id || idx} p={3} bg={surfaceBg} borderRadius="md" border="1px solid" borderColor={cardBorder} fontSize="xs">
                          <Text color={accentColor} fontWeight="bold" mb={1}>Case #{idx + 1}:</Text>
                          <Text color={textColor}>Input: <code>{tc.input || '(empty)'}</code></Text>
                          <Text color={textColor}>Expected: <code>{tc.expected_output}</code></Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}
                  </VStack>
                ) : (
                  <Text color={mutedText}>Select a question to view problem description.</Text>
                )}
              </Box>

              {/* Fixed Bottom Question Navigation Bar (Docked Below Question Component) */}
              <Flex
                justify="space-between"
                align="center"
                px={4}
                py={2.5}
                bg={surfaceBg}
                borderTop="1px solid"
                borderColor={cardBorder}
                flexShrink={0}
              >
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ChevronLeftIcon />}
                  isDisabled={selectedIndex === 0}
                  onClick={handlePrevQuestion}
                  borderRadius="lg"
                  fontSize="xs"
                  color={textColor}
                  borderColor={cardBorder}
                  _hover={{ bg: cardBg }}
                >
                  Previous Question
                </Button>
                <Text fontSize="xs" fontWeight="bold" color={mutedText}>
                  Question {selectedIndex + 1} of {allQuestions.length}
                </Text>
                {selectedIndex === allQuestions.length - 1 ? (
                  <Button
                    size="sm"
                    colorScheme="green"
                    variant="solid"
                    px={4}
                    py={1.5}
                    fontWeight="semibold"
                    fontSize="xs"
                    borderRadius="lg"
                    rightIcon={<CheckCircleIcon boxSize={3.5} />}
                    onClick={onFinishOpen}
                  >
                    Finish Assessment
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    colorScheme="brand"
                    rightIcon={<ChevronRightIcon />}
                    onClick={handleNextQuestion}
                    borderRadius="lg"
                    fontSize="xs"
                  >
                    Next Question
                  </Button>
                )}
              </Flex>
            </Card>
        </Box>

        {/* Draggable Vertical Divider (Sliding Window Handle) */}
        <Box
          display={{ base: 'none', lg: 'flex' }}
          w="14px"
          mx="-3px"
          h="100%"
          alignItems="center"
          justifyContent="center"
          cursor="col-resize"
          userSelect="none"
          zIndex={10}
          role="separator"
          aria-label="Drag left or right to resize coding window"
          aria-valuenow={Math.round(splitPct)}
          onMouseDown={handleSplitterMouseDown}
          onTouchStart={handleSplitterMouseDown}
          onDoubleClick={handleSplitterDoubleClick}
          title="Drag left/right to resize • Double click to reset (42%)"
        >
          <Box
            w={isDragging ? '4px' : '3px'}
            h="100%"
            borderRadius="full"
            bg={isDragging ? accentColor : 'transparent'}
            _hover={{ bg: accentColor, w: '4px' }}
            transition="background 0.15s, width 0.15s"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              w="7px"
              h="38px"
              borderRadius="full"
              bg={isDragging ? accentColor : cardBorder}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="space-evenly"
              py={1}
              boxShadow={isDragging ? '0 0 10px rgba(47, 141, 70, 0.7)' : 'none'}
            >
              <Box w="2px" h="2px" borderRadius="full" bg={textColor} opacity={0.7} />
              <Box w="2px" h="2px" borderRadius="full" bg={textColor} opacity={0.7} />
              <Box w="2px" h="2px" borderRadius="full" bg={textColor} opacity={0.7} />
            </Box>
          </Box>
        </Box>

        {/* Right Panel: Code Editor (top flex) + Console Output (bottom docked) */}
        <Box
          w={{ base: '100%', lg: `${100 - splitPct}%` }}
          h="100%"
          minH="0"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          gap={3}
          pl={{ base: 0, lg: 1 }}
        >
          {/* Editor Container Card */}
          <Card
            bg={cardBg}
            borderColor={cardBorder}
            borderWidth="1px"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="sm"
            flex="1"
            minH="220px"
            display="flex"
            flexDirection="column"
          >
            {/* Editor Header Bar */}
            <Flex justify="space-between" align="center" bg={surfaceBg} px={4} py={2} borderBottom="1px solid" borderColor={cardBorder} wrap="wrap" gap={2} flexShrink={0}>
              <HStack spacing={3}>
                <Text fontSize="xs" color={textColor} fontWeight="bold">
                  Language:
                </Text>
                <Select
                  size="xs"
                  w="130px"
                  bg={cardBg}
                  borderColor={cardBorder}
                  color={textColor}
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  <option value="cpp">C++ (g++)</option>
                  <option value="c">C (gcc)</option>
                  <option value="java">Java (openjdk)</option>
                  <option value="python">Python 3</option>
                </Select>
              </HStack>

              <HStack spacing={2}>
                <Tooltip label={isFullscreen ? 'Exit Full Screen (Esc)' : 'Enter Full Screen'} fontSize="xs">
                  <Button
                    size="xs"
                    variant={isFullscreen ? 'solid' : 'ghost'}
                    colorScheme={isFullscreen ? 'green' : 'gray'}
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
                  >
                    {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
                  </Button>
                </Tooltip>
                <Tooltip label="Reset starter code" fontSize="xs">
                  <Button size="xs" variant="ghost" colorScheme="gray" onClick={handleResetCode} leftIcon={<RepeatIcon />}>
                    Reset
                  </Button>
                </Tooltip>
                <Button
                  size="xs"
                  colorScheme="green"
                  variant="outline"
                  onClick={handleRunCode}
                  isLoading={isRunning}
                  loadingText="Running..."
                >
                  Run Code
                </Button>
                <Button
                  size="xs"
                  colorScheme="green"
                  onClick={handleSubmitQuestion}
                  isLoading={isSubmitting}
                  loadingText="Evaluating..."
                >
                  Submit Answer
                </Button>
              </HStack>
            </Flex>

            {/* Monaco Editor with Anti-Cheat Copy-Paste Prevention */}
            <Box
              flex="1"
              h="100%"
              minH="0"
              w="full"
              position="relative"
              overflow="hidden"
              onPaste={(e) => {
                e.preventDefault();
                e.stopPropagation();
                notifyCopyPasteDisabled();
              }}
              onCopy={(e) => {
                e.preventDefault();
                e.stopPropagation();
                notifyCopyPasteDisabled();
              }}
              onCut={(e) => {
                e.preventDefault();
                e.stopPropagation();
                notifyCopyPasteDisabled();
              }}
            >
              <Editor
                height="100%"
                width="100%"
                language={MONACO_LANG_MAP[language] || 'cpp'}
                theme={monacoTheme}
                value={currentCode}
                onChange={handleCodeChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  lineNumbers: 'on',
                  tabSize: 4,
                  contextmenu: false, // Disables right-click menu (no copy/paste via context menu)
                  copyWithSyntaxHighlighting: false,
                }}
              />
            </Box>
          </Card>

            {/* Bottom Panel: Custom Input & Outputs with collapse/expand */}
            <Card
              bg={cardBg}
              borderColor={cardBorder}
              borderWidth="1px"
              borderRadius="xl"
              p={3}
              h={isConsoleMinimized ? '44px' : { base: '240px', lg: '250px' }}
              minH={isConsoleMinimized ? '44px' : '180px'}
              maxH={isConsoleMinimized ? '44px' : '360px'}
              flexShrink={0}
              boxShadow="sm"
              display="flex"
              flexDirection="column"
              overflow="hidden"
              transition="height 0.2s ease"
            >
              <Tabs
                variant="line"
                colorScheme="green"
                index={activeOutputTab}
                onChange={(idx) => {
                  setActiveOutputTab(idx);
                  if (isConsoleMinimized) {
                    setIsConsoleMinimized(false);
                    setTimeout(triggerEditorLayout, 220);
                  }
                }}
                display="flex"
                flexDirection="column"
                h="100%"
                minH="0"
              >
                <Flex justify="space-between" align="center" borderBottom="1px solid" borderColor={cardBorder} pb={1} flexShrink={0}>
                  <TabList borderBottom="none" mb="-1px">
                    <Tab color={mutedText} _selected={{ color: accentColor, borderColor: accentColor, fontWeight: 'bold' }} fontSize="xs" py={1} px={3}>
                      Console Output {runResult && (runResult.success ? '✅' : '⚠️')}
                    </Tab>
                    <Tab color={mutedText} _selected={{ color: accentColor, borderColor: accentColor, fontWeight: 'bold' }} fontSize="xs" py={1} px={3}>
                      Evaluation Results {evalResult && `(${evalResult.passedTestCases}/${evalResult.totalTestCases})`}
                    </Tab>
                    <Tab color={mutedText} _selected={{ color: accentColor, borderColor: accentColor, fontWeight: 'bold' }} fontSize="xs" py={1} px={3}>
                      Custom Input
                    </Tab>
                  </TabList>

                  <Button
                    size="xs"
                    variant="ghost"
                    color={mutedText}
                    _hover={{ color: textColor }}
                    onClick={() => {
                      setIsConsoleMinimized((prev) => !prev);
                      setTimeout(triggerEditorLayout, 220);
                    }}
                    title={isConsoleMinimized ? 'Expand Console' : 'Minimize Console'}
                    px={2}
                    h="24px"
                    fontSize="2xs"
                  >
                    {isConsoleMinimized ? '▲ Expand' : '▼ Minimize'}
                  </Button>
                </Flex>

                {!isConsoleMinimized && (
                  <TabPanels flex="1" minH="0" overflowY="auto" pt={1}>
                  {/* Tab 0: Run Console Output */}
                  <TabPanel px={0} py={3}>
                    {isRunning ? (
                      <LoadingSpinner label="Running code in Docker sandbox..." />
                    ) : runResult ? (
                      <VStack align="stretch" spacing={2} fontSize="xs">
                        <HStack justify="space-between">
                          <Badge colorScheme={runResult.success ? 'green' : 'red'}>
                            {runResult.success ? 'Execution Succeeded' : runResult.errorType || 'Execution Error'}
                          </Badge>
                          {runResult.executionTime !== undefined && (
                            <Text color={mutedText}>Execution time: {runResult.executionTime}ms</Text>
                          )}
                        </HStack>

                        {runResult.output !== undefined && runResult.output !== null && (
                          <Box>
                            <Text color={mutedText} mb={1}>Standard Output:</Text>
                            <Code p={3} borderRadius="md" w="full" bg={surfaceBg} color={textColor} borderColor={cardBorder} borderWidth="1px" display="block" whiteSpace="pre-wrap">
                              {runResult.output !== '' ? runResult.output : '(No output returned)'}
                            </Code>
                          </Box>
                        )}

                        {runResult.error && (
                          <Alert
                            status="error"
                            variant="subtle"
                            borderRadius="lg"
                            p={3}
                            flexDirection="column"
                            alignItems="start"
                          >
                            <HStack mb={1}>
                              <AlertIcon />
                              <AlertDescription fontWeight="bold" fontSize="xs">
                                {runResult.errorType ? runResult.errorType.replace(/_/g, ' ') : 'Compilation / Runtime Error'}
                              </AlertDescription>
                            </HStack>
                            <Text fontSize="2xs" color={mutedText} mb={2}>
                              Compiler diagnostics and line numbers are highlighted directly in the editor above.
                            </Text>
                            <Code p={3} borderRadius="md" w="full" bg={surfaceBg} color="red.500" borderColor="red.400" borderWidth="1px" display="block" whiteSpace="pre-wrap" fontSize="xs">
                              {runResult.error}
                            </Code>
                          </Alert>
                        )}
                      </VStack>
                    ) : (
                      <Text color={mutedText} fontSize="xs" py={4} textAlign="center">
                        Click "Run Code" to test against custom or sample input without official marks.
                      </Text>
                    )}
                  </TabPanel>

                  {/* Tab 1: Official Submission Evaluation */}
                  <TabPanel px={0} py={3}>
                    {isSubmitting ? (
                      <LoadingSpinner label="Executing code against hidden and visible test cases..." />
                    ) : evalResult ? (
                      <VStack align="stretch" spacing={3} fontSize="xs">
                        {/* Summary Header */}
                        <Flex justify="space-between" align="center" bg={surfaceBg} p={3} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
                          <HStack>
                            <Badge
                              colorScheme={
                                evalResult.status === 'accepted'
                                  ? 'green'
                                  : evalResult.status === 'partially_correct'
                                  ? 'yellow'
                                  : 'red'
                              }
                              px={2}
                              py={1}
                              borderRadius="md"
                              fontSize="xs"
                              textTransform="uppercase"
                            >
                              {evalResult.status.replace(/_/g, ' ')}
                            </Badge>
                            <Text color={textColor} fontWeight="bold">
                              {evalResult.passedTestCases} of {evalResult.totalTestCases} Test Cases Passed
                            </Text>
                          </HStack>
                          <Text color={accentColor} fontWeight="bold" fontSize="sm">
                            Score: {evalResult.score} / {evalResult.totalMarks} Marks
                          </Text>
                        </Flex>

                        {/* Compilation Error Notice if any */}
                        {evalResult.error && (
                          <Alert status="error" variant="subtle" borderRadius="lg" p={3} flexDirection="column" alignItems="start">
                            <HStack mb={1}>
                              <AlertIcon />
                              <AlertDescription fontWeight="bold" fontSize="xs">
                                Compilation / Evaluation Error
                              </AlertDescription>
                            </HStack>
                            <Text fontSize="2xs" color={mutedText} mb={2}>
                              Diagnostics with line numbers are marked in your code editor.
                            </Text>
                            <Code p={3} borderRadius="md" w="full" bg={surfaceBg} color="red.500" borderColor="red.400" borderWidth="1px" display="block" whiteSpace="pre-wrap" fontSize="xs">
                              {evalResult.error}
                            </Code>
                          </Alert>
                        )}

                        {/* Test Case Cards */}
                        {evalResult.testCaseResults && evalResult.testCaseResults.length > 0 && (
                          <VStack spacing={2} align="stretch" maxH="240px" overflowY="auto">
                            {evalResult.testCaseResults.map((tc, idx) => (
                              <Box
                                key={tc.testCaseId || idx}
                                p={3}
                                borderRadius="lg"
                                bg={surfaceBg}
                                border="1px solid"
                                borderColor={tc.passed ? 'green.400' : 'red.400'}
                              >
                                <HStack justify="space-between">
                                  <HStack>
                                    <Icon
                                      as={tc.passed ? CheckCircleIcon : CloseIcon}
                                      color={tc.passed ? 'green.500' : 'red.500'}
                                      boxSize={3.5}
                                    />
                                    <Text color={textColor} fontWeight="bold">
                                      {tc.isHidden ? `Hidden Test Case #${idx + 1}` : `Visible Test Case #${idx + 1}`}
                                    </Text>
                                    <Badge size="xs" colorScheme={tc.passed ? 'green' : 'red'}>
                                      {tc.passed ? 'PASSED' : tc.status || 'FAILED'}
                                    </Badge>
                                  </HStack>
                                  {tc.executionTime !== undefined && (
                                    <Text color={mutedText} fontSize="2xs">{tc.executionTime}ms</Text>
                                  )}
                                </HStack>

                                {/* Only show input/expected output for visible test cases */}
                                {!tc.isHidden ? (
                                  <Box mt={2} pt={2} borderTop="1px solid" borderColor={cardBorder} color={textColor} fontSize="xs">
                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2}>
                                      <Box>
                                        <Text color={mutedText} fontSize="2xs" fontWeight="bold">INPUT:</Text>
                                        <Code p={1.5} borderRadius="sm" w="full" bg={cardBg} color={textColor} fontSize="2xs" whiteSpace="pre-wrap">
                                          {tc.input || '(empty)'}
                                        </Code>
                                      </Box>
                                      <Box>
                                        <Text color={mutedText} fontSize="2xs" fontWeight="bold">EXPECTED OUTPUT:</Text>
                                        <Code p={1.5} borderRadius="sm" w="full" bg={cardBg} color="green.500" fontSize="2xs" whiteSpace="pre-wrap">
                                          {tc.expectedOutput}
                                        </Code>
                                      </Box>
                                      <Box>
                                        <Text color={mutedText} fontSize="2xs" fontWeight="bold">YOUR OUTPUT:</Text>
                                        <Code p={1.5} borderRadius="sm" w="full" bg={cardBg} color={tc.passed ? 'green.500' : 'red.500'} fontSize="2xs" whiteSpace="pre-wrap">
                                          {tc.actualOutput !== undefined && tc.actualOutput !== null && tc.actualOutput !== '' ? tc.actualOutput : '(no output)'}
                                        </Code>
                                      </Box>
                                    </SimpleGrid>
                                  </Box>
                                ) : (
                                  <Box mt={1.5} pt={1.5} borderTop="1px solid" borderColor={cardBorder}>
                                    <Text color={mutedText} fontSize="2xs" fontStyle="italic">
                                      🔒 Hidden test case (input and expected output obscured for assessment integrity)
                                    </Text>
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </VStack>
                    ) : (
                      <Text color={mutedText} fontSize="xs" py={4} textAlign="center">
                        Click "Submit Answer" to officially evaluate this question against all test cases.
                      </Text>
                    )}
                  </TabPanel>

                  {/* Tab 2: Custom Input */}
                  <TabPanel px={0} py={3}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text color={mutedText} fontSize="xs" fontWeight="medium">
                        Standard Input (stdin) for Run Code:
                      </Text>
                      {currentQuestion?.sample_input && (
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme="green"
                          onClick={() => setCustomInput(currentQuestion.sample_input)}
                        >
                          Reset to Sample Input
                        </Button>
                      )}
                    </Flex>
                    <Textarea
                      size="xs"
                      rows={4}
                      bg={surfaceBg}
                      borderColor={cardBorder}
                      color={textColor}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter custom standard input here..."
                    />
                  </TabPanel>
                </TabPanels>
              )}
            </Tabs>
          </Card>
        </Box>
      </Flex>
      ) : (
        /* MCQ View: Centered in the middle with polished card design */
        <Flex
          flex="1"
          minH="0"
          w="full"
          overflowY="auto"
          alignItems="center"
          justifyContent="center"
          py={{ base: 4, md: 8 }}
          px={{ base: 3, md: 6 }}
        >
          <Card
            bg={cardBg}
            borderColor={cardBorder}
            borderWidth="1px"
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            boxShadow="xl"
            w="full"
            maxW="880px"
          >
            <VStack align="stretch" spacing={6}>
              {/* Question Header Badges */}
              <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                <HStack spacing={2}>
                  <Badge colorScheme="purple" px={3} py={1} borderRadius="md" fontSize="xs" fontWeight="bold">
                    MCQ — Question {selectedIndex + 1} of {allQuestions.length}
                  </Badge>
                  {currentQuestion?.topic_title && (
                    <Badge colorScheme="cyan" variant="subtle" px={2.5} py={0.5} borderRadius="md" fontSize="xs">
                      {currentQuestion.topic_title}
                    </Badge>
                  )}
                  {currentQuestion?.marks && (
                    <Badge colorScheme="green" variant="subtle" px={2.5} py={0.5} borderRadius="md" fontSize="xs">
                      {currentQuestion.marks} Marks
                    </Badge>
                  )}
                </HStack>
                <HStack spacing={2.5}>
                  {mcqAnswers[currentQuestion?.mcq_id] ? (
                    <Badge colorScheme="green" px={3} py={1} borderRadius="md" fontSize="xs">
                      ✓ Saved Answer: Option {mcqAnswers[currentQuestion?.mcq_id]}
                    </Badge>
                  ) : (
                    <Badge colorScheme="gray" px={3} py={1} borderRadius="md" fontSize="xs">
                      Not Answered Yet
                    </Badge>
                  )}
                  <Tooltip label={isFullscreen ? 'Exit Full Screen (Esc)' : 'Enter Full Screen'} fontSize="xs">
                    <Button
                      size="xs"
                      variant={isFullscreen ? 'solid' : 'outline'}
                      colorScheme={isFullscreen ? 'green' : 'gray'}
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
                    >
                      {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
                    </Button>
                  </Tooltip>
                </HStack>
              </Flex>

              {/* Question Statement */}
              <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="700" color={textColor} lineHeight="tall">
                {currentQuestion?.question_text}
              </Text>

              <Divider borderColor={cardBorder} />

              {/* Options List */}
              <RadioGroup
                value={mcqAnswers[currentQuestion?.mcq_id] || ''}
                onChange={(val) => handleSaveMcqAnswer(currentQuestion?.mcq_id, val)}
              >
                <VStack spacing={3.5} align="stretch">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const isSelected = mcqAnswers[currentQuestion?.mcq_id] === optKey;
                    const optText = currentQuestion?.[`option_${optKey.toLowerCase()}`];
                    if (!optText) return null;
                    return (
                      <Box
                        key={optKey}
                        p={4}
                        borderRadius="xl"
                        border="2px solid"
                        borderColor={isSelected ? accentColor : cardBorder}
                        bg={isSelected ? surfaceBg : 'transparent'}
                        cursor="pointer"
                        onClick={() => handleSaveMcqAnswer(currentQuestion?.mcq_id, optKey)}
                        transition="all 0.18s ease"
                        _hover={{
                          borderColor: isSelected ? accentColor : textColor,
                          bg: surfaceBg,
                          transform: 'translateY(-1px)',
                        }}
                      >
                        <HStack spacing={4} align="center">
                          <Radio value={optKey} colorScheme="green" size="lg" isChecked={isSelected}>
                            <Badge
                              colorScheme={isSelected ? 'green' : 'gray'}
                              fontSize="xs"
                              fontWeight="bold"
                              px={2.5}
                              py={0.5}
                              borderRadius="md"
                            >
                              OPTION {optKey}
                            </Badge>
                          </Radio>
                          <Text fontSize={{ base: 'sm', md: 'md' }} color={textColor} fontWeight={isSelected ? '600' : 'normal'}>
                            {optText}
                          </Text>
                        </HStack>
                      </Box>
                    );
                  })}
                </VStack>
              </RadioGroup>

              {/* Bottom Navigation */}
              <Flex justify="space-between" align="center" pt={4} borderTop="1px solid" borderColor={cardBorder}>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ChevronLeftIcon />}
                  isDisabled={selectedIndex === 0}
                  onClick={handlePrevQuestion}
                  borderRadius="lg"
                  fontSize="xs"
                  color={textColor}
                  borderColor={cardBorder}
                  _hover={{ bg: surfaceBg }}
                >
                  Previous Question
                </Button>
                <Text fontSize="xs" fontWeight="bold" color={mutedText}>
                  Question {selectedIndex + 1} of {allQuestions.length}
                </Text>
                {selectedIndex === allQuestions.length - 1 ? (
                  <Button
                    size="sm"
                    colorScheme="green"
                    variant="solid"
                    px={4}
                    py={1.5}
                    fontWeight="semibold"
                    fontSize="xs"
                    borderRadius="lg"
                    rightIcon={<CheckCircleIcon boxSize={3.5} />}
                    onClick={onFinishOpen}
                  >
                    Finish Assessment
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    colorScheme="brand"
                    rightIcon={<ChevronRightIcon />}
                    onClick={handleNextQuestion}
                    borderRadius="lg"
                    fontSize="xs"
                  >
                    Next Question
                  </Button>
                )}
              </Flex>
            </VStack>
          </Card>
        </Flex>
      )}

      {/* Finish Assessment Confirmation Modal */}
      <Modal
        isOpen={isFinishOpen}
        onClose={onFinishClose}
        isCentered
        size="md"
        portalProps={{ containerRef: workspaceRef }}
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px" color={textColor} borderRadius="2xl">
          <ModalHeader color={textColor}>Final Assessment Submission</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color={textColor}>
                Are you sure you want to finish and submit the assessment now?
              </Text>

              <Box bg={surfaceBg} p={4} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
                <VStack align="stretch" spacing={2} fontSize="sm">
                  <HStack justify="space-between">
                    <Text color={mutedText}>Coding Problems Attempted:</Text>
                    <Text fontWeight="bold" color={accentColor}>
                      {codingAttemptedCount} of {questions.length}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color={mutedText}>MCQs Answered:</Text>
                    <Text fontWeight="bold" color="purple.500">
                      {mcqAnsweredCount} of {mcqs.length}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" pt={1} borderTop="1px solid" borderColor={cardBorder}>
                    <Text color={mutedText}>Total Attempted:</Text>
                    <Text fontWeight="bold" color={accentColor}>
                      {attemptedCount} of {allQuestions.length}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color={mutedText}>Remaining Time:</Text>
                    <Text fontWeight="bold" color="orange.600">
                      {formatTimeRemaining(remainingSeconds)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {attemptedCount < allQuestions.length && (
                <Alert status="warning" borderRadius="md" fontSize="xs">
                  <AlertIcon />
                  <AlertDescription>
                    You have {allQuestions.length - attemptedCount} unsubmitted question(s). Unsubmitted questions will receive 0 marks.
                  </AlertDescription>
                </Alert>
              )}

              <Text fontSize="xs" color={mutedText}>
                Once submitted, you will not be able to modify any answers or resume this assessment.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onFinishClose}>
              Continue Working
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleFinalSubmit}
              isLoading={isFinalSubmitting}
              loadingText="Finalizing..."
            >
              Confirm & Submit All
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default LabAssessmentWorkspace;
