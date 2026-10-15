// ──────────────────────────────────────────────
// Faculty: Lab Coding Question Bank Manager
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  Select,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tag,
  Code,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  CheckCircleIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import {
  listLabQuestionsApi,
  createLabQuestionApi,
  deleteLabQuestionApi,
  addLabTestCaseApi,
  deleteLabTestCaseApi,
} from '../../api/labApi';
import { getAllTopicsApi } from '../../api/topicApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const LabQuestionBank = () => {
  const toast = useToast();

  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Question Modal
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    problem_statement: '',
    input_format: '',
    output_format: '',
    constraints: '',
    sample_input: '',
    sample_output: '',
    explanation: '',
    difficulty: 'medium',
    marks: 10,
  });

  // Add Test Case Modal
  const {
    isOpen: isTestCaseOpen,
    onOpen: onTestCaseOpen,
    onClose: onTestCaseClose,
  } = useDisclosure();
  const [targetQuestionId, setTargetQuestionId] = useState(null);
  const [newTestCase, setNewTestCase] = useState({
    input: '',
    expected_output: '',
    is_hidden: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await getAllTopicsApi();
        const tList = res.data?.data?.topics || res.data?.topics || [];
        setTopics(tList);
        if (tList.length > 0) {
          setSelectedTopicId(tList[0].topic_id.toString());
        }
      } catch (err) {
        toast({
          title: 'Error fetching topics',
          description: err.response?.data?.message || 'Could not load topics list.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchTopics();
  }, [toast]);

  // Fetch questions for selected topic
  const loadQuestions = useCallback(async () => {
    if (!selectedTopicId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await listLabQuestionsApi(parseInt(selectedTopicId, 10));
      setQuestions(res.data?.data?.questions || []);
    } catch (err) {
      toast({
        title: 'Error loading questions',
        description: err.response?.data?.message || 'Failed to load question bank.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedTopicId, toast]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Create Question Submit
  const handleCreateQuestion = async () => {
    if (!newQuestion.title || !newQuestion.problem_statement) {
      toast({ title: 'Title and problem statement are required', status: 'warning', duration: 2500 });
      return;
    }

    try {
      setIsSubmitting(true);
      await createLabQuestionApi({
        ...newQuestion,
        topic_id: parseInt(selectedTopicId, 10),
      });

      toast({
        title: 'Question Created',
        description: 'New coding challenge added to the question bank.',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });

      setNewQuestion({
        title: '',
        problem_statement: '',
        input_format: '',
        output_format: '',
        constraints: '',
        sample_input: '',
        sample_output: '',
        explanation: '',
        difficulty: 'medium',
        marks: 10,
      });
      onCreateClose();
      loadQuestions();
    } catch (err) {
      toast({
        title: 'Creation Failed',
        description: err.response?.data?.message || 'Could not save question.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteLabQuestionApi(qId);
      toast({ title: 'Question deleted', status: 'info', duration: 2000 });
      loadQuestions();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err.response?.data?.message || 'Could not delete question.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Add Test Case Submit
  const handleAddTestCase = async () => {
    if (!newTestCase.expected_output) {
      toast({ title: 'Expected output is required', status: 'warning', duration: 2500 });
      return;
    }

    try {
      setIsSubmitting(true);
      await addLabTestCaseApi(targetQuestionId, newTestCase);
      toast({ title: 'Test case added', status: 'success', duration: 2000 });
      setNewTestCase({ input: '', expected_output: '', is_hidden: false });
      onTestCaseClose();
      loadQuestions();
    } catch (err) {
      toast({
        title: 'Failed to add testcase',
        description: err.response?.data?.message || 'Could not add test case.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTestCase = async (testCaseId) => {
    try {
      await deleteLabTestCaseApi(testCaseId);
      toast({ title: 'Test case removed', status: 'info', duration: 2000 });
      loadQuestions();
    } catch (err) {
      toast({
        title: 'Delete test case failed',
        description: err.response?.data?.message || 'Could not remove test case.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Header Banner */}
      <Box
        p={8}
        borderRadius="2xl"
        bg="bg.card"
        border="1px solid"
        borderColor="border.primary"
        boxShadow="sm"
      >
        <Flex
          justify="space-between"
          align={{ base: 'start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
        >
          <VStack align="start" spacing={2}>
            <Heading size="lg" color="text.primary">
              Practical Question Bank 📚
            </Heading>
            <Text color="text.secondary" fontSize="sm">
              Maintain reusable practical coding questions and test cases mapped to curriculum topics.
            </Text>
          </VStack>

          <Button
            onClick={onCreateOpen}
            leftIcon={<AddIcon />}
            colorScheme="brand"
            isDisabled={!selectedTopicId}
          >
            Add New Question
          </Button>
        </Flex>
      </Box>

      {/* Filter by Topic */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody>
          <HStack spacing={4}>
            <Text color="gray.300" fontSize="sm" fontWeight="bold" whiteSpace="nowrap">
              Select Curriculum Topic:
            </Text>
            <Select
              maxW="400px"
              bg="dark.bg"
              borderColor="slate.600"
              color="white"
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
            >
              {topics.map((t) => (
                <option key={t.topic_id} value={t.topic_id}>
                  {t.title}
                </option>
              ))}
            </Select>
            <Badge colorScheme="purple" px={3} py={1} borderRadius="md">
              {questions.length} Questions in Pool
            </Badge>
          </HStack>
        </CardBody>
      </Card>

      {/* Questions List */}
      {isLoading ? (
        <LoadingSpinner label="Loading topic question bank..." />
      ) : questions.length === 0 ? (
        <EmptyState
          title="No Questions in this Topic Bank"
          description="Add 2–5 practical coding questions with test cases to enable randomized lab assessments."
        />
      ) : (
        <Accordion allowMultiple defaultIndex={[0]} reduceMotion>
          {questions.map((q, idx) => (
            <AccordionItem
              key={q.lab_question_id}
              bg="slate.800"
              borderColor="slate.700"
              borderWidth="1px"
              borderRadius="xl"
              mb={4}
              overflow="hidden"
            >
              <AccordionButton p={4} _hover={{ bg: 'slate.750' }}>
                <Flex justify="space-between" align="center" w="full" mr={3}>
                  <HStack spacing={3}>
                    <Badge colorScheme="cyan" px={2} py={0.5} borderRadius="md" fontSize="xs">
                      #{idx + 1}
                    </Badge>
                    <Text fontWeight="bold" color="white" fontSize="sm">
                      {q.title}
                    </Text>
                    <Badge
                      colorScheme={
                        q.difficulty === 'easy'
                          ? 'green'
                          : q.difficulty === 'hard'
                          ? 'red'
                          : 'yellow'
                      }
                      fontSize="2xs"
                      textTransform="capitalize"
                    >
                      {q.difficulty}
                    </Badge>
                    <Badge colorScheme="purple" fontSize="2xs">
                      {q.marks || 10} Marks
                    </Badge>
                  </HStack>

                  <HStack spacing={2} onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="xs"
                      leftIcon={<AddIcon />}
                      colorScheme="teal"
                      variant="outline"
                      onClick={() => {
                        setTargetQuestionId(q.lab_question_id);
                        onTestCaseOpen();
                      }}
                    >
                      Add Test Case
                    </Button>
                    <IconButton
                      size="xs"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteQuestion(q.lab_question_id)}
                      aria-label="Delete question"
                    />
                  </HStack>
                </Flex>
                <AccordionIcon color="gray.400" />
              </AccordionButton>

              <AccordionPanel pb={6} pt={2} px={6} borderTop="1px solid" borderColor="slate.700">
                <VStack align="stretch" spacing={4} fontSize="xs">
                  <Box>
                    <Text fontWeight="bold" color="gray.300" mb={1}>
                      Problem Statement:
                    </Text>
                    <Text color="gray.200" whiteSpace="pre-wrap" lineHeight="tall">
                      {q.problem_statement}
                    </Text>
                  </Box>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {q.sample_input && (
                      <Box>
                        <Text fontWeight="bold" color="gray.300" mb={1}>
                          Sample Input:
                        </Text>
                        <Code p={2} borderRadius="md" w="full" colorScheme="purple" display="block">
                          {q.sample_input}
                        </Code>
                      </Box>
                    )}
                    {q.sample_output && (
                      <Box>
                        <Text fontWeight="bold" color="gray.300" mb={1}>
                          Sample Output:
                        </Text>
                        <Code p={2} borderRadius="md" w="full" colorScheme="green" display="block">
                          {q.sample_output}
                        </Code>
                      </Box>
                    )}
                  </SimpleGrid>

                  {/* Test Cases List */}
                  {q.testCases && q.testCases.length > 0 && (
                    <Box mt={2}>
                      <Text fontWeight="bold" color="gray.300" mb={2}>
                        Configured Test Cases ({q.testCases.length}):
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {q.testCases.map((tc, tcIdx) => (
                          <Flex
                            key={tc.lab_testcase_id || tcIdx}
                            p={3}
                            bg="slate.900"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="slate.700"
                            justify="space-between"
                            align="center"
                          >
                            <VStack align="start" spacing={1}>
                              <HStack>
                                <Badge colorScheme={tc.is_hidden ? 'purple' : 'green'} fontSize="2xs">
                                  {tc.is_hidden ? 'Hidden Case (Evaluation Only)' : 'Visible Case'}
                                </Badge>
                              </HStack>
                              <Text color="gray.400">
                                Input: <code>{tc.input || '(empty)'}</code>
                              </Text>
                              <Text color="gray.400">
                                Expected: <code>{tc.expected_output}</code>
                              </Text>
                            </VStack>
                            <IconButton
                              size="xs"
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDeleteTestCase(tc.lab_testcase_id)}
                              aria-label="Remove testcase"
                            />
                          </Flex>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Modal: Create Question */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg="slate.900" borderColor="slate.700" borderWidth="1px" color="white">
          <ModalHeader>Add Question to Topic Bank</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs" color="gray.300">
                  Question Title
                </FormLabel>
                <Input
                  size="sm"
                  bg="dark.bg"
                  borderColor="slate.600"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion((q) => ({ ...q, title: e.target.value }))}
                  placeholder="e.g. Find Pair with Target Sum in Array"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" color="gray.300">
                  Problem Statement
                </FormLabel>
                <Textarea
                  size="sm"
                  rows={4}
                  bg="dark.bg"
                  borderColor="slate.600"
                  value={newQuestion.problem_statement}
                  onChange={(e) =>
                    setNewQuestion((q) => ({ ...q, problem_statement: e.target.value }))
                  }
                  placeholder="Describe the problem, input format, constraints, and requirements..."
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={3} w="full">
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.300">
                    Difficulty
                  </FormLabel>
                  <Select
                    size="sm"
                    bg="dark.bg"
                    borderColor="slate.600"
                    value={newQuestion.difficulty}
                    onChange={(e) =>
                      setNewQuestion((q) => ({ ...q, difficulty: e.target.value }))
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color="gray.300">
                    Marks
                  </FormLabel>
                  <Input
                    size="sm"
                    type="number"
                    bg="dark.bg"
                    borderColor="slate.600"
                    value={newQuestion.marks}
                    onChange={(e) =>
                      setNewQuestion((q) => ({
                        ...q,
                        marks: parseInt(e.target.value, 10) || 10,
                      }))
                    }
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={3} w="full">
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.300">
                    Sample Input
                  </FormLabel>
                  <Textarea
                    size="xs"
                    rows={2}
                    bg="dark.bg"
                    borderColor="slate.600"
                    value={newQuestion.sample_input}
                    onChange={(e) =>
                      setNewQuestion((q) => ({ ...q, sample_input: e.target.value }))
                    }
                    placeholder="e.g. 5&#10;1 2 3 4 5"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color="gray.300">
                    Sample Output
                  </FormLabel>
                  <Textarea
                    size="xs"
                    rows={2}
                    bg="dark.bg"
                    borderColor="slate.600"
                    value={newQuestion.sample_output}
                    onChange={(e) =>
                      setNewQuestion((q) => ({ ...q, sample_output: e.target.value }))
                    }
                    placeholder="e.g. 15"
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateClose} color="gray.400">
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleCreateQuestion}
              isLoading={isSubmitting}
            >
              Save Question
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal: Add Test Case */}
      <Modal isOpen={isTestCaseOpen} onClose={onTestCaseClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg="slate.900" borderColor="slate.700" borderWidth="1px" color="white">
          <ModalHeader>Add Test Case</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="xs" color="gray.300">
                  Standard Input (stdin)
                </FormLabel>
                <Textarea
                  size="sm"
                  rows={3}
                  bg="dark.bg"
                  borderColor="slate.600"
                  value={newTestCase.input}
                  onChange={(e) =>
                    setNewTestCase((tc) => ({ ...tc, input: e.target.value }))
                  }
                  placeholder="Input fed to stdin..."
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" color="gray.300">
                  Expected Output (stdout)
                </FormLabel>
                <Textarea
                  size="sm"
                  rows={3}
                  bg="dark.bg"
                  borderColor="slate.600"
                  value={newTestCase.expected_output}
                  onChange={(e) =>
                    setNewTestCase((tc) => ({
                      ...tc,
                      expected_output: e.target.value,
                    }))
                  }
                  placeholder="Exact expected standard output..."
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="is-hidden" mb="0" fontSize="xs" color="gray.300">
                  Hidden Test Case (Secret from students during assessment)
                </FormLabel>
                <Switch
                  id="is-hidden"
                  colorScheme="purple"
                  isChecked={newTestCase.is_hidden}
                  onChange={(e) =>
                    setNewTestCase((tc) => ({ ...tc, is_hidden: e.target.checked }))
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTestCaseClose} color="gray.400">
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleAddTestCase}
              isLoading={isSubmitting}
            >
              Add Test Case
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default LabQuestionBank;
