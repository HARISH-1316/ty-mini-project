// ──────────────────────────────────────────────
// Student Dashboard
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  VStack,
  HStack,
  Button,
  Badge,
  Progress,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { AddIcon, ArrowForwardIcon, CheckCircleIcon, TimeIcon } from '@chakra-ui/icons';
import useAuth from '../../hooks/useAuth';
import { getMyRoomsApi } from '../../api/roomApi';
import { getMyOverallProgressApi } from '../../api/progressApi';
import { getStudentAvailableLabsApi } from '../../api/labApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [rooms, setRooms] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [labAssessments, setLabAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, progressRes, labsRes] = await Promise.all([
          getMyRoomsApi(),
          getMyOverallProgressApi().catch(() => ({ data: null })),
          getStudentAvailableLabsApi().catch(() => ({ data: { data: { labs: [] } } })),
        ]);
        setRooms(roomsRes.data?.rooms || []);
        setProgressData(progressRes.data || null);
        setLabAssessments(labsRes.data?.data?.labs || []);
      } catch {
        toast({
          title: 'Error loading dashboard',
          description: 'Failed to fetch your rooms or progress.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return <LoadingSpinner label="Loading student dashboard..." />;
  }

  const completedCount = progressData?.completedTopicsCount || 0;
  const totalTopics = progressData?.totalTopicsCount || 0;
  const overallPercentage = progressData?.overallProgress || 0;
  const topicsProgress = progressData?.topicsProgress || [];

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Welcome Banner */}
      <Box
        p={8}
        borderRadius="2xl"
        bg="bg.card"
        border="1px solid"
        borderColor="border.primary"
        boxShadow="sm"
      >
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
          <VStack align="start" spacing={2}>
            <Heading size="lg" color="text.primary">
              Welcome back, {user?.name}! 👋
            </Heading>
            <Text color="text.secondary" fontSize="sm">
              Roll No: {user?.profile?.roll_number || 'N/A'} • Course: {user?.profile?.course || 'Engineering'}
            </Text>
          </VStack>
          <HStack spacing={3} wrap="wrap">
            <Button
              as={RouterLink}
              to="/student/lab-assessments"
              variant="outline"
            >
              Practical Assessments
            </Button>
            <Button
              as={RouterLink}
              to="/student/join-room"
              leftIcon={<AddIcon />}
              colorScheme="brand"
            >
              Join New Lab Room
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Quick Stats Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Joined Lab Rooms</StatLabel>
              <StatNumber color="purple.300" fontSize="3xl">{rooms.length}</StatNumber>
              <StatHelpText color="gray.500">Enrolled lab courses</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Lab Assessments</StatLabel>
              <StatNumber color="teal.300" fontSize="3xl">{labAssessments.length}</StatNumber>
              <StatHelpText color="gray.500">Available / Attempted</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Completed Topics</StatLabel>
              <StatNumber color="emerald.400" fontSize="3xl">
                {completedCount} <Text as="span" fontSize="lg" color="gray.500">/ {totalTopics}</Text>
              </StatNumber>
              <StatHelpText color="gray.500">Fully completed modules</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Overall Progress</StatLabel>
              <StatNumber color="cyan.400" fontSize="3xl">{overallPercentage}%</StatNumber>
              <StatHelpText color="gray.500">Syllabus completed</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Practical Lab Assessments Section */}
      <VStack align="stretch" spacing={4}>
        <Flex justify="space-between" align="center">
          <HStack>
            <Heading size="md" color="white">
              Practical Lab Assessments ({labAssessments.length})
            </Heading>
            <Badge colorScheme="teal" px={2} py={0.5} borderRadius="md">
              Timed Coding
            </Badge>
          </HStack>
          <Button
            as={RouterLink}
            to="/student/lab-assessments"
            size="sm"
            variant="ghost"
            colorScheme="teal"
            rightIcon={<ArrowForwardIcon />}
          >
            Go to Assessments
          </Button>
        </Flex>

        {labAssessments.length === 0 ? (
          <Box p={6} bg="slate.800" borderRadius="xl" border="1px dashed" borderColor="slate.700">
            <Text color="gray.400" fontSize="sm">
              No practical assessments currently scheduled for your enrolled rooms. Check back later!
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {labAssessments.slice(0, 3).map((lab) => {
              const hasAttempt = Boolean(lab.attempt);
              const isSubmitted = lab.attempt?.status === 'submitted';
              const isInProgress = lab.attempt?.status === 'in_progress';

              return (
                <Card
                  key={lab.lab_id}
                  bg="slate.800"
                  borderColor={isInProgress ? 'teal.500' : isSubmitted ? 'purple.600' : 'slate.700'}
                  borderWidth="1px"
                  borderRadius="xl"
                  p={4}
                  transition="all 0.2s"
                  _hover={{ transform: 'translateY(-2px)' }}
                >
                  <VStack align="stretch" spacing={3}>
                    <Flex justify="space-between" align="start">
                      <Heading size="sm" color="white" noOfLines={1}>
                        {lab.title}
                      </Heading>
                      <Badge
                        colorScheme={
                          isInProgress
                            ? 'teal'
                            : isSubmitted
                            ? 'purple'
                            : 'green'
                        }
                        fontSize="2xs"
                      >
                        {isInProgress ? 'In Progress' : isSubmitted ? 'Submitted' : 'Available'}
                      </Badge>
                    </Flex>
                    <Text fontSize="xs" color="gray.400">
                      Duration: {lab.duration} mins • {lab.num_questions || 5} Questions
                    </Text>
                    <Button
                      as={RouterLink}
                      to={
                        isSubmitted
                          ? `/student/lab-assessments/${lab.lab_id}/result`
                          : `/student/lab-assessments/${lab.lab_id}`
                      }
                      size="xs"
                      colorScheme={isInProgress ? 'teal' : isSubmitted ? 'purple' : 'green'}
                      variant={isSubmitted ? 'outline' : 'solid'}
                      rightIcon={<ArrowForwardIcon />}
                    >
                      {isInProgress ? 'Resume' : isSubmitted ? 'View Result' : 'Start'}
                    </Button>
                  </VStack>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </VStack>

      {/* Enrolled Lab Rooms Section */}
      <VStack align="stretch" spacing={4}>
        <Flex justify="space-between" align="center">
          <Heading size="md" color="white">
            My Virtual Lab Rooms ({rooms.length})
          </Heading>
          <Button as={RouterLink} to="/student/rooms" size="sm" variant="ghost" colorScheme="purple" rightIcon={<ArrowForwardIcon />}>
            View All Rooms
          </Button>
        </Flex>

        {rooms.length === 0 ? (
          <Box p={8} bg="slate.800" borderRadius="xl" textAlign="center" border="1px dashed" borderColor="slate.700">
            <Text color="gray.400" mb={4}>You have not joined any virtual lab rooms yet.</Text>
            <Button as={RouterLink} to="/student/join-room" size="sm" colorScheme="purple" leftIcon={<AddIcon />}>
              Enter Room Code to Join
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {rooms.slice(0, 3).map((room) => (
              <Card
                key={room.room_id}
                as={RouterLink}
                to={`/student/rooms/${room.room_id}`}
                bg="slate.800"
                borderColor="slate.700"
                borderWidth="1px"
                borderRadius="xl"
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-4px)', borderColor: 'purple.400', boxShadow: 'xl' }}
              >
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <Badge colorScheme="purple" px={2} py={0.5} borderRadius="md">
                      CODE: {room.room_code}
                    </Badge>
                    <Heading size="sm" color="white">
                      {room.room_name}
                    </Heading>
                    <Text color="gray.400" fontSize="xs" noOfLines={2}>
                      {room.description || 'No description provided.'}
                    </Text>
                    <HStack justify="space-between" w="full" pt={2} borderTop="1px solid" borderColor="slate.700">
                      <Text color="gray.400" fontSize="xs">
                        Faculty: {room.faculty_name || 'Faculty'}
                      </Text>
                      <ArrowForwardIcon color="purple.300" />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Progress Summary Section */}
      {topicsProgress.length > 0 && (
        <VStack align="stretch" spacing={4} pt={4}>
          <Flex justify="space-between" align="center">
            <Heading size="md" color="white">Topic Progress</Heading>
            <Button as={RouterLink} to="/student/progress" size="sm" variant="ghost" colorScheme="purple" rightIcon={<ArrowForwardIcon />}>
              View Full Progress
            </Button>
          </Flex>
          <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
            <CardBody>
              <VStack spacing={4} align="stretch">
                {topicsProgress.slice(0, 4).map((p) => (
                  <Box key={p.topic_id} p={3} bg="slate.900" borderRadius="lg">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text color="white" fontWeight="medium" fontSize="sm">
                        {p.title}
                      </Text>
                      <Badge colorScheme={p.status === 'Completed' ? 'green' : p.status === 'In Progress' ? 'purple' : 'gray'}>
                        {p.status} ({p.progressPercentage}%)
                      </Badge>
                    </Flex>
                    <Progress
                      value={p.progressPercentage}
                      colorScheme={p.progressPercentage === 100 ? 'green' : 'purple'}
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      )}
    </VStack>
  );
};

export default StudentDashboard;
