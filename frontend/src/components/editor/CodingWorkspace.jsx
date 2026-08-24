// ──────────────────────────────────────────────
// CodingWorkspace — Full Sandboxed Monaco Editor IDE
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import {
  ArrowForwardIcon,
  RepeatIcon,
  CheckCircleIcon,
  WarningIcon,
  TimeIcon,
  CopyIcon,
  CheckIcon,
} from '@chakra-ui/icons';
import { executeCodeApi, submitCodeApi } from '../../api/editorApi';

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

  const currentQuestion = questions[selectedQuestionIndex] || null;
  const currentQId = currentQuestion ? (currentQuestion.tca_question_id || currentQuestion.scca_id) : null;

  // Initialize sample input into custom input when question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.sample_input) {
      setCustomInput(currentQuestion.sample_input);
    }
    setRunResult(null);
    setSubmitResult(null);
  }, [selectedQuestionIndex, currentQuestion]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
  };

  const handleCodeChange = (newCode) => {
    setCodeMap((prev) => ({
      ...prev,
      [language]: newCode ?? '',
    }));
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

  const handleCopySample = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied to clipboard',
      status: 'success',
      duration: 1500,
      isClosable: true,
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
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody p={8} textAlign="center">
          <Icon as={TimeIcon} w={8} h={8} color="purple.400" mb={3} />
          <Heading size="md" color="white">No Coding Problems Available</Heading>
          <Text color="gray.400" fontSize="sm" mt={2}>
            Your instructor has not configured coding questions for this assessment yet.
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack spacing={4} align="stretch" w="full">
      {/* ── Top Bar: Title & Question Selector ────────── */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody p={4}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={3}>
              <Heading size="md" color="white">
                {assessmentTitle}
              </Heading>
              <Badge colorScheme="purple" px={2.5} py={0.5} borderRadius="full">
                {questions.length} Question{questions.length > 1 ? 's' : ''}
              </Badge>
            </HStack>

            {/* Question Selector tabs if multiple */}
            {questions.length > 1 && (
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.400">Question:</Text>
                {questions.map((q, idx) => (
                  <Button
                    key={q.tca_question_id || q.scca_id || idx}
                    size="sm"
                    variant={selectedQuestionIndex === idx ? 'solid' : 'outline'}
                    colorScheme={selectedQuestionIndex === idx ? 'purple' : 'gray'}
                    borderColor="slate.600"
                    onClick={() => setSelectedQuestionIndex(idx)}
                  >
                    Q{idx + 1}
                  </Button>
                ))}
              </HStack>
            )}
          </Flex>
        </CardBody>
      </Card>

      {/* ── Main Split View ────────────────────────────── */}
      <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={4} alignItems="start">
        {/* LEFT COLUMN: Problem Description (5 cols) */}
        <Box gridColumn={{ base: 'span 12', lg: 'span 5' }}>
          <Card bg="slate.800" borderColor="slate.700" borderWidth="1px" h="full">
            <CardBody p={5}>
              <VStack align="stretch" spacing={5}>
                {/* Problem Header */}
                <Box>
                  <Flex justify="space-between" align="center" mb={1}>
                    <Tag size="sm" colorScheme="purple">
                      Question {selectedQuestionIndex + 1} of {questions.length}
                    </Tag>
                    <Badge colorScheme="cyan" fontSize="xs" px={2} py={0.5}>
                      {currentQuestion?.marks || 10} Marks
                    </Badge>
                  </Flex>
                  <Heading size="md" color="white" mt={2}>
                    {currentQuestion?.title || `Problem ${selectedQuestionIndex + 1}`}
                  </Heading>
                </Box>

                <Divider borderColor="slate.700" />

                {/* Problem Statement */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="purple.300" textTransform="uppercase" letterSpacing="wider" mb={2}>
                    Problem Statement
                  </Text>
                  <Text color="gray.200" fontSize="sm" lineHeight="tall" whiteSpace="pre-line">
                    {currentQuestion?.problem_statement}
                  </Text>
                </Box>

                {/* Constraints */}
                {currentQuestion?.constraints && (
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="purple.300" textTransform="uppercase" letterSpacing="wider" mb={2}>
                      Constraints
                    </Text>
                    <Box p={3} bg="slate.900" borderRadius="lg" border="1px solid" borderColor="slate.750">
                      <Code colorScheme="purple" bg="transparent" color="gray.300" fontSize="xs" whiteSpace="pre-line">
                        {currentQuestion.constraints}
                      </Code>
                    </Box>
                  </Box>
                )}

                {/* Sample Input / Output */}
                {currentQuestion?.sample_input && (
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="xs" fontWeight="bold" color="purple.300" textTransform="uppercase" letterSpacing="wider">
                        Sample Input
                      </Text>
                      <Button
                        size="2xs"
                        variant="ghost"
                        colorScheme="gray"
                        leftIcon={copied ? <CheckIcon /> : <CopyIcon />}
                        onClick={() => handleCopySample(currentQuestion.sample_input)}
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </Flex>
                    <Box p={3} bg="slate.900" borderRadius="lg" border="1px solid" borderColor="slate.750">
                      <Code colorScheme="purple" bg="transparent" color="emerald.300" fontSize="xs" whiteSpace="pre">
                        {currentQuestion.sample_input}
                      </Code>
                    </Box>
                  </Box>
                )}

                {currentQuestion?.sample_output && (
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="purple.300" textTransform="uppercase" letterSpacing="wider" mb={1}>
                      Sample Output
                    </Text>
                    <Box p={3} bg="slate.900" borderRadius="lg" border="1px solid" borderColor="slate.750">
                      <Code colorScheme="purple" bg="transparent" color="cyan.300" fontSize="xs" whiteSpace="pre">
                        {currentQuestion.sample_output}
                      </Code>
                    </Box>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        </Box>

        {/* RIGHT COLUMN: Code Editor & Execution Console (7 cols) */}
        <Box gridColumn={{ base: 'span 12', lg: 'span 7' }}>
          <VStack spacing={4} align="stretch">
            {/* Editor Toolbar */}
            <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
              <CardBody p={3}>
                <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                  <HStack spacing={2}>
                    <Text fontSize="xs" color="gray.400" fontWeight="bold">Language:</Text>
                    <Select
                      size="sm"
                      w="130px"
                      bg="slate.900"
                      borderColor="slate.700"
                      color="white"
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
                      colorScheme="cyan"
                      variant="solid"
                      onClick={handleRunCode}
                      isLoading={isRunning}
                      loadingText="Running..."
                    >
                      ▶ Run Code
                    </Button>

                    <Button
                      size="sm"
                      colorScheme="purple"
                      bgGradient="linear(to-r, purple.500, pink.500)"
                      _hover={{ bgGradient: 'linear(to-r, purple.600, pink.600)' }}
                      onClick={handleSubmitCode}
                      isLoading={isSubmitting}
                      loadingText="Testing..."
                    >
                      Submit
                    </Button>
                  </HStack>
                </Flex>
              </CardBody>
            </Card>

            {/* Monaco Editor Container */}
            <Card bg="slate.900" borderColor="slate.700" borderWidth="1px" overflow="hidden" borderRadius="xl">
              <Box h="380px" w="full">
                <Editor
                  height="100%"
                  language={language === 'c' || language === 'cpp' ? 'cpp' : language}
                  value={codeMap[language]}
                  theme="vs-dark"
                  onChange={handleCodeChange}
                  options={{
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    padding: { top: 12, bottom: 12 },
                  }}
                />
              </Box>
            </Card>

            {/* Execution / Results Panel */}
            <Card bg="slate.800" borderColor="slate.700" borderWidth="1px" borderRadius="xl">
              <CardBody p={4}>
                <Tabs index={activeTab} onChange={(idx) => setActiveTab(idx)} colorScheme="purple" variant="enclosed">
                  <TabList borderColor="slate.700">
                    <Tab color="gray.400" _selected={{ color: 'purple.300', bg: 'slate.900', borderColor: 'slate.700' }} fontSize="xs" fontWeight="bold">
                      Console Output {runResult && (runResult.success ? '✓' : '✗')}
                    </Tab>
                    <Tab color="gray.400" _selected={{ color: 'purple.300', bg: 'slate.900', borderColor: 'slate.700' }} fontSize="xs" fontWeight="bold">
                      Test Case Results {submitResult && (submitResult.isCompleted ? '✓' : '○')}
                    </Tab>
                    <Tab color="gray.400" _selected={{ color: 'purple.300', bg: 'slate.900', borderColor: 'slate.700' }} fontSize="xs" fontWeight="bold">
                      Custom Stdin
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* TAB 1: Console Run Output */}
                    <TabPanel p={3}>
                      {isRunning ? (
                        <Text color="gray.400" fontSize="sm">Executing sandboxed container...</Text>
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
                              <HStack color="gray.400" fontSize="xs">
                                <Icon as={TimeIcon} />
                                <Text>{runResult.executionTime} ms</Text>
                              </HStack>
                            )}
                          </Flex>

                          {/* Stdout */}
                          {runResult.output && (
                            <Box>
                              <Text fontSize="2xs" color="gray.400" textTransform="uppercase" fontWeight="bold" mb={1}>
                                Standard Output
                              </Text>
                              <Box p={3} bg="slate.950" borderRadius="md" border="1px solid" borderColor="slate.700">
                                <Code colorScheme="purple" bg="transparent" color="gray.100" fontSize="xs" whiteSpace="pre-wrap" display="block">
                                  {runResult.output}
                                </Code>
                              </Box>
                            </Box>
                          )}

                          {/* Error */}
                          {runResult.error && (
                            <Box>
                              <Text fontSize="2xs" color="red.400" textTransform="uppercase" fontWeight="bold" mb={1}>
                                Error Output
                              </Text>
                              <Box p={3} bg="rgba(127, 29, 29, 0.2)" borderRadius="md" border="1px solid" borderColor="red.800">
                                <Code colorScheme="red" bg="transparent" color="red.200" fontSize="xs" whiteSpace="pre-wrap" display="block">
                                  {runResult.error}
                                </Code>
                              </Box>
                            </Box>
                          )}
                        </VStack>
                      ) : (
                        <Text color="gray.400" fontSize="xs">
                          Click <strong>Run Code</strong> to execute your solution with custom stdin.
                        </Text>
                      )}
                    </TabPanel>

                    {/* TAB 2: Submission Test Case Results */}
                    <TabPanel p={3}>
                      {isSubmitting ? (
                        <Text color="gray.400" fontSize="sm">Grading solution against all test cases...</Text>
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
                              <Tag colorScheme="purple" size="sm">
                                Score: {submitResult.score || 0} / {submitResult.totalMarks || 10}
                              </Tag>
                            </HStack>

                            <Text color="gray.400" fontSize="xs">
                              Passed: {submitResult.passedTestCases || 0} / {submitResult.totalTestCases || 0} Test Cases
                            </Text>
                          </Flex>

                          {/* Error block if compile error */}
                          {submitResult.error && (
                            <Box p={3} bg="rgba(127, 29, 29, 0.2)" borderRadius="md" border="1px solid" borderColor="red.800">
                              <Text fontSize="xs" color="red.300" fontWeight="bold" mb={1}>
                                {submitResult.errorType || 'Evaluation Error'}
                              </Text>
                              <Code colorScheme="red" bg="transparent" color="red.200" fontSize="xs" whiteSpace="pre-wrap">
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
                                  bg="slate.900"
                                  borderRadius="md"
                                  border="1px solid"
                                  borderColor={tc.passed ? 'emerald.800' : 'red.800'}
                                >
                                  <Flex justify="space-between" align="center">
                                    <HStack spacing={2}>
                                      <Icon
                                        as={tc.passed ? CheckCircleIcon : WarningIcon}
                                        color={tc.passed ? 'emerald.400' : 'red.400'}
                                      />
                                      <Text color="white" fontSize="xs" fontWeight="bold">
                                        Test Case {idx + 1} {tc.isHidden ? '(Hidden)' : ''}
                                      </Text>
                                    </HStack>

                                    <HStack spacing={2}>
                                      <Badge colorScheme={tc.passed ? 'green' : 'red'} fontSize="2xs">
                                        {tc.status || (tc.passed ? 'PASSED' : 'FAILED')}
                                      </Badge>
                                      {tc.executionTime !== undefined && (
                                        <Text color="gray.500" fontSize="2xs">
                                          {tc.executionTime}ms
                                        </Text>
                                      )}
                                    </HStack>
                                  </Flex>

                                  {!tc.isHidden && !tc.passed && (
                                    <Box mt={2} pt={2} borderTop="1px solid" borderColor="slate.800" fontSize="xs">
                                      <Text color="gray.400">Input: <Code colorScheme="gray" fontSize="xs">{tc.input}</Code></Text>
                                      <Text color="gray.400">Expected: <Code colorScheme="green" fontSize="xs">{tc.expectedOutput}</Code></Text>
                                      <Text color="gray.400">Actual: <Code colorScheme="red" fontSize="xs">{tc.actualOutput || tc.error}</Code></Text>
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </VStack>
                          )}
                        </VStack>
                      ) : (
                        <Text color="gray.400" fontSize="xs">
                          Click <strong>Submit</strong> to evaluate your code against all test cases.
                        </Text>
                      )}
                    </TabPanel>

                    {/* TAB 3: Custom Stdin Input */}
                    <TabPanel p={3}>
                      <VStack align="stretch" spacing={2}>
                        <Text fontSize="xs" color="gray.400" fontWeight="bold">
                          Provide custom stdin input for testing:
                        </Text>
                        <Textarea
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="Type stdin input here..."
                          bg="slate.900"
                          borderColor="slate.700"
                          color="white"
                          fontFamily="monospace"
                          fontSize="xs"
                          rows={4}
                        />
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );
};

export default CodingWorkspace;
