// ──────────────────────────────────────────────
// Faculty: MCQ Question Bank Manager
// ──────────────────────────────────────────────
// Full support for all 17 DSA topics, comprehensive MCQ
// creation with 4 options (A-D), correct answer selection,
// detailed explanations, topic/subtopic assignment,
// publish/unpublish/archive controls, and student preview.
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
  Radio,
  RadioGroup,
  Stack,
  Divider,
  Tag,
  IconButton,
  Flex,
  InputGroup,
  InputLeftElement,
  Tooltip,
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
  listLabMcqsApi,
  createLabMcqApi,
  updateLabMcqApi,
  deleteLabMcqApi,
  publishLabMcqApi,
  unpublishLabMcqApi,
  getLabMcqTopicsSummaryApi,
} from '../../api/labApi';
import { getAllTopicsApi, getTopicSubtopicsApi } from '../../api/topicApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const DIFFICULTY_COLORS = {
  easy: 'green',
  medium: 'blue',
  hard: 'purple',
};

const McqQuestionBank = () => {
  const toast = useToast();

  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#292D2A');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#B8C0B9');
  const accentColor = useColorModeValue('#2F8D46', '#A3E635');

  // Question list state
  const [mcqs, setMcqs] = useState([]);
  const [topicsSummary, setTopicsSummary] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedTopicId, setSelectedTopicId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create / Edit modal state
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [editingMcqId, setEditingMcqId] = useState(null);
  const [subtopicsForTopic, setSubtopicsForTopic] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    explanation: '',
    topic_id: '',
    subtopic_id: '',
    difficulty: 'medium',
    status: 'published',
  });

  // Student Preview Modal
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const [previewMcq, setPreviewMcq] = useState(null);
  const [previewSelectedOption, setPreviewSelectedOption] = useState('');

  // Delete Confirmation Modal
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deletingMcq, setDeletingMcq] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load summary and topics catalog
  const loadMetadata = useCallback(async () => {
    try {
      const [sumRes, topRes] = await Promise.all([
        getLabMcqTopicsSummaryApi(),
        getAllTopicsApi(),
      ]);
      setTopicsSummary(sumRes.data?.data?.topics || []);
      setAllTopics(topRes.data?.topics || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load topic metadata.',
        status: 'error',
        duration: 3000,
      });
    }
  }, [toast]);

  // Fetch MCQs based on filters
  const fetchMcqs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (selectedTopicId !== 'all') params.topicId = selectedTopicId;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await listLabMcqsApi(params);
      setMcqs(res.data?.data?.mcqs || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch MCQs.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedTopicId, statusFilter, searchQuery, toast]);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  useEffect(() => {
    fetchMcqs();
  }, [fetchMcqs]);

  // Load subtopics when topic changes in form
  const handleTopicChangeInForm = async (topicId) => {
    setFormData((prev) => ({ ...prev, topic_id: topicId, subtopic_id: '' }));
    if (!topicId) {
      setSubtopicsForTopic([]);
      return;
    }
    try {
      const res = await getTopicSubtopicsApi(topicId);
      setSubtopicsForTopic(res.data?.subtopics || []);
    } catch {
      setSubtopicsForTopic([]);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingMcqId(null);
    setFormData({
      title: '',
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
      explanation: '',
      topic_id: selectedTopicId !== 'all' ? selectedTopicId : allTopics[0]?.topic_id || '',
      subtopic_id: '',
      difficulty: 'medium',
      status: 'published',
    });
    if (selectedTopicId !== 'all') {
      handleTopicChangeInForm(selectedTopicId);
    }
    onFormOpen();
  };

  const openEditModal = async (mcq) => {
    setIsEditing(true);
    setEditingMcqId(mcq.mcq_id);
    setFormData({
      title: mcq.title || '',
      question_text: mcq.question_text || '',
      option_a: mcq.option_a || '',
      option_b: mcq.option_b || '',
      option_c: mcq.option_c || '',
      option_d: mcq.option_d || '',
      correct_option: mcq.correct_option || 'A',
      explanation: mcq.explanation || '',
      topic_id: mcq.topic_id || '',
      subtopic_id: mcq.subtopic_id || '',
      difficulty: mcq.difficulty || 'medium',
      status: mcq.status || 'published',
    });

    if (mcq.topic_id) {
      try {
        const res = await getTopicSubtopicsApi(mcq.topic_id);
        setSubtopicsForTopic(res.data?.subtopics || []);
      } catch {
        setSubtopicsForTopic([]);
      }
    }
    onFormOpen();
  };

  const handleSaveMcq = async () => {
    if (!formData.question_text.trim()) {
      toast({ title: 'Question text is required', status: 'warning', duration: 2500 });
      return;
    }
    if (!formData.option_a.trim() || !formData.option_b.trim() || !formData.option_c.trim() || !formData.option_d.trim()) {
      toast({ title: 'All 4 options (A, B, C, D) are required', status: 'warning', duration: 2500 });
      return;
    }
    if (!formData.topic_id) {
      toast({ title: 'Please select a topic', status: 'warning', duration: 2500 });
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        title: formData.title.trim() || formData.question_text.slice(0, 60),
        question_text: formData.question_text,
        option_a: formData.option_a,
        option_b: formData.option_b,
        option_c: formData.option_c,
        option_d: formData.option_d,
        correct_option: formData.correct_option,
        explanation: formData.explanation,
        topic_id: parseInt(formData.topic_id, 10),
        subtopic_id: formData.subtopic_id ? parseInt(formData.subtopic_id, 10) : null,
        difficulty: formData.difficulty,
        status: formData.status,
      };

      if (isEditing) {
        await updateLabMcqApi(editingMcqId, payload);
        toast({ title: 'MCQ Updated', status: 'success', duration: 2500 });
      } else {
        await createLabMcqApi(payload);
        toast({ title: 'MCQ Created', status: 'success', duration: 2500 });
      }
      onFormClose();
      fetchMcqs();
      loadMetadata();
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: err.response?.data?.message || 'Could not save MCQ.',
        status: 'error',
        duration: 3500,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (mcq) => {
    try {
      if (mcq.status === 'published') {
        await unpublishLabMcqApi(mcq.mcq_id);
        toast({ title: 'Question Unpublished', status: 'info', duration: 2000 });
      } else {
        await publishLabMcqApi(mcq.mcq_id);
        toast({ title: 'Question Published', status: 'success', duration: 2000 });
      }
      fetchMcqs();
      loadMetadata();
    } catch (err) {
      toast({
        title: 'Status Change Failed',
        description: err.response?.data?.message || 'Action could not be completed.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const confirmDelete = (mcq) => {
    setDeletingMcq(mcq);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!deletingMcq) return;
    try {
      setIsDeleting(true);
      await deleteLabMcqApi(deletingMcq.mcq_id);
      toast({ title: 'MCQ Deleted', status: 'success', duration: 2500 });
      onDeleteClose();
      fetchMcqs();
      loadMetadata();
    } catch (err) {
      toast({
        title: 'Delete Failed',
        description: err.response?.data?.message || 'Could not delete question.',
        status: 'error',
        duration: 3500,
      });
    } finally {
      setIsDeleting(false);
      setDeletingMcq(null);
    }
  };

  const openPreview = (mcq) => {
    setPreviewMcq(mcq);
    setPreviewSelectedOption('');
    onPreviewOpen();
  };

  const totalPublishedCount = topicsSummary.reduce(
    (acc, t) => acc + parseInt(t.published_mcq_count || 0, 10),
    0
  );

  return (
    <VStack spacing={8} align="stretch" w="full" maxW="1440px" mx="auto" pb={16}>
      {/* Header Banner */}
      <Box p={6} borderRadius="2xl" bg={cardBg} border="1px solid" borderColor={cardBorder} boxShadow="sm">
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color={textColor} fontWeight="800">
              MCQ Question Bank 📝
            </Heading>
            <Text color={mutedText} fontSize="sm">
              Comprehensive multiple-choice question bank across all 17 Data Structures and Algorithms curriculum topics ({totalPublishedCount} published MCQs)
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              leftIcon={<RepeatIcon />}
              variant="outline"
              size="sm"
              onClick={() => {
                fetchMcqs();
                loadMetadata();
              }}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="brand"
              size="sm"
              onClick={openCreateModal}
            >
              Add New MCQ
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Topics Summary Cards Horizontal Slider */}
      <Box overflowX="auto" pb={2}>
        <HStack spacing={4} align="stretch">
          {topicsSummary.map((t) => {
            const isSelected = String(selectedTopicId) === String(t.topic_id);
            const count = parseInt(t.published_mcq_count || 0, 10);
            return (
              <Card
                key={t.topic_id}
                minW="220px"
                cursor="pointer"
                onClick={() => setSelectedTopicId(isSelected ? 'all' : t.topic_id)}
                bg={isSelected ? surfaceBg : cardBg}
                borderColor={isSelected ? accentColor : cardBorder}
                borderWidth="2px"
                borderRadius="xl"
                transition="all 0.2s"
                _hover={{ borderColor: accentColor }}
              >
                <CardBody p={4}>
                  <VStack align="start" spacing={1}>
                    <Badge colorScheme={count >= 5 ? 'green' : 'orange'} fontSize="2xs">
                      {count >= 5 ? 'Ready (>=5)' : `${count} MCQs`}
                    </Badge>
                    <Text fontWeight="bold" fontSize="sm" color={textColor} noOfLines={1}>
                      {t.title}
                    </Text>
                    <HStack justify="space-between" w="full" pt={1}>
                      <Text fontSize="xs" color={mutedText}>
                        Total: {t.total_mcq_count || 0}
                      </Text>
                      <Text fontSize="xs" fontWeight="bold" color={accentColor}>
                        {count} Published
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
        </HStack>
      </Box>

      {/* Filters Bar */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl">
        <CardBody p={4}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search MCQ statement or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            <Select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
            >
              <option value="all">All 17 DSA Topics</option>
              {allTopics.map((t) => (
                <option key={t.topic_id} value={t.topic_id}>
                  {t.title}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
              <option value="archived">Archived Only</option>
            </Select>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* MCQ List */}
      {isLoading ? (
        <LoadingSpinner label="Loading MCQ question bank..." />
      ) : mcqs.length === 0 ? (
        <EmptyState
          title="No MCQs Found"
          description="No multiple-choice questions match your current search or topic filter."
          actionLabel="Create First MCQ"
          onAction={openCreateModal}
        />
      ) : (
        <VStack spacing={4} align="stretch">
          <Text fontSize="sm" color={mutedText} fontWeight="medium">
            Showing {mcqs.length} multiple-choice questions
          </Text>

          {mcqs.map((mcq, idx) => (
            <Card
              key={mcq.mcq_id}
              bg={cardBg}
              borderColor={cardBorder}
              borderWidth="1px"
              borderRadius="xl"
              boxShadow="sm"
              transition="all 0.2s"
              _hover={{ borderColor: accentColor }}
            >
              <CardBody p={5}>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="start" gap={3} wrap="wrap">
                    <HStack spacing={2} wrap="wrap">
                      <Tag size="sm" colorScheme="purple">
                        Q#{idx + 1}
                      </Tag>
                      <Tag size="sm" colorScheme="cyan">
                        {mcq.topic_title || 'Topic'}
                      </Tag>
                      {mcq.subtopic_title && (
                        <Tag size="sm" colorScheme="teal" variant="outline">
                          {mcq.subtopic_title}
                        </Tag>
                      )}
                      <Badge colorScheme={DIFFICULTY_COLORS[mcq.difficulty] || 'gray'} fontSize="xs">
                        {mcq.difficulty}
                      </Badge>
                      <Badge colorScheme={mcq.status === 'published' ? 'green' : 'orange'} fontSize="xs">
                        {mcq.status}
                      </Badge>
                    </HStack>

                    <HStack spacing={1}>
                      <Tooltip label="Student Preview">
                        <IconButton
                          aria-label="Preview"
                          icon={<ViewIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openPreview(mcq)}
                        />
                      </Tooltip>
                      <Tooltip label="Edit MCQ">
                        <IconButton
                          aria-label="Edit"
                          icon={<EditIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(mcq)}
                        />
                      </Tooltip>
                      <Tooltip label={mcq.status === 'published' ? 'Unpublish' : 'Publish'}>
                        <Button
                          size="xs"
                          variant={mcq.status === 'published' ? 'outline' : 'solid'}
                          colorScheme={mcq.status === 'published' ? 'orange' : 'green'}
                          onClick={() => handleTogglePublish(mcq)}
                        >
                          {mcq.status === 'published' ? 'Unpublish' : 'Publish'}
                        </Button>
                      </Tooltip>
                      <Tooltip label="Delete MCQ">
                        <IconButton
                          aria-label="Delete"
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => confirmDelete(mcq)}
                        />
                      </Tooltip>
                    </HStack>
                  </Flex>

                  {/* Question Statement */}
                  <Text fontWeight="semibold" fontSize="md" color={textColor}>
                    {mcq.question_text}
                  </Text>

                  {/* Options Grid */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} pt={1}>
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const isCorrect = mcq.correct_option === optKey;
                      const optText = mcq[`option_${optKey.toLowerCase()}`];
                      return (
                        <Box
                          key={optKey}
                          p={2.5}
                          borderRadius="md"
                          bg={isCorrect ? surfaceBg : 'transparent'}
                          border="1px solid"
                          borderColor={isCorrect ? accentColor : cardBorder}
                        >
                          <HStack spacing={2} align="start">
                            <Badge colorScheme={isCorrect ? 'green' : 'gray'} px={1.5}>
                              {optKey}
                            </Badge>
                            <Text fontSize="sm" color={textColor} fontWeight={isCorrect ? 'bold' : 'normal'}>
                              {optText}
                            </Text>
                            {isCorrect && (
                              <Badge colorScheme="green" ml="auto" fontSize="2xs">
                                Correct Answer
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      );
                    })}
                  </SimpleGrid>

                  {/* Explanation Preview */}
                  {mcq.explanation && (
                    <Box bg={surfaceBg} p={3} borderRadius="md" borderLeft="3px solid" borderColor="brand.500">
                      <Text fontSize="xs" fontWeight="bold" color={mutedText} mb={0.5}>
                        Explanation:
                      </Text>
                      <Text fontSize="xs" color={textColor}>
                        {mcq.explanation}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      {/* Create / Edit MCQ Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px" maxH="90vh" overflowY="auto">
          <ModalHeader color={textColor}>
            {isEditing ? 'Edit Multiple-Choice Question' : 'Create New Multiple-Choice Question'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Topic</FormLabel>
                  <Select
                    value={formData.topic_id}
                    onChange={(e) => handleTopicChangeInForm(e.target.value)}
                  >
                    <option value="">Select Topic...</option>
                    {allTopics.map((t) => (
                      <option key={t.topic_id} value={t.topic_id}>
                        {t.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Subtopic (Optional)</FormLabel>
                  <Select
                    value={formData.subtopic_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subtopic_id: e.target.value }))}
                    isDisabled={!formData.topic_id || subtopicsForTopic.length === 0}
                  >
                    <option value="">None / General Topic</option>
                    {subtopicsForTopic.map((st) => (
                      <option key={st.subtopic_id} value={st.subtopic_id}>
                        {st.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Difficulty</FormLabel>
                  <Select
                    value={formData.difficulty}
                    onChange={(e) => setFormData((prev) => ({ ...prev, difficulty: e.target.value }))}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Publication Status</FormLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="published">Published (Ready for Assessments)</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontSize="sm">Question Title / Summary (Optional)</FormLabel>
                <Input
                  placeholder="e.g. Quick Sort Worst Case Analysis"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Question Statement</FormLabel>
                <Textarea
                  placeholder="Enter the full question text here..."
                  rows={3}
                  value={formData.question_text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, question_text: e.target.value }))}
                />
              </FormControl>

              <Divider borderColor={cardBorder} />

              <Heading size="xs" color={mutedText} textTransform="uppercase">
                Options & Correct Answer
              </Heading>

              <RadioGroup
                value={formData.correct_option}
                onChange={(val) => setFormData((prev) => ({ ...prev, correct_option: val }))}
              >
                <VStack spacing={3} align="stretch">
                  {['A', 'B', 'C', 'D'].map((optKey) => (
                    <Box key={optKey} p={3} borderRadius="md" border="1px solid" borderColor={cardBorder}>
                      <HStack spacing={3} align="center">
                        <Radio value={optKey} colorScheme="green">
                          <Badge colorScheme={formData.correct_option === optKey ? 'green' : 'gray'}>
                            Option {optKey} {formData.correct_option === optKey && '(Correct)'}
                          </Badge>
                        </Radio>
                        <Input
                          placeholder={`Enter text for option ${optKey}...`}
                          value={formData[`option_${optKey.toLowerCase()}`]}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({ ...prev, [`option_${optKey.toLowerCase()}`]: val }));
                          }}
                        />
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </RadioGroup>

              <FormControl>
                <FormLabel fontSize="sm">Explanation of Correct Answer</FormLabel>
                <Textarea
                  placeholder="Explain why this option is correct to aid student review..."
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, explanation: e.target.value }))}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onFormClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSaveMcq} isLoading={isSaving}>
              {isEditing ? 'Save Changes' : 'Create Question'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Student Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader color={textColor}>Student View Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {previewMcq && (
              <VStack spacing={4} align="stretch">
                <Box p={3} borderRadius="md" bg={surfaceBg}>
                  <Text fontSize="xs" color={mutedText}>
                    Topic: {previewMcq.topic_title}
                  </Text>
                  <Text fontWeight="semibold" fontSize="md" mt={1}>
                    {previewMcq.question_text}
                  </Text>
                </Box>

                <RadioGroup value={previewSelectedOption} onChange={setPreviewSelectedOption}>
                  <Stack spacing={3}>
                    {['A', 'B', 'C', 'D'].map((key) => (
                      <Box
                        key={key}
                        p={3}
                        borderRadius="md"
                        border="1px solid"
                        borderColor={previewSelectedOption === key ? accentColor : cardBorder}
                        bg={previewSelectedOption === key ? surfaceBg : 'transparent'}
                      >
                        <Radio value={key} colorScheme="green">
                          <Text fontSize="sm" color={textColor}>
                            <strong>{key}.</strong> {previewMcq[`option_${key.toLowerCase()}`]}
                          </Text>
                        </Radio>
                      </Box>
                    ))}
                  </Stack>
                </RadioGroup>

                <Divider borderColor={cardBorder} />

                <Box p={3} borderRadius="md" bg={surfaceBg}>
                  <Text fontSize="xs" fontWeight="bold" color="green.500">
                    Faculty Verified Solution:
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color={textColor} mt={1}>
                    Option {previewMcq.correct_option}: {previewMcq[`option_${previewMcq.correct_option?.toLowerCase()}`]}
                  </Text>
                  {previewMcq.explanation && (
                    <Text fontSize="xs" color={mutedText} mt={1}>
                      {previewMcq.explanation}
                    </Text>
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" onClick={onPreviewClose}>
              Close Preview
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader color={textColor}>Delete MCQ</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={textColor}>
              Are you sure you want to delete this multiple-choice question? If it is already in use by active assessments, it will be archived safely instead.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default McqQuestionBank;
