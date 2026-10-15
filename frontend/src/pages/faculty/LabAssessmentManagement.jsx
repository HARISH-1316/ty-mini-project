// ──────────────────────────────────────────────
// Faculty: Lab Assessment Management Dashboard
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Progress,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ArrowForwardIcon, CheckCircleIcon, TimeIcon, WarningIcon, CloseIcon } from '@chakra-ui/icons';
import { useRef } from 'react';
import {
  getFacultyLabAssessmentsApi,
  getTopicsSummaryApi,
  createLabAssessmentApi,
  cancelLabAssessmentApi,
} from '../../api/labApi';
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();
  const cancelRef = useRef();

  const [labs, setLabs] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    duration: 120,
    num_questions: 5,
    marks_per_question: 10,
  });

  const fetchLabs = useCallback(async () => {
    try {
      const [labsRes, topicsRes] = await Promise.all([
        getFacultyLabAssessmentsApi(),
        getTopicsSummaryApi().catch(() => ({ data: { data: { topics: [] } } })),
      ]);
      setLabs(labsRes.data?.data?.labs || []);
      setAvailableTopics(topicsRes.data?.data?.topics || []);
    } catch {
      toast({ title: 'Failed to load assessments', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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
    if (!form.title || !form.start_time || !form.end_time) {
      toast({ title: 'Please fill all required fields', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (selectedTopicIds.length === 0) {
      toast({ title: 'Please select at least one topic for this assessment', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    try {
      setIsCreating(true);
      const res = await createLabAssessmentApi({
        ...form,
        start_time: toUtcIsoString(form.start_time),
        end_time: toUtcIsoString(form.end_time),
        topic_ids: selectedTopicIds,
      });
      const newLab = res.data?.data?.lab;
      toast({ title: 'Assessment created!', description: 'Topics configured successfully.', status: 'success', duration: 3000, isClosable: true });
      onClose();
      setForm({ title: '', description: '', start_time: '', end_time: '', duration: 120, num_questions: 5, marks_per_question: 10 });
      setSelectedTopicIds([]);
      navigate(`/faculty/lab-assessments/${newLab.lab_id}`);
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Failed to create assessment', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsCreating(false);
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
          <Spinner size="xl" color="purple.400" thickness="4px" />
          <Text color="gray.400">Loading lab assessments...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Header */}
      <Box p={8} borderRadius="2xl" bg="bg.card" border="1px solid" borderColor="border.primary" boxShadow="sm">
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="text.primary">🧪 Lab Assessments</Heading>
            <Text color="text.secondary" fontSize="sm">Create and manage practical coding assessments for students</Text>
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
              leftIcon={<AddIcon />}
              colorScheme="brand"
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
          { label: 'Total', value: stats.total, color: 'purple.300' },
          { label: 'Active Now', value: stats.active, color: 'green.400' },
          { label: 'Drafts', value: stats.draft, color: 'gray.400' },
          { label: 'Completed', value: stats.completed, color: 'cyan.400' },
        ].map(s => (
          <Card key={s.label} bg="slate.800" borderColor="slate.700" borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel color="gray.400" fontSize="xs">{s.label}</StatLabel>
                <StatNumber color={s.color} fontSize="3xl">{s.value}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Assessment List */}
      {labs.length === 0 ? (
        <Box p={12} bg="slate.800" borderRadius="2xl" textAlign="center" border="1px dashed" borderColor="slate.600">
          <Text fontSize="4xl" mb={3}>🧪</Text>
          <Heading size="md" color="white" mb={2}>No Lab Assessments Yet</Heading>
          <Text color="gray.400" mb={6}>Create your first lab assessment to get started.</Text>
          <Button leftIcon={<AddIcon />} colorScheme="purple" onClick={onOpen}>Create First Assessment</Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
          {labs.map((lab) => {
            const StatusIcon = STATUS_ICONS[lab.status] || TimeIcon;
            return (
              <Card
                key={lab.lab_id}
                bg="slate.800"
                borderColor="slate.700"
                borderWidth="1px"
                borderRadius="xl"
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-3px)', borderColor: 'purple.500', boxShadow: 'xl' }}
              >
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <Flex w="full" justify="space-between" align="start">
                      <Badge colorScheme={STATUS_COLORS[lab.status]} px={2} py={0.5} borderRadius="md" textTransform="capitalize">
                        <HStack spacing={1}>
                          <Icon as={StatusIcon} boxSize={3} />
                          <Text>{lab.status}</Text>
                        </HStack>
                      </Badge>
                      <Text color="gray.500" fontSize="xs">{lab.num_questions || 5} Q • {lab.marks_per_question || 10} pts each</Text>
                    </Flex>

                    <Heading size="sm" color="white" noOfLines={2}>{lab.title}</Heading>

                    {lab.description && (
                      <Text color="gray.400" fontSize="xs" noOfLines={2}>{lab.description}</Text>
                    )}

                    {lab.topics && lab.topics.length > 0 && (
                      <HStack wrap="wrap" gap={1}>
                        {lab.topics.slice(0, 3).map(t => (
                          <Tag key={t.topic_id} size="sm" colorScheme="purple" variant="subtle">
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

                    <Divider borderColor="slate.700" />

                    <VStack align="start" spacing={1} w="full">
                      <Text color="gray.500" fontSize="xs">
                        📅 Start: {formatDateTime(lab.start_time)}
                      </Text>
                      <Text color="gray.500" fontSize="xs">
                        🏁 End: {formatDateTime(lab.end_time)}
                      </Text>
                      <Text color="gray.500" fontSize="xs">
                        ⏱ Duration: {lab.duration} min
                      </Text>
                    </VStack>

                    <HStack w="full" spacing={2}>
                      <Button
                        as={RouterLink}
                        to={`/faculty/lab-assessments/${lab.lab_id}`}
                        size="sm"
                        colorScheme="purple"
                        variant="solid"
                        flex={1}
                        rightIcon={<ArrowForwardIcon />}
                      >
                        Manage
                      </Button>
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
        <ModalContent bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <ModalHeader color="white">Create New Lab Assessment</ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="gray.300" fontSize="sm">Assessment Title</FormLabel>
                <Input
                  placeholder="e.g., DSA Lab Assessment — Unit 3"
                  bg="dark.bg"
                  borderColor="slate.600"
                  color="white"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  _placeholder={{ color: 'gray.500' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300" fontSize="sm">Description</FormLabel>
                <Textarea
                  placeholder="Brief description of the assessment..."
                  bg="dark.bg"
                  borderColor="slate.600"
                  color="white"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  _placeholder={{ color: 'gray.500' }}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel color="gray.300" fontSize="sm">Start Date & Time</FormLabel>
                  <Input
                    type="datetime-local"
                    bg="dark.bg"
                    borderColor="slate.600"
                    color="white"
                    value={form.start_time}
                    onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                    sx={{ colorScheme: 'dark' }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="gray.300" fontSize="sm">End Date & Time</FormLabel>
                  <Input
                    type="datetime-local"
                    bg="dark.bg"
                    borderColor="slate.600"
                    color="white"
                    value={form.end_time}
                    onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                    sx={{ colorScheme: 'dark' }}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={3} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel color="gray.300" fontSize="sm">Duration (min)</FormLabel>
                  <NumberInput
                    min={5}
                    max={480}
                    value={form.duration}
                    onChange={(_, v) => setForm(f => ({ ...f, duration: v || 120 }))}
                  >
                    <NumberInputField bg="dark.bg" borderColor="slate.600" color="white" />
                    <NumberInputStepper>
                      <NumberIncrementStepper borderColor="slate.600" color="gray.400" />
                      <NumberDecrementStepper borderColor="slate.600" color="gray.400" />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.300" fontSize="sm">Questions / Student</FormLabel>
                  <NumberInput
                    min={1}
                    max={50}
                    value={form.num_questions}
                    onChange={(_, v) => setForm(f => ({ ...f, num_questions: v || 5 }))}
                  >
                    <NumberInputField bg="dark.bg" borderColor="slate.600" color="white" />
                    <NumberInputStepper>
                      <NumberIncrementStepper borderColor="slate.600" color="gray.400" />
                      <NumberDecrementStepper borderColor="slate.600" color="gray.400" />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.300" fontSize="sm">Marks / Question</FormLabel>
                  <NumberInput
                    min={1}
                    max={100}
                    value={form.marks_per_question}
                    onChange={(_, v) => setForm(f => ({ ...f, marks_per_question: v || 10 }))}
                  >
                    <NumberInputField bg="dark.bg" borderColor="slate.600" color="white" />
                    <NumberInputStepper>
                      <NumberIncrementStepper borderColor="slate.600" color="gray.400" />
                      <NumberDecrementStepper borderColor="slate.600" color="gray.400" />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              {/* Topic Selection Section */}
              <Box w="full" pt={1}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text color="gray.300" fontSize="sm" fontWeight="semibold">
                    Select Curriculum Topics for Assessment <Text as="span" color="red.400">*</Text>
                  </Text>
                  <Badge colorScheme={selectedTopicIds.length > 0 ? 'purple' : 'gray'} fontSize="xs">
                    {selectedTopicIds.length} Selected
                  </Badge>
                </Flex>

                {availableTopics.length === 0 ? (
                  <Alert status="warning" borderRadius="md" bg="orange.950" borderColor="orange.800" borderWidth="1px" fontSize="xs">
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
                          bg={isChecked ? 'purple.950' : 'dark.bg'}
                          border="1px solid"
                          borderColor={isChecked ? 'purple.500' : 'slate.700'}
                          cursor="pointer"
                          onClick={() => toggleTopicSelection(topic.topic_id)}
                          transition="all 0.15s"
                          _hover={{ borderColor: 'purple.400' }}
                        >
                          <Flex justify="space-between" align="center">
                            <HStack spacing={3}>
                              <Checkbox
                                colorScheme="purple"
                                isChecked={isChecked}
                                onChange={() => toggleTopicSelection(topic.topic_id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="xs" fontWeight="bold" color="white">
                                  {topic.title}
                                </Text>
                                {topic.description && (
                                  <Text fontSize="2xs" color="gray.400" noOfLines={1}>
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
              <Box w="full" p={3} bg="slate.900" borderRadius="md" borderWidth="1px" borderColor="slate.700">
                <HStack justify="space-between" mb={1}>
                  <Text color="gray.300" fontSize="xs">
                    Available Question Pool:
                  </Text>
                  <Badge
                    colorScheme={totalPoolFromSelected >= form.num_questions ? 'green' : 'orange'}
                    fontSize="xs"
                  >
                    {totalPoolFromSelected} of {form.num_questions} Required
                  </Badge>
                </HStack>
                <Progress
                  value={Math.min(100, form.num_questions > 0 ? (totalPoolFromSelected / form.num_questions) * 100 : 0)}
                  size="xs"
                  colorScheme={totalPoolFromSelected >= form.num_questions ? 'green' : 'orange'}
                  borderRadius="full"
                  mb={2}
                />
                <Text color="gray.400" fontSize="2xs">
                  {totalPoolFromSelected >= form.num_questions
                    ? '✅ Sufficient question pool. Each student will receive randomized questions from these selected topics.'
                    : '⚠️ Pool has fewer questions than required. Please select topics with sufficient questions or add questions to the Question Bank.'}
                </Text>
              </Box>

              <Box w="full" p={2.5} bg="purple.950" borderRadius="md" borderWidth="1px" borderColor="purple.800">
                <Text color="purple.300" fontSize="xs">
                  💡 Total marks = {form.num_questions} questions × {form.marks_per_question} pts = <strong>{form.num_questions * form.marks_per_question} marks</strong>
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" colorScheme="gray" onClick={onClose}>Cancel</Button>
            <Button
              colorScheme="purple"
              onClick={handleCreate}
              isLoading={isCreating}
              loadingText="Creating..."
            >
              Create Assessment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel Confirmation */}
      <AlertDialog isOpen={isCancelOpen} leastDestructiveRef={cancelRef} onClose={onCancelClose}>
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent bg="slate.800" borderColor="slate.700" borderWidth="1px">
            <AlertDialogHeader color="white">Cancel Assessment</AlertDialogHeader>
            <AlertDialogBody color="gray.300">
              Are you sure you want to cancel <strong>{selectedLab?.title}</strong>? This cannot be undone and students will no longer be able to access this assessment.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} variant="ghost" colorScheme="gray" onClick={onCancelClose}>Keep</Button>
              <Button colorScheme="red" onClick={handleCancel}>Cancel Assessment</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default LabAssessmentManagement;
