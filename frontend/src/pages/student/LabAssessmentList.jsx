// ──────────────────────────────────────────────
// Student: Lab Assessment Dashboard & List
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Button,
  Flex,
  Icon,
  Tag,
  TagLabel,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import {
  TimeIcon,
  CheckCircleIcon,
  ArrowForwardIcon,
  WarningTwoIcon,
  CalendarIcon,
  LockIcon,
} from '@chakra-ui/icons';
import { getStudentAvailableLabsApi } from '../../api/labApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const STATUS_CONFIG = {
  active: { color: 'green', label: 'Active Now' },
  published: { color: 'blue', label: 'Published' },
  completed: { color: 'purple', label: 'Completed' },
  in_progress: { color: 'teal', label: 'In Progress' },
  submitted: { color: 'emerald', label: 'Submitted' },
  timed_out: { color: 'orange', label: 'Timed Out' },
  expired: { color: 'red', label: 'Expired' },
};

const formatDateTime = (dt) => {
  if (!dt) return 'N/A';
  return new Date(dt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const LabAssessmentList = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [labs, setLabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLabForStart, setSelectedLabForStart] = useState(null);
  const { isOpen: isStartOpen, onOpen: onStartOpen, onClose: onStartClose } = useDisclosure();

  const fetchLabs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getStudentAvailableLabsApi();
      setLabs(res.data?.data?.labs || []);
    } catch (err) {
      toast({
        title: 'Failed to load assessments',
        description: err.response?.data?.message || 'Could not fetch available lab assessments.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  const now = new Date();

  // Categorize assessments
  const activeAndInProgress = labs.filter((lab) => {
    const hasActiveAttempt = lab.attempt && lab.attempt.status === 'in_progress';
    const isAvailableTime = new Date(lab.start_time) <= now && now < new Date(lab.end_time);
    return hasActiveAttempt || (isAvailableTime && !lab.attempt);
  });

  const upcomingLabs = labs.filter((lab) => {
    return new Date(lab.start_time) > now;
  });

  const completedOrSubmitted = labs.filter((lab) => {
    return (
      lab.attempt?.status === 'submitted' ||
      lab.attempt?.status === 'timed_out' ||
      lab.attempt?.status === 'expired' ||
      now >= new Date(lab.end_time)
    );
  });

  const handleStartPrompt = (lab) => {
    if (lab.attempt?.status === 'submitted' || lab.attempt?.status === 'timed_out' || lab.attempt?.status === 'expired') {
      navigate(`/student/lab-assessments/${lab.lab_id}/result`);
      return;
    }
    if (lab.attempt?.status === 'in_progress') {
      navigate(`/student/lab-assessments/${lab.lab_id}`);
      return;
    }
    setSelectedLabForStart(lab);
    onStartOpen();
  };

  const handleConfirmStart = () => {
    if (!selectedLabForStart) return;
    onStartClose();
    navigate(`/student/lab-assessments/${selectedLabForStart.lab_id}`);
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading practical lab assessments..." />;
  }

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Header Banner */}
      <Box
        p={{ base: 6, md: 8 }}
        borderRadius="2xl"
        bgGradient="linear(to-r, blue.900, purple.900, dark.card)"
        border="1px solid"
        borderColor="purple.800"
        boxShadow="xl"
      >
        <VStack align="start" spacing={2}>
          <Heading size="lg" color="white">
            Practical Lab Assessments (LA) 💻
          </Heading>
          <Text color="gray.300" fontSize="sm" maxW="3xl">
            Timed practical coding assessments allocated directly from curriculum topics. Write, test, and submit your code in sandboxed language environments.
          </Text>
        </VStack>
      </Box>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={6}>
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Available / In-Progress</StatLabel>
              <StatNumber color="green.400" fontSize="3xl">
                {activeAndInProgress.length}
              </StatNumber>
              <StatHelpText color="gray.500">Ready to attempt</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Upcoming Assessments</StatLabel>
              <StatNumber color="cyan.400" fontSize="3xl">
                {upcomingLabs.length}
              </StatNumber>
              <StatHelpText color="gray.500">Scheduled soon</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Completed Assessments</StatLabel>
              <StatNumber color="purple.400" fontSize="3xl">
                {completedOrSubmitted.length}
              </StatNumber>
              <StatHelpText color="gray.500">Submitted attempts</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Assessment Tabs */}
      <Tabs variant="soft-rounded" colorScheme="purple">
        <TabList bg="slate.900" p={2} borderRadius="xl" border="1px solid" borderColor="slate.800" overflowX="auto">
          <Tab color="gray.400" _selected={{ color: 'white', bg: 'purple.600' }}>
            All Assessments ({labs.length})
          </Tab>
          <Tab color="gray.400" _selected={{ color: 'white', bg: 'green.600' }}>
            Active ({activeAndInProgress.length})
          </Tab>
          <Tab color="gray.400" _selected={{ color: 'white', bg: 'cyan.600' }}>
            Upcoming ({upcomingLabs.length})
          </Tab>
          <Tab color="gray.400" _selected={{ color: 'white', bg: 'purple.700' }}>
            Past / Completed ({completedOrSubmitted.length})
          </Tab>
        </TabList>

        <TabPanels mt={6}>
          {/* Tab 1: All */}
          <TabPanel p={0}>
            {labs.length === 0 ? (
              <EmptyState
                title="No Lab Assessments Available"
                description="Your instructors have not scheduled any lab assessments for your enrolled rooms yet."
              />
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {labs.map((lab) => (
                  <AssessmentCard key={lab.lab_id} lab={lab} onStart={handleStartPrompt} />
                ))}
              </SimpleGrid>
            )}
          </TabPanel>

          {/* Tab 2: Active */}
          <TabPanel p={0}>
            {activeAndInProgress.length === 0 ? (
              <EmptyState
                title="No Active Assessments"
                description="There are no lab assessments currently open for you right now."
              />
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {activeAndInProgress.map((lab) => (
                  <AssessmentCard key={lab.lab_id} lab={lab} onStart={handleStartPrompt} />
                ))}
              </SimpleGrid>
            )}
          </TabPanel>

          {/* Tab 3: Upcoming */}
          <TabPanel p={0}>
            {upcomingLabs.length === 0 ? (
              <EmptyState
                title="No Upcoming Assessments"
                description="No upcoming assessments scheduled in the future."
              />
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {upcomingLabs.map((lab) => (
                  <AssessmentCard key={lab.lab_id} lab={lab} onStart={handleStartPrompt} />
                ))}
              </SimpleGrid>
            )}
          </TabPanel>

          {/* Tab 4: Past / Completed */}
          <TabPanel p={0}>
            {completedOrSubmitted.length === 0 ? (
              <EmptyState
                title="No Completed Assessments"
                description="You haven't completed or submitted any lab assessments yet."
              />
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {completedOrSubmitted.map((lab) => (
                  <AssessmentCard key={lab.lab_id} lab={lab} onStart={handleStartPrompt} />
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Confirmation Modal to Start Assessment */}
      <Modal isOpen={isStartOpen} onClose={onStartClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg="slate.900" borderColor="slate.700" borderWidth="1px" color="white">
          <ModalHeader>Start Assessment Confirmation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="md">
                Are you ready to begin <Text as="span" fontWeight="bold" color="purple.300">{selectedLabForStart?.title}</Text>?
              </Text>

              <Alert status="warning" borderRadius="md" bg="orange.900" borderColor="orange.700" borderWidth="1px">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Once started, your personalized assessment timer of <strong>{selectedLabForStart?.duration} minutes</strong> will begin counting down immediately. The timer cannot be paused or reset.
                </AlertDescription>
              </Alert>

              <Box bg="slate.800" p={4} borderRadius="lg" border="1px solid" borderColor="slate.700">
                <VStack align="stretch" spacing={2} fontSize="sm" color="gray.300">
                  <HStack justify="space-between">
                    <Text>Assigned Questions:</Text>
                    <Text fontWeight="bold" color="white">{selectedLabForStart?.num_questions || 5} questions</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Duration:</Text>
                    <Text fontWeight="bold" color="white">{selectedLabForStart?.duration} minutes</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Maximum Marks:</Text>
                    <Text fontWeight="bold" color="white">
                      {(selectedLabForStart?.num_questions || 5) * (selectedLabForStart?.marks_per_question || 10)} marks
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>End Deadline:</Text>
                    <Text fontWeight="bold" color="white">{formatDateTime(selectedLabForStart?.end_time)}</Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onStartClose} color="gray.400">
              Cancel
            </Button>
            <Button
              bgGradient="linear(to-r, green.500, teal.500)"
              color="white"
              _hover={{ bgGradient: 'linear(to-r, green.600, teal.600)' }}
              onClick={handleConfirmStart}
              leftIcon={<ArrowForwardIcon />}
            >
              Start Assessment Now
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

// ── Assessment Card Component ───────────────────
const AssessmentCard = ({ lab, onStart }) => {
  const navigate = useNavigate();
  const now = new Date();
  const startTime = new Date(lab.start_time);
  const endTime = new Date(lab.end_time);

  const isUpcoming = now < startTime;
  const isExpired = now >= endTime;
  const hasAttempt = Boolean(lab.attempt);
  const attemptStatus = lab.attempt?.status;

  const totalMarks = (lab.num_questions || 5) * (lab.marks_per_question || 10);

  return (
    <Card
      bg="slate.800"
      borderColor={
        attemptStatus === 'in_progress'
          ? 'teal.500'
          : attemptStatus === 'submitted'
          ? 'purple.600'
          : 'slate.700'
      }
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="md"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
    >
      <CardBody p={6}>
        <VStack align="stretch" spacing={4}>
          {/* Card Header */}
          <Flex justify="space-between" align="start" gap={2}>
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="md" color="white" noOfLines={2}>
                {lab.title}
              </Heading>
              {lab.description && (
                <Text color="gray.400" fontSize="sm" noOfLines={2}>
                  {lab.description}
                </Text>
              )}
            </VStack>

            {/* Status Badge */}
            {attemptStatus ? (
              <Badge
                colorScheme={STATUS_CONFIG[attemptStatus]?.color || 'gray'}
                px={2.5}
                py={1}
                borderRadius="md"
                fontSize="xs"
                textTransform="uppercase"
              >
                {STATUS_CONFIG[attemptStatus]?.label || attemptStatus}
              </Badge>
            ) : isUpcoming ? (
              <Badge colorScheme="cyan" px={2.5} py={1} borderRadius="md" fontSize="xs">
                Upcoming
              </Badge>
            ) : isExpired ? (
              <Badge colorScheme="red" px={2.5} py={1} borderRadius="md" fontSize="xs">
                Closed
              </Badge>
            ) : (
              <Badge colorScheme="green" px={2.5} py={1} borderRadius="md" fontSize="xs">
                Available
              </Badge>
            )}
          </Flex>

          {/* Topics Covered */}
          {lab.topics && lab.topics.length > 0 && (
            <HStack spacing={2} wrap="wrap">
              {lab.topics.map((t) => (
                <Tag key={t.topic_id} size="sm" colorScheme="purple" variant="subtle">
                  <TagLabel>{t.title}</TagLabel>
                </Tag>
              ))}
            </HStack>
          )}

          <Divider borderColor="slate.700" />

          {/* Metadata Grid */}
          <SimpleGrid columns={2} spacing={3} fontSize="xs" color="gray.300">
            <HStack>
              <Icon as={TimeIcon} color="purple.400" />
              <Text>Duration: <strong>{lab.duration} mins</strong></Text>
            </HStack>
            <HStack>
              <Icon as={CheckCircleIcon} color="teal.400" />
              <Text>Questions: <strong>{lab.num_questions || 5}</strong></Text>
            </HStack>
            <HStack>
              <Icon as={CalendarIcon} color="cyan.400" />
              <Text>Start: <strong>{formatDateTime(lab.start_time)}</strong></Text>
            </HStack>
            <HStack>
              <Icon as={CalendarIcon} color="red.400" />
              <Text>End: <strong>{formatDateTime(lab.end_time)}</strong></Text>
            </HStack>
          </SimpleGrid>

          {/* Score display if submitted */}
          {attemptStatus === 'submitted' && (
            <Box bg="purple.950" p={3} borderRadius="lg" border="1px solid" borderColor="purple.800">
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.300">Your Final Score:</Text>
                <Text fontSize="md" fontWeight="bold" color="purple.200">
                  {lab.attempt?.obtained_marks ?? 0} / {totalMarks} Marks
                </Text>
              </HStack>
            </Box>
          )}

          {/* Action Buttons */}
          <Box pt={2}>
            {attemptStatus === 'in_progress' ? (
              <Button
                w="full"
                colorScheme="teal"
                onClick={() => navigate(`/student/lab-assessments/${lab.lab_id}`)}
                rightIcon={<ArrowForwardIcon />}
              >
                Resume Assessment
              </Button>
            ) : attemptStatus === 'submitted' || attemptStatus === 'timed_out' || attemptStatus === 'expired' ? (
              <Button
                w="full"
                variant="outline"
                colorScheme="purple"
                onClick={() => navigate(`/student/lab-assessments/${lab.lab_id}/result`)}
                rightIcon={<ArrowForwardIcon />}
              >
                View Assessment Result
              </Button>
            ) : isUpcoming ? (
              <Button w="full" isDisabled leftIcon={<LockIcon />} colorScheme="gray" variant="solid">
                Starts at {formatDateTime(lab.start_time)}
              </Button>
            ) : isExpired ? (
              <Button w="full" isDisabled colorScheme="red" variant="outline">
                Assessment Ended
              </Button>
            ) : (
              <Button
                w="full"
                bgGradient="linear(to-r, green.500, teal.500)"
                color="white"
                _hover={{ bgGradient: 'linear(to-r, green.600, teal.600)' }}
                onClick={() => onStart(lab)}
                rightIcon={<ArrowForwardIcon />}
              >
                Start Assessment
              </Button>
            )}
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default LabAssessmentList;
