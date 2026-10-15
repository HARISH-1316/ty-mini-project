// ──────────────────────────────────────────────
// Student: Lab Assessment Coding Workspace
// ──────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
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
} from '@chakra-ui/icons';
import {
  startOrResumeLabApi,
  getStudentQuestionsApi,
  labRunCodeApi,
  labSubmitQuestionApi,
  getLabSubmissionStatusApi,
  submitLabAssessmentApi,
} from '../../api/labApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

  const [isLoading, setIsLoading] = useState(true);
  const [lab, setLab] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Per-question state: codeMap[questionId][language]
  const [codeStore, setCodeStore] = useState({});
  const [language, setLanguage] = useState('cpp');
  const [customInput, setCustomInput] = useState('');

  // Submissions map: questionSubmissions[questionId] = { status, marks_obtained, ... }
  const [submissionMap, setSubmissionMap] = useState({});

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const [activeOutputTab, setActiveOutputTab] = useState(0); // 0 = Run, 1 = Eval

  // Timer
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef(null);

  // Submit assessment modal
  const { isOpen: isFinishOpen, onOpen: onFinishOpen, onClose: onFinishClose } = useDisclosure();
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);

  // Copy helper
  const [copied, setCopied] = useState(false);

  // Initialize and load assessment attempt & questions
  useEffect(() => {
    let isMounted = true;

    const initAssessment = async () => {
      try {
        setIsLoading(true);

        // 1. Start or resume
        const startRes = await startOrResumeLabApi(labId);
        const { attempt: att, questions: qList, alreadySubmitted } = startRes.data?.data || {};

        if (!isMounted) return;

        // If the assessment is already submitted or expired, redirect to result page immediately
        if (alreadySubmitted || att?.status === 'submitted' || att?.status === 'timed_out' || att?.status === 'expired') {
          navigate(`/student/lab-assessments/${labId}/result`, { replace: true });
          return;
        }

        setAttempt(att);

        // Fetch detailed questions with public test cases
        const qRes = await getStudentQuestionsApi(labId);
        const fullQuestions = qRes.data?.data?.questions || qList || [];
        setQuestions(fullQuestions);

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

  const currentQuestion = questions[selectedIndex] || null;
  const currentQId = currentQuestion?.lab_question_id;

  // Sync custom input and previous submitted language with current question
  useEffect(() => {
    if (currentQuestion?.sample_input) {
      setCustomInput(currentQuestion.sample_input);
    } else {
      setCustomInput('');
    }
    setRunResult(null);
    setEvalResult(null);
    if (currentQId && submissionMap[currentQId]?.language) {
      setLanguage(submissionMap[currentQId].language);
    }
  }, [selectedIndex, currentQuestion, currentQId, submissionMap]);

  // Current editor code
  const currentCode =
    codeStore[currentQId]?.[language] ||
    STARTER_TEMPLATES[language] ||
    '';

  const handleCodeChange = (val) => {
    if (!currentQId) return;
    setCodeStore((prev) => ({
      ...prev,
      [currentQId]: {
        ...(prev[currentQId] || {}),
        [language]: val ?? '',
      },
    }));
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

      setRunResult(res.data?.data || {});
      toast({
        title: 'Run Complete',
        status: res.data?.data?.success ? 'success' : 'warning',
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

  const attemptedCount = Object.values(submissionMap).filter(
    (s) => s.status && s.status !== 'not_attempted'
  ).length;

  return (
    <VStack spacing={4} align="stretch" w="full" minH="calc(100vh - 100px)">
      {/* Top Bar: Assessment Title, Timer, Question Navigation, Finish Button */}
      <Card bg="slate.900" borderColor="slate.800" borderWidth="1px" p={4} borderRadius="xl">
        <Flex
          justify="space-between"
          align="center"
          direction={{ base: 'column', md: 'row' }}
          gap={4}
        >
          {/* Title & Attempt Info */}
          <VStack align="start" spacing={0}>
            <HStack>
              <Heading size="md" color="white">
                Practical Assessment
              </Heading>
              <Badge colorScheme="purple" px={2} py={0.5} borderRadius="md">
                {questions.length} Questions
              </Badge>
            </HStack>
            <Text fontSize="xs" color="gray.400">
              Questions randomly allocated from curriculum topics • All changes saved
            </Text>
          </VStack>

          {/* Question Navigator Buttons */}
          <HStack spacing={2} wrap="wrap" justify="center">
            {questions.map((q, idx) => {
              const sub = submissionMap[q.lab_question_id];
              const isCurrent = idx === selectedIndex;
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
                  key={q.lab_question_id}
                  size="sm"
                  variant={isCurrent ? 'solid' : 'outline'}
                  colorScheme={isCurrent ? 'purple' : btnColorScheme}
                  onClick={() => setSelectedIndex(idx)}
                  borderRadius="lg"
                  px={3}
                  fontSize="xs"
                >
                  Q{idx + 1}
                  {subStatus === 'accepted' && (
                    <Icon as={CheckCircleIcon} color="green.300" ml={1} boxSize={3} />
                  )}
                </Button>
              );
            })}
          </HStack>

          {/* Timer and Finish Button */}
          <HStack spacing={4}>
            {/* Live Timer */}
            <HStack
              bg={isTimerCritical ? 'red.900' : isTimerWarning ? 'orange.900' : 'slate.800'}
              border="1px solid"
              borderColor={isTimerCritical ? 'red.500' : isTimerWarning ? 'orange.500' : 'slate.700'}
              px={4}
              py={2}
              borderRadius="xl"
              boxShadow="inner"
            >
              <Icon
                as={TimeIcon}
                color={isTimerCritical ? 'red.400' : isTimerWarning ? 'orange.400' : 'purple.400'}
                boxSize={4}
              />
              <Text
                fontFamily="mono"
                fontWeight="bold"
                fontSize="md"
                color={isTimerCritical ? 'red.200' : isTimerWarning ? 'orange.200' : 'white'}
              >
                {formatTimeRemaining(remainingSeconds)}
              </Text>
            </HStack>

            <Button
              colorScheme="red"
              variant="outline"
              size="sm"
              onClick={onFinishOpen}
              _hover={{ bg: 'red.900', color: 'white' }}
            >
              Finish Assessment
            </Button>
          </HStack>
        </Flex>
      </Card>

      {/* Main Workspace: 2 Columns */}
      <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={4} flex={1}>
        {/* Left Column: Problem Statement & Test Cases (5 Cols) */}
        <Box gridColumn={{ lg: 'span 5' }}>
          <Card
            bg="slate.900"
            borderColor="slate.800"
            borderWidth="1px"
            h="calc(100vh - 210px)"
            overflowY="auto"
            borderRadius="xl"
            p={5}
          >
            {currentQuestion ? (
              <VStack align="stretch" spacing={5}>
                {/* Question Header */}
                <VStack align="start" spacing={1}>
                  <HStack justify="space-between" w="full">
                    <HStack>
                      <Badge colorScheme="purple" px={2} py={0.5} borderRadius="md">
                        Question {selectedIndex + 1} of {questions.length}
                      </Badge>
                      <Badge
                        colorScheme={
                          currentQuestion.difficulty === 'easy'
                            ? 'green'
                            : currentQuestion.difficulty === 'hard'
                            ? 'red'
                            : 'yellow'
                        }
                        px={2}
                        py={0.5}
                        borderRadius="md"
                        textTransform="capitalize"
                      >
                        {currentQuestion.difficulty || 'Medium'}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" fontWeight="bold" color="cyan.400">
                      {currentQuestion.marks || 10} Marks
                    </Text>
                  </HStack>

                  <Heading size="md" color="white" pt={1}>
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

                <Divider borderColor="slate.800" />

                {/* Problem Statement */}
                <Box>
                  <Text fontWeight="semibold" color="gray.300" fontSize="sm" mb={1}>
                    Problem Statement
                  </Text>
                  <Text color="gray.200" fontSize="sm" whiteSpace="pre-wrap" lineHeight="tall">
                    {currentQuestion.problem_statement}
                  </Text>
                </Box>

                {/* Input Format */}
                {currentQuestion.input_format && (
                  <Box>
                    <Text fontWeight="semibold" color="gray.300" fontSize="sm" mb={1}>
                      Input Format
                    </Text>
                    <Text color="gray.300" fontSize="xs" whiteSpace="pre-wrap">
                      {currentQuestion.input_format}
                    </Text>
                  </Box>
                )}

                {/* Output Format */}
                {currentQuestion.output_format && (
                  <Box>
                    <Text fontWeight="semibold" color="gray.300" fontSize="sm" mb={1}>
                      Output Format
                    </Text>
                    <Text color="gray.300" fontSize="xs" whiteSpace="pre-wrap">
                      {currentQuestion.output_format}
                    </Text>
                  </Box>
                )}

                {/* Constraints */}
                {currentQuestion.constraints && (
                  <Box>
                    <Text fontWeight="semibold" color="gray.300" fontSize="sm" mb={1}>
                      Constraints
                    </Text>
                    <Code p={2} borderRadius="md" w="full" colorScheme="gray" fontSize="xs" whiteSpace="pre-wrap">
                      {currentQuestion.constraints}
                    </Code>
                  </Box>
                )}

                {/* Sample Input / Output */}
                {currentQuestion.sample_input && (
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontWeight="semibold" color="gray.300" fontSize="sm">
                        Sample Input
                      </Text>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="gray"
                        leftIcon={copied ? <CheckIcon /> : <CopyIcon />}
                        onClick={() => handleCopyInput(currentQuestion.sample_input)}
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </Flex>
                    <Code p={3} borderRadius="md" w="full" colorScheme="purple" fontSize="xs" whiteSpace="pre-wrap">
                      {currentQuestion.sample_input}
                    </Code>
                  </Box>
                )}

                {currentQuestion.sample_output && (
                  <Box>
                    <Text fontWeight="semibold" color="gray.300" fontSize="sm" mb={1}>
                      Sample Output
                    </Text>
                    <Code p={3} borderRadius="md" w="full" colorScheme="green" fontSize="xs" whiteSpace="pre-wrap">
                      {currentQuestion.sample_output}
                    </Code>
                  </Box>
                )}

                {/* Explanation */}
                {currentQuestion.explanation && (
                  <Box>
                    <Text fontWeight="semibold" color="gray.300" fontSize="sm" mb={1}>
                      Explanation
                    </Text>
                    <Text color="gray.400" fontSize="xs" whiteSpace="pre-wrap">
                      {currentQuestion.explanation}
                    </Text>
                  </Box>
                )}

                {/* Public Test Cases Preview */}
                {currentQuestion.publicTestCases && currentQuestion.publicTestCases.length > 0 && (
                  <Box>
                    <Text fontWeight="semibold" color="gray.300" fontSize="sm" mb={2}>
                      Visible Test Cases ({currentQuestion.publicTestCases.length})
                    </Text>
                    <VStack spacing={2} align="stretch">
                      {currentQuestion.publicTestCases.map((tc, idx) => (
                        <Box key={tc.lab_testcase_id || idx} p={2} bg="slate.800" borderRadius="md" border="1px solid" borderColor="slate.700" fontSize="xs">
                          <Text color="gray.400" mb={1}>Case #{idx + 1}:</Text>
                          <Text color="gray.300">Input: <code>{tc.input || '(empty)'}</code></Text>
                          <Text color="gray.300">Expected: <code>{tc.expected_output}</code></Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            ) : (
              <Text color="gray.400">Select a question to view problem description.</Text>
            )}
          </Card>
        </Box>

        {/* Right Column: Code Editor & Output (7 Cols) */}
        <Box gridColumn={{ lg: 'span 7' }}>
          <VStack spacing={4} align="stretch" h="full">
            {/* Editor Container Card */}
            <Card bg="slate.900" borderColor="slate.800" borderWidth="1px" borderRadius="xl" overflow="hidden">
              {/* Editor Header Bar */}
              <Flex justify="space-between" align="center" bg="slate.800" px={4} py={2} borderBottom="1px solid" borderColor="slate.700">
                <HStack spacing={3}>
                  <Text fontSize="xs" color="gray.300" fontWeight="bold">
                    Language:
                  </Text>
                  <Select
                    size="xs"
                    w="130px"
                    bg="dark.bg"
                    borderColor="slate.600"
                    color="white"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="cpp">C++ (g++)</option>
                    <option value="c">C (gcc)</option>
                    <option value="java">Java (openjdk)</option>
                    <option value="python">Python 3</option>
                  </Select>
                </HStack>

                <HStack spacing={2}>
                  <Tooltip label="Reset starter code" fontSize="xs">
                    <Button size="xs" variant="ghost" colorScheme="gray" onClick={handleResetCode} leftIcon={<RepeatIcon />}>
                      Reset
                    </Button>
                  </Tooltip>
                  <Button
                    size="xs"
                    colorScheme="purple"
                    variant="outline"
                    onClick={handleRunCode}
                    isLoading={isRunning}
                    loadingText="Running..."
                  >
                    Run Code
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="brand"
                    onClick={handleSubmitQuestion}
                    isLoading={isSubmitting}
                    loadingText="Evaluating..."
                  >
                    Submit Answer
                  </Button>
                </HStack>
              </Flex>

              {/* Monaco Editor */}
              <Box h="360px" w="full">
                <Editor
                  height="100%"
                  language={MONACO_LANG_MAP[language] || 'cpp'}
                  theme="vs-dark"
                  value={currentCode}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineNumbers: 'on',
                    tabSize: 4,
                  }}
                />
              </Box>
            </Card>

            {/* Bottom Panel: Custom Input & Outputs */}
            <Card bg="slate.900" borderColor="slate.800" borderWidth="1px" borderRadius="xl" p={4} minH="220px">
              <Tabs
                variant="line"
                colorScheme="purple"
                index={activeOutputTab}
                onChange={(idx) => setActiveOutputTab(idx)}
              >
                <TabList borderColor="slate.800">
                  <Tab color="gray.400" _selected={{ color: 'white', borderColor: 'purple.400' }} fontSize="xs">
                    Console Output {runResult && (runResult.success ? '✅' : '⚠️')}
                  </Tab>
                  <Tab color="gray.400" _selected={{ color: 'white', borderColor: 'green.400' }} fontSize="xs">
                    Evaluation Results {evalResult && `(${evalResult.passedTestCases}/${evalResult.totalTestCases})`}
                  </Tab>
                  <Tab color="gray.400" _selected={{ color: 'white', borderColor: 'cyan.400' }} fontSize="xs">
                    Custom Input
                  </Tab>
                </TabList>

                <TabPanels>
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
                            <Text color="gray.400">Execution time: {runResult.executionTime}ms</Text>
                          )}
                        </HStack>

                        {runResult.output && (
                          <Box>
                            <Text color="gray.400" mb={1}>Standard Output:</Text>
                            <Code p={3} borderRadius="md" w="full" colorScheme="gray" display="block" whiteSpace="pre-wrap">
                              {runResult.output}
                            </Code>
                          </Box>
                        )}

                        {runResult.error && (
                          <Box>
                            <Text color="red.400" mb={1}>Error / Stderr:</Text>
                            <Code p={3} borderRadius="md" w="full" colorScheme="red" display="block" whiteSpace="pre-wrap">
                              {runResult.error}
                            </Code>
                          </Box>
                        )}
                      </VStack>
                    ) : (
                      <Text color="gray.500" fontSize="xs" py={4} textAlign="center">
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
                        <Flex justify="space-between" align="center" bg="slate.800" p={3} borderRadius="lg">
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
                            <Text color="white" fontWeight="bold">
                              {evalResult.passedTestCases} of {evalResult.totalTestCases} Test Cases Passed
                            </Text>
                          </HStack>
                          <Text color="purple.300" fontWeight="bold" fontSize="sm">
                            Score: {evalResult.score} / {evalResult.totalMarks} Marks
                          </Text>
                        </Flex>

                        {/* Compilation Error Notice if any */}
                        {evalResult.error && (
                          <Code p={3} borderRadius="md" w="full" colorScheme="red" display="block" whiteSpace="pre-wrap">
                            {evalResult.error}
                          </Code>
                        )}

                        {/* Test Case Cards */}
                        {evalResult.testCaseResults && evalResult.testCaseResults.length > 0 && (
                          <VStack spacing={2} align="stretch" maxH="180px" overflowY="auto">
                            {evalResult.testCaseResults.map((tc, idx) => (
                              <Box
                                key={tc.testCaseId || idx}
                                p={2}
                                borderRadius="md"
                                bg="slate.800"
                                border="1px solid"
                                borderColor={tc.passed ? 'green.800' : 'red.800'}
                              >
                                <HStack justify="space-between">
                                  <HStack>
                                    <Icon
                                      as={tc.passed ? CheckCircleIcon : CloseIcon}
                                      color={tc.passed ? 'green.400' : 'red.400'}
                                      boxSize={3}
                                    />
                                    <Text color="white" fontWeight="semibold">
                                      {tc.isHidden ? `Hidden Test Case #${idx + 1}` : `Visible Test Case #${idx + 1}`}
                                    </Text>
                                    <Badge size="xs" colorScheme={tc.passed ? 'green' : 'red'}>
                                      {tc.passed ? 'PASSED' : tc.status || 'FAILED'}
                                    </Badge>
                                  </HStack>
                                  {tc.executionTime !== undefined && (
                                    <Text color="gray.500" fontSize="2xs">{tc.executionTime}ms</Text>
                                  )}
                                </HStack>

                                {/* Only show input/expected output for visible test cases */}
                                {!tc.isHidden && (
                                  <Box mt={1} pt={1} borderTop="1px solid" borderColor="slate.700" color="gray.300" fontSize="2xs">
                                    <Text>Input: <code>{tc.input}</code></Text>
                                    <Text>Expected: <code>{tc.expectedOutput}</code></Text>
                                    <Text>Output: <code>{tc.actualOutput}</code></Text>
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </VStack>
                    ) : (
                      <Text color="gray.500" fontSize="xs" py={4} textAlign="center">
                        Click "Submit Answer" to officially evaluate this question against all test cases.
                      </Text>
                    )}
                  </TabPanel>

                  {/* Tab 2: Custom Input */}
                  <TabPanel px={0} py={3}>
                    <Text color="gray.400" fontSize="xs" mb={1}>
                      Standard Input (stdin) for Run Code:
                    </Text>
                    <Textarea
                      size="xs"
                      rows={4}
                      bg="dark.bg"
                      borderColor="slate.700"
                      color="white"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter custom input here..."
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Card>
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Finish Assessment Confirmation Modal */}
      <Modal isOpen={isFinishOpen} onClose={onFinishClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="slate.900" borderColor="slate.700" borderWidth="1px" color="white">
          <ModalHeader>Final Assessment Submission</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm">
                Are you sure you want to finish and submit the assessment now?
              </Text>

              <Box bg="slate.800" p={4} borderRadius="lg" border="1px solid" borderColor="slate.700">
                <VStack align="stretch" spacing={2} fontSize="sm">
                  <HStack justify="space-between">
                    <Text color="gray.300">Questions Attempted:</Text>
                    <Text fontWeight="bold" color="cyan.400">
                      {attemptedCount} of {questions.length}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.300">Remaining Time:</Text>
                    <Text fontWeight="bold" color="yellow.400">
                      {formatTimeRemaining(remainingSeconds)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {attemptedCount < questions.length && (
                <Alert status="warning" borderRadius="md" bg="orange.900" borderColor="orange.700" borderWidth="1px" fontSize="xs">
                  <AlertIcon />
                  <AlertDescription>
                    You have {questions.length - attemptedCount} unsubmitted question(s). Unsubmitted questions will receive 0 marks.
                  </AlertDescription>
                </Alert>
              )}

              <Text fontSize="xs" color="gray.400">
                Once submitted, you will not be able to modify any answers or resume this assessment.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onFinishClose} color="gray.400">
              Continue Working
            </Button>
            <Button
              colorScheme="red"
              onClick={handleFinalSubmit}
              isLoading={isFinalSubmitting}
              loadingText="Finalizing..."
            >
              Confirm & Submit All
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default LabAssessmentWorkspace;
