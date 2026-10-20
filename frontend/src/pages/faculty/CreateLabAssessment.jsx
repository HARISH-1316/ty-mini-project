// ──────────────────────────────────────────────
// Faculty: Lab Assessment Detail / Edit / Question Selection Page
// ──────────────────────────────────────────────
// Supports 17 DSA topics and 3 Allocation Modes:
// Mode A: Faculty Selects Specific Questions (identical questions for all)
// Mode B: Automatic Random Allocation (random from topic pool)
// Mode C: Hybrid Allocation (manual selection for specific students + random for rest)
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Flex,
  Spinner,
  useToast,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Tag,
  TagLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  Code,
  Tooltip,
  Checkbox,
  InputGroup,
  InputLeftElement,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  CheckCircleIcon,
  AddIcon,
  DeleteIcon,
  ArrowForwardIcon,
  SearchIcon,
  ViewIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import {
  getLabAssessmentDetailApi,
  updateLabAssessmentApi,
  publishLabAssessmentApi,
  addTopicToAssessmentApi,
  removeTopicFromAssessmentApi,
  getTopicsSummaryApi,
  listLabQuestionsApi,
  listLabMcqsApi,
} from '../../api/labApi';
import {
  toLocalDatetimeInputString,
  toUtcIsoString,
  formatDisplayDateTime,
} from '../../utils/dateUtils';

const STATUS_COLORS = {
  draft: 'gray',
  published: 'blue',
  active: 'green',
  completed: 'purple',
  cancelled: 'red',
};

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

const formatDT = (dt) => formatDisplayDateTime(dt);

