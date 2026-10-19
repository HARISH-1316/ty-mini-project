// ──────────────────────────────────────────────
// Faculty: Lab Coding Question Bank Manager
// ──────────────────────────────────────────────
// Full support for 17 DSA topics, comprehensive question
// creation with inline test cases, difficulty marking (5/10/15),
// publish/unpublish, archive/unarchive, and student preview.
// Styled according to the clean, high-contrast normal green theme.
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
  FormHelperText,
  Input,
  Textarea,
  Switch,
  Divider,
  Tag,
  Code,
  IconButton,
  Flex,
  InputGroup,
  InputLeftElement,
  Tooltip,
  Checkbox,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  CheckCircleIcon,
  ViewIcon,
  SearchIcon,
  RepeatIcon,
} from '@chakra-ui/icons';
import {
  listLabQuestionsApi,
  createLabQuestionApi,
  updateLabQuestionApi,
  deleteLabQuestionApi,
  publishLabQuestionApi,
  unpublishLabQuestionApi,
  archiveLabQuestionApi,
  unarchiveLabQuestionApi,
  getQuestionBankTopicsSummaryApi,
  addLabTestCaseApi,
  deleteLabTestCaseApi,
} from '../../api/labApi';
import { getTopicSubtopicsApi } from '../../api/topicApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const DIFFICULTY_MARKS = {
  easy: 5,
  medium: 10,
  hard: 15,
};

const DIFFICULTY_COLORS = {
  easy: 'green',
  medium: 'blue',
  hard: 'purple',
};

const ALL_LANGUAGES = [
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'python', label: 'Python' },
];

