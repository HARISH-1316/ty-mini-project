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
        const rawLabs =
          labsRes.data?.data?.labs ||
          labsRes.data?.data?.assessments ||
          labsRes.data?.labs ||
          labsRes.data?.assessments ||
          [];
        setLabAssessments(Array.isArray(rawLabs) ? rawLabs : []);
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
              to="/student/rooms"
              variant="outline"
            >
              My Virtual Rooms
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
        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Joined Lab Rooms</StatLabel>
              <StatNumber color="accent.primary" fontSize="3xl">{rooms.length}</StatNumber>
              <StatHelpText color="text.secondary">Enrolled lab courses</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          as={RouterLink}
          to="/student/lab-assessments"
          bg="bg.card"
          borderColor="border.primary"
          borderWidth="1px"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ transform: 'translateY(-2px)', borderColor: 'teal.500', boxShadow: 'md' }}
        >
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Lab Assessments</StatLabel>
              <StatNumber color="teal.500" fontSize="3xl">{labAssessments.length}</StatNumber>
              <StatHelpText color="text.secondary">Available / In Progress →</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Completed Topics</StatLabel>
              <StatNumber color="accent.primary" fontSize="3xl">
                {completedCount} <Text as="span" fontSize="lg" color="text.secondary">/ {totalTopics}</Text>
              </StatNumber>
              <StatHelpText color="text.secondary">Fully completed modules</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Overall Progress</StatLabel>
              <StatNumber color="cyan.500" fontSize="3xl">{overallPercentage}%</StatNumber>
              <StatHelpText color="text.secondary">Syllabus completed</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Enrolled Lab Rooms Section */}
      <VStack align="stretch" spacing={4}>
        <Flex justify="space-between" align="center">
          <Heading size="md" color="text.primary">
            My Virtual Lab Rooms ({rooms.length})
          </Heading>
          <Button as={RouterLink} to="/student/rooms" size="sm" variant="ghost" colorScheme="brand" rightIcon={<ArrowForwardIcon />}>
            View All Rooms
          </Button>
        </Flex>

        {rooms.length === 0 ? (
          <Box p={8} bg="bg.card" borderRadius="xl" textAlign="center" border="1px dashed" borderColor="border.primary">
            <Text color="text.secondary" mb={4}>You have not joined any virtual lab rooms yet.</Text>
            <Button as={RouterLink} to="/student/join-room" size="sm" colorScheme="brand" leftIcon={<AddIcon />}>
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
                bg="bg.card"
                borderColor="border.primary"
                borderWidth="1px"
                borderRadius="xl"
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-4px)', borderColor: 'accent.primary', boxShadow: 'xl' }}
              >
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <Badge colorScheme="brand" px={2} py={0.5} borderRadius="md">
                      CODE: {room.room_code}
                    </Badge>
                    <Heading size="sm" color="text.primary">
                      {room.room_name}
                    </Heading>
                    <Text color="text.secondary" fontSize="xs" noOfLines={2}>
                      {room.description || 'No description provided.'}
                    </Text>
                    <HStack justify="space-between" w="full" pt={2} borderTop="1px solid" borderColor="border.primary">
                      <Text color="text.secondary" fontSize="xs">
                        Faculty: {room.faculty_name || 'Faculty'}
                      </Text>
                      <ArrowForwardIcon color="accent.primary" />
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
            <Heading size="md" color="text.primary">Topic Progress</Heading>
            <Button as={RouterLink} to="/student/progress" size="sm" variant="ghost" colorScheme="brand" rightIcon={<ArrowForwardIcon />}>
              View Full Progress
            </Button>
          </Flex>
          <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
            <CardBody>
              <VStack spacing={4} align="stretch">
                {topicsProgress.slice(0, 4).map((p) => (
                  <Box key={p.topic_id} p={3} bg="bg.secondary" borderRadius="lg">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text color="text.primary" fontWeight="medium" fontSize="sm">
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