const CreateLabAssessment = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Color tokens aligned with normal light green theme
  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#292D2A');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#B8C0B9');
  const accentColor = useColorModeValue('#2F8D46', '#A3E635');

  // Modals
  const { isOpen: isPublishOpen, onOpen: onPublishOpen, onClose: onPublishClose } = useDisclosure();
  const { isOpen: isAddTopicOpen, onOpen: onAddTopicOpen, onClose: onAddTopicClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { isOpen: isManualModalOpen, onOpen: onManualModalOpen, onClose: onManualModalClose } = useDisclosure();

  // Assessment & pool data
  const [lab, setLab] = useState(null);
  const [allTopics, setAllTopics] = useState([]);
  const [poolStats, setPoolStats] = useState([]);
  const [totalEligible, setTotalEligible] = useState(0);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // MCQ state
  const [availableMcqs, setAvailableMcqs] = useState([]);
  const [selectedMcqIds, setSelectedMcqIds] = useState([]);
  const [previewMcq, setPreviewMcq] = useState(null);
  const [mcqSearch, setMcqSearch] = useState('');
  const [mcqTopicFilter, setMcqTopicFilter] = useState('all');

  // Hybrid Mode state
  const [manualAllocations, setManualAllocations] = useState([]);
  const [targetStudentId, setTargetStudentId] = useState('');
  const [targetStudentName, setTargetStudentName] = useState('');
  const [studentSpecificQIds, setStudentSpecificQIds] = useState([]);

  // Filters for question browser
  const [qSearch, setQSearch] = useState('');
  const [qTopicFilter, setQTopicFilter] = useState('all');
  const [qDiffFilter, setQDiffFilter] = useState('all');

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    duration: 120,
    num_questions: 8,
    num_coding_questions: 3,
    marks_per_question: 10,
    num_mcq_questions: 5,
    marks_per_mcq: 2,
    allocation_mode: 'random',
  });

  // ── Load Assessment Data ───────────────────────
  const loadData = useCallback(async () => {
    try {
      const [labRes, topicsRes] = await Promise.all([
        getLabAssessmentDetailApi(labId),
        getTopicsSummaryApi().catch(() => ({ data: { data: { topics: [] } } })),
      ]);

      const labData = labRes.data?.data?.lab;
      setLab(labData);

      const mode = labData?.allocation_mode || 'random';
      setEditForm({
        title: labData?.title || '',
        description: labData?.description || '',
        start_time: toLocalDatetimeInputString(labData?.start_time),
        end_time: toLocalDatetimeInputString(labData?.end_time),
        duration: labData?.duration || 120,
        num_questions: labData?.num_questions || 8,
        num_coding_questions: labData?.num_coding_questions ?? 3,
        marks_per_question: labData?.marks_per_question || 10,
        num_mcq_questions: labData?.num_mcq_questions ?? 5,
        marks_per_mcq: labData?.marks_per_mcq || 2,
        allocation_mode: mode,
      });

      setAllTopics(topicsRes.data?.data?.topics || []);
      setPoolStats(labData?.questionPoolStats || []);
      setTotalEligible(labData?.totalEligibleQuestions || 0);

      // Selected questions for Mode A
      const preSelected = (labData?.selectedQuestions || []).map((q) => q.lab_question_id);
      setSelectedQuestionIds(preSelected);

      const preSelectedMcqs = (labData?.selectedMcqs || []).map((m) => m.mcq_id);
      setSelectedMcqIds(preSelectedMcqs);

      // Existing manual allocations for Mode C
      if (labData?.allocations) {
        const manualMap = {};
        labData.allocations
          .filter((a) => a.is_manual)
          .forEach((a) => {
            if (!manualMap[a.student_id]) {
              manualMap[a.student_id] = {
                student_id: a.student_id,
                student_name: a.student_name,
                roll_number: a.roll_number,
                question_ids: [],
              };
            }
            manualMap[a.student_id].question_ids.push(a.lab_question_id);
          });
        setManualAllocations(Object.values(manualMap));
      }

      // Load published questions & MCQs for the assessment's selected topics
      const topicIds = (labData?.topics || []).map((t) => t.topic_id);
      if (topicIds.length > 0) {
        const [questionsResults, mcqsResults] = await Promise.all([
          Promise.all(topicIds.map((tId) =>
            listLabQuestionsApi({ topicId: tId, status: 'published' }).catch(() => ({ data: { data: { questions: [] } } }))
          )),
          Promise.all(topicIds.map((tId) =>
            listLabMcqsApi({ topicId: tId, status: 'published' }).catch(() => ({ data: { data: { mcqs: [] } } }))
          )),
        ]);

        const combined = [];
        const seen = new Set();
        questionsResults.forEach((r) => {
          const list = r.data?.data?.questions || r.data?.questions || [];
          list.forEach((q) => {
            if (!seen.has(q.lab_question_id)) {
              seen.add(q.lab_question_id);
              combined.push(q);
            }
          });
        });
        setAvailableQuestions(combined);

        const combinedMcqs = [];
        const seenMcqs = new Set();
        mcqsResults.forEach((r) => {
          const list = r.data?.data?.mcqs || r.data?.mcqs || [];
          list.forEach((m) => {
            if (!seenMcqs.has(m.mcq_id)) {
              seenMcqs.add(m.mcq_id);
              combinedMcqs.push(m);
            }
          });
        });
        setAvailableMcqs(combinedMcqs);
      } else {
        setAvailableQuestions([]);
        setAvailableMcqs([]);
      }
    } catch (err) {
      toast({
        title: err.response?.data?.message || 'Failed to load assessment',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [labId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Save Assessment Settings & Allocations ────
  const handleSave = async (overrideSelectedQIds = null) => {
    try {
      setIsSaving(true);
      const qIds = overrideSelectedQIds !== null ? overrideSelectedQIds : selectedQuestionIds;
      const parsedCoding = parseInt(editForm.num_coding_questions ?? 0, 10);
      const parsedMcq = parseInt(editForm.num_mcq_questions ?? 0, 10);
      const validCoding = isNaN(parsedCoding) || parsedCoding < 0 ? 0 : parsedCoding;
      const validMcq = isNaN(parsedMcq) || parsedMcq < 0 ? 0 : parsedMcq;

      if (validCoding === 0 && validMcq === 0) {
        toast({
          title: 'Invalid question counts',
          description: 'Assessment must include at least 1 question (either coding or MCQ).',
          status: 'warning',
          duration: 3500,
          isClosable: true,
        });
        setIsSaving(false);
        return;
      }

      const payload = {
        ...editForm,
        num_questions: validCoding + validMcq,
        num_coding_questions: validCoding,
        num_mcq_questions: validMcq,
        marks_per_question: parseInt(editForm.marks_per_question || 10, 10),
        marks_per_mcq: parseInt(editForm.marks_per_mcq || 2, 10),
        start_time: toUtcIsoString(editForm.start_time),
        end_time: toUtcIsoString(editForm.end_time),
        allocation_mode: editForm.allocation_mode,
        selected_question_ids: editForm.allocation_mode === 'specific' ? qIds : [],
        selected_mcq_ids: editForm.allocation_mode === 'specific' ? selectedMcqIds : [],
        manual_allocations: editForm.allocation_mode === 'hybrid' ? manualAllocations : [],
      };

      await updateLabAssessmentApi(labId, payload);
      toast({
        title: 'Assessment settings saved',
        description: 'Question selections and allocation rules updated in database.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      loadData();
    } catch (err) {
      toast({
        title: err.response?.data?.message || 'Failed to save',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Topic Management ──────────────────────────
  const handleAddTopic = async () => {
    if (!selectedTopicId) return;
    try {
      await addTopicToAssessmentApi(labId, parseInt(selectedTopicId, 10));
      toast({ title: 'Topic added to assessment', status: 'success', duration: 2000, isClosable: true });
      setSelectedTopicId('');
      onAddTopicClose();
      loadData();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Failed to add topic', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleRemoveTopic = async (topicId) => {
    try {
      await removeTopicFromAssessmentApi(labId, topicId);
      toast({ title: 'Topic removed', status: 'info', duration: 2000, isClosable: true });
      loadData();
    } catch (err) {
      toast({ title: 'Failed to remove topic', status: 'error', duration: 3000, isClosable: true });
    }
  };

  // ── Mode A: Question Selection ────────────────
  const handleToggleSelectQuestion = (qId) => {
    setSelectedQuestionIds((prev) => {
      const next = prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId];
      return next;
    });
  };

  // ── Mode C: Manual Student Assignment ─────────
  const handleOpenManualAssignment = () => {
    setTargetStudentId('');
    setTargetStudentName('');
    setStudentSpecificQIds([]);
    onManualModalOpen();
  };

  const handleSaveStudentAssignment = () => {
    const sId = parseInt(targetStudentId, 10);
    if (!sId || isNaN(sId)) {
      toast({ title: 'Please enter a valid numeric Student ID', status: 'warning', duration: 2500 });
      return;
    }
    if (studentSpecificQIds.length !== (editForm.num_questions || 5)) {
      toast({
        title: `Must select exactly ${editForm.num_questions || 5} questions`,
        description: `Currently selected: ${studentSpecificQIds.length}`,
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const updated = [
      ...manualAllocations.filter((m) => m.student_id !== sId),
      {
        student_id: sId,
        student_name: targetStudentName || `Student #${sId}`,
        question_ids: studentSpecificQIds,
      },
    ];
    setManualAllocations(updated);
    onManualModalClose();
    toast({ title: `Assigned ${studentSpecificQIds.length} questions to Student #${sId}`, status: 'success', duration: 2500 });
  };

  const handleRemoveManualAssignment = (sId) => {
    setManualAllocations((prev) => prev.filter((m) => m.student_id !== sId));
  };

  // ── Publish Action ───────────────────────────
  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await publishLabAssessmentApi(labId);
      toast({
        title: 'Assessment published!',
        description: 'Students can now participate during the scheduled time window.',
        status: 'success',
        duration: 3500,
        isClosable: true,
      });
      onPublishClose();
      loadData();
    } catch (err) {
      toast({
        title: err.response?.data?.message || 'Failed to publish assessment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleToggleSelectMcq = (mId) => {
    setSelectedMcqIds((prev) => {
      const next = prev.includes(mId) ? prev.filter((id) => id !== mId) : [...prev, mId];
      return next;
    });
  };

  // Question filtering
  const filteredAvailableQuestions = availableQuestions.filter((q) => {
    if (qSearch.trim() && !q.title.toLowerCase().includes(qSearch.toLowerCase())) {
      return false;
    }
    if (qTopicFilter !== 'all' && q.topic_id?.toString() !== qTopicFilter) {
      return false;
    }
    if (qDiffFilter !== 'all' && q.difficulty !== qDiffFilter) {
      return false;
    }
    return true;
  });

  // MCQ filtering
  const filteredAvailableMcqs = availableMcqs.filter((m) => {
    if (mcqSearch.trim()) {
      const term = mcqSearch.toLowerCase();
      const textMatch = m.question_text?.toLowerCase().includes(term);
      const optMatch = m.option_a?.toLowerCase().includes(term) ||
                       m.option_b?.toLowerCase().includes(term) ||
                       m.option_c?.toLowerCase().includes(term) ||
                       m.option_d?.toLowerCase().includes(term);
      if (!textMatch && !optMatch) return false;
    }
    if (mcqTopicFilter !== 'all' && m.topic_id?.toString() !== mcqTopicFilter) {
      return false;
    }
    return true;
  });

  const isDraft = lab?.status === 'draft';
  const addedTopicIds = new Set(lab?.topics?.map((t) => t.topic_id) || []);
  const availableTopicsToAdd = allTopics.filter((t) => !addedTopicIds.has(t.topic_id));

  // Mode-specific sufficiency checks
  const numCodingReq = parseInt(editForm.num_coding_questions ?? 0, 10) || 0;
  const numMcqReq = parseInt(editForm.num_mcq_questions ?? 0, 10) || 0;
  const numReq = numCodingReq + numMcqReq;
  const isModeA = editForm.allocation_mode === 'specific';
  const isModeB = editForm.allocation_mode === 'random';
  const isModeC = editForm.allocation_mode === 'hybrid';

  const isCodingSufficient = isModeA
    ? numCodingReq === 0 || selectedQuestionIds.length >= numCodingReq
    : numCodingReq === 0 || totalEligible >= numCodingReq;

  const isMcqSufficient = isModeA
    ? numMcqReq === 0 || selectedMcqIds.length >= numMcqReq
    : true;

  const isQuestionSufficient = numReq > 0 && isCodingSufficient && isMcqSufficient;

  // Selected questions objects and total marks calculation
  const selectedQuestionObjects = availableQuestions.filter((q) =>
    selectedQuestionIds.includes(q.lab_question_id)
  );
  const totalSelectedMarks = selectedQuestionObjects.reduce(
    (acc, q) => acc + (q.marks || DIFFICULTY_MARKS[q.difficulty] || 10),
    0
  );

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <VStack spacing={3}>
          <Spinner size="xl" color={accentColor} thickness="4px" />
          <Text color={mutedText}>Loading assessment details...</Text>
        </VStack>
      </Flex>
    );
  }

  if (!lab) return null;

  return (
    <VStack spacing={8} align="stretch" w="full" maxW="1440px" mx="auto" pb={16}>
      {/* ── Top Header ────────────────────────────────────── */}
      <Box>
        <Button
          as={RouterLink}
          to="/faculty/lab-assessments"
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          size="sm"
          mb={4}
        >
          Back to Assessments
        </Button>

        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
          <VStack align="start" spacing={1}>
            <HStack spacing={3}>
              <Heading size="lg" color={textColor} fontWeight="800">
                {lab.title}
              </Heading>
              <Badge colorScheme={STATUS_COLORS[lab.status]} px={2.5} py={1} borderRadius="md" textTransform="capitalize">
                {lab.status}
              </Badge>
              <Badge
                colorScheme={isModeA ? 'cyan' : isModeC ? 'teal' : 'purple'}
                px={2.5}
                py={1}
                borderRadius="md"
              >
                {isModeA ? 'Mode A: Specific Questions' : isModeC ? 'Mode C: Hybrid Allocation' : 'Mode B: Random Allocation'}
              </Badge>
              {lab.room_name && (
                <Badge colorScheme="teal" px={2.5} py={1} borderRadius="md">
                  Room: {lab.room_name} ({lab.room_code})
                </Badge>
              )}
            </HStack>
            <Text color={mutedText} fontSize="sm">
              Created by {lab.faculty_name} • Duration: {lab.duration} mins • {numCodingReq} Coding + {numMcqReq} MCQs
            </Text>
          </VStack>

          <HStack spacing={3}>
            <Button
              as={RouterLink}
              to="/faculty/lab-questions"
              variant="outline"
              size="sm"
            >
              Question Bank
            </Button>
            <Button
              as={RouterLink}
              to={`/faculty/lab-assessments/${labId}/results`}
              variant="outline"
              size="sm"
              rightIcon={<ArrowForwardIcon />}
            >
              Results
            </Button>
            {isDraft && (
              <Button
                colorScheme="brand"
                onClick={onPublishOpen}
                isDisabled={!isQuestionSufficient || !lab.start_time || !lab.end_time || lab.topics?.length === 0}
                leftIcon={<CheckCircleIcon />}
              >
                Publish Assessment
              </Button>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* ── Readiness / Allocation Mode Alert ────────────── */}
      {isDraft && (
        <Alert
          status={isQuestionSufficient && lab.topics?.length > 0 ? 'success' : 'warning'}
          borderRadius="2xl"
          borderWidth="1px"
        >
          <AlertIcon />
          <Box flex={1}>
            <AlertTitle fontSize="sm">
              {lab.topics?.length === 0
                ? 'Topics Required'
                : isModeA
                ? `Mode A — Selected ${selectedQuestionIds.length} / ${numCodingReq} Coding Qs & ${selectedMcqIds.length} / ${numMcqReq} MCQs (${totalSelectedMarks} Total Marks)`
                : isModeC
                ? `Mode C — Hybrid Pool: ${totalEligible} questions available (${manualAllocations.length} students assigned manually)`
                : `Mode B — Ready for random allocation: ${totalEligible} eligible questions in pool (need at least ${numCodingReq} coding)`}
            </AlertTitle>
            <AlertDescription fontSize="xs" color={mutedText}>
              {lab.topics?.length === 0
                ? 'Add at least one curriculum topic to enable assessment question selection.'
                : isModeA && (!isCodingSufficient || !isMcqSufficient)
                ? `Please ensure you select at least ${numCodingReq} coding question(s) and ${numMcqReq} MCQ(s) before publishing.`
                : isModeA
                ? 'All students taking this assessment will receive the exact questions you have selected below.'
                : isModeC
                ? 'Students with manual assignments receive their exact chosen questions; all other students receive randomized questions from the pool.'
                : 'Each student will automatically receive a randomized set of questions when starting the assessment.'}
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* ── Main Layout Grid ──────────────────────────────── */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Left Column (1 col): Settings & Topics */}
        <VStack spacing={6} align="stretch">
          {/* Assessment Configuration Card */}
          <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="2xl" boxShadow="sm">
            <CardBody p={5}>
              <Heading size="sm" color={textColor} mb={4}>
                Assessment Configuration
              </Heading>

              {isDraft ? (
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="600">Title</FormLabel>
                    <Input
                      size="sm"
                      value={editForm.title}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="600">Description</FormLabel>
                    <Textarea
                      size="sm"
                      rows={2}
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </FormControl>

                  <SimpleGrid columns={2} spacing={3} w="full">
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="600">Start Time</FormLabel>
                      <Input
                        size="sm"
                        type="datetime-local"
                        value={editForm.start_time}
                        onChange={(e) => setEditForm((f) => ({ ...f, start_time: e.target.value }))}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="600">End Time</FormLabel>
                      <Input
                        size="sm"
                        type="datetime-local"
                        value={editForm.end_time}
                        onChange={(e) => setEditForm((f) => ({ ...f, end_time: e.target.value }))}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={2} spacing={3} w="full">
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="600">Duration (mins)</FormLabel>
                      <NumberInput
                        size="sm"
                        min={5}
                        max={480}
                        value={editForm.duration}
                        onChange={(_, v) => setEditForm((f) => ({ ...f, duration: v || 120 }))}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="600">Coding Qs / Student</FormLabel>
                      <NumberInput
                        size="sm"
                        min={0}
                        max={20}
                        value={editForm.num_coding_questions}
                        onChange={(_, v) => setEditForm((f) => ({ ...f, num_coding_questions: isNaN(v) ? 0 : Math.max(0, v) }))}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="600">Marks / Coding Q</FormLabel>
                      <NumberInput
                        size="sm"
                        min={1}
                        max={100}
                        value={editForm.marks_per_question}
                        onChange={(_, v) => setEditForm((f) => ({ ...f, marks_per_question: isNaN(v) ? 10 : Math.max(1, v) }))}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={2} spacing={3} w="full">
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="600">MCQs / Student</FormLabel>
                      <NumberInput
                        size="sm"
                        min={0}
                        max={50}
                        value={editForm.num_mcq_questions}
                        onChange={(_, v) => setEditForm((f) => ({ ...f, num_mcq_questions: isNaN(v) ? 0 : Math.max(0, v) }))}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="600">Marks / MCQ</FormLabel>
                      <NumberInput
                        size="sm"
                        min={1}
                        max={50}
                        value={editForm.marks_per_mcq}
                        onChange={(_, v) => setEditForm((f) => ({ ...f, marks_per_mcq: isNaN(v) ? 2 : Math.max(1, v) }))}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>

                  {/* Allocation Mode Selector */}
                  <FormControl isRequired w="full">
                    <FormLabel fontSize="xs" fontWeight="600">Allocation Mode</FormLabel>
                    <Select
                      size="sm"
                      value={editForm.allocation_mode}
                      onChange={(e) => setEditForm((f) => ({ ...f, allocation_mode: e.target.value }))}
                    >
                      <option value="specific">Mode A — Faculty Selects Specific Questions</option>
                      <option value="random">Mode B — Automatic Random Allocation</option>
                      <option value="hybrid">Mode C — Hybrid Allocation</option>
                    </Select>
                    <FormHelperText fontSize="10px">
                      {isModeA && 'Select the exact questions below. All students receive these questions.'}
                      {isModeB && 'Questions will be randomly picked from the selected topics for each student.'}
                      {isModeC && 'Assign exact questions to particular students; rest get random allocation.'}
                    </FormHelperText>
                  </FormControl>

                  <Button
                    size="sm"
                    colorScheme="brand"
                    w="full"
                    onClick={() => handleSave()}
                    isLoading={isSaving}
                  >
                    Save Assessment Settings
                  </Button>
                </VStack>
              ) : (
                <VStack spacing={3} align="start" fontSize="xs">
                  <HStack justify="space-between" w="full">
                    <Text color={mutedText}>Start:</Text>
                    <Text fontWeight="600">{formatDT(lab.start_time)}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text color={mutedText}>End:</Text>
                    <Text fontWeight="600">{formatDT(lab.end_time)}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text color={mutedText}>Duration:</Text>
                    <Text fontWeight="600">{lab.duration} mins</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text color={mutedText}>Questions:</Text>
                    <Text fontWeight="600">{lab.num_questions}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text color={mutedText}>Allocation Mode:</Text>
                    <Badge colorScheme="purple">{lab.allocation_mode}</Badge>
                  </HStack>
                </VStack>
              )}
            </CardBody>
          </Card>

          {/* Curriculum Topics Card */}
          <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="2xl" boxShadow="sm">
            <CardBody p={5}>
              <Flex justify="space-between" align="center" mb={3}>
                <Heading size="sm" color={textColor}>
                  Selected Topics ({lab.topics?.length || 0})
                </Heading>
                {isDraft && (
                  <Button
                    size="xs"
                    leftIcon={<AddIcon />}
                    colorScheme="brand"
                    variant="outline"
                    onClick={onAddTopicOpen}
                  >
                    Add Topic
                  </Button>
                )}
              </Flex>

              {lab.topics?.length === 0 ? (
                <Box p={4} bg={surfaceBg} borderRadius="xl" textAlign="center">
                  <Text fontSize="xs" color={mutedText}>
                    No topics added yet. Add topics to create the question pool.
                  </Text>
                </Box>
              ) : (
                <VStack spacing={2.5} align="stretch">
                  {poolStats.map((stat) => (
                    <Box
                      key={stat.topic_id}
                      p={2.5}
                      borderRadius="lg"
                      bg={surfaceBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                    >
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="700" fontSize="xs" noOfLines={1}>
                            {stat.topic_title}
                          </Text>
                          <HStack spacing={1} mt={0.5}>
                            <Badge size="xs" colorScheme={stat.question_count > 0 ? 'green' : 'orange'} fontSize="10px">
                              {stat.question_count} published Qs
                            </Badge>
                          </HStack>
                        </Box>
                        {isDraft && (
                          <IconButton
                            icon={<DeleteIcon />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            aria-label="Remove topic"
                            onClick={() => handleRemoveTopic(stat.topic_id)}
                          />
                        )}
                      </Flex>
                    </Box>
                  ))}

                  {/* Pool Progress */}
                  <Box mt={2} p={3} borderRadius="lg" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                    <Flex justify="space-between" fontSize="xs" mb={1.5}>
                      <Text color={mutedText}>Coding Question Pool:</Text>
                      <Text fontWeight="bold" color={numCodingReq === 0 || totalEligible >= numCodingReq ? 'green.600' : 'orange.600'}>
                        {totalEligible} / {numCodingReq} coding required
                      </Text>
                    </Flex>
                    <Progress
                      value={numCodingReq === 0 ? 100 : Math.min(100, (totalEligible / (numCodingReq || 1)) * 100)}
                      colorScheme={numCodingReq === 0 || totalEligible >= numCodingReq ? 'green' : 'orange'}
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>
                </VStack>
              )}
            </CardBody>
          </Card>
        </VStack>

        {/* Right Column (2 cols): Question Selection & Allocation Engine */}
        <Box gridColumn={{ base: '1', lg: 'span 2' }}>
          <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="2xl" boxShadow="sm">
            <CardBody p={5}>
              {/* Mode A — Faculty Selects Specific Questions */}
              {isModeA && (
                <Box>
                  <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} mb={4} direction={{ base: 'column', sm: 'row' }} gap={2}>
                    <Box>
                      <Heading size="sm" color={textColor}>
                        Mode A: Select Specific Questions & MCQs
                      </Heading>
                      <Text fontSize="xs" color={mutedText}>
                        Select exact coding questions and MCQs to include. All students will receive these configured questions.
                      </Text>
                    </Box>
                    <HStack spacing={2} wrap="wrap">
                      <Tag size="md" colorScheme={numCodingReq === 0 || selectedQuestionIds.length >= numCodingReq ? 'green' : 'orange'} variant="solid">
                        {selectedQuestionIds.length} / {numCodingReq} Coding Qs
                      </Tag>
                      <Tag size="md" colorScheme={numMcqReq === 0 || selectedMcqIds.length >= numMcqReq ? 'green' : 'orange'} variant="solid">
                        {selectedMcqIds.length} / {numMcqReq} MCQs
                      </Tag>
                      {isDraft && (
                        <Button
                          size="sm"
                          colorScheme="brand"
                          onClick={() => handleSave()}
                          isLoading={isSaving}
                        >
                          Save Selection
                        </Button>
                      )}
                    </HStack>
                  </Flex>

                  {/* Dual Mode A Tabs: Coding Questions and MCQs */}
                  <Tabs variant="enclosed" colorScheme="green" defaultIndex={numCodingReq === 0 ? 1 : 0}>
                    <TabList borderColor={cardBorder} mb={4}>
                      <Tab fontWeight="bold" fontSize="sm">
                        Coding Questions ({selectedQuestionIds.length} / {numCodingReq})
                      </Tab>
                      <Tab fontWeight="bold" fontSize="sm">
                        Multiple Choice Questions ({selectedMcqIds.length} / {numMcqReq})
                      </Tab>
                    </TabList>

                    <TabPanels>
                      {/* ── TAB 1: CODING QUESTIONS ── */}
                      <TabPanel p={0}>
                        {/* Question Browser Filters */}
                        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} mb={4}>
                          <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none">
                              <SearchIcon color="gray.400" />
                            </InputLeftElement>
                            <Input
                              placeholder="Search coding questions..."
                              value={qSearch}
                              onChange={(e) => setQSearch(e.target.value)}
                              borderRadius="lg"
                            />
                          </InputGroup>

                          <Select
                            size="sm"
                            borderRadius="lg"
                            value={qTopicFilter}
                            onChange={(e) => setQTopicFilter(e.target.value)}
                          >
                            <option value="all">All Selected Topics</option>
                            {(lab.topics || []).map((t) => (
                              <option key={t.topic_id} value={t.topic_id}>
                                {t.topic_title}
                              </option>
                            ))}
                          </Select>

                          <Select
                            size="sm"
                            borderRadius="lg"
                            value={qDiffFilter}
                            onChange={(e) => setQDiffFilter(e.target.value)}
                          >
                            <option value="all">All Difficulties</option>
                            <option value="easy">Easy (5 marks)</option>
                            <option value="medium">Medium (10 marks)</option>
                            <option value="hard">Hard (15 marks)</option>
                          </Select>
                        </SimpleGrid>

                        {/* Available Coding Questions Table */}
                        {filteredAvailableQuestions.length === 0 ? (
                          <Box p={8} textAlign="center" borderRadius="xl" bg={surfaceBg}>
                            <Text color={mutedText} fontSize="sm">
                              No published coding questions available for the selected topics and filters.
                            </Text>
                          </Box>
                        ) : (
                          <VStack spacing={2.5} align="stretch" maxH="550px" overflowY="auto" pr={1}>
                            {filteredAvailableQuestions.map((q) => {
                              const isSelected = selectedQuestionIds.includes(q.lab_question_id);
                              const diffColor = DIFFICULTY_COLORS[q.difficulty] || 'gray';
                              const marks = q.marks || DIFFICULTY_MARKS[q.difficulty] || 10;
                              return (
                                <Box
                                  key={q.lab_question_id}
                                  p={3.5}
                                  borderRadius="xl"
                                  bg={isSelected ? surfaceBg : 'transparent'}
                                  borderWidth="2px"
                                  borderColor={isSelected ? 'blue.400' : cardBorder}
                                  transition="all 0.15s ease"
                                  _hover={{ borderColor: 'blue.300' }}
                                >
                                  <Flex justify="space-between" align="start" gap={3}>
                                    <HStack spacing={3} align="start" flex={1}>
                                      {isDraft && (
                                        <Checkbox
                                          mt={1}
                                          colorScheme="brand"
                                          isChecked={isSelected}
                                          onChange={() => handleToggleSelectQuestion(q.lab_question_id)}
                                        />
                                      )}
                                      <VStack align="start" spacing={1}>
                                        <HStack spacing={2} wrap="wrap">
                                          <Text fontWeight="700" fontSize="sm" color={textColor}>
                                            {q.title}
                                          </Text>
                                          <Badge colorScheme={diffColor} fontSize="xs">
                                            {q.difficulty} ({marks}m)
                                          </Badge>
                                          {q.topic_title && (
                                            <Badge colorScheme="blue" variant="subtle" fontSize="10px">
                                              {q.topic_title}
                                            </Badge>
                                          )}
                                        </HStack>
                                        <Text fontSize="xs" color={mutedText} noOfLines={2}>
                                          {q.problem_statement}
                                        </Text>
                                      </VStack>
                                    </HStack>

                                    <HStack spacing={1}>
                                      <Tooltip label="Preview problem statement" hasArrow>
                                        <IconButton
                                          icon={<ViewIcon />}
                                          size="xs"
                                          variant="ghost"
                                          colorScheme="blue"
                                          aria-label="Preview"
                                          onClick={() => {
                                            setPreviewQuestion(q);
                                            onPreviewOpen();
                                          }}
                                        />
                                      </Tooltip>
                                    </HStack>
                                  </Flex>
                                </Box>
                              );
                            })}
                          </VStack>
                        )}
                      </TabPanel>

                      {/* ── TAB 2: MCQ QUESTIONS ── */}
                      <TabPanel p={0}>
                        {/* MCQ Filters */}
                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={4}>
                          <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none">
                              <SearchIcon color="gray.400" />
                            </InputLeftElement>
                            <Input
                              placeholder="Search MCQs by question or option..."
                              value={mcqSearch}
                              onChange={(e) => setMcqSearch(e.target.value)}
                              borderRadius="lg"
                            />
                          </InputGroup>

                          <Select
                            size="sm"
                            borderRadius="lg"
                            value={mcqTopicFilter}
                            onChange={(e) => setMcqTopicFilter(e.target.value)}
                          >
                            <option value="all">All Selected Topics</option>
                            {(lab.topics || []).map((t) => (
                              <option key={t.topic_id} value={t.topic_id}>
                                {t.topic_title}
                              </option>
                            ))}
                          </Select>
                        </SimpleGrid>

                        {/* Available MCQs List */}
                        {filteredAvailableMcqs.length === 0 ? (
                          <Box p={8} textAlign="center" borderRadius="xl" bg={surfaceBg}>
                            <Text color={mutedText} fontSize="sm">
                              No published MCQs available for the selected topics and filters.
                            </Text>
                          </Box>
                        ) : (
                          <VStack spacing={3} align="stretch" maxH="550px" overflowY="auto" pr={1}>
                            {filteredAvailableMcqs.map((m) => {
                              const isSelected = selectedMcqIds.includes(m.mcq_id);
                              return (
                                <Box
                                  key={m.mcq_id}
                                  p={4}
                                  borderRadius="xl"
                                  bg={isSelected ? surfaceBg : 'transparent'}
                                  borderWidth="2px"
                                  borderColor={isSelected ? 'purple.400' : cardBorder}
                                  transition="all 0.15s ease"
                                  _hover={{ borderColor: 'purple.300' }}
                                >
                                  <Flex justify="space-between" align="start" gap={3}>
                                    <HStack spacing={3} align="start" flex={1}>
                                      {isDraft && (
                                        <Checkbox
                                          mt={1}
                                          colorScheme="purple"
                                          isChecked={isSelected}
                                          onChange={() => handleToggleSelectMcq(m.mcq_id)}
                                        />
                                      )}
                                      <VStack align="start" spacing={2} w="full">
                                        <HStack spacing={2} wrap="wrap">
                                          <Badge colorScheme="purple" fontSize="xs">
                                            MCQ #{m.mcq_id}
                                          </Badge>
                                          {m.topic_title && (
                                            <Badge colorScheme="blue" variant="subtle" fontSize="10px">
                                              {m.topic_title}
                                            </Badge>
                                          )}
                                          <Badge colorScheme="green" fontSize="xs">
                                            Correct: Option {m.correct_option}
                                          </Badge>
                                          <Badge colorScheme="teal" variant="outline" fontSize="xs">
                                            {m.marks || 2} marks
                                          </Badge>
                                        </HStack>

                                        <Text fontWeight="600" fontSize="sm" color={textColor}>
                                          {m.question_text}
                                        </Text>

                                        {/* Options Grid */}
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} w="full" pt={1}>
                                          {['A', 'B', 'C', 'D'].map((optKey) => {
                                            const optText = m[`option_${optKey.toLowerCase()}`];
                                            const isCorrect = m.correct_option === optKey;
                                            return (
                                              <Box
                                                key={optKey}
                                                p={2}
                                                borderRadius="md"
                                                bg={isCorrect ? 'green.50' : surfaceBg}
                                                borderWidth="1px"
                                                borderColor={isCorrect ? 'green.400' : cardBorder}
                                                fontSize="xs"
                                              >
                                                <Text color={isCorrect ? 'green.800' : textColor}>
                                                  <strong>({optKey})</strong> {optText}
                                                </Text>
                                              </Box>
                                            );
                                          })}
                                        </SimpleGrid>

                                        {m.explanation && (
                                          <Text fontSize="2xs" color={mutedText} fontStyle="italic" pt={1}>
                                            💡 Explanation: {m.explanation}
                                          </Text>
                                        )}
                                      </VStack>
                                    </HStack>
                                  </Flex>
                                </Box>
                              );
                            })}
                          </VStack>
                        )}
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Box>
              )}

              {/* Mode B — Automatic Random Allocation */}
              {isModeB && (
                <Box>
                  <Heading size="sm" color={textColor} mb={1}>
                    Mode B: Automatic Random Allocation
                  </Heading>
                  <Text fontSize="xs" color={mutedText} mb={4}>
                    The system dynamically and securely allocates {numReq} unique questions from the selected topic pool to each student when they start the assessment.
                  </Text>

                  <Alert status="info" borderRadius="xl" mb={4}>
                    <AlertIcon />
                    <Box fontSize="xs">
                      <AlertTitle fontWeight="bold">How Mode B Operates:</AlertTitle>
                      <AlertDescription>
                        1. When a student enters the lab workspace, the backend selects {numReq} questions randomly without repetition from the {totalEligible} published questions in the selected topics.
                        <br />
                        2. The allocation is permanently saved in PostgreSQL (<Code fontSize="10px">la_student_allocations</Code>), ensuring refreshing or reconnecting returns the exact same questions.
                        <br />
                        3. Students cannot access questions or marks assigned to other students.
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <Tabs variant="enclosed" colorScheme="green" size="sm" mt={3}>
                    <TabList borderColor={cardBorder}>
                      <Tab fontSize="xs" fontWeight="bold">
                        Coding Questions Pool ({availableQuestions.length})
                      </Tab>
                      <Tab fontSize="xs" fontWeight="bold">
                        MCQ Pool ({availableMcqs.length})
                      </Tab>
                    </TabList>

                    <TabPanels pt={3}>
                      <TabPanel p={0}>
                        <VStack spacing={2} align="stretch" maxH="450px" overflowY="auto">
                          {availableQuestions.length === 0 ? (
                            <Text fontSize="xs" color={mutedText} py={4} textAlign="center">
                              No published coding questions found for the selected topics.
                            </Text>
                          ) : (
                            availableQuestions.map((q) => (
                              <Box key={q.lab_question_id} p={3} borderRadius="lg" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                                <Flex justify="space-between" align="center">
                                  <VStack align="start" spacing={0.5}>
                                    <HStack spacing={2}>
                                      <Text fontWeight="600" fontSize="xs">{q.title}</Text>
                                      <Badge colorScheme={DIFFICULTY_COLORS[q.difficulty]} fontSize="9px">{q.difficulty} ({q.marks || DIFFICULTY_MARKS[q.difficulty]}m)</Badge>
                                      <Badge colorScheme="blue" variant="subtle" fontSize="9px">{q.topic_title}</Badge>
                                    </HStack>
                                    <Text fontSize="10px" color={mutedText} noOfLines={1}>{q.problem_statement}</Text>
                                  </VStack>
                                  <IconButton
                                    icon={<ViewIcon />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="blue"
                                    aria-label="Preview"
                                    onClick={() => {
                                      setPreviewQuestion(q);
                                      onPreviewOpen();
                                    }}
                                  />
                                </Flex>
                              </Box>
                            ))
                          )}
                        </VStack>
                      </TabPanel>

                      <TabPanel p={0}>
                        <VStack spacing={2} align="stretch" maxH="450px" overflowY="auto">
                          {availableMcqs.length === 0 ? (
                            <Text fontSize="xs" color={mutedText} py={4} textAlign="center">
                              No published MCQs found for the selected topics.
                            </Text>
                          ) : (
                            availableMcqs.map((m) => (
                              <Box key={m.mcq_id} p={3} borderRadius="lg" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                                <VStack align="stretch" spacing={1}>
                                  <HStack justify="space-between">
                                    <HStack spacing={2}>
                                      <Badge colorScheme="purple" fontSize="9px">{m.topic_title || 'Topic'}</Badge>
                                      <Badge colorScheme={DIFFICULTY_COLORS[m.difficulty]} fontSize="9px">{m.difficulty || 'medium'}</Badge>
                                      <Badge colorScheme="green" fontSize="9px">Correct: Option {m.correct_option}</Badge>
                                    </HStack>
                                  </HStack>
                                  <Text fontSize="xs" fontWeight="600" color={textColor} mt={1}>{m.question_text}</Text>
                                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={1} pt={1}>
                                    {['A', 'B', 'C', 'D'].map((k) => (
                                      <Text key={k} fontSize="10px" color={m.correct_option === k ? 'green.600' : mutedText} fontWeight={m.correct_option === k ? 'bold' : 'normal'}>
                                        {k}. {m[`option_${k.toLowerCase()}`]}
                                      </Text>
                                    ))}
                                  </SimpleGrid>
                                </VStack>
                              </Box>
                            ))
                          )}
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Box>
              )}

              {/* Mode C — Hybrid Allocation */}
              {isModeC && (
                <Box>
                  <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} mb={3} direction={{ base: 'column', sm: 'row' }} gap={2}>
                    <Box>
                      <Heading size="sm" color={textColor}>
                        Mode C: Hybrid Allocation
                      </Heading>
                      <Text fontSize="xs" color={mutedText}>
                        Manually designate questions for specific students. All remaining students receive randomized questions from the pool.
                      </Text>
                    </Box>
                    {isDraft && (
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<AddIcon />}
                          colorScheme="brand"
                          variant="outline"
                          onClick={handleOpenManualAssignment}
                        >
                          Assign Student
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="brand"
                          onClick={() => handleSave()}
                          isLoading={isSaving}
                        >
                          Save Allocations
                        </Button>
                      </HStack>
                    )}
                  </Flex>

                  {/* Manual Student Assignments List */}
                  <Heading size="xs" textTransform="uppercase" color="gray.500" mb={2}>
                    Manual Student Assignments ({manualAllocations.length})
                  </Heading>

                  {manualAllocations.length === 0 ? (
                    <Box p={6} borderRadius="xl" bg={surfaceBg} textAlign="center" mb={4}>
                      <Text fontSize="xs" color={mutedText}>
                        No students have been manually assigned yet. Click "Assign Student" above to assign specific questions to individual students.
                      </Text>
                    </Box>
                  ) : (
                    <VStack spacing={2.5} align="stretch" mb={4}>
                      {manualAllocations.map((ma) => (
                        <Box key={ma.student_id} p={3} borderRadius="xl" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                          <Flex justify="space-between" align="center">
                            <Box>
                              <HStack spacing={2}>
                                <Text fontWeight="bold" fontSize="xs">Student #{ma.student_id}</Text>
                                {ma.student_name && <Badge colorScheme="purple">{ma.student_name}</Badge>}
                                {ma.roll_number && <Badge colorScheme="gray">{ma.roll_number}</Badge>}
                              </HStack>
                              <Text fontSize="10px" color={mutedText} mt={0.5}>
                                Assigned Questions: {ma.question_ids?.join(', ')} ({ma.question_ids?.length} Qs)
                              </Text>
                            </Box>
                            {isDraft && (
                              <IconButton
                                icon={<DeleteIcon />}
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                aria-label="Remove assignment"
                                onClick={() => handleRemoveManualAssignment(ma.student_id)}
                              />
                            )}
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  )}

                  <Alert status="info" size="sm" borderRadius="lg" fontSize="xs">
                    <AlertIcon />
                    All unassigned students will receive {numReq} randomized questions from the {totalEligible} questions in the topic pool when starting.
                  </Alert>
                </Box>
              )}
            </CardBody>
          </Card>
        </Box>
      </SimpleGrid>

      {/* ── QUESTION PREVIEW MODAL (STUDENT VIEW) ─────────── */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="3xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent borderRadius="2xl" bg={cardBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader pb={1}>
            <HStack spacing={2}>
              <ViewIcon color="blue.500" />
              <Heading size="md" color={textColor}>Question Preview</Heading>
            </HStack>
            <HStack spacing={2} mt={1}>
              <Badge colorScheme={DIFFICULTY_COLORS[previewQuestion?.difficulty]}>
                {previewQuestion?.difficulty} ({previewQuestion?.marks || DIFFICULTY_MARKS[previewQuestion?.difficulty] || 10} marks)
              </Badge>
              {previewQuestion?.topic_title && <Badge colorScheme="blue">{previewQuestion.topic_title}</Badge>}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            {previewQuestion && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="sm" color={textColor} mb={2}>{previewQuestion.title}</Heading>
                  <Box p={4} borderRadius="xl" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                    <Text fontSize="sm" whiteSpace="pre-wrap">{previewQuestion.problem_statement}</Text>
                  </Box>
                </Box>

                {previewQuestion.input_format && (
                  <Box>
                    <Text fontWeight="bold" fontSize="xs" color="gray.600" mb={1}>Input Format</Text>
                    <Box p={2.5} borderRadius="md" bg={surfaceBg} fontSize="xs">{previewQuestion.input_format}</Box>
                  </Box>
                )}

                {previewQuestion.output_format && (
                  <Box>
                    <Text fontWeight="bold" fontSize="xs" color="gray.600" mb={1}>Output Format</Text>
                    <Box p={2.5} borderRadius="md" bg={surfaceBg} fontSize="xs">{previewQuestion.output_format}</Box>
                  </Box>
                )}

                {previewQuestion.constraints && (
                  <Box>
                    <Text fontWeight="bold" fontSize="xs" color="gray.600" mb={1}>Constraints</Text>
                    <Code p={2} borderRadius="md" w="full" fontSize="xs">{previewQuestion.constraints}</Code>
                  </Box>
                )}

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box p={3} borderRadius="lg" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>Sample Input</Text>
                    <Code p={2} borderRadius="md" w="full" fontSize="xs" whiteSpace="pre-wrap">
                      {previewQuestion.sample_input || '(none)'}
                    </Code>
                  </Box>
                  <Box p={3} borderRadius="lg" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>Sample Output</Text>
                    <Code p={2} borderRadius="md" w="full" fontSize="xs" whiteSpace="pre-wrap">
                      {previewQuestion.sample_output || '(none)'}
                    </Code>
                  </Box>
                </SimpleGrid>

                {previewQuestion.explanation && (
                  <Box p={3} borderRadius="lg" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>Sample Explanation</Text>
                    <Text fontSize="xs">{previewQuestion.explanation}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" onClick={onPreviewClose}>Close Preview</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── MANUAL ASSIGNMENT MODAL (MODE C) ─────────────── */}
      <Modal isOpen={isManualModalOpen} onClose={onManualModalClose} size="2xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent borderRadius="2xl" bg={cardBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader>
            <Heading size="md" color={textColor}>Assign Questions to Student</Heading>
            <Text fontSize="xs" color={mutedText} mt={1}>
              Select exactly {numReq} questions for this specific student.
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={2} spacing={3}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs">Student ID</FormLabel>
                  <Input
                    size="sm"
                    placeholder="e.g. 1"
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs">Student Name (Optional Label)</FormLabel>
                  <Input
                    size="sm"
                    placeholder="e.g. Harish Patil"
                    value={targetStudentName}
                    onChange={(e) => setTargetStudentName(e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>

              <Flex justify="space-between" align="center">
                <Text fontSize="xs" fontWeight="bold">
                  Select {numReq} Questions:
                </Text>
                <Badge colorScheme={studentSpecificQIds.length === numReq ? 'green' : 'orange'}>
                  {studentSpecificQIds.length} / {numReq} Chosen
                </Badge>
              </Flex>

              <VStack spacing={2} align="stretch" maxH="320px" overflowY="auto">
                {availableQuestions.map((q) => {
                  const isChecked = studentSpecificQIds.includes(q.lab_question_id);
                  return (
                    <Box
                      key={q.lab_question_id}
                      p={2.5}
                      borderRadius="lg"
                      bg={isChecked ? surfaceBg : 'transparent'}
                      borderWidth="1px"
                      borderColor={isChecked ? 'blue.400' : cardBorder}
                      cursor="pointer"
                      onClick={() => {
                        setStudentSpecificQIds((prev) =>
                          prev.includes(q.lab_question_id)
                            ? prev.filter((id) => id !== q.lab_question_id)
                            : prev.length < numReq
                            ? [...prev, q.lab_question_id]
                            : prev
                        );
                      }}
                    >
                      <Flex justify="space-between" align="center">
                        <HStack spacing={2}>
                          <Checkbox isChecked={isChecked} colorScheme="brand" pointerEvents="none" />
                          <Text fontSize="xs" fontWeight="600">{q.title}</Text>
                        </HStack>
                        <Badge size="xs" colorScheme={DIFFICULTY_COLORS[q.difficulty]}>
                          {q.difficulty}
                        </Badge>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onManualModalClose}>Cancel</Button>
            <Button
              colorScheme="brand"
              isDisabled={studentSpecificQIds.length !== numReq || !targetStudentId}
              onClick={handleSaveStudentAssignment}
            >
              Assign to Student
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── ADD TOPIC MODAL ──────────────────────────────── */}
      <Modal isOpen={isAddTopicOpen} onClose={onAddTopicClose}>
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent borderRadius="2xl" bg={cardBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader color={textColor}>Add Topic to Assessment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel fontSize="sm">Select Curriculum Topic</FormLabel>
              <Select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                placeholder="Choose a topic..."
              >
                {availableTopicsToAdd.map((t) => (
                  <option key={t.topic_id} value={t.topic_id}>
                    {t.title} ({t.question_count || 0} questions)
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddTopicClose}>Cancel</Button>
            <Button colorScheme="brand" onClick={handleAddTopic} isDisabled={!selectedTopicId}>
              Add Topic
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── PUBLISH CONFIRMATION MODAL ───────────────────── */}
      <Modal isOpen={isPublishOpen} onClose={onPublishClose}>
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent borderRadius="2xl" bg={cardBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader color={textColor}>Publish Lab Assessment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm">
                Publishing makes <strong>{lab.title}</strong> accessible to eligible students.
              </Text>
              <Box p={3} borderRadius="lg" bg={surfaceBg} borderWidth="1px" borderColor={cardBorder} fontSize="xs">
                <Text>📅 <strong>Start:</strong> {formatDT(lab.start_time)}</Text>
                <Text mt={1}>🏁 <strong>End:</strong> {formatDT(lab.end_time)}</Text>
                <Text mt={1}>⏱ <strong>Duration:</strong> {lab.duration} mins</Text>
                <Text mt={1}>❓ <strong>Questions:</strong> {numReq} per student</Text>
                <Text mt={1}>⚙ <strong>Mode:</strong> {isModeA ? 'Mode A (Specific Questions)' : isModeC ? 'Mode C (Hybrid)' : 'Mode B (Random Pool)'}</Text>
                {isModeA && (
                  <Text mt={1} color="green.600" fontWeight="bold">
                    🎯 {selectedQuestionIds.length} exact questions will be given to all students.
                  </Text>
                )}
              </Box>
              <Alert status="warning" borderRadius="md" size="sm">
                <AlertIcon />
                <Text fontSize="xs">Once published, question configuration and topics cannot be modified.</Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPublishClose}>Go Back</Button>
            <Button colorScheme="brand" onClick={handlePublish} isLoading={isPublishing}>
              Confirm &amp; Publish
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default CreateLabAssessment;
