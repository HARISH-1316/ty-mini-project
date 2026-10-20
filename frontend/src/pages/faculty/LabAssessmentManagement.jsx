// ──────────────────────────────────────────────
// Faculty: Lab Assessment Management Dashboard
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, VStack, HStack, Heading, Text, Button, Badge, Card, CardBody,
  SimpleGrid, Flex, Spinner, useToast, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure,
  FormControl, FormLabel, Input, Textarea, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Tag, TagLabel, Icon,
  Stat, StatLabel, StatNumber, Divider,
  Checkbox, CheckboxGroup, Alert, AlertIcon, AlertDescription, Stack,
  Progress, Select, useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ArrowForwardIcon, CheckCircleIcon, TimeIcon, WarningIcon, CloseIcon } from '@chakra-ui/icons';
import {
  getFacultyLabAssessmentsApi,
  getTopicsSummaryApi,
  createLabAssessmentApi,
  publishLabAssessmentApi,
  cancelLabAssessmentApi,
} from '../../api/labApi';
import { getMyRoomsApi } from '../../api/roomApi';
import {
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

const STATUS_ICONS = {
  draft: EditIcon,
  published: TimeIcon,
  active: CheckCircleIcon,
  completed: CheckCircleIcon,
  cancelled: CloseIcon,
};

const formatDateTime = (dt) => formatDisplayDateTime(dt);

const LabAssessmentManagement = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();
  const cancelRef = useRef();

  // Responsive theme tokens: crisp light surfaces in light mode, sleek dark surfaces in dark mode
  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedColor = useColorModeValue('#505750', '#A3B19B');
  const surfaceBg = useColorModeValue('#F2F6F3', '#171918');
  const activeGreenSoft = useColorModeValue('#E8F5E9', '#1E382B');

  const [labs, setLabs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [form, setForm] = useState({
    room_id: '',
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    duration: 120,
    num_coding_questions: 3,
    marks_per_question: 10,
    num_mcq_questions: 5,
    marks_per_mcq: 2,
    allocation_mode: 'random',
    publish_immediately: false,
  });
  const [publishingId, setPublishingId] = useState(null);

  const fetchLabs = useCallback(async () => {
    try {
      const [labsRes, topicsRes, roomsRes] = await Promise.all([
        getFacultyLabAssessmentsApi(),
        getTopicsSummaryApi().catch(() => ({ data: { data: { topics: [] } } })),
        getMyRoomsApi().catch(() => ({ data: { rooms: [] } })),
      ]);
      setLabs(labsRes.data?.data?.labs || []);
      setAvailableTopics(topicsRes.data?.data?.topics || []);
      const fetchedRooms = roomsRes.data?.rooms || roomsRes.rooms || [];
      setRooms(fetchedRooms);

      // Check query param for roomId
      const params = new URLSearchParams(location.search);
      const queryRoomId = params.get('roomId');
      if (queryRoomId) {
        setForm(f => ({ ...f, room_id: queryRoomId }));
        onOpen();
      }
    } catch {
      toast({ title: 'Failed to load assessments', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  }, [location.search, onOpen, toast]);

  useEffect(() => { fetchLabs(); }, [fetchLabs]);

  const toggleTopicSelection = (topicId) => {
    setSelectedTopicIds(prev => 
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const totalPoolFromSelected = availableTopics
    .filter(t => selectedTopicIds.includes(t.topic_id))
    .reduce((sum, t) => sum + (t.question_count || 0), 0);

  const handleCreate = async () => {
    if (!form.room_id) {
      toast({ title: 'Please select a virtual room for this assessment', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (!form.title || !form.start_time || !form.end_time) {
      toast({ title: 'Please fill all required fields', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (selectedTopicIds.length === 0) {
      toast({ title: 'Please select at least one topic for this assessment', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    const parsedCoding = parseInt(form.num_coding_questions ?? 0, 10);
    const parsedMcq = parseInt(form.num_mcq_questions ?? 0, 10);
    const totalQuestions = parsedCoding + parsedMcq;

    if (totalQuestions <= 0) {
      toast({
        title: 'Please configure at least 1 coding question or 1 MCQ',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsCreating(true);
      const res = await createLabAssessmentApi({
        ...form,
        room_id: parseInt(form.room_id, 10),
        num_questions: totalQuestions,
        num_coding_questions: parsedCoding,
        num_mcq_questions: parsedMcq,
        marks_per_question: parseInt(form.marks_per_question ?? 10, 10),
        marks_per_mcq: parseInt(form.marks_per_mcq ?? 2, 10),
        start_time: toUtcIsoString(form.start_time),
        end_time: toUtcIsoString(form.end_time),
        topic_ids: selectedTopicIds,
        allocation_mode: form.allocation_mode,
        publish_immediately: Boolean(form.publish_immediately),
      });
      const newLab = res.data?.data?.lab;
      toast({
        title: 'Assessment created!',
        description: form.publish_immediately
          ? 'Assessment created and published for room members!'
          : 'Room-based assessment configured.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setForm({
        room_id: '',
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        duration: 120,
        num_coding_questions: 3,
        marks_per_question: 10,
        num_mcq_questions: 5,
        marks_per_mcq: 2,
        allocation_mode: 'random',
        publish_immediately: false,
      });
      setSelectedTopicIds([]);
      navigate(`/faculty/lab-assessments/${newLab.lab_id}`);
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Failed to create assessment', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsCreating(false);
    }
  };

  const handleQuickPublish = async (labId) => {
    try {
      setPublishingId(labId);
      await publishLabAssessmentApi(labId);
      toast({
        title: 'Assessment published!',
        description: 'Enrolled students can now view and access this assessment.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchLabs();
    } catch (err) {
      toast({
        title: 'Could not publish assessment',
        description: err.response?.data?.message || 'Click Manage to configure questions or schedule before publishing.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPublishingId(null);
    }
  };

  const handleCancel = async () => {
    if (!selectedLab) return;
    try {
      await cancelLabAssessmentApi(selectedLab.lab_id);
      toast({ title: 'Assessment cancelled', status: 'info', duration: 3000, isClosable: true });
      fetchLabs();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Failed to cancel', status: 'error', duration: 3000, isClosable: true });
    } finally {
      onCancelClose();
      setSelectedLab(null);
    }
  };

  const stats = {
    total: labs.length,
    active: labs.filter(l => l.status === 'active').length,
    draft: labs.filter(l => l.status === 'draft').length,
    completed: labs.filter(l => l.status === 'completed').length,
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="300px">
        <VStack>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text color={mutedColor}>Loading lab assessments...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <VStack spacing={8} align="stretch" w="full" maxW="1440px" mx="auto" pb={16}>
      {/* Header */}
      <Box p={6} borderRadius="2xl" bg={cardBg} border="1px solid" borderColor={cardBorder} boxShadow="sm">
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color={textColor} fontWeight="800">
              Lab Assessments
            </Heading>
            <Text color={mutedColor} fontSize="sm">
              Create, manage, and monitor topic-based coding assessments for your students
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              as={RouterLink}
              to="/faculty/lab-questions"
              variant="outline"
              colorScheme="brand"
              size="sm"
            >
              Question Bank
            </Button>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="brand"
              size="sm"
              onClick={onOpen}
            >
              New Assessment
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {[
          { label: 'Total Assessments', value: stats.total, color: 'blue.600' },
          { label: 'Active Now', value: stats.active, color: 'green.600' },
          { label: 'Drafts', value: stats.draft, color: 'orange.600' },
          { label: 'Completed', value: stats.completed, color: 'purple.600' },
        ].map(s => (
          <Card key={s.label} bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="xs">
            <CardBody py={4}>
              <Stat>
                <StatLabel color={mutedColor} fontSize="xs" fontWeight="600">{s.label}</StatLabel>
                <StatNumber color={s.color} fontSize="2xl" fontWeight="800">{s.value}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Assessment List */}
      {labs.length === 0 ? (
        <Box p={12} bg={cardBg} borderRadius="2xl" textAlign="center" border="1px dashed" borderColor={cardBorder}>
          <Text fontSize="4xl" mb={3}>🧪</Text>
          <Heading size="md" color={textColor} mb={2}>No Lab Assessments Yet</Heading>
          <Text color={mutedColor} mb={6}>Create your first lab assessment to get started.</Text>
          <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={onOpen}>Create First Assessment</Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
          {labs.map((lab) => {
            const StatusIcon = STATUS_ICONS[lab.status] || TimeIcon;
            return (
              <Card
                key={lab.lab_id}
                bg={cardBg}
                borderColor={cardBorder}
                borderWidth="1px"
                borderRadius="xl"
                boxShadow="xs"
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-2px)', borderColor: 'brand.500', boxShadow: 'md' }}
              >
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <Flex w="full" justify="space-between" align="start">
                      <HStack spacing={2}>
                        <Badge colorScheme={STATUS_COLORS[lab.status]} px={2} py={0.5} borderRadius="md" textTransform="capitalize">
                          <HStack spacing={1}>
                            <Icon as={StatusIcon} boxSize={3} />
                            <Text>{lab.status}</Text>
                          </HStack>
                        </Badge>
                        <Badge
                          colorScheme={
                            lab.allocation_mode === 'specific'
                              ? 'cyan'
                              : lab.allocation_mode === 'hybrid'
                              ? 'teal'
                              : 'purple'
                          }
                          px={2}
                          py={0.5}
                          borderRadius="md"
                        >
                          {lab.allocation_mode === 'specific'
                            ? 'Mode A: Specific'
                            : lab.allocation_mode === 'hybrid'
                            ? 'Mode C: Hybrid'
                            : 'Mode B: Random'}
                        </Badge>
                      </HStack>
                      {lab.room_name && (
                        <Badge colorScheme="cyan" fontSize="2xs" px={2} py={0.5} borderRadius="md">
                          🏠 {lab.room_name}
                        </Badge>
                      )}
                    </Flex>

                    <Heading size="sm" color={textColor} noOfLines={2} fontWeight="700">{lab.title}</Heading>

                    <HStack spacing={2} wrap="wrap">
                      <Tag size="sm" colorScheme="blue">
                        {lab.num_coding_questions ?? lab.num_questions ?? 0} Coding
                      </Tag>
                      <Tag size="sm" colorScheme="purple">
                        {lab.num_mcq_questions ?? 0} MCQs
                      </Tag>
                      <Tag size="sm" colorScheme="orange">
                        {lab.total_marks || ((lab.num_coding_questions || lab.num_questions || 0) * 10 + (lab.num_mcq_questions || 0) * 2)} pts
                      </Tag>
                    </HStack>

                    {lab.description && (
                      <Text color={mutedColor} fontSize="xs" noOfLines={2}>{lab.description}</Text>
                    )}

                    {lab.topics && lab.topics.length > 0 && (
                      <HStack wrap="wrap" gap={1}>
                        {lab.topics.slice(0, 3).map(t => (
                          <Tag key={t.topic_id} size="sm" colorScheme="green" variant="subtle">
                            <TagLabel fontSize="xs">{t.topic_title}</TagLabel>
                          </Tag>
                        ))}
                        {lab.topics.length > 3 && (
                          <Tag size="sm" colorScheme="gray" variant="subtle">
                            <TagLabel fontSize="xs">+{lab.topics.length - 3}</TagLabel>
                          </Tag>
                        )}
                      </HStack>
                    )}

                    <Divider borderColor={cardBorder} />

                    <VStack align="start" spacing={1} w="full">
                      <Text color={mutedColor} fontSize="xs">
                        📅 Start: {formatDateTime(lab.start_time)}
                      </Text>
                      <Text color={mutedColor} fontSize="xs">
                        🏁 End: {formatDateTime(lab.end_time)}
                      </Text>
                      <Text color={mutedColor} fontSize="xs">
                        ⏱ Duration: {lab.duration} mins
                      </Text>
                    </VStack>

                    <HStack w="full" spacing={2} pt={2}>
                      <Button
                        as={RouterLink}
                        to={`/faculty/lab-assessments/${lab.lab_id}`}
                        size="sm"
                        colorScheme="brand"
                        variant="solid"
                        flex={1}
                        rightIcon={<ArrowForwardIcon />}
                      >
                        Manage
                      </Button>
                      {lab.status === 'draft' && (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          isLoading={publishingId === lab.lab_id}
                          onClick={() => handleQuickPublish(lab.lab_id)}
                          title="Publish Assessment for Students"
                        >
                          Publish
                        </Button>
                      )}
                      {lab.status !== 'cancelled' && lab.status !== 'completed' && (
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => { setSelectedLab(lab); onCancelOpen(); }}
                          title="Cancel Assessment"
                        >
                          <DeleteIcon />
                        </Button>
                      )}
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>
      )}

      {/* Create Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="2xl">
          <ModalHeader color={textColor} fontWeight="800">Create New Lab Assessment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={textColor} fontSize="sm" fontWeight="600">Virtual Lab Room</FormLabel>
                <Select
                  placeholder="Select a Room to host this assessment..."
                  value={form.room_id}
                  onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))}
                >
                  {rooms.map(r => (
                    <option key={r.room_id} value={r.room_id}>
                      {r.room_name} ({r.room_code})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor} fontSize="sm" fontWeight="600">Assessment Title</FormLabel>
                <Input
                  placeholder="e.g., DSA Lab Assessment — Unit 3"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontSize="sm" fontWeight="600">Description</FormLabel>
                <Textarea
                  placeholder="Brief description of the assessment..."
                  rows={2}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="sm" fontWeight="600">Start Date & Time</FormLabel>
                  <Input
                    type="datetime-local"
                    value={form.start_time}
                    onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="sm" fontWeight="600">End Date & Time</FormLabel>
                  <Input
                    type="datetime-local"
                    value={form.end_time}
                    onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired w="full">
                <FormLabel color={textColor} fontSize="sm" fontWeight="600">Duration (min)</FormLabel>
                <NumberInput
                  min={5}
                  max={480}
                  value={form.duration}
                  onChange={(_, v) => setForm(f => ({ ...f, duration: v || 120 }))}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              {/* Hybrid Question Configuration */}
              <Box w="full" p={3} borderRadius="lg" bg={surfaceBg} border="1px solid" borderColor={cardBorder}>
                <Heading size="xs" color={textColor} mb={3}>
                  Hybrid Assessment Structure (Coding + MCQs)
                </Heading>
                <SimpleGrid columns={2} spacing={3} mb={3}>
                  <FormControl>
                    <FormLabel color={textColor} fontSize="xs" fontWeight="600">Coding Questions / Student</FormLabel>
                    <NumberInput
                      min={0}
                      max={20}
                      value={form.num_coding_questions}
                      onChange={(_, v) => setForm(f => ({ ...f, num_coding_questions: isNaN(v) ? 0 : Math.max(0, v) }))}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textColor} fontSize="xs" fontWeight="600">Marks / Coding Question</FormLabel>
                    <NumberInput
                      min={1}
                      max={100}
                      value={form.marks_per_question}
                      onChange={(_, v) => setForm(f => ({ ...f, marks_per_question: isNaN(v) ? 10 : Math.max(1, v) }))}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={2} spacing={3} mb={2}>
                  <FormControl>
                    <FormLabel color={textColor} fontSize="xs" fontWeight="600">MCQs / Student</FormLabel>
                    <NumberInput
                      min={0}
                      max={50}
                      value={form.num_mcq_questions}
                      onChange={(_, v) => setForm(f => ({ ...f, num_mcq_questions: isNaN(v) ? 0 : Math.max(0, v) }))}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textColor} fontSize="xs" fontWeight="600">Marks / MCQ</FormLabel>
                    <NumberInput
                      min={1}
                      max={50}
                      value={form.marks_per_mcq}
                      onChange={(_, v) => setForm(f => ({ ...f, marks_per_mcq: isNaN(v) ? 2 : Math.max(1, v) }))}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                <HStack justify="space-between" fontSize="xs" color={mutedColor} pt={2} borderTop="1px solid" borderColor={cardBorder}>
                  <Text>Total Questions: <strong>{(form.num_coding_questions || 0) + (form.num_mcq_questions || 0)}</strong></Text>
                  <Text>Max Marks: <strong>{(form.num_coding_questions || 0) * (form.marks_per_question || 10) + (form.num_mcq_questions || 0) * (form.marks_per_mcq || 2)}</strong></Text>
                </HStack>
              </Box>

              {/* Allocation Mode Selector */}
              <FormControl isRequired w="full">
                <FormLabel color={textColor} fontSize="sm" fontWeight="600">Question Allocation Mode</FormLabel>
                <Select
                  value={form.allocation_mode}
                  onChange={e => setForm(f => ({ ...f, allocation_mode: e.target.value }))}
                >
                  <option value="random">Mode B — Automatic Random Allocation (Unique questions per student)</option>
                  <option value="specific">Mode A — Faculty Selects Specific Questions (Identical questions for all)</option>
                  <option value="hybrid">Mode C — Hybrid Allocation (Manual student assignment + random pool)</option>
                </Select>
                <Text color={mutedColor} fontSize="xs" mt={1}>
                  {form.allocation_mode === 'specific'
                    ? 'Mode A: You will select the exact questions in the next screen. Every student receives the exact same questions.'
                    : form.allocation_mode === 'hybrid'
                    ? 'Mode C: You can choose exact questions for specific students; all remaining students receive randomized questions.'
                    : 'Mode B: The system will randomly allocate the configured number of published questions to each student.'}
                </Text>
              </FormControl>

              {/* Topic Selection Section */}
              <Box w="full" pt={1}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text color={textColor} fontSize="sm" fontWeight="semibold">
                    Select Curriculum Topics for Assessment <Text as="span" color="red.500">*</Text>
                  </Text>
                  <Badge colorScheme={selectedTopicIds.length > 0 ? 'green' : 'gray'} fontSize="xs">
                    {selectedTopicIds.length} Selected
                  </Badge>
                </Flex>

                {availableTopics.length === 0 ? (
                  <Alert status="warning" borderRadius="md" fontSize="xs">
                    <AlertIcon />
                    <AlertDescription>No curriculum topics found. Create topics first in Topic Catalog.</AlertDescription>
                  </Alert>
                ) : (
                  <VStack spacing={2} align="stretch" maxH="170px" overflowY="auto" pr={1}>
                    {availableTopics.map((topic) => {
                      const isChecked = selectedTopicIds.includes(topic.topic_id);
                      return (
                        <Box
                          key={topic.topic_id}
                          p={2.5}
                          borderRadius="lg"
                          bg={isChecked ? activeGreenSoft : cardBg}
                          border="1px solid"
                          borderColor={isChecked ? 'brand.500' : cardBorder}
                          cursor="pointer"
                          onClick={() => toggleTopicSelection(topic.topic_id)}
                          transition="all 0.15s"
                          _hover={{ borderColor: 'brand.400' }}
                        >
                          <Flex justify="space-between" align="center">
                            <HStack spacing={3}>
                              <Checkbox
                                colorScheme="brand"
                                isChecked={isChecked}
                                onChange={() => toggleTopicSelection(topic.topic_id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="xs" fontWeight="bold" color={textColor}>
                                  {topic.title}
                                </Text>
                                {topic.description && (
                                  <Text fontSize="2xs" color={mutedColor} noOfLines={1}>
                                    {topic.description}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                            <Badge
                              colorScheme={topic.question_count >= 5 ? 'green' : topic.question_count > 0 ? 'yellow' : 'red'}
                              fontSize="2xs"
                              px={2}
                              py={0.5}
                              borderRadius="md"
                            >
                              {topic.question_count} questions
                            </Badge>
                          </Flex>
                        </Box>
                      );
                    })}
                  </VStack>
                )}
              </Box>

              {/* Pool Status Alert */}
              <Box w="full" p={3} bg={surfaceBg} borderRadius="md" borderWidth="1px" borderColor={cardBorder}>
                <HStack justify="space-between" mb={1}>
                  <Text color={textColor} fontSize="xs" fontWeight="600">
                    Available Coding Pool:
                  </Text>
                  <Badge
                    colorScheme={(parseInt(form.num_coding_questions ?? 0, 10) === 0 || totalPoolFromSelected >= parseInt(form.num_coding_questions ?? 0, 10)) ? 'green' : 'orange'}
                    fontSize="xs"
                  >
                    {totalPoolFromSelected} of {parseInt(form.num_coding_questions ?? 0, 10)} Coding Qs Required
                  </Badge>
                </HStack>
                <Progress
                  value={parseInt(form.num_coding_questions ?? 0, 10) === 0 ? 100 : Math.min(100, (totalPoolFromSelected / (parseInt(form.num_coding_questions ?? 0, 10) || 1)) * 100)}
                  colorScheme={(parseInt(form.num_coding_questions ?? 0, 10) === 0 || totalPoolFromSelected >= parseInt(form.num_coding_questions ?? 0, 10)) ? 'green' : 'orange'}
                  size="xs"
                  borderRadius="full"
                />
              </Box>

              <FormControl pt={1}>
                <Checkbox
                  colorScheme="brand"
                  isChecked={form.publish_immediately}
                  onChange={e => setForm(f => ({ ...f, publish_immediately: e.target.checked }))}
                >
                  <Text fontSize="xs" color={textColor} fontWeight="600">
                    Publish assessment immediately for enrolled room students
                  </Text>
                </Checkbox>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px" borderColor={cardBorder}>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isCreating}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleCreate}
              isLoading={isCreating}
              loadingText="Creating..."
            >
              Continue to Assessment Config
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        isOpen={isCancelOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCancelClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancel Assessment
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to cancel <strong>{selectedLab?.title}</strong>? Students will no longer be able to take this assessment.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCancelClose}>
                Keep Assessment
              </Button>
              <Button colorScheme="red" onClick={handleCancel} ml={3}>
                Yes, Cancel Assessment
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default LabAssessmentManagement;
