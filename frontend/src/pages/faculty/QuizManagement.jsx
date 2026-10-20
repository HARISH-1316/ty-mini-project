// ──────────────────────────────────────────────
// QuizManagement — Faculty & Admin Quiz Content Management
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Radio,
  RadioGroup,
  NumberInput,
  NumberInputField,
  useDisclosure,
  useToast,
  Flex,
  IconButton,
  Badge,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, DeleteIcon, EditIcon, CheckCircleIcon } from '@chakra-ui/icons';
import {
  getPrerequisiteQuizManageApi,
  addPrereqQuestionApi,
  updatePrereqQuestionApi,
  deletePrereqQuestionApi,
  updatePrereqQuizConfigApi,
  getSubtopicQuizManageApi,
  addSubtopicQuestionApi,
  updateSubtopicQuestionApi,
  deleteSubtopicQuestionApi,
  getFinalQuizManageApi,
  addFinalQuestionApi,
  updateFinalQuestionApi,
  deleteFinalQuestionApi,
  updateFinalQuizConfigApi,
} from '../../api/quizApi';
import { getTopicByIdApi } from '../../api/topicApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';

const initialQuestionForm = {
  question_text: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_option: 'A',
  marks: 1,
  order_index: 1,
};

const QuizManagement = () => {
  const { topicId } = useParams();
  const toast = useToast();

  const [topic, setTopic] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Prerequisite Quiz State
  const [prereqQuizData, setPrereqQuizData] = useState(null);

  // Subtopic Quiz State
  const [subtopics, setSubtopics] = useState([]);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState('');
  const [subtopicQuizData, setSubtopicQuizData] = useState(null);
  const [isLoadingSubtopic, setIsLoadingSubtopic] = useState(false);

  // Final Quiz State
  const [finalQuizData, setFinalQuizData] = useState(null);

  // Question Modal State (Add / Edit)
  const { isOpen: isQModalOpen, onOpen: onOpenQModal, onClose: onCloseQModal } = useDisclosure();
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [targetQuizCategory, setTargetQuizCategory] = useState('prereq'); // 'prereq' | 'subtopic' | 'final'
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionForm, setQuestionForm] = useState(initialQuestionForm);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, category }
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Topic and Main Quizzes
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [topicRes, prereqRes, finalRes] = await Promise.all([
        getTopicByIdApi(topicId),
        getPrerequisiteQuizManageApi(topicId).catch(() => ({ data: null })),
        getFinalQuizManageApi(topicId).catch(() => ({ data: null })),
      ]);

      const t = topicRes.data?.topic || null;
      setTopic(t);
      setPrereqQuizData(prereqRes.data || null);
      setFinalQuizData(finalRes.data || null);

      const stList = t?.subtopics || [];
      setSubtopics(stList);
      if (stList.length > 0 && !selectedSubtopicId) {
        setSelectedSubtopicId(String(stList[0].subtopic_id));
      }
    } catch (err) {
      toast({
        title: 'Error loading quiz management',
        description: err.response?.data?.message || 'Failed to fetch topic quiz information.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [topicId]);

  // Fetch Subtopic Quiz when selected subtopic changes
  useEffect(() => {
    if (!selectedSubtopicId) return;

    const fetchSubtopicQuiz = async () => {
      try {
        setIsLoadingSubtopic(true);
        const res = await getSubtopicQuizManageApi(selectedSubtopicId);
        setSubtopicQuizData(res.data || null);
      } catch {
        setSubtopicQuizData(null);
      } finally {
        setIsLoadingSubtopic(false);
      }
    };

    fetchSubtopicQuiz();
  }, [selectedSubtopicId]);

  // Open Add Question Modal
  const handleOpenAddModal = (category) => {
    setTargetQuizCategory(category);
    setModalType('add');
    setEditingQuestionId(null);
    setQuestionForm({
      ...initialQuestionForm,
      order_index: getCurrentQuestionsCount(category) + 1,
    });
    onOpenQModal();
  };

  // Open Edit Question Modal
  const handleOpenEditModal = (category, q) => {
    setTargetQuizCategory(category);
    setModalType('edit');
    const qId = q.pq_question_id || q.stq_id || q.fq_question_id;
    setEditingQuestionId(qId);
    setQuestionForm({
      question_text: q.question_text || '',
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_option: q.correct_option || 'A',
      marks: q.marks || 1,
      order_index: q.order_index || 1,
    });
    onOpenQModal();
  };

  const getCurrentQuestionsCount = (category) => {
    if (category === 'prereq') return prereqQuizData?.questions?.length || 0;
    if (category === 'subtopic') return subtopicQuizData?.questions?.length || 0;
    if (category === 'final') return finalQuizData?.questions?.length || 0;
    return 0;
  };

  // Save Question (Add or Edit)
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setIsSavingQuestion(true);

    try {
      if (targetQuizCategory === 'prereq') {
        const prereqQuizId = prereqQuizData?.quiz?.prereq_quiz_id;
        if (modalType === 'add') {
          await addPrereqQuestionApi(prereqQuizId, questionForm);
        } else {
          await updatePrereqQuestionApi(editingQuestionId, questionForm);
        }
        const updated = await getPrerequisiteQuizManageApi(topicId);
        setPrereqQuizData(updated.data);
      } else if (targetQuizCategory === 'subtopic') {
        const contentId = subtopicQuizData?.content?.content_id;
        if (modalType === 'add') {
          await addSubtopicQuestionApi(contentId, questionForm);
        } else {
          await updateSubtopicQuestionApi(editingQuestionId, questionForm);
        }
        const updated = await getSubtopicQuizManageApi(selectedSubtopicId);
        setSubtopicQuizData(updated.data);
      } else if (targetQuizCategory === 'final') {
        const finalQuizId = finalQuizData?.quiz?.final_quiz_id;
        if (modalType === 'add') {
          await addFinalQuestionApi(finalQuizId, questionForm);
        } else {
          await updateFinalQuestionApi(editingQuestionId, questionForm);
        }
        const updated = await getFinalQuizManageApi(topicId);
        setFinalQuizData(updated.data);
      }

      toast({
        title: modalType === 'add' ? 'Question Added' : 'Question Updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onCloseQModal();
    } catch (err) {
      toast({
        title: 'Error saving question',
        description: err.response?.data?.message || 'Failed to save question.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSavingQuestion(false);
    }
  };

  // Delete Question
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.category === 'prereq') {
        await deletePrereqQuestionApi(deleteTarget.id);
        const updated = await getPrerequisiteQuizManageApi(topicId);
        setPrereqQuizData(updated.data);
      } else if (deleteTarget.category === 'subtopic') {
        await deleteSubtopicQuestionApi(deleteTarget.id);
        const updated = await getSubtopicQuizManageApi(selectedSubtopicId);
        setSubtopicQuizData(updated.data);
      } else if (deleteTarget.category === 'final') {
        await deleteFinalQuestionApi(deleteTarget.id);
        const updated = await getFinalQuizManageApi(topicId);
        setFinalQuizData(updated.data);
      }

      toast({
        title: 'Question Deleted',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      setDeleteTarget(null);
    } catch (err) {
      toast({
        title: 'Error deleting question',
        description: err.response?.data?.message || 'Failed to delete question.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading quiz management..." />;
  }

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Header */}
      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
        <VStack align="start" spacing={1}>
          <HStack spacing={3}>
            <Button as={RouterLink} to="/faculty/topics" size="sm" variant="ghost" colorScheme="purple" leftIcon={<ArrowBackIcon />}>
              Back to Topics
            </Button>
          </HStack>
          <Heading size="lg" color="white">
            Quiz Management
          </Heading>
          <Text color="gray.400" fontSize="sm">
            Topic: {topic?.title || 'Topic'}
          </Text>
        </VStack>
      </Flex>

      {/* Tabs for Quiz Categories */}
      <Tabs variant="soft-rounded" colorScheme="purple" index={activeTab} onChange={setActiveTab}>
        <TabList bg="slate.800" p={1.5} borderRadius="xl" border="1px solid" borderColor="slate.700">
          <Tab color="text.secondary" _selected={{ color: 'pureWhite', bg: 'purple.600' }}>
            1. Prerequisite Quiz ({prereqQuizData?.questions?.length || 0})
          </Tab>
          <Tab color="text.secondary" _selected={{ color: 'pureWhite', bg: 'purple.600' }}>
            2. Subtopic Quizzes ({subtopicQuizData?.questions?.length || 0})
          </Tab>
          <Tab color="text.secondary" _selected={{ color: 'pureWhite', bg: 'purple.600' }}>
            3. Final Quiz ({finalQuizData?.questions?.length || 0})
          </Tab>
        </TabList>

        <TabPanels pt={4}>
          {/* =========================================================
              PANEL 1: PREREQUISITE QUIZ
             ========================================================= */}
          <TabPanel px={0}>
            <VStack spacing={6} align="stretch">
              <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
                <CardBody p={5}>
                  <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                    <VStack align="start" spacing={1}>
                      <Heading size="md" color="white">
                        {prereqQuizData?.quiz?.title || 'Prerequisite Quiz'}
                      </Heading>
                      <HStack spacing={2}>
                        <Badge colorScheme="purple">
                          {prereqQuizData?.questions?.length || 0} Questions
                        </Badge>
                        <Badge colorScheme="cyan">
                          Total Marks: {prereqQuizData?.quiz?.total_marks || 0}
                        </Badge>
                        <Badge colorScheme="emerald">
                          Pass: {prereqQuizData?.quiz?.passing_criteria || 50}%
                        </Badge>
                      </HStack>
                    </VStack>

                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="brand"
                      onClick={() => handleOpenAddModal('prereq')}
                    >
                      Add Question
                    </Button>
                  </Flex>
                </CardBody>
              </Card>

              {/* Questions List */}
              <QuestionsList
                questions={prereqQuizData?.questions || []}
                idKey="pq_question_id"
                onEdit={(q) => handleOpenEditModal('prereq', q)}
                onDelete={(q) => setDeleteTarget({ id: q.pq_question_id, category: 'prereq' })}
              />
            </VStack>
          </TabPanel>

          {/* =========================================================
              PANEL 2: SUBTOPIC QUIZZES
             ========================================================= */}
          <TabPanel px={0}>
            <VStack spacing={6} align="stretch">
              <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
                <CardBody p={5}>
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontSize="xs" fontWeight="bold" color="purple.300" textTransform="uppercase">
                          Select Subtopic to Manage
                        </Text>
                        <Select
                          value={selectedSubtopicId}
                          onChange={(e) => setSelectedSubtopicId(e.target.value)}
                          bg="slate.900"
                          borderColor="slate.700"
                          color="text.primary"
                          maxW="md"
                        >
                          {subtopics.map((st) => (
                            <option key={st.subtopic_id} value={st.subtopic_id}>
                              {st.title}
                            </option>
                          ))}
                        </Select>
                      </VStack>

                      <Button
                        leftIcon={<AddIcon />}
                        colorScheme="brand"
                        onClick={() => handleOpenAddModal('subtopic')}
                        isDisabled={!selectedSubtopicId || !subtopicQuizData?.content}
                      >
                        Add Question
                      </Button>
                    </Flex>

                    {subtopicQuizData && (
                      <HStack spacing={2} pt={2} borderTop="1px solid" borderColor="slate.700">
                        <Badge colorScheme="purple">
                          {subtopicQuizData.questions?.length || 0} Questions
                        </Badge>
                        <Badge colorScheme="cyan">
                          Total Marks: {subtopicQuizData.total_marks || 0}
                        </Badge>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {isLoadingSubtopic ? (
                <LoadingSpinner label="Loading subtopic questions..." />
              ) : (
                <QuestionsList
                  questions={subtopicQuizData?.questions || []}
                  idKey="stq_id"
                  onEdit={(q) => handleOpenEditModal('subtopic', q)}
                  onDelete={(q) => setDeleteTarget({ id: q.stq_id, category: 'subtopic' })}
                />
              )}
            </VStack>
          </TabPanel>

          {/* =========================================================
              PANEL 3: FINAL TOPIC QUIZ
             ========================================================= */}
          <TabPanel px={0}>
            <VStack spacing={6} align="stretch">
              <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
                <CardBody p={5}>
                  <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                    <VStack align="start" spacing={1}>
                      <Heading size="md" color="white">
                        {finalQuizData?.quiz?.title || 'Final Module Quiz'}
                      </Heading>
                      <HStack spacing={2}>
                        <Badge colorScheme="purple">
                          {finalQuizData?.questions?.length || 0} Questions
                        </Badge>
                        <Badge colorScheme="cyan">
                          Total Marks: {finalQuizData?.quiz?.total_marks || 0}
                        </Badge>
                        <Badge colorScheme="amber">
                          Time Limit: {finalQuizData?.quiz?.time_limit || 15} mins
                        </Badge>
                      </HStack>
                    </VStack>

                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="brand"
                      onClick={() => handleOpenAddModal('final')}
                    >
                      Add Question
                    </Button>
                  </Flex>
                </CardBody>
              </Card>

              {/* Questions List */}
              <QuestionsList
                questions={finalQuizData?.questions || []}
                idKey="fq_question_id"
                onEdit={(q) => handleOpenEditModal('final', q)}
                onDelete={(q) => setDeleteTarget({ id: q.fq_question_id, category: 'final' })}
              />
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Add / Edit Question Modal */}
      <Modal isOpen={isQModalOpen} onClose={onCloseQModal} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="slate.800" borderColor="slate.700" borderWidth="1px" color="white" as="form" onSubmit={handleSaveQuestion}>
          <ModalHeader>
            {modalType === 'add' ? 'Add New Question' : 'Edit Question'}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.300">Question Statement</FormLabel>
                <Textarea
                  placeholder="e.g. What is the time complexity of binary search?"
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                  bg="slate.900"
                  borderColor="slate.700"
                  rows={3}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.300">Option A</FormLabel>
                  <Input
                    value={questionForm.option_a}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                    bg="slate.900"
                    borderColor="slate.700"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.300">Option B</FormLabel>
                  <Input
                    value={questionForm.option_b}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                    bg="slate.900"
                    borderColor="slate.700"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.300">Option C</FormLabel>
                  <Input
                    value={questionForm.option_c}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                    bg="slate.900"
                    borderColor="slate.700"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.300">Option D</FormLabel>
                  <Input
                    value={questionForm.option_d}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                    bg="slate.900"
                    borderColor="slate.700"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} pt={2}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.300">Correct Answer</FormLabel>
                  <Select
                    value={questionForm.correct_option}
                    onChange={(e) => setQuestionForm({ ...questionForm, correct_option: e.target.value })}
                    bg="slate.900"
                    borderColor="slate.700"
                    color="accent.primary"
                    fontWeight="bold"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.300">Marks</FormLabel>
                  <NumberInput
                    min={1}
                    max={10}
                    value={questionForm.marks}
                    onChange={(valStr, valNum) => setQuestionForm({ ...questionForm, marks: valNum || 1 })}
                  >
                    <NumberInputField bg="slate.900" borderColor="slate.700" />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">Order Index</FormLabel>
                  <NumberInput
                    min={1}
                    value={questionForm.order_index}
                    onChange={(valStr, valNum) => setQuestionForm({ ...questionForm, order_index: valNum || 1 })}
                  >
                    <NumberInputField bg="slate.900" borderColor="slate.700" />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" colorScheme="gray" mr={3} onClick={onCloseQModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={isSavingQuestion}
            >
              Save Question
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Question"
        message="Are you sure you want to permanently delete this quiz question?"
        confirmText="Delete Question"
        colorScheme="red"
        isLoading={isDeleting}
      />
    </VStack>
  );
};

// Reusable Questions List Component for Management View
const QuestionsList = ({ questions = [], idKey, onEdit, onDelete }) => {
  if (questions.length === 0) {
    return (
      <EmptyState
        title="No Questions Added"
        description="Click 'Add Question' to create the first question for this quiz."
      />
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {questions.map((q, idx) => {
        const qId = q[idKey] || idx;
        return (
          <Card key={qId} bg="slate.800" borderColor="slate.700" borderWidth="1px" borderRadius="xl">
            <CardBody p={5}>
              <VStack align="stretch" spacing={3}>
                <Flex justify="space-between" align="start" gap={3}>
                  <HStack spacing={2} align="start" flex={1}>
                    <Badge colorScheme="purple" fontSize="xs" mt={0.5}>
                      #{idx + 1}
                    </Badge>
                    <Text color="white" fontWeight="medium" fontSize="md">
                      {q.question_text}
                    </Text>
                  </HStack>

                  <HStack spacing={2}>
                    <Badge colorScheme="cyan">Marks: {q.marks || 1}</Badge>
                    <IconButton
                      aria-label="Edit Question"
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="purple"
                      onClick={() => onEdit(q)}
                    />
                    <IconButton
                      aria-label="Delete Question"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => onDelete(q)}
                    />
                  </HStack>
                </Flex>

                {/* Options display with correct answer highlighted */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2} pt={2}>
                  {[
                    { key: 'A', text: q.option_a },
                    { key: 'B', text: q.option_b },
                    { key: 'C', text: q.option_c },
                    { key: 'D', text: q.option_d },
                  ].map((opt) => {
                    const isCorrect = q.correct_option === opt.key;
                    return (
                      <Box
                        key={opt.key}
                        p={2.5}
                        borderRadius="md"
                        bg={isCorrect ? 'rgba(34, 197, 94, 0.15)' : 'slate.900'}
                        border="1px solid"
                        borderColor={isCorrect ? 'emerald.500' : 'slate.700'}
                      >
                        <HStack spacing={2}>
                          <Badge colorScheme={isCorrect ? 'green' : 'gray'} fontSize="xs">
                            {opt.key}
                          </Badge>
                          <Text color={isCorrect ? 'emerald.300' : 'gray.300'} fontSize="xs" fontWeight={isCorrect ? 'bold' : 'normal'}>
                            {opt.text}
                          </Text>
                          {isCorrect && <CheckCircleIcon color="emerald.400" w={3.5} h={3.5} ml="auto" />}
                        </HStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        );
      })}
    </VStack>
  );
};

export default QuizManagement;
