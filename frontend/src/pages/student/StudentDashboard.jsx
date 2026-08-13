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
import { getMyProgressApi } from '../../api/topicApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [rooms, setRooms] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, progressRes] = await Promise.all([
          getMyRoomsApi(),
          getMyProgressApi().catch(() => ({ data: { progress: [] } })),
        ]);
        setRooms(roomsRes.data?.rooms || []);
        setProgressList(progressRes.data?.progress || []);
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

  const completedCount = progressList.filter((p) => p.status === 'Completed').length;
  const inProgressCount = progressList.filter((p) => p.status === 'In Progress').length;

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Welcome Banner */}
      <Box
        p={8}
        borderRadius="2xl"
        bgGradient="linear(to-r, purple.900, slate.900, dark.card)"
        border="1px solid"
        borderColor="purple.800"
        boxShadow="xl"
      >
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
          <VStack align="start" spacing={2}>
            <Heading size="lg" color="white">
              Welcome back, {user?.name}! 👋
            </Heading>
            <Text color="gray.300" fontSize="sm">
              Roll No: {user?.profile?.roll_number || 'N/A'} • Course: {user?.profile?.course || 'Engineering'}
            </Text>
          </VStack>
          <Button
            as={RouterLink}
            to="/student/join-room"
            leftIcon={<AddIcon />}
            bgGradient="linear(to-r, purple.500, pink.500)"
            color="white"
            _hover={{ bgGradient: 'linear(to-r, purple.600, pink.600)' }}
          >
            Join New Lab Room
          </Button>
        </Flex>
      </Box>

      {/* Quick Stats Grid */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={6}>
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
              <StatLabel color="gray.400">Completed Topics</StatLabel>
              <StatNumber color="emerald.400" fontSize="3xl">{completedCount}</StatNumber>
              <StatHelpText color="gray.500">Fully completed modules</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Topics In Progress</StatLabel>
              <StatNumber color="amber.400" fontSize="3xl">{inProgressCount}</StatNumber>
              <StatHelpText color="gray.500">Active learning items</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

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
      {progressList.length > 0 && (
        <VStack align="stretch" spacing={4} pt={4}>
          <Heading size="md" color="white">Recent Learning Progress</Heading>
          <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
            <CardBody>
              <VStack spacing={4} align="stretch">
                {progressList.slice(0, 4).map((p) => (
                  <Box key={p.progress_id} p={3} bg="slate.900" borderRadius="lg">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text color="white" fontWeight="medium" fontSize="sm">
                        {p.topic_title || `Topic #${p.topic_id}`}
                      </Text>
                      <Badge colorScheme={p.status === 'Completed' ? 'green' : 'yellow'}>
                        {p.status}
                      </Badge>
                    </Flex>
                    <Progress
                      value={p.status === 'Completed' ? 100 : p.status === 'In Progress' ? 50 : 0}
                      colorScheme={p.status === 'Completed' ? 'green' : 'purple'}
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
