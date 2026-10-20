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
  useColorModeValue,
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

  // Color tokens aligned with normal light green theme
  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#292D2A');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#B8C0B9');
  const accentColor = useColorModeValue('#2F8D46', '#A3E635');

  const [labs, setLabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLabForStart, setSelectedLabForStart] = useState(null);
  const { isOpen: isStartOpen, onOpen: onStartOpen, onClose: onStartClose } = useDisclosure();

  const fetchLabs = useCallback(async () => {
    try {
      setIsLoading(true);
      const rawLabs =
        res.data?.data?.labs ||
        res.data?.data?.assessments ||
        res.data?.labs ||
        res.data?.assessments ||
        [];
      setLabs(Array.isArray(rawLabs) ? rawLabs : []);
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
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        boxShadow="sm"
      >
        <VStack align="start" spacing={2}>
          <Heading size="lg" color={textColor} fontWeight="800">
            Practical Lab Assessments (LA) 💻
          </Heading>
          <Text color={mutedText} fontSize="sm" maxW="3xl">
            Timed practical coding assessments allocated directly from curriculum topics. Write, test, and submit your code in sandboxed language environments.
          </Text>
        </VStack>
      </Box>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={6}>
        <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color={mutedText}>Available / In-Progress</StatLabel>
              <StatNumber color="green.600" fontSize="3xl" fontWeight="bold">
                {activeAndInProgress.length}
              </StatNumber>
              <StatHelpText color={mutedText}>Ready to attempt</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color={mutedText}>Upcoming Assessments</StatLabel>
              <StatNumber color="blue.600" fontSize="3xl" fontWeight="bold">
                {upcomingLabs.length}
              </StatNumber>
              <StatHelpText color={mutedText}>Scheduled soon</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color={mutedText}>Completed Assessments</StatLabel>
              <StatNumber color="purple.600" fontSize="3xl" fontWeight="bold">
                {completedOrSubmitted.length}
              </StatNumber>
              <StatHelpText color={mutedText}>Submitted attempts</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Assessment Tabs */}
      <Tabs variant="soft-rounded" colorScheme="green">
        <TabList bg={cardBg} p={2} borderRadius="xl" border="1px solid" borderColor={cardBorder} overflowX="auto" boxShadow="sm">
          <Tab color={mutedText} _selected={{ color: 'pureWhite', bg: 'green.600', fontWeight: 'bold' }}>
            All Assessments ({labs.length})
          </Tab>
          <Tab color={mutedText} _selected={{ color: 'pureWhite', bg: 'green.600', fontWeight: 'bold' }}>
            Active ({activeAndInProgress.length})
          </Tab>
          <Tab color={mutedText} _selected={{ color: 'pureWhite', bg: 'blue.600', fontWeight: 'bold' }}>
            Upcoming ({upcomingLabs.length})
          </Tab>
          <Tab color={mutedText} _selected={{ color: 'pureWhite', bg: 'purple.600', fontWeight: 'bold' }}>
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
        <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px" color={textColor} borderRadius="2xl">
          <ModalHeader color={textColor}>Start Assessment Confirmation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="md" color={textColor}>
                Are you ready to begin <Text as="span" fontWeight="bold" color="green.600">{selectedLabForStart?.title}</Text>?
              </Text>

              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Once started, your personalized assessment timer of <strong>{selectedLabForStart?.duration} minutes</strong> will begin counting down immediately. The timer cannot be paused or reset.
                </AlertDescription>
              </Alert>

              <Box bg={surfaceBg} p={4} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
                <VStack align="stretch" spacing={2} fontSize="sm" color={textColor}>
                  <HStack justify="space-between">
                    <Text color={mutedText}>Assigned Questions:</Text>
                    <Text fontWeight="bold">{selectedLabForStart?.num_questions || 5} questions</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color={mutedText}>Duration:</Text>
                    <Text fontWeight="bold">{selectedLabForStart?.duration} minutes</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color={mutedText}>Maximum Marks:</Text>
                    <Text fontWeight="bold">
                      {(selectedLabForStart?.num_questions || 5) * (selectedLabForStart?.marks_per_question || 10)} marks
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color={mutedText}>End Deadline:</Text>
                    <Text fontWeight="bold">{formatDateTime(selectedLabForStart?.end_time)}</Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onStartClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
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
  const totalMarks = lab.total_marks || (lab.num_questions * (lab.marks_per_question || 10)) || (lab.attempt?.total_marks) || 50;

  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#292D2A');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#B8C0B9');

  return (
    <Card
      bg={cardBg}
      borderColor={
        attemptStatus === 'in_progress'
          ? 'green.500'
          : attemptStatus === 'submitted'
          ? 'green.600'
          : cardBorder
      }
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
    >
      <CardBody p={6}>
        <VStack align="stretch" spacing={4}>
          {/* Card Header */}
          <Flex justify="space-between" align="start" gap={2}>
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="md" color={textColor} noOfLines={2} fontWeight="800">
                {lab.title}
              </Heading>
              {lab.description && (
                <Text color={mutedText} fontSize="sm" noOfLines={2}>
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
              <Badge colorScheme="blue" px={2.5} py={1} borderRadius="md" fontSize="xs">
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
                <Tag key={t.topic_id} size="sm" colorScheme="green" variant="subtle">
                  <TagLabel>{t.title}</TagLabel>
                </Tag>
              ))}
            </HStack>
          )}

          <Divider borderColor={cardBorder} />

          {/* Metadata Grid */}
          <SimpleGrid columns={2} spacing={3} fontSize="xs" color={textColor}>
            <HStack>
              <Icon as={TimeIcon} color="green.600" />
              <Text>Duration: <strong>{lab.duration} mins</strong></Text>
            </HStack>
            <HStack>
              <Icon as={CheckCircleIcon} color="green.600" />
              <Text>Questions: <strong>{lab.num_questions || 5}</strong></Text>
            </HStack>
            <HStack>
              <Icon as={CalendarIcon} color="blue.500" />
              <Text>Start: <strong>{formatDateTime(lab.start_time)}</strong></Text>
            </HStack>
            <HStack>
              <Icon as={CalendarIcon} color="red.500" />
              <Text>End: <strong>{formatDateTime(lab.end_time)}</strong></Text>
            </HStack>
          </SimpleGrid>

          {/* Score display if submitted */}
          {attemptStatus === 'submitted' && (
            <Box bg={surfaceBg} p={3} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
              <HStack justify="space-between">
                <Text fontSize="xs" color={mutedText}>Your Final Score:</Text>
                <Text fontSize="md" fontWeight="bold" color="green.600">
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
                colorScheme="green"
                onClick={() => navigate(`/student/lab-assessments/${lab.lab_id}`)}
                rightIcon={<ArrowForwardIcon />}
              >
                Resume Assessment
              </Button>
            ) : attemptStatus === 'submitted' || attemptStatus === 'timed_out' || attemptStatus === 'expired' ? (
              <Button
                w="full"
                variant="outline"
                colorScheme="green"
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
                colorScheme="green"
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
