// ──────────────────────────────────────────────
// Faculty: Lab Assessment Detail / Edit / Publish Page
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, VStack, HStack, Heading, Text, Button, Badge, Card, CardBody,
  SimpleGrid, Flex, Spinner, useToast, FormControl, FormLabel, Input,
  Textarea, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper, Divider,
  Table, Thead, Tbody, Tr, Th, Td, Select, Tag, TagLabel, TagCloseButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, useDisclosure, Progress, Alert, AlertIcon,
  AlertDescription, Icon, Code,
} from '@chakra-ui/react';
import {
  ArrowBackIcon, CheckCircleIcon, WarningIcon, AddIcon, DeleteIcon, ArrowForwardIcon,
} from '@chakra-ui/icons';
import {
  getLabAssessmentDetailApi,
  updateLabAssessmentApi,
  publishLabAssessmentApi,
  addTopicToAssessmentApi,
  removeTopicFromAssessmentApi,
  getQuestionPoolApi,
  getTopicsSummaryApi,
} from '../../api/labApi';
import {
  toLocalDatetimeInputString,
  toUtcIsoString,
  formatDisplayDateTime,
} from '../../utils/dateUtils';

const STATUS_COLORS = { draft: 'gray', published: 'blue', active: 'green', completed: 'purple', cancelled: 'red' };
const formatDT = (dt) => formatDisplayDateTime(dt);