const LabQuestionBank = () => {
  const toast = useToast();

  // High-contrast Normal Theme Color Tokens
  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#292D2A');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#B8C0B9');
  const activeTopicBg = useColorModeValue('#E8F5E9', '#303B22');
  const activeTopicBorder = useColorModeValue('#2F8D46', '#A3E635');

  // Topics and filtering state
  const [topicsSummary, setTopicsSummary] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('all');
  const [topicSearch, setTopicSearch] = useState('');
  const [questionSearch, setQuestionSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Question list state
  const [questions, setQuestions] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subtopics cache by topicId
  const [subtopicsByTopic, setSubtopicsByTopic] = useState({});

  // ── Create Question Modal State ──────────────
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const [createForm, setCreateForm] = useState({
    topic_id: '',
    subtopic_id: '',
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
    supported_languages: ['c', 'cpp', 'java', 'python'],
    status: 'published',
    is_published: true,
  });

  const [createTestCases, setCreateTestCases] = useState([
    { input: '', expected_output: '', is_hidden: false },
    { input: '', expected_output: '', is_hidden: true },
  ]);

  // ── Edit Question Modal State ────────────────
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editTestCases, setEditTestCases] = useState([]);

  // ── Student Preview Modal State ──────────────
  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // ── Add Test Case Modal State (standalone) ────
  const {
    isOpen: isAddCaseOpen,
    onOpen: onAddCaseOpen,
    onClose: onAddCaseClose,
  } = useDisclosure();
  const [targetQuestionForCase, setTargetQuestionForCase] = useState(null);
  const [standaloneCase, setStandaloneCase] = useState({
    input: '',
    expected_output: '',
    is_hidden: false,
  });

  // ── 1. Load Topics Summary ──────────────────
  const fetchTopicsSummary = useCallback(async () => {
    try {
      setIsLoadingTopics(true);
      const res = await getQuestionBankTopicsSummaryApi();
      const list = res.data?.data?.topics || res.data?.topics || [];
      setTopicsSummary(list);
    } catch (err) {
      toast({
        title: 'Error loading topics',
        description: err.response?.data?.message || 'Failed to fetch topic question stats.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingTopics(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTopicsSummary();
  }, [fetchTopicsSummary]);

  // ── 2. Load Questions ────────────────────────
  const loadQuestions = useCallback(async () => {
    try {
      setIsLoadingQuestions(true);
      const params = {};
      if (selectedTopicId !== 'all') {
        params.topicId = parseInt(selectedTopicId, 10);
      }
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      if (filterDifficulty !== 'all') {
        params.difficulty = filterDifficulty;
      }
      if (questionSearch.trim()) {
        params.search = questionSearch.trim();
      }

      const res = await listLabQuestionsApi(params);
      const qList = res.data?.data?.questions || res.data?.questions || [];
      setQuestions(qList);
    } catch (err) {
      toast({
        title: 'Error loading questions',
        description: err.response?.data?.message || 'Could not retrieve questions.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [selectedTopicId, filterStatus, filterDifficulty, questionSearch, toast]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Load subtopics for a topic on demand
  const loadSubtopics = useCallback(async (tId) => {
    if (!tId || subtopicsByTopic[tId]) return;
    try {
      const res = await getTopicSubtopicsApi(tId);
      const subs = res.data?.subtopics || res.subtopics || [];
      setSubtopicsByTopic((prev) => ({ ...prev, [tId]: subs }));
    } catch {
      // Non-critical
    }
  }, [subtopicsByTopic]);

  // ── 3. Open Create Modal ─────────────────────
  const handleOpenCreate = (topicId = null) => {
    const tId = topicId || (selectedTopicId !== 'all' ? selectedTopicId : topicsSummary[0]?.topic_id?.toString() || '');
    setCreateForm({
      topic_id: tId,
      subtopic_id: '',
      title: '',
      problem_statement: '',
      input_format: '',
      output_format: '',
      constraints: '',
      sample_input: '',
      sample_output: '',
      explanation: '',
      difficulty: 'medium',
      marks: DIFFICULTY_MARKS.medium,
      supported_languages: ['c', 'cpp', 'java', 'python'],
      status: 'published',
      is_published: true,
    });
    setCreateTestCases([
      { input: '', expected_output: '', is_hidden: false },
      { input: '', expected_output: '', is_hidden: true },
    ]);
    if (tId) loadSubtopics(tId);
    onCreateOpen();
  };

  const handleDifficultyChange = (val, isEditing = false) => {
    const marks = DIFFICULTY_MARKS[val] || 10;
    if (isEditing) {
      setEditForm((prev) => ({ ...prev, difficulty: val, marks }));
    } else {
      setCreateForm((prev) => ({ ...prev, difficulty: val, marks }));
    }
  };

  // ── 4. Submit Create Question ────────────────
  const handleCreateSubmit = async () => {
    if (!createForm.topic_id) {
      toast({ title: 'Please select a topic', status: 'warning', duration: 2500 });
      return;
    }
    if (!createForm.title.trim() || !createForm.problem_statement.trim()) {
      toast({ title: 'Title and Problem Statement are required', status: 'warning', duration: 2500 });
      return;
    }

    const validTestCases = createTestCases.filter((tc) => tc.expected_output && tc.expected_output.trim().length > 0);
    if (validTestCases.length === 0) {
      toast({
        title: 'At least one testcase required',
        description: 'Please provide at least one testcase with expected output.',
        status: 'warning',
        duration: 3500,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...createForm,
        topic_id: parseInt(createForm.topic_id, 10),
        subtopic_id: createForm.subtopic_id ? parseInt(createForm.subtopic_id, 10) : null,
        marks: DIFFICULTY_MARKS[createForm.difficulty] || 10,
        test_cases: validTestCases,
      };

      await createLabQuestionApi(payload);

      toast({
        title: 'Question Created Successfully',
        description: `"${createForm.title}" added with ${validTestCases.length} testcase(s).`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onCreateClose();
      fetchTopicsSummary();
      loadQuestions();
    } catch (err) {
      toast({
        title: 'Creation Failed',
        description: err.response?.data?.message || 'Could not save question to PostgreSQL.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 5. Open Edit Modal ───────────────────────
  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setEditForm({
      title: q.title || '',
      problem_statement: q.problem_statement || '',
      input_format: q.input_format || '',
      output_format: q.output_format || '',
      constraints: q.constraints || '',
      sample_input: q.sample_input || '',
      sample_output: q.sample_output || '',
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'medium',
      marks: DIFFICULTY_MARKS[q.difficulty] || 10,
      supported_languages: q.supported_languages || ['c', 'cpp', 'java', 'python'],
      status: q.status || (q.is_published ? 'published' : 'draft'),
      is_published: q.is_published ?? true,
      topic_id: q.topic_id?.toString() || '',
      subtopic_id: q.subtopic_id?.toString() || '',
    });
    setEditTestCases(q.testCases ? [...q.testCases] : []);
    if (q.topic_id) loadSubtopics(q.topic_id);
    onEditOpen();
  };

  // ── 6. Submit Edit Question ──────────────────
  const handleEditSubmit = async () => {
    if (!editForm.title?.trim() || !editForm.problem_statement?.trim()) {
      toast({ title: 'Title and Problem Statement are required', status: 'warning', duration: 2500 });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...editForm,
        topic_id: parseInt(editForm.topic_id, 10),
        subtopic_id: editForm.subtopic_id ? parseInt(editForm.subtopic_id, 10) : null,
        marks: DIFFICULTY_MARKS[editForm.difficulty] || 10,
        test_cases: editTestCases.filter((tc) => tc.expected_output && tc.expected_output.trim().length > 0),
      };

      await updateLabQuestionApi(editingQuestion.lab_question_id, payload);

      toast({
        title: 'Question Updated',
        description: 'Changes and testcases have been saved to the database.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onEditClose();
      fetchTopicsSummary();
      loadQuestions();
    } catch (err) {
      toast({
        title: 'Update Failed',
        description: err.response?.data?.message || 'Could not update question.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 7. Publish / Unpublish Actions ───────────
  const handleTogglePublish = async (q) => {
    const isCurrentlyPublished = q.status === 'published' && q.is_published;
    try {
      if (isCurrentlyPublished) {
        await unpublishLabQuestionApi(q.lab_question_id);
        toast({ title: 'Question set to Draft', status: 'info', duration: 2500 });
      } else {
        await publishLabQuestionApi(q.lab_question_id);
        toast({ title: 'Question Published', description: 'Question is now available for Lab Assessments.', status: 'success', duration: 2500 });
      }
      fetchTopicsSummary();
      loadQuestions();
    } catch (err) {
      toast({
        title: 'Action Failed',
        description: err.response?.data?.message || 'Could not change publication status.',
        status: 'error',
        duration: 3500,
      });
    }
  };

  // ── 8. Archive / Unarchive Actions ───────────
  const handleToggleArchive = async (q) => {
    const isArchived = q.is_archived || q.status === 'archived';
    try {
      if (isArchived) {
        await unarchiveLabQuestionApi(q.lab_question_id);
        toast({ title: 'Question Restored', description: 'Question unarchived successfully.', status: 'success', duration: 2500 });
      } else {
        await archiveLabQuestionApi(q.lab_question_id);
        toast({ title: 'Question Archived', description: 'Question moved to archive.', status: 'info', duration: 2500 });
      }
      fetchTopicsSummary();
      loadQuestions();
    } catch (err) {
      toast({
        title: 'Archive Action Failed',
        description: err.response?.data?.message || 'Could not update archive state.',
        status: 'error',
        duration: 3500,
      });
    }
  };

  // ── 9. Delete Question Action ────────────────
  const handleDeleteQuestion = async (q) => {
    if (!window.confirm(`Are you sure you want to delete "${q.title}"? Questions used in existing assessments will be safely archived instead.`)) {
      return;
    }
    try {
      const res = await deleteLabQuestionApi(q.lab_question_id);
      toast({
        title: 'Question Deleted / Archived',
        description: res.data?.message || 'Operation completed.',
        status: 'info',
        duration: 3000,
      });
      fetchTopicsSummary();
      loadQuestions();
    } catch (err) {
      toast({
        title: 'Delete Failed',
        description: err.response?.data?.message || 'Could not delete question.',
        status: 'error',
        duration: 3500,
      });
    }
  };

  // ── 10. Standalone Add Test Case ─────────────
  const handleOpenAddCase = (q) => {
    setTargetQuestionForCase(q);
    setStandaloneCase({ input: '', expected_output: '', is_hidden: false });
    onAddCaseOpen();
  };

  const handleStandaloneCaseSubmit = async () => {
    if (!standaloneCase.expected_output.trim()) {
      toast({ title: 'Expected output is required', status: 'warning', duration: 2500 });
      return;
    }
    try {
      setIsSubmitting(true);
      await addLabTestCaseApi(targetQuestionForCase.lab_question_id, standaloneCase);
      toast({ title: 'Test Case Added', status: 'success', duration: 2000 });
      onAddCaseClose();
      loadQuestions();
    } catch (err) {
      toast({
        title: 'Failed to add testcase',
        description: err.response?.data?.message || 'Could not save testcase.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTestCaseDirect = async (testCaseId) => {
    if (!window.confirm('Delete this testcase?')) return;
    try {
      await deleteLabTestCaseApi(testCaseId);
      toast({ title: 'Test case deleted', status: 'info', duration: 2000 });
      loadQuestions();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err.response?.data?.message || 'Could not delete testcase.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // ── 11. Student Preview ──────────────────────
  const handleOpenPreview = (q) => {
    setPreviewQuestion(q);
    onPreviewOpen();
  };

  // Filter topics for the topic browser
  const filteredTopics = topicsSummary.filter((t) =>
    t.title.toLowerCase().includes(topicSearch.toLowerCase())
  );

  // Overall totals across all topics
  const totalQuestionsAll = topicsSummary.reduce((acc, t) => acc + (t.question_count || 0), 0);
  const totalPublishedAll = topicsSummary.reduce((acc, t) => acc + (t.published_count || 0), 0);
  const totalDraftAll = topicsSummary.reduce((acc, t) => acc + (t.draft_count || 0), 0);
  const totalArchivedAll = topicsSummary.reduce((acc, t) => acc + (t.archived_count || 0), 0);

  const activeTopicObj = topicsSummary.find((t) => t.topic_id?.toString() === selectedTopicId);

  return (
    <VStack spacing={8} align="stretch" w="full" maxW="1440px" mx="auto" pb={16}>
      {/* ── Top Header & Stats ────────────────────────────── */}
      <Box p={6} borderRadius="2xl" bg={cardBg} border="1px solid" borderColor={cardBorder} boxShadow="sm">
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
          <Box>
            <Heading size="lg" color={textColor} fontWeight="800" letterSpacing="-0.02em">
              Faculty Question Bank
            </Heading>
            <Text color={mutedText} fontSize="sm" mt={1}>
              Curate, edit, and publish topic-specific coding challenges across all 17 DSA curriculum modules.
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<RepeatIcon />}
              variant="outline"
              size="sm"
              onClick={() => {
                fetchTopicsSummary();
                loadQuestions();
              }}
              isLoading={isLoadingTopics || isLoadingQuestions}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="brand"
              size="sm"
              onClick={() => handleOpenCreate()}
              boxShadow="sm"
            >
              Create Question
            </Button>
          </HStack>
        </Flex>

        {/* Global Stats Badges */}
        <HStack spacing={3} mt={4} wrap="wrap">
          <Tag size="md" colorScheme="gray" variant="subtle" py={1} px={3} borderRadius="full">
            <Text fontWeight="bold" mr={1.5}>{totalQuestionsAll}</Text> Total Questions
          </Tag>
          <Tag size="md" colorScheme="green" variant="subtle" py={1} px={3} borderRadius="full">
            <CheckCircleIcon mr={1.5} /> <Text fontWeight="bold" mr={1.5}>{totalPublishedAll}</Text> Published
          </Tag>
          <Tag size="md" colorScheme="orange" variant="subtle" py={1} px={3} borderRadius="full">
            <Text fontWeight="bold" mr={1.5}>{totalDraftAll}</Text> Drafts
          </Tag>
          <Tag size="md" colorScheme="gray" variant="outline" py={1} px={3} borderRadius="full">
            <Text fontWeight="bold" mr={1.5}>{totalArchivedAll}</Text> Archived
          </Tag>
          <Tag size="md" colorScheme="green" variant="outline" py={1} px={3} borderRadius="full">
            <Text fontWeight="bold" mr={1.5}>17 / 17</Text> DSA Topics
          </Tag>
        </HStack>
      </Box>

      {/* ── Phase 2: Faculty Topic List / Grid ────────────── */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="2xl" boxShadow="sm">
        <CardBody p={5}>
          <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} mb={4} direction={{ base: 'column', sm: 'row' }} gap={3}>
            <HStack spacing={2}>
              <Heading size="sm" color={textColor} fontWeight="700">
                DSA Topics ({topicsSummary.length})
              </Heading>
              <Text fontSize="xs" color={mutedText}>
                Select a topic to view its question bank
              </Text>
            </HStack>
            <HStack spacing={3} w={{ base: 'full', sm: 'auto' }}>
              <InputGroup size="sm" maxW={{ base: 'full', sm: '260px' }}>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Filter 17 topics..."
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  borderRadius="lg"
                  bg={cardBg}
                  borderColor={cardBorder}
                  color={textColor}
                />
              </InputGroup>
              <Button
                size="sm"
                variant={selectedTopicId === 'all' ? 'solid' : 'ghost'}
                colorScheme="brand"
                onClick={() => setSelectedTopicId('all')}
              >
                All Topics
              </Button>
            </HStack>
          </Flex>

          {isLoadingTopics ? (
            <Flex justify="center" p={8}>
              <LoadingSpinner message="Loading topics..." />
            </Flex>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }} spacing={3}>
              {filteredTopics.map((t, idx) => {
                const isSelected = selectedTopicId === t.topic_id?.toString();
                const hasMinFive = (t.question_count || 0) >= 5;
                return (
                  <Box
                    key={t.topic_id}
                    p={3.5}
                    borderRadius="xl"
                    borderWidth="2px"
                    borderColor={isSelected ? activeTopicBorder : cardBorder}
                    bg={isSelected ? activeTopicBg : cardBg}
                    cursor="pointer"
                    transition="all 0.15s ease-in-out"
                    _hover={{ borderColor: 'brand.500', transform: 'translateY(-1px)' }}
                    onClick={() => setSelectedTopicId(t.topic_id.toString())}
                    position="relative"
                    boxShadow="xs"
                  >
                    <Flex justify="space-between" align="center" mb={2}>
                      <Badge
                        size="xs"
                        bg={isSelected ? 'brand.500' : 'gray.100'}
                        color={isSelected ? 'white' : 'gray.700'}
                        fontSize="10px"
                        borderRadius="md"
                        px={1.5}
                        py={0.5}
                        fontWeight="700"
                      >
                        #{idx + 1}
                      </Badge>
                      <Badge
                        size="xs"
                        colorScheme={hasMinFive ? 'green' : 'orange'}
                        fontSize="10px"
                        borderRadius="full"
                        px={2}
                        py={0.5}
                        fontWeight="700"
                      >
                        {t.question_count} Qs
                      </Badge>
                    </Flex>
                    <Text fontWeight="700" fontSize="xs" color={textColor} noOfLines={2} title={t.title} mb={2} lineHeight="short">
                      {t.title}
                    </Text>
                    <HStack spacing={1.5} fontSize="10px" color={mutedText}>
                      <Text color="green.600" fontWeight="700">{t.published_count || 0} pub</Text>
                      {t.draft_count > 0 && <Text color="orange.600">• {t.draft_count} draft</Text>}
                      {t.archived_count > 0 && <Text color="gray.500">• {t.archived_count} arc</Text>}
                    </HStack>
                    <Button
                      size="xs"
                      w="full"
                      mt={2.5}
                      variant={isSelected ? 'solid' : 'outline'}
                      colorScheme="brand"
                      fontSize="10px"
                      h="24px"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCreate(t.topic_id.toString());
                      }}
                    >
                      + Add Question
                    </Button>
                  </Box>
                );
              })}
            </SimpleGrid>
          )}
        </CardBody>
      </Card>

      {/* ── Question Bank Explorer & Filters ────────────── */}
      <Box>
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={4}>
          <HStack spacing={3}>
            <Heading size="md" color={textColor} fontWeight="800">
              {activeTopicObj ? activeTopicObj.title : 'All Questions'}
            </Heading>
            <Badge colorScheme="green" fontSize="sm" px={2.5} py={0.5} borderRadius="full" fontWeight="700">
              {questions.length} Question{questions.length !== 1 ? 's' : ''}
            </Badge>
          </HStack>

          <HStack spacing={3} wrap="wrap" w={{ base: 'full', md: 'auto' }}>
            {/* Search Input */}
            <InputGroup size="sm" maxW={{ base: 'full', sm: '220px' }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search questions..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                borderRadius="lg"
                bg={cardBg}
                borderColor={cardBorder}
                color={textColor}
              />
            </InputGroup>

            {/* Difficulty Filter */}
            <Select
              size="sm"
              w="150px"
              borderRadius="lg"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              bg={cardBg}
              borderColor={cardBorder}
              color={textColor}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy (5 marks)</option>
              <option value="medium">Medium (10 marks)</option>
              <option value="hard">Hard (15 marks)</option>
            </Select>

            {/* Status Filter */}
            <Select
              size="sm"
              w="140px"
              borderRadius="lg"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              bg={cardBg}
              borderColor={cardBorder}
              color={textColor}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>

            <Button
              size="sm"
              colorScheme="brand"
              leftIcon={<AddIcon />}
              onClick={() => handleOpenCreate(selectedTopicId !== 'all' ? selectedTopicId : null)}
            >
              New Question
            </Button>
          </HStack>
        </Flex>

        {/* Questions List */}
        {isLoadingQuestions ? (
          <Flex justify="center" p={12}>
            <LoadingSpinner message="Loading questions..." />
          </Flex>
        ) : questions.length === 0 ? (
          <EmptyState
            title="No questions found"
            description="No coding questions match your current filters or selected topic."
            actionLabel="Create First Question"
            onAction={() => handleOpenCreate(selectedTopicId !== 'all' ? selectedTopicId : null)}
          />
        ) : (
          <VStack spacing={4} align="stretch">
            {questions.map((q) => {
              const diffColor = DIFFICULTY_COLORS[q.difficulty] || 'gray';
              const isArchived = q.is_archived || q.status === 'archived';
              const isPublished = q.status === 'published' && q.is_published && !isArchived;
              const testCases = q.testCases || [];
              const visibleCases = testCases.filter((tc) => !tc.is_hidden).length;
              const hiddenCases = testCases.filter((tc) => tc.is_hidden).length;

              return (
                <Card
                  key={q.lab_question_id}
                  bg={cardBg}
                  borderColor={cardBorder}
                  borderWidth="1px"
                  borderRadius="xl"
                  boxShadow="xs"
                  opacity={isArchived ? 0.75 : 1}
                  transition="all 0.15s ease"
                  _hover={{ borderColor: 'brand.500', boxShadow: 'sm' }}
                >
                  <CardBody p={5}>
                    <Flex justify="space-between" align="start" gap={4} direction={{ base: 'column', md: 'row' }}>
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack spacing={2} wrap="wrap">
                          <Heading size="sm" color={textColor} fontWeight="700">
                            {q.title}
                          </Heading>

                          {/* Difficulty & Marks Badge */}
                          <Badge colorScheme={diffColor} textTransform="capitalize" px={2} py={0.5} borderRadius="md" fontWeight="700">
                            {q.difficulty} ({q.marks || DIFFICULTY_MARKS[q.difficulty] || 10}m)
                          </Badge>

                          {/* Publication Status Badge */}
                          <Badge
                            colorScheme={isArchived ? 'gray' : isPublished ? 'green' : 'orange'}
                            textTransform="capitalize"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                            fontWeight="700"
                          >
                            {isArchived ? 'Archived' : isPublished ? 'Published' : 'Draft'}
                          </Badge>

                          {/* Topic Tag */}
                          {q.topic_title && (
                            <Tag size="sm" colorScheme="green" variant="subtle" borderRadius="md">
                              {q.topic_title}
                            </Tag>
                          )}
                          {q.subtopic_title && (
                            <Tag size="sm" colorScheme="teal" variant="subtle" borderRadius="md">
                              {q.subtopic_title}
                            </Tag>
                          )}
                        </HStack>

                        {/* Problem statement preview */}
                        <Text color={mutedText} fontSize="sm" noOfLines={2}>
                          {q.problem_statement}
                        </Text>

                        {/* Supported Languages & Testcase summary */}
                        <HStack spacing={3} pt={1} wrap="wrap">
                          <HStack spacing={1}>
                            <Text fontSize="xs" color={mutedText} fontWeight="600">Languages:</Text>
                            {(q.supported_languages || ['c', 'cpp', 'java', 'python']).map((lang) => (
                              <Badge key={lang} size="xs" variant="outline" colorScheme="gray" textTransform="uppercase" fontSize="10px">
                                {lang}
                              </Badge>
                            ))}
                          </HStack>

                          <HStack spacing={1}>
                            <Text fontSize="xs" color={mutedText} fontWeight="600">Test Cases:</Text>
                            <Badge size="xs" colorScheme={testCases.length > 0 ? 'purple' : 'red'}>
                              {testCases.length} total ({visibleCases} visible, {hiddenCases} hidden)
                            </Badge>
                          </HStack>
                        </HStack>
                      </VStack>

                      {/* Action Buttons */}
                      <HStack spacing={2} align="center" wrap="wrap">
                        {/* Student Preview Button */}
                        <Tooltip label="Preview as student sees it" hasArrow>
                          <IconButton
                            icon={<ViewIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            aria-label="Student Preview"
                            onClick={() => handleOpenPreview(q)}
                          />
                        </Tooltip>

                        {/* Edit Button */}
                        <Tooltip label="Edit question & test cases" hasArrow>
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="yellow"
                            aria-label="Edit Question"
                            onClick={() => handleOpenEdit(q)}
                          />
                        </Tooltip>

                        {/* Publish / Unpublish Button */}
                        <Tooltip label={isPublished ? 'Unpublish to Draft' : 'Publish Question'} hasArrow>
                          <Button
                            size="sm"
                            variant={isPublished ? 'outline' : 'solid'}
                            colorScheme={isPublished ? 'orange' : 'green'}
                            leftIcon={<CheckCircleIcon />}
                            onClick={() => handleTogglePublish(q)}
                          >
                            {isPublished ? 'Draft' : 'Publish'}
                          </Button>
                        </Tooltip>

                        {/* Archive / Unarchive Button */}
                        <Tooltip label={isArchived ? 'Restore from Archive' : 'Archive Question'} hasArrow>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme={isArchived ? 'green' : 'gray'}
                            onClick={() => handleToggleArchive(q)}
                          >
                            {isArchived ? 'Restore' : 'Archive'}
                          </Button>
                        </Tooltip>

                        {/* Delete Button */}
                        <Tooltip label="Delete question" hasArrow>
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            aria-label="Delete Question"
                            onClick={() => handleDeleteQuestion(q)}
                          />
                        </Tooltip>
                      </HStack>
                    </Flex>

                    {/* Inline Test Cases Dropdown / Preview */}
                    {testCases.length > 0 && (
                      <Box mt={3} pt={3} borderTop="1px" borderColor={cardBorder}>
                        <Flex justify="space-between" align="center" mb={2}>
                          <Text fontSize="xs" fontWeight="700" color={mutedText} textTransform="uppercase">
                            Configured Test Cases ({testCases.length})
                          </Text>
                          <Button
                            size="xs"
                            leftIcon={<AddIcon />}
                            variant="ghost"
                            colorScheme="brand"
                            onClick={() => handleOpenAddCase(q)}
                          >
                            Add Test Case
                          </Button>
                        </Flex>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                          {testCases.map((tc, tcIdx) => (
                            <Box
                              key={tc.test_case_id || tcIdx}
                              p={2.5}
                              borderRadius="md"
                              bg={surfaceBg}
                              borderWidth="1px"
                              borderColor={cardBorder}
                              fontSize="xs"
                            >
                              <Flex justify="space-between" align="center" mb={1}>
                                <HStack spacing={1}>
                                  <Text fontWeight="bold" color={textColor}>Case #{tcIdx + 1}</Text>
                                  <Badge size="xs" colorScheme={tc.is_hidden ? 'purple' : 'green'} fontSize="9px">
                                    {tc.is_hidden ? 'Hidden' : 'Visible'}
                                  </Badge>
                                </HStack>
                                <IconButton
                                  icon={<DeleteIcon />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="red"
                                  aria-label="Delete case"
                                  onClick={() => handleDeleteTestCaseDirect(tc.test_case_id)}
                                />
                              </Flex>
                              <Text color={mutedText} noOfLines={1}>
                                <strong>In:</strong> <Code fontSize="10px">{tc.input || '(empty)'}</Code>
                              </Text>
                              <Text color={mutedText} noOfLines={1} mt={0.5}>
                                <strong>Exp:</strong> <Code fontSize="10px">{tc.expected_output}</Code>
                              </Text>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </VStack>
        )}
      </Box>

      {/* ── CREATE QUESTION MODAL ────────────────────────── */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent borderRadius="2xl" bg={cardBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader pb={1}>
            <Heading size="md" color={textColor} fontWeight="800">Create Coding Question</Heading>
            <Text fontSize="xs" color={mutedText} mt={1}>
              The question and its test cases will be stored permanently in PostgreSQL and ready for assessment selection.
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <VStack spacing={5} align="stretch">
              {/* Topic & Subtopic Row */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>DSA Topic</FormLabel>
                  <Select
                    value={createForm.topic_id}
                    onChange={(e) => {
                      const tId = e.target.value;
                      setCreateForm((f) => ({ ...f, topic_id: tId, subtopic_id: '' }));
                      if (tId) loadSubtopics(tId);
                    }}
                  >
                    <option value="">Select Topic...</option>
                    {topicsSummary.map((t) => (
                      <option key={t.topic_id} value={t.topic_id}>
                        {t.title} ({t.question_count} Qs)
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Subtopic (Optional)</FormLabel>
                  <Select
                    value={createForm.subtopic_id}
                    onChange={(e) => setCreateForm((f) => ({ ...f, subtopic_id: e.target.value }))}
                  >
                    <option value="">General Topic Question</option>
                    {(subtopicsByTopic[createForm.topic_id] || []).map((st) => (
                      <option key={st.subtopic_id} value={st.subtopic_id}>
                        {st.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Title */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Question Title</FormLabel>
                <Input
                  placeholder="e.g. Find First and Last Position of Element in Sorted Array"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                />
              </FormControl>

              {/* Problem Statement */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Problem Statement</FormLabel>
                <Textarea
                  rows={5}
                  placeholder="Describe the problem, input specifications, and expected behavior in detail..."
                  value={createForm.problem_statement}
                  onChange={(e) => setCreateForm((f) => ({ ...f, problem_statement: e.target.value }))}
                />
              </FormControl>

              {/* Input Format & Output Format */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Input Format</FormLabel>
                  <Textarea
                    rows={2}
                    placeholder="e.g. First line contains N. Second line contains N space-separated integers."
                    value={createForm.input_format}
                    onChange={(e) => setCreateForm((f) => ({ ...f, input_format: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Output Format</FormLabel>
                  <Textarea
                    rows={2}
                    placeholder="e.g. Print two space-separated indices or -1 -1 if not found."
                    value={createForm.output_format}
                    onChange={(e) => setCreateForm((f) => ({ ...f, output_format: e.target.value }))}
                  />
                </FormControl>
              </SimpleGrid>

              {/* Constraints */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Constraints</FormLabel>
                <Input
                  placeholder="e.g. 1 <= N <= 10^5, -10^9 <= nums[i] <= 10^9"
                  value={createForm.constraints}
                  onChange={(e) => setCreateForm((f) => ({ ...f, constraints: e.target.value }))}
                />
              </FormControl>

              {/* Sample Input & Output */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Sample Input</FormLabel>
                  <Textarea
                    rows={3}
                    fontFamily="mono"
                    fontSize="sm"
                    placeholder="6&#10;5 7 7 8 8 10&#10;8"
                    value={createForm.sample_input}
                    onChange={(e) => setCreateForm((f) => ({ ...f, sample_input: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Sample Output</FormLabel>
                  <Textarea
                    rows={3}
                    fontFamily="mono"
                    fontSize="sm"
                    placeholder="3 4"
                    value={createForm.sample_output}
                    onChange={(e) => setCreateForm((f) => ({ ...f, sample_output: e.target.value }))}
                  />
                </FormControl>
              </SimpleGrid>

              {/* Explanation */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Sample Explanation</FormLabel>
                <Input
                  placeholder="Target 8 is present at index 3 and 4."
                  value={createForm.explanation}
                  onChange={(e) => setCreateForm((f) => ({ ...f, explanation: e.target.value }))}
                />
              </FormControl>

              {/* Difficulty & Automatic Marks */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Difficulty</FormLabel>
                  <Select
                    value={createForm.difficulty}
                    onChange={(e) => handleDifficultyChange(e.target.value, false)}
                  >
                    <option value="easy">Easy (5 marks)</option>
                    <option value="medium">Medium (10 marks)</option>
                    <option value="hard">Hard (15 marks)</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Allocated Marks</FormLabel>
                  <Input
                    isReadOnly
                    value={`${createForm.marks} Marks`}
                    fontWeight="bold"
                    bg={surfaceBg}
                  />
                  <FormHelperText fontSize="xs">
                    Enforced: Easy=5, Med=10, Hard=15
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Initial Status</FormLabel>
                  <Select
                    value={createForm.status}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        status: e.target.value,
                        is_published: e.target.value === 'published',
                      }))
                    }
                  >
                    <option value="published">Published (Ready for Labs)</option>
                    <option value="draft">Draft (Private to Faculty)</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Supported Languages */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Supported Programming Languages</FormLabel>
                <HStack spacing={4} wrap="wrap">
                  {ALL_LANGUAGES.map((lang) => (
                    <Checkbox
                      key={lang.id}
                      colorScheme="brand"
                      isChecked={createForm.supported_languages.includes(lang.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setCreateForm((f) => ({
                          ...f,
                          supported_languages: checked
                            ? [...f.supported_languages, lang.id]
                            : f.supported_languages.filter((l) => l !== lang.id),
                        }));
                      }}
                    >
                      <Text fontSize="sm" color={textColor}>{lang.label}</Text>
                    </Checkbox>
                  ))}
                </HStack>
              </FormControl>

              <Divider />

              {/* ── Test Cases Management ── */}
              <Box>
                <Flex justify="space-between" align="center" mb={3}>
                  <Box>
                    <Heading size="xs" textTransform="uppercase" color={textColor} fontWeight="700">
                      Test Cases ({createTestCases.length})
                    </Heading>
                    <Text fontSize="xs" color={mutedText}>
                      Include both visible sample test cases and hidden evaluation cases.
                    </Text>
                  </Box>
                  <Button
                    size="xs"
                    leftIcon={<AddIcon />}
                    colorScheme="brand"
                    variant="outline"
                    onClick={() =>
                      setCreateTestCases((prev) => [
                        ...prev,
                        { input: '', expected_output: '', is_hidden: true },
                      ])
                    }
                  >
                    Add Test Case
                  </Button>
                </Flex>

                <VStack spacing={3} align="stretch">
                  {createTestCases.map((tc, idx) => (
                    <Box
                      key={idx}
                      p={3}
                      borderRadius="xl"
                      bg={surfaceBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <HStack spacing={2}>
                          <Badge colorScheme="blue">Case #{idx + 1}</Badge>
                          <Switch
                            size="sm"
                            colorScheme="brand"
                            isChecked={tc.is_hidden}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setCreateTestCases((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, is_hidden: checked } : item))
                              );
                            }}
                          />
                          <Text fontSize="xs" fontWeight="600" color={tc.is_hidden ? 'purple.600' : 'green.600'}>
                            {tc.is_hidden ? 'Hidden Case (Grading)' : 'Visible Case (Student)'}
                          </Text>
                        </HStack>

                        {createTestCases.length > 1 && (
                          <IconButton
                            icon={<DeleteIcon />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            aria-label="Remove case"
                            onClick={() =>
                              setCreateTestCases((prev) => prev.filter((_, i) => i !== idx))
                            }
                          />
                        )}
                      </Flex>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="xs" color={mutedText} mb={1}>Standard Input (stdin)</FormLabel>
                          <Textarea
                            rows={2}
                            fontFamily="mono"
                            fontSize="xs"
                            placeholder="Input data..."
                            value={tc.input}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCreateTestCases((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, input: val } : item))
                              );
                            }}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel fontSize="xs" color={mutedText} mb={1}>Expected Output (stdout)</FormLabel>
                          <Textarea
                            rows={2}
                            fontFamily="mono"
                            fontSize="xs"
                            placeholder="Expected exact output..."
                            value={tc.expected_output}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCreateTestCases((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, expected_output: val } : item))
                              );
                            }}
                          />
                        </FormControl>
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px" borderColor={cardBorder}>
            <Button variant="ghost" mr={3} onClick={onCreateClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleCreateSubmit}
              isLoading={isSubmitting}
              loadingText="Saving to PostgreSQL..."
            >
              Create Question
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── EDIT QUESTION MODAL ──────────────────────────── */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent borderRadius="2xl" bg={cardBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader pb={1}>
            <Heading size="md" color={textColor} fontWeight="800">Edit Coding Question</Heading>
            <Text fontSize="xs" color={mutedText} mt={1}>
              Update problem statement, constraints, metadata, and test cases.
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <VStack spacing={5} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>DSA Topic</FormLabel>
                  <Select
                    value={editForm.topic_id || ''}
                    onChange={(e) => {
                      const tId = e.target.value;
                      setEditForm((f) => ({ ...f, topic_id: tId, subtopic_id: '' }));
                      if (tId) loadSubtopics(tId);
                    }}
                  >
                    {topicsSummary.map((t) => (
                      <option key={t.topic_id} value={t.topic_id}>
                        {t.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Subtopic (Optional)</FormLabel>
                  <Select
                    value={editForm.subtopic_id || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, subtopic_id: e.target.value }))}
                  >
                    <option value="">General Topic Question</option>
                    {(subtopicsByTopic[editForm.topic_id] || []).map((st) => (
                      <option key={st.subtopic_id} value={st.subtopic_id}>
                        {st.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Question Title</FormLabel>
                <Input
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Problem Statement</FormLabel>
                <Textarea
                  rows={5}
                  value={editForm.problem_statement || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, problem_statement: e.target.value }))}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Input Format</FormLabel>
                  <Textarea
                    rows={2}
                    value={editForm.input_format || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, input_format: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Output Format</FormLabel>
                  <Textarea
                    rows={2}
                    value={editForm.output_format || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, output_format: e.target.value }))}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Constraints</FormLabel>
                <Input
                  value={editForm.constraints || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, constraints: e.target.value }))}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Sample Input</FormLabel>
                  <Textarea
                    rows={3}
                    fontFamily="mono"
                    fontSize="sm"
                    value={editForm.sample_input || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, sample_input: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Sample Output</FormLabel>
                  <Textarea
                    rows={3}
                    fontFamily="mono"
                    fontSize="sm"
                    value={editForm.sample_output || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, sample_output: e.target.value }))}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Explanation</FormLabel>
                <Input
                  value={editForm.explanation || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, explanation: e.target.value }))}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Difficulty</FormLabel>
                  <Select
                    value={editForm.difficulty || 'medium'}
                    onChange={(e) => handleDifficultyChange(e.target.value, true)}
                  >
                    <option value="easy">Easy (5 marks)</option>
                    <option value="medium">Medium (10 marks)</option>
                    <option value="hard">Hard (15 marks)</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Marks</FormLabel>
                  <Input
                    isReadOnly
                    value={`${editForm.marks || DIFFICULTY_MARKS[editForm.difficulty] || 10} Marks`}
                    fontWeight="bold"
                    bg={surfaceBg}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Publication Status</FormLabel>
                  <Select
                    value={editForm.status || 'published'}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        status: e.target.value,
                        is_published: e.target.value === 'published',
                      }))
                    }
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Supported Languages */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Supported Programming Languages</FormLabel>
                <HStack spacing={4} wrap="wrap">
                  {ALL_LANGUAGES.map((lang) => (
                    <Checkbox
                      key={lang.id}
                      colorScheme="brand"
                      isChecked={(editForm.supported_languages || []).includes(lang.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditForm((f) => ({
                          ...f,
                          supported_languages: checked
                            ? [...(f.supported_languages || []), lang.id]
                            : (f.supported_languages || []).filter((l) => l !== lang.id),
                        }));
                      }}
                    >
                      <Text fontSize="sm" color={textColor}>{lang.label}</Text>
                    </Checkbox>
                  ))}
                </HStack>
              </FormControl>

              <Divider />

              {/* Edit Test Cases */}
              <Box>
                <Flex justify="space-between" align="center" mb={3}>
                  <Box>
                    <Heading size="xs" textTransform="uppercase" color={textColor} fontWeight="700">
                      Test Cases ({editTestCases.length})
                    </Heading>
                    <Text fontSize="xs" color={mutedText}>
                      Add, update, or remove test cases for evaluation.
                    </Text>
                  </Box>
                  <Button
                    size="xs"
                    leftIcon={<AddIcon />}
                    colorScheme="brand"
                    variant="outline"
                    onClick={() =>
                      setEditTestCases((prev) => [
                        ...prev,
                        { input: '', expected_output: '', is_hidden: true },
                      ])
                    }
                  >
                    Add Test Case
                  </Button>
                </Flex>

                <VStack spacing={3} align="stretch">
                  {editTestCases.map((tc, idx) => (
                    <Box
                      key={tc.test_case_id || idx}
                      p={3}
                      borderRadius="xl"
                      bg={surfaceBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <HStack spacing={2}>
                          <Badge colorScheme="blue">Case #{idx + 1}</Badge>
                          <Switch
                            size="sm"
                            colorScheme="brand"
                            isChecked={tc.is_hidden}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setEditTestCases((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, is_hidden: checked } : item))
                              );
                            }}
                          />
                          <Text fontSize="xs" fontWeight="600" color={tc.is_hidden ? 'purple.600' : 'green.600'}>
                            {tc.is_hidden ? 'Hidden Case (Evaluation)' : 'Visible Case (Student)'}
                          </Text>
                        </HStack>

                        <IconButton
                          icon={<DeleteIcon />}
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          aria-label="Remove case"
                          onClick={() =>
                            setEditTestCases((prev) => prev.filter((_, i) => i !== idx))
                          }
                        />
                      </Flex>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="xs" color={mutedText} mb={1}>Input</FormLabel>
                          <Textarea
                            rows={2}
                            fontFamily="mono"
                            fontSize="xs"
                            value={tc.input || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditTestCases((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, input: val } : item))
                              );
                            }}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel fontSize="xs" color={mutedText} mb={1}>Expected Output</FormLabel>
                          <Textarea
                            rows={2}
                            fontFamily="mono"
                            fontSize="xs"
                            value={tc.expected_output || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditTestCases((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, expected_output: val } : item))
                              );
                            }}
                          />
                        </FormControl>
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px" borderColor={cardBorder}>
            <Button variant="ghost" mr={3} onClick={onEditClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleEditSubmit}
              isLoading={isSubmitting}
              loadingText="Updating Question..."
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── STUDENT PREVIEW MODAL ───────────────────────── */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="3xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent borderRadius="2xl" bg={cardBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader pb={1}>
            <HStack spacing={2}>
              <ViewIcon color="brand.500" />
              <Heading size="md" color={textColor} fontWeight="800">Student View Preview</Heading>
            </HStack>
            <Text fontSize="xs" color={mutedText} mt={1}>
              Marks, difficulty rating, and hidden evaluation test cases are strictly hidden from students.
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            {previewQuestion && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="md" color={textColor} fontWeight="700">
                    {previewQuestion.title}
                  </Heading>
                  <HStack spacing={2} mt={2}>
                    {previewQuestion.topic_title && (
                      <Badge colorScheme="green">{previewQuestion.topic_title}</Badge>
                    )}
                    {previewQuestion.subtopic_title && (
                      <Badge colorScheme="teal">{previewQuestion.subtopic_title}</Badge>
                    )}
                  </HStack>
                </Box>

                <Box>
                  <Text fontWeight="bold" fontSize="sm" color={textColor} mb={1}>
                    Problem Description
                  </Text>
                  <Box p={4} borderRadius="xl" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                    <Text fontSize="sm" whiteSpace="pre-wrap" color={textColor}>
                      {previewQuestion.problem_statement}
                    </Text>
                  </Box>
                </Box>

                {previewQuestion.input_format && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color={textColor} mb={1}>
                      Input Format
                    </Text>
                    <Box p={3} borderRadius="lg" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                      <Text fontSize="xs" whiteSpace="pre-wrap" color={textColor}>{previewQuestion.input_format}</Text>
                    </Box>
                  </Box>
                )}

                {previewQuestion.output_format && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color={textColor} mb={1}>
                      Output Format
                    </Text>
                    <Box p={3} borderRadius="lg" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                      <Text fontSize="xs" whiteSpace="pre-wrap" color={textColor}>{previewQuestion.output_format}</Text>
                    </Box>
                  </Box>
                )}

                {previewQuestion.constraints && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color={textColor} mb={1}>
                      Constraints
                    </Text>
                    <Code p={2} borderRadius="md" w="full" fontSize="xs">
                      {previewQuestion.constraints}
                    </Code>
                  </Box>
                )}

                {/* Visible Sample Test Cases ONLY */}
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color={textColor} mb={2}>
                    Sample Cases (Visible to Students)
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <Box p={3} borderRadius="lg" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                      <Text fontSize="xs" fontWeight="bold" color={mutedText} mb={1}>Sample Input</Text>
                      <Code p={2} borderRadius="md" w="full" fontSize="xs" whiteSpace="pre-wrap">
                        {previewQuestion.sample_input || '(none)'}
                      </Code>
                    </Box>

                    <Box p={3} borderRadius="lg" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                      <Text fontSize="xs" fontWeight="bold" color={mutedText} mb={1}>Sample Output</Text>
                      <Code p={2} borderRadius="md" w="full" fontSize="xs" whiteSpace="pre-wrap">
                        {previewQuestion.sample_output || '(none)'}
                      </Code>
                    </Box>
                  </SimpleGrid>

                  {previewQuestion.explanation && (
                    <Box mt={3} p={3} borderRadius="lg" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                      <Text fontSize="xs" fontWeight="bold" color={mutedText} mb={1}>Explanation</Text>
                      <Text fontSize="xs" color={textColor}>{previewQuestion.explanation}</Text>
                    </Box>
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={cardBorder}>
            <Button colorScheme="brand" onClick={onPreviewClose}>
              Close Preview
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── STANDALONE ADD TEST CASE MODAL ──────────────── */}
      <Modal isOpen={isAddCaseOpen} onClose={onAddCaseClose} size="lg">
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent borderRadius="2xl" bg={cardBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader>
            <Heading size="sm" color={textColor}>Add Test Case</Heading>
            <Text fontSize="xs" color={mutedText} mt={0.5}>
              For: {targetQuestionForCase?.title}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" color={textColor}>Standard Input (stdin)</FormLabel>
                <Textarea
                  rows={3}
                  fontFamily="mono"
                  fontSize="xs"
                  placeholder="Input arguments or stdin data..."
                  value={standaloneCase.input}
                  onChange={(e) => setStandaloneCase((c) => ({ ...c, input: e.target.value }))}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color={textColor}>Expected Output (stdout)</FormLabel>
                <Textarea
                  rows={3}
                  fontFamily="mono"
                  fontSize="xs"
                  placeholder="Expected exact stdout output..."
                  value={standaloneCase.expected_output}
                  onChange={(e) => setStandaloneCase((c) => ({ ...c, expected_output: e.target.value }))}
                />
              </FormControl>

              <HStack spacing={3}>
                <Switch
                  colorScheme="brand"
                  isChecked={standaloneCase.is_hidden}
                  onChange={(e) => setStandaloneCase((c) => ({ ...c, is_hidden: e.target.checked }))}
                />
                <Text fontSize="sm" fontWeight="600" color={textColor}>
                  {standaloneCase.is_hidden ? 'Hidden Test Case (Assessment Evaluation)' : 'Visible Sample Case'}
                </Text>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddCaseClose}>Cancel</Button>
            <Button colorScheme="brand" onClick={handleStandaloneCaseSubmit} isLoading={isSubmitting}>
              Add Case
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default LabQuestionBank;
