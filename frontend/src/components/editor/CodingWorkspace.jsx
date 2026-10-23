// ──────────────────────────────────────────────
// CodingWorkspace — Full Sandboxed Monaco Editor IDE
// ──────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Select,
  Card,
  CardBody,
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
  useColorModeValue,
} from '@chakra-ui/react';
import {
  ArrowForwardIcon,
  RepeatIcon,
  CheckCircleIcon,
  WarningIcon,
  TimeIcon,
  CopyIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { executeCodeApi, submitCodeApi } from '../../api/editorApi';
import { parseCompilerErrors } from '../../utils/compilerDiagnostics';

const DEFAULT_TEMPLATES = {
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Read input and write solution
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

const CodingWorkspace = ({
  assessmentTitle = 'Coding Assessment',
  questions = [],
  assessmentType = 'topic',
  roomId = null,
  onCompleted = null,
}) => {
  const toast = useToast();

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [language, setLanguage] = useState('cpp');
  const [codeMap, setCodeMap] = useState({
    cpp: DEFAULT_TEMPLATES.cpp,
    c: DEFAULT_TEMPLATES.c,
    java: DEFAULT_TEMPLATES.java,
    python: DEFAULT_TEMPLATES.python,
  });

  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState(0); // 0 = Output, 1 = Test Cases
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fullscreen & Editor Refs
  const workspaceRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Draggable Split Pane (Sliding Window)
  const defaultSplitPct = 42;
  const [splitPct, setSplitPct] = useState(() => {
    try {
      const saved = localStorage.getItem('wce_coding_split_ratio');
      const parsed = saved ? parseFloat(saved) : defaultSplitPct;
      return isNaN(parsed) || parsed < 20 || parsed > 80 ? defaultSplitPct : parsed;
    } catch {
      return defaultSplitPct;
    }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isConsoleMinimized, setIsConsoleMinimized] = useState(false);
  const splitContainerRef = useRef(null);

  const triggerEditorLayout = () => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  };

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
        localStorage.setItem('wce_coding_split_ratio', splitPct.toString());
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

  // Window resize listener
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
      localStorage.setItem('wce_coding_split_ratio', defaultSplitPct.toString());
    } catch {}
    setTimeout(triggerEditorLayout, 60);
  };

  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#171918');
  const codeBoxBg = useColorModeValue('#F5F7F5', '#171918');
  const codeBoxBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#B8C0B9');
  const accentColor = useColorModeValue('#2F8D46', '#A3E635');
  const tcBorderSuccess = useColorModeValue('#C8E6C9', '#2E7D32');
  const tcBorderFail = useColorModeValue('#FFCDD2', '#C62828');
  const monacoTheme = useColorModeValue('vs', 'vs-dark');

  const currentQuestion = questions[selectedQuestionIndex] || null;
  const currentQId = currentQuestion ? (currentQuestion.tca_question_id || currentQuestion.scca_id) : null;

  const prevQIdRef = useRef(null);

  // Fullscreen change listener
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

  // Initialize sample input into custom input when question changes
  useEffect(() => {
    if (currentQId && currentQId !== prevQIdRef.current) {
      prevQIdRef.current = currentQId;
      if (currentQuestion && currentQuestion.sample_input) {
        setCustomInput(currentQuestion.sample_input);
      } else {
        setCustomInput('');
      }
      setRunResult(null);
      setSubmitResult(null);

      // Clear Monaco error markers on question switch
      if (monacoRef.current && editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          monacoRef.current.editor.setModelMarkers(model, 'compiler', []);
        }
      }
    }
  }, [currentQId, currentQuestion]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
  };

  const handleCodeChange = (newCode) => {
    setCodeMap((prev) => ({
      ...prev,
      [language]: newCode ?? '',
    }));

    // Clear stale compiler markers when typing
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, 'compiler', []);
      }
    }
  };

  const handleResetCode = () => {
    setCodeMap((prev) => ({
      ...prev,
      [language]: DEFAULT_TEMPLATES[language],
    }));
    toast({
      title: 'Code Reset',
      description: `Starter template restored for ${language.toUpperCase()}.`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Question navigation handlers
  const handlePrevQuestion = () => {
    setSelectedQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setSelectedQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1));
  };

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

  // Run Code (Dry run with custom stdin)
  const handleRunCode = async () => {
    const code = codeMap[language] || '';
    if (!code.trim()) {
      toast({
        title: 'Empty Code',
        description: 'Please write code before running.',
        status: 'warning',
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      setIsRunning(true);
      setActiveTab(0);
      const res = await executeCodeApi({
        roomId,
        language,
        code,
        input: customInput,
      });

      setRunResult(res.data);

      // Highlight compiler or runtime diagnostics in editor
      if (!res.data?.success && res.data?.error && monacoRef.current && editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const markers = parseCompilerErrors(res.data.error, monacoRef.current);
          monacoRef.current.editor.setModelMarkers(model, 'compiler', markers);
        }
      }

      if (res.data?.success) {
        toast({
          title: 'Code Executed',
          description: `Finished in ${res.data.executionTime || 0}ms`,
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
      } else {
        toast({
          title: res.data?.errorType || 'Execution Error',
          description: res.data?.error || 'Execution encountered an issue.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Execution failed.';
      setRunResult({
        success: false,
        errorType: 'ERROR',
        error: msg,
      });
      toast({
        title: 'Execution Failed',
        description: msg,
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution (Graded against test cases)
  const handleSubmitCode = async () => {
    if (!currentQId) return;
    const code = codeMap[language] || '';
    if (!code.trim()) {
      toast({
        title: 'Empty Code',
        description: 'Please write code before submitting.',
        status: 'warning',
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setActiveTab(1); // Switch to Test Cases tab
      const res = await submitCodeApi({
        roomId,
        language,
        code,
        questionId: currentQId,
        assessmentType,
      });

      setSubmitResult(res.data);

      // Highlight compiler or runtime diagnostics in editor
      if (res.data?.error && monacoRef.current && editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const markers = parseCompilerErrors(res.data.error, monacoRef.current);
          monacoRef.current.editor.setModelMarkers(model, 'compiler', markers);
        }
      }

      const passed = res.data?.passedTestCases;
      const total = res.data?.totalTestCases;

      if (res.data?.isCompleted || res.data?.status === 'PASSED') {
        toast({
          title: 'All Test Cases Passed! 🎉',
          description: `Score: ${res.data.score}/${res.data.totalMarks} (${passed}/${total} test cases passed)`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        if (onCompleted) onCompleted(res.data);
      } else {
        toast({
          title: 'Submission Evaluated',
          description: `Passed ${passed || 0}/${total || 0} test cases. Score: ${res.data?.score || 0}/${res.data?.totalMarks || 10}`,
          status: 'info',
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Submission failed.';
      setSubmitResult({
        success: false,
        error: msg,
      });
      toast({
        title: 'Submission Error',
        description: msg,
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm">
        <CardBody p={8} textAlign="center">
          <Icon as={TimeIcon} w={8} h={8} color={accentColor} mb={3} />
          <Heading size="md" color={textColor}>No Coding Problems Available</Heading>
          <Text color={mutedText} fontSize="sm" mt={2}>
            Your instructor has not configured coding questions for this assessment yet.
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Flex
      ref={workspaceRef}
      direction="column"
      w="full"
      h={isFullscreen ? '100vh' : { base: 'auto', lg: 'calc(100vh - 84px)' }}
      maxH={isFullscreen ? '100vh' : 'none'}
      minH={isFullscreen ? '100vh' : { base: 'auto', lg: '650px' }}
      bg={isFullscreen ? surfaceBg : 'transparent'}
      p={isFullscreen ? 3 : 0}
      overflow={isFullscreen ? 'hidden' : { base: 'visible', lg: 'hidden' }}
      boxSizing="border-box"
      gap={3}
      position="relative"
    >
      {/* Global dragging overlay shield */}
      {isDragging && (
        <Box
          position="fixed"
          inset={0}
          zIndex={99999}
          cursor="col-resize"
          userSelect="none"
        />
      )}

      {/* ── Top Bar: Title & Question Selector ────────── */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm" flexShrink={0}>
        <CardBody py={2.5} px={4}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={3}>
              <Heading size="md" color={textColor}>
                {assessmentTitle}
              </Heading>
              <Badge colorScheme="green" px={2.5} py={0.5} borderRadius="full">
                {questions.length} Question{questions.length > 1 ? 's' : ''}
              </Badge>
            </HStack>

            {/* Question Selector tabs if multiple */}
            {questions.length > 1 && (
              <HStack spacing={2} wrap="wrap">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ChevronLeftIcon />}
                  isDisabled={selectedQuestionIndex === 0}
                  onClick={handlePrevQuestion}
                  borderColor={cardBorder}
                >
                  Prev
                </Button>
                {questions.map((q, idx) => (
                  <Button
                    key={q.tca_question_id || q.scca_id || idx}
                    size="sm"
                    variant={selectedQuestionIndex === idx ? 'solid' : 'outline'}
                    colorScheme="green"
                    borderColor={cardBorder}
                    onClick={() => setSelectedQuestionIndex(idx)}
                  >
                    Q{idx + 1}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  rightIcon={<ChevronRightIcon />}
                  isDisabled={selectedQuestionIndex === questions.length - 1}
                  onClick={handleNextQuestion}
                  borderColor={cardBorder}
                >
                  Next
                </Button>
              </HStack>
            )}
          </Flex>
        </CardBody>
      </Card>

      {/* ── Main Split View ────────────────────────────── */}
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
        {/* LEFT COLUMN: Problem Description */}
        <Box
          w={{ base: '100%', lg: `${splitPct}%` }}
          h="100%"
          minH="0"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          pr={{ base: 0, lg: 1 }}
        >
          <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm" h="100%" display="flex" flexDirection="column" overflow="hidden">
            <Box flex="1" minH="0" overflowY="auto">
              <CardBody p={5}>
                <VStack align="stretch" spacing={5}>
                  {/* Problem Header */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Tag size="sm" colorScheme="green">
                        Question {selectedQuestionIndex + 1} of {questions.length}
                      </Tag>
                      <Badge colorScheme="green" fontSize="xs" px={2} py={0.5}>
                        {currentQuestion?.marks || 10} Marks
                      </Badge>
                    </Flex>
                    <Heading size="md" color={textColor} mt={2}>
                      {currentQuestion?.title || `Problem ${selectedQuestionIndex + 1}`}
                    </Heading>
                  </Box>

                  <Divider borderColor={cardBorder} />

                  {/* Problem Statement */}
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color={accentColor} textTransform="uppercase" letterSpacing="wider" mb={2}>
                      Problem Statement
                    </Text>
                    <Text color={textColor} fontSize="sm" lineHeight="tall" whiteSpace="pre-line" fontWeight="400">
                      {currentQuestion?.problem_statement}
                    </Text>
                  </Box>

                  {/* Constraints */}
                  {currentQuestion?.constraints && (
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color={accentColor} textTransform="uppercase" letterSpacing="wider" mb={2}>
                        Constraints
                      </Text>
                      <Box p={3} bg={codeBoxBg} borderRadius="lg" border="1px solid" borderColor={codeBoxBorder}>
                        <Code bg="transparent" color={textColor} fontSize="xs" whiteSpace="pre-line">
                          {currentQuestion.constraints}
                        </Code>
                      </Box>
                    </Box>
                  )}

                  {/* Sample Input / Output */}
                  {currentQuestion?.sample_input && (
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color={accentColor} textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                        Sample Input
                      </Text>
                      <Box p={3} bg={codeBoxBg} borderRadius="lg" border="1px solid" borderColor={codeBoxBorder}>
                        <Code bg="transparent" color={textColor} fontSize="xs" whiteSpace="pre">
                          {currentQuestion.sample_input}
                        </Code>
                      </Box>
                    </Box>
                  )}

                  {currentQuestion?.sample_output && (
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color={accentColor} textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                        Sample Output
                      </Text>
                      <Box p={3} bg={codeBoxBg} borderRadius="lg" border="1px solid" borderColor={codeBoxBorder}>
                        <Code bg="transparent" color={textColor} fontSize="xs" whiteSpace="pre">
                          {currentQuestion.sample_output}
                        </Code>
                      </Box>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Box>

            {/* Problem Bottom Navigation docked below question component */}
            {questions.length > 1 && (
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
                  isDisabled={selectedQuestionIndex === 0}
                  onClick={handlePrevQuestion}
                  borderRadius="lg"
                  color={textColor}
                  borderColor={cardBorder}
                  _hover={{ bg: cardBg }}
                >
                  Previous Question
                </Button>
                <Text fontSize="xs" fontWeight="bold" color={mutedText}>
                  Question {selectedQuestionIndex + 1} of {questions.length}
                </Text>
                <Button
                  size="sm"
                  colorScheme="brand"
                  rightIcon={<ChevronRightIcon />}
                  isDisabled={selectedQuestionIndex === questions.length - 1}
                  onClick={handleNextQuestion}
                  borderRadius="lg"
                >
                  Next Question
                </Button>
              </Flex>
            )}
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

        {/* RIGHT COLUMN: Code Editor & Execution Console */}
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
            overflow="hidden"
            borderRadius="xl"
            boxShadow="sm"
            flex="1"
            minH="220px"
            display="flex"
            flexDirection="column"
          >
            {/* Editor Toolbar */}
            <Flex justify="space-between" align="center" wrap="wrap" gap={2} bg={surfaceBg} px={3} py={1.5} borderBottom="1px solid" borderColor={cardBorder} flexShrink={0}>
              <HStack spacing={2}>
                <Text fontSize="xs" color={textColor} fontWeight="bold">Language:</Text>
                <Select
                  size="sm"
                  w="130px"
                  bg={cardBg}
                  borderColor={cardBorder}
                  color={textColor}
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value="cpp">C++ (gcc 14)</option>
                  <option value="c">C (gcc 14)</option>
                  <option value="java">Java 21</option>
                  <option value="python">Python 3.12</option>
                </Select>
              </HStack>

              <HStack spacing={2}>
                <Tooltip label={isFullscreen ? 'Exit Full Screen (Esc)' : 'Enter Full Screen'} placement="top">
                  <Button
                    size="sm"
                    variant={isFullscreen ? 'solid' : 'ghost'}
                    colorScheme={isFullscreen ? 'green' : 'gray'}
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
                  >
                    {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
                  </Button>
                </Tooltip>
                <Tooltip label="Reset starter code" placement="top">
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    leftIcon={<RepeatIcon />}
                    onClick={handleResetCode}
                  >
                    Reset
                  </Button>
                </Tooltip>

                <Button
                  size="sm"
                  colorScheme="green"
                  variant="outline"
                  onClick={handleRunCode}
                  isLoading={isRunning}
                  loadingText="Running..."
                >
                  ▶ Run Code
                </Button>

                <Button
                  size="sm"
                  colorScheme="brand"
                  onClick={handleSubmitCode}
                  isLoading={isSubmitting}
                  loadingText="Testing..."
                >
                  Submit
                </Button>
              </HStack>
            </Flex>

            {/* Monaco Editor Container with strict Anti-Cheat / No Copy-Paste */}
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
                language={language === 'c' || language === 'cpp' ? 'cpp' : language}
                value={codeMap[language]}
                theme={monacoTheme}
                onChange={handleCodeChange}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 14,
                  fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  padding: { top: 12, bottom: 12 },
                  contextmenu: false, // Disables right-click menu (prevent paste & copy options)
                  copyWithSyntaxHighlighting: false,
                }}
              />
            </Box>
          </Card>

          {/* Execution / Results Panel */}
          <Card
            bg={cardBg}
            borderColor={cardBorder}
            borderWidth="1px"
            borderRadius="xl"
            boxShadow="sm"
            p={3}
            h={isConsoleMinimized ? '44px' : { base: '240px', lg: '250px' }}
            minH={isConsoleMinimized ? '44px' : '180px'}
            maxH={isConsoleMinimized ? '44px' : '360px'}
            flexShrink={0}
            display="flex"
            flexDirection="column"
            overflow="hidden"
            transition="height 0.2s ease"
          >
            <Tabs
              index={activeTab}
              onChange={(idx) => {
                setActiveTab(idx);
                if (isConsoleMinimized) {
                  setIsConsoleMinimized(false);
                  setTimeout(triggerEditorLayout, 220);
                }
              }}
              colorScheme="green"
              variant="enclosed"
              display="flex"
              flexDirection="column"
              h="100%"
              minH="0"
            >
              <Flex justify="space-between" align="center" borderBottom="1px solid" borderColor={cardBorder} pb={1} flexShrink={0}>
                <TabList borderColor="transparent" mb="-1px">
                  <Tab color={mutedText} _selected={{ color: accentColor, bg: surfaceBg, borderColor: cardBorder, fontWeight: 'bold' }} fontSize="xs" py={1} px={3}>
                    Console Output {runResult && (runResult.success ? '✓' : '✗')}
                  </Tab>
                  <Tab color={mutedText} _selected={{ color: accentColor, bg: surfaceBg, borderColor: cardBorder, fontWeight: 'bold' }} fontSize="xs" py={1} px={3}>
                    Test Case Results {submitResult && (submitResult.isCompleted ? '✓' : '○')}
                  </Tab>
                  <Tab color={mutedText} _selected={{ color: accentColor, bg: surfaceBg, borderColor: cardBorder, fontWeight: 'bold' }} fontSize="xs" py={1} px={3}>
                    Custom Stdin
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
                    {/* TAB 1: Console Run Output */}
                    <TabPanel p={3}>
                      {isRunning ? (
                        <Text color={mutedText} fontSize="sm">Executing sandboxed container...</Text>
                      ) : runResult ? (
                        <VStack align="stretch" spacing={3}>
                          <Flex justify="space-between" align="center">
                            <Badge
                              colorScheme={runResult.success ? 'green' : 'red'}
                              fontSize="xs"
                              px={2.5}
                              py={0.5}
                            >
                              {runResult.errorType || (runResult.success ? 'SUCCESS' : 'ERROR')}
                            </Badge>
                            {runResult.executionTime !== undefined && (
                              <HStack color={mutedText} fontSize="xs">
                                <Icon as={TimeIcon} />
                                <Text>{runResult.executionTime} ms</Text>
                              </HStack>
                            )}
                          </Flex>

                          {/* Stdout */}
                          {runResult.output && (
                            <Box>
                              <Text fontSize="2xs" color={mutedText} textTransform="uppercase" fontWeight="bold" mb={1}>
                                Standard Output
                              </Text>
                              <Box p={3} bg={codeBoxBg} borderRadius="md" border="1px solid" borderColor={codeBoxBorder}>
                                <Code bg="transparent" color={textColor} fontSize="xs" whiteSpace="pre-wrap" display="block">
                                  {runResult.output}
                                </Code>
                              </Box>
                            </Box>
                          )}

                          {/* Error */}
                          {runResult.error && (
                            <Box>
                              <Text fontSize="2xs" color="red.600" textTransform="uppercase" fontWeight="bold" mb={1}>
                                Error Output
                              </Text>
                              <Box p={3} bg="rgba(127, 29, 29, 0.1)" borderRadius="md" border="1px solid" borderColor="red.300">
                                <Code bg="transparent" color="red.700" fontSize="xs" whiteSpace="pre-wrap" display="block">
                                  {runResult.error}
                                </Code>
                              </Box>
                            </Box>
                          )}
                        </VStack>
                      ) : (
                        <Text color={mutedText} fontSize="xs">
                          Click <strong style={{ color: textColor }}>Run Code</strong> to execute your solution with custom stdin.
                        </Text>
                      )}
                    </TabPanel>

                    {/* TAB 2: Submission Test Case Results */}
                    <TabPanel p={3}>
                      {isSubmitting ? (
                        <Text color={mutedText} fontSize="sm">Grading solution against all test cases...</Text>
                      ) : submitResult ? (
                        <VStack align="stretch" spacing={4}>
                          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                            <HStack spacing={2}>
                              <Badge
                                colorScheme={submitResult.isCompleted || submitResult.status === 'PASSED' ? 'green' : 'red'}
                                fontSize="sm"
                                px={3}
                                py={1}
                                borderRadius="full"
                              >
                                {submitResult.status || (submitResult.isCompleted ? 'PASSED' : 'FAILED')}
                              </Badge>
                              <Tag colorScheme="green" size="sm">
                                Score: {submitResult.score || 0} / {submitResult.totalMarks || 10}
                              </Tag>
                            </HStack>

                            <Text color={mutedText} fontSize="xs">
                              Passed: {submitResult.passedTestCases || 0} / {submitResult.totalTestCases || 0} Test Cases
                            </Text>
                          </Flex>

                          {/* Error block if compile error */}
                          {submitResult.error && (
                            <Box p={3} bg="rgba(127, 29, 29, 0.1)" borderRadius="md" border="1px solid" borderColor="red.300">
                              <Text fontSize="xs" color="red.700" fontWeight="bold" mb={1}>
                                {submitResult.errorType || 'Evaluation Error'}
                              </Text>
                              <Code bg="transparent" color="red.700" fontSize="xs" whiteSpace="pre-wrap">
                                {submitResult.error}
                              </Code>
                            </Box>
                          )}

                          {/* Test Cases List */}
                          {submitResult.testCaseResults && submitResult.testCaseResults.length > 0 && (
                            <VStack spacing={2} align="stretch">
                              {submitResult.testCaseResults.map((tc, idx) => (
                                <Box
                                  key={tc.testCaseId || idx}
                                  p={3}
                                  bg={codeBoxBg}
                                  borderRadius="md"
                                  border="1px solid"
                                  borderColor={tc.passed ? tcBorderSuccess : tcBorderFail}
                                >
                                  <Flex justify="space-between" align="center">
                                    <HStack spacing={2}>
                                      <Icon
                                        as={tc.passed ? CheckCircleIcon : WarningIcon}
                                        color={tc.passed ? 'green.500' : 'red.500'}
                                      />
                                      <Text color={textColor} fontSize="xs" fontWeight="bold">
                                        Test Case {idx + 1} {tc.isHidden ? '(Hidden)' : ''}
                                      </Text>
                                    </HStack>

                                    <HStack spacing={2}>
                                      <Badge colorScheme={tc.passed ? 'green' : 'red'} fontSize="2xs">
                                        {tc.status || (tc.passed ? 'PASSED' : 'FAILED')}
                                      </Badge>
                                      {tc.executionTime !== undefined && (
                                        <Text color={mutedText} fontSize="2xs">
                                          {tc.executionTime}ms
                                        </Text>
                                      )}
                                    </HStack>
                                  </Flex>

                                  {!tc.isHidden && !tc.passed && (
                                    <Box mt={2} pt={2} borderTop="1px solid" borderColor={cardBorder} fontSize="xs">
                                      <Text color={mutedText}>Input: <Code colorScheme="gray" color={textColor} bg={cardBg} fontSize="xs">{tc.input}</Code></Text>
                                      <Text color={mutedText}>Expected: <Code colorScheme="green" color={textColor} bg={cardBg} fontSize="xs">{tc.expectedOutput}</Code></Text>
                                      <Text color={mutedText}>Actual: <Code colorScheme="red" color="red.700" bg={cardBg} fontSize="xs">{tc.actualOutput || tc.error}</Code></Text>
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </VStack>
                          )}
                        </VStack>
                      ) : (
                        <Text color={mutedText} fontSize="xs">
                          Click <strong style={{ color: textColor }}>Submit</strong> to evaluate your code against all test cases.
                        </Text>
                      )}
                    </TabPanel>

                    {/* TAB 3: Custom Stdin Input */}
                    <TabPanel p={3}>
                      <VStack align="stretch" spacing={2}>
                        <Text fontSize="xs" color={textColor} fontWeight="bold">
                          Provide custom stdin input for testing:
                        </Text>
                        <Textarea
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="Type stdin input here..."
                          bg={cardBg}
                          borderColor={cardBorder}
                          color={textColor}
                          fontFamily="monospace"
                          fontSize="xs"
                          rows={4}
                          _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                        />
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                )}
              </Tabs>
            </Card>
          </Box>
        </Flex>
      </Flex>
    );
};

export default CodingWorkspace;