const CreateLabAssessment = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isPublishOpen, onOpen: onPublishOpen, onClose: onPublishClose } = useDisclosure();
  const { isOpen: isAddTopicOpen, onOpen: onAddTopicOpen, onClose: onAddTopicClose } = useDisclosure();

  const [lab, setLab] = useState(null);
  const [allTopics, setAllTopics] = useState([]);
  const [poolStats, setPoolStats] = useState([]);
  const [totalEligible, setTotalEligible] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [editForm, setEditForm] = useState({});

  const loadData = useCallback(async () => {
    try {
      const [labRes, topicsRes] = await Promise.all([
        getLabAssessmentDetailApi(labId),
        getTopicsSummaryApi().catch(() => ({ data: { data: { topics: [] } } })),
      ]);
      const labData = labRes.data?.data?.lab;
      setLab(labData);
      setEditForm({
        title: labData?.title || '',
        description: labData?.description || '',
        start_time: toLocalDatetimeInputString(labData?.start_time),
        end_time: toLocalDatetimeInputString(labData?.end_time),
        duration: labData?.duration || 120,
        num_questions: labData?.num_questions || 5,
        marks_per_question: labData?.marks_per_question || 10,
      });
      setAllTopics(topicsRes.data?.data?.topics || []);
      setPoolStats(labData?.questionPoolStats || []);
      setTotalEligible(labData?.totalEligibleQuestions || 0);
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Failed to load assessment', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  }, [labId, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateLabAssessmentApi(labId, {
        ...editForm,
        start_time: toUtcIsoString(editForm.start_time),
        end_time: toUtcIsoString(editForm.end_time),
      });
      toast({ title: 'Assessment saved', status: 'success', duration: 2000, isClosable: true });
      loadData();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Failed to save', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTopic = async () => {
    if (!selectedTopicId) return;
    try {
      await addTopicToAssessmentApi(labId, parseInt(selectedTopicId, 10));
      toast({ title: 'Topic added', status: 'success', duration: 2000, isClosable: true });
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

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await publishLabAssessmentApi(labId);
      toast({ title: 'Assessment published!', description: 'Students can now access it.', status: 'success', duration: 3000, isClosable: true });
      onPublishClose();
      loadData();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Failed to publish', status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsPublishing(false);
    }
  };

  const isDraft = lab?.status === 'draft';
  const addedTopicIds = new Set(lab?.topics?.map(t => t.topic_id) || []);
  const availableTopics = allTopics.filter(t => !addedTopicIds.has(t.topic_id));

  const questionSufficiency = lab ? (totalEligible >= lab.num_questions) : false;

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="300px">
        <VStack><Spinner size="xl" color="purple.400" thickness="4px" /><Text color="gray.400">Loading...</Text></VStack>
      </Flex>
    );
  }

  if (!lab) return null;

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Header */}
      <Box>
        <Button
          as={RouterLink}
          to="/faculty/lab-assessments"
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          colorScheme="gray"
          size="sm"
          mb={4}
        >
          Back to Assessments
        </Button>
        <Flex justify="space-between" align="start" gap={4} direction={{ base: 'column', md: 'row' }}>
          <VStack align="start" spacing={1}>
            <HStack>
              <Heading size="lg" color="white">{lab.title}</Heading>
              <Badge colorScheme={STATUS_COLORS[lab.status]} px={2} py={1} borderRadius="md" textTransform="capitalize">
                {lab.status}
              </Badge>
            </HStack>
            <Text color="gray.400" fontSize="sm">Created by {lab.faculty_name}</Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              as={RouterLink}
              to="/faculty/lab-questions"
              variant="outline"
              colorScheme="purple"
              size="sm"
            >
              Question Bank
            </Button>
            <Button
              as={RouterLink}
              to={`/faculty/lab-assessments/${labId}/results`}
              variant="outline"
              colorScheme="cyan"
              size="sm"
              rightIcon={<ArrowForwardIcon />}
            >
              View Results
            </Button>
            {isDraft && (
              <Button
                colorScheme="green"
                onClick={onPublishOpen}
                isDisabled={!questionSufficiency || !lab.start_time || !lab.end_time}
                leftIcon={<CheckCircleIcon />}
              >
                Publish
              </Button>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Publish readiness alert */}
      {isDraft && (
        <Alert
          status={questionSufficiency && lab.topics?.length > 0 ? 'success' : 'warning'}
          borderRadius="xl"
          bg={questionSufficiency && lab.topics?.length > 0 ? 'green.900' : 'orange.900'}
          borderWidth="1px"
          borderColor={questionSufficiency && lab.topics?.length > 0 ? 'green.700' : 'orange.700'}
        >
          <AlertIcon />
          <AlertDescription color="white" fontSize="sm">
            {lab.topics?.length === 0
              ? 'Add at least one topic to enable publishing.'
              : !questionSufficiency
                ? `Need ${lab.num_questions} questions, only ${totalEligible} available. Add more questions to the selected topics.`
                : `Ready to publish! ${totalEligible} questions available (need ${lab.num_questions}). Students will receive ${lab.num_questions} randomly selected questions.`
            }
          </AlertDescription>
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Left: Edit form */}
        {isDraft && (
          <VStack spacing={5} align="stretch">
            <Heading size="md" color="white">Assessment Settings</Heading>

            <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
              <CardBody>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.300" fontSize="sm">Title</FormLabel>
                    <Input
                      bg="dark.bg"
                      borderColor="slate.600"
                      color="white"
                      value={editForm.title}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      _placeholder={{ color: 'gray.500' }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.300" fontSize="sm">Description</FormLabel>
                    <Textarea
                      bg="dark.bg"
                      borderColor="slate.600"
                      color="white"
                      rows={3}
                      value={editForm.description}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      _placeholder={{ color: 'gray.500' }}
                    />
                  </FormControl>

                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel color="gray.300" fontSize="sm">Start Time</FormLabel>
                      <Input
                        type="datetime-local"
                        bg="dark.bg"
                        borderColor="slate.600"
                        color="white"
                        value={editForm.start_time}
                        onChange={e => setEditForm(f => ({ ...f, start_time: e.target.value }))}
                        sx={{ colorScheme: 'dark' }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="gray.300" fontSize="sm">End Time</FormLabel>
                      <Input
                        type="datetime-local"
                        bg="dark.bg"
                        borderColor="slate.600"
                        color="white"
                        value={editForm.end_time}
                        onChange={e => setEditForm(f => ({ ...f, end_time: e.target.value }))}
                        sx={{ colorScheme: 'dark' }}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={3} spacing={4} w="full">
                    <FormControl>
                      <FormLabel color="gray.300" fontSize="sm">Duration (min)</FormLabel>
                      <NumberInput min={5} max={480} value={editForm.duration} onChange={(_, v) => setEditForm(f => ({ ...f, duration: v || 120 }))}>
                        <NumberInputField bg="dark.bg" borderColor="slate.600" color="white" />
                        <NumberInputStepper>
                          <NumberIncrementStepper borderColor="slate.600" color="gray.400" />
                          <NumberDecrementStepper borderColor="slate.600" color="gray.400" />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel color="gray.300" fontSize="sm">Num Questions</FormLabel>
                      <NumberInput min={1} max={50} value={editForm.num_questions} onChange={(_, v) => setEditForm(f => ({ ...f, num_questions: v || 5 }))}>
                        <NumberInputField bg="dark.bg" borderColor="slate.600" color="white" />
                        <NumberInputStepper>
                          <NumberIncrementStepper borderColor="slate.600" color="gray.400" />
                          <NumberDecrementStepper borderColor="slate.600" color="gray.400" />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel color="gray.300" fontSize="sm">Marks / Q</FormLabel>
                      <NumberInput min={1} max={100} value={editForm.marks_per_question} onChange={(_, v) => setEditForm(f => ({ ...f, marks_per_question: v || 10 }))}>
                        <NumberInputField bg="dark.bg" borderColor="slate.600" color="white" />
                        <NumberInputStepper>
                          <NumberIncrementStepper borderColor="slate.600" color="gray.400" />
                          <NumberDecrementStepper borderColor="slate.600" color="gray.400" />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>

                  <Button
                    colorScheme="purple"
                    w="full"
                    onClick={handleSave}
                    isLoading={isSaving}
                    loadingText="Saving..."
                  >
                    Save Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        )}

        {/* Assessment Overview (non-draft) */}
        {!isDraft && (
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="white">Assessment Details</Heading>
            <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
              <CardBody>
                <VStack spacing={3} align="start">
                  <HStack justify="space-between" w="full">
                    <Text color="gray.400" fontSize="sm">Start</Text>
                    <Text color="white" fontSize="sm">{formatDT(lab.start_time)}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text color="gray.400" fontSize="sm">End</Text>
                    <Text color="white" fontSize="sm">{formatDT(lab.end_time)}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text color="gray.400" fontSize="sm">Duration</Text>
                    <Text color="white" fontSize="sm">{lab.duration} minutes</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text color="gray.400" fontSize="sm">Questions / Student</Text>
                    <Text color="white" fontSize="sm">{lab.num_questions}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text color="gray.400" fontSize="sm">Total Marks</Text>
                    <Text color="purple.300" fontSize="sm" fontWeight="bold">
                      {lab.num_questions * lab.marks_per_question}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        )}

        {/* Right: Topics & Question Pool */}
        <VStack spacing={5} align="stretch">
          <HStack justify="space-between">
            <Heading size="md" color="white">Selected Topics</Heading>
            {isDraft && (
              <Button size="sm" leftIcon={<AddIcon />} colorScheme="purple" variant="outline" onClick={onAddTopicOpen}>
                Add Topic
              </Button>
            )}
          </HStack>

          {lab.topics?.length === 0 ? (
            <Box p={6} bg="slate.800" borderRadius="xl" textAlign="center" border="1px dashed" borderColor="slate.600">
              <Text color="gray.400" fontSize="sm">No topics selected yet. Add topics to build the question pool.</Text>
            </Box>
          ) : (
            <VStack spacing={3} align="stretch">
              {poolStats.map((stat) => (
                <Card key={stat.topic_id} bg="slate.800" borderColor="slate.700" borderWidth="1px" borderRadius="xl">
                  <CardBody py={3}>
                    <Flex align="center" justify="space-between">
                      <VStack align="start" spacing={1} flex={1}>
                        <Text color="white" fontWeight="medium" fontSize="sm">{stat.topic_title}</Text>
                        <HStack spacing={2}>
                          <Badge colorScheme={stat.question_count >= (lab.num_questions || 5) ? 'green' : 'orange'} fontSize="xs">
                            {stat.question_count} question{stat.question_count !== 1 ? 's' : ''}
                          </Badge>
                          {stat.question_count === 0 && (
                            <Text color="orange.300" fontSize="xs">⚠ No questions</Text>
                          )}
                        </HStack>
                      </VStack>
                      {isDraft && (
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemoveTopic(stat.topic_id)}
                        >
                          <DeleteIcon />
                        </Button>
                      )}
                    </Flex>
                  </CardBody>
                </Card>
              ))}

              <Box p={3} bg="dark.bg" borderRadius="lg" borderWidth="1px" borderColor="slate.700">
                <Flex justify="space-between" mb={2}>
                  <Text color="gray.400" fontSize="sm">Total Pool</Text>
                  <Text color={questionSufficiency ? 'green.400' : 'orange.400'} fontSize="sm" fontWeight="bold">
                    {totalEligible} / {lab.num_questions} required
                  </Text>
                </Flex>
                <Progress
                  value={Math.min(100, (totalEligible / (lab.num_questions || 5)) * 100)}
                  colorScheme={questionSufficiency ? 'green' : 'orange'}
                  size="sm"
                  borderRadius="full"
                />
              </Box>

              <Button
                as={RouterLink}
                to="/faculty/lab-questions"
                variant="outline"
                colorScheme="cyan"
                size="sm"
                rightIcon={<ArrowForwardIcon />}
              >
                Manage Question Bank
              </Button>
            </VStack>
          )}
        </VStack>
      </SimpleGrid>

      {/* Add Topic Modal */}
      <Modal isOpen={isAddTopicOpen} onClose={onAddTopicClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <ModalHeader color="white">Add Topic to Assessment</ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">Select Topic</FormLabel>
              <Select
                bg="dark.bg"
                borderColor="slate.600"
                color="text.primary"
                value={selectedTopicId}
                onChange={e => setSelectedTopicId(e.target.value)}
                placeholder="Choose a topic..."
              >
                {availableTopics.map(t => (
                  <option key={t.topic_id} value={t.topic_id}>
                    {t.title} — ({t.question_count ?? 0} questions in pool)
                  </option>
                ))}
              </Select>
            </FormControl>
            {availableTopics.length === 0 && (
              <Text color="gray.400" fontSize="sm" mt={3}>All topics have been added.</Text>
            )}
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" colorScheme="gray" onClick={onAddTopicClose}>Cancel</Button>
            <Button colorScheme="purple" onClick={handleAddTopic} isDisabled={!selectedTopicId}>Add Topic</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Publish Confirmation Modal */}
      <Modal isOpen={isPublishOpen} onClose={onPublishClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <ModalHeader color="white">Publish Assessment</ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Text color="gray.300">
                Publishing will make <strong style={{ color: 'white' }}>{lab.title}</strong> available to eligible students at the configured start time.
              </Text>
              <Box p={4} bg="dark.bg" borderRadius="lg" w="full">
                <VStack align="start" spacing={2}>
                  <Text color="gray.400" fontSize="sm">📅 Start: {formatDT(lab.start_time)}</Text>
                  <Text color="gray.400" fontSize="sm">🏁 End: {formatDT(lab.end_time)}</Text>
                  <Text color="gray.400" fontSize="sm">⏱ Duration: {lab.duration} minutes</Text>
                  <Text color="gray.400" fontSize="sm">❓ Questions/student: {lab.num_questions}</Text>
                  <Text color="gray.400" fontSize="sm">📊 Pool: {totalEligible} eligible questions</Text>
                </VStack>
              </Box>
              <Text color="orange.300" fontSize="sm">
                ⚠ Once published, settings cannot be edited. Ensure everything is correct.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" colorScheme="gray" onClick={onPublishClose}>Go Back</Button>
            <Button colorScheme="green" onClick={handlePublish} isLoading={isPublishing} loadingText="Publishing...">
              Confirm & Publish
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default CreateLabAssessment;
