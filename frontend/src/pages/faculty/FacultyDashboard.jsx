// ──────────────────────────────────────────────
// Faculty Dashboard
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
  useDisclosure,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { AddIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import useAuth from '../../hooks/useAuth';
import { getMyRoomsApi } from '../../api/roomApi';
import { getAllTopicsApi } from '../../api/topicApi';
import { getFacultyLabAssessmentsApi } from '../../api/labApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CreateRoomModal from './CreateRoomModal';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [rooms, setRooms] = useState([]);
  const [topicsCount, setTopicsCount] = useState(0);
  const [labAssessments, setLabAssessments] = useState([]);
  const [labAssessmentsCount, setLabAssessmentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [roomsRes, topicsRes, labsRes] = await Promise.all([
        getMyRoomsApi(),
        getAllTopicsApi().catch(() => ({ data: { topics: [] } })),
        getFacultyLabAssessmentsApi().catch(() => ({ data: { data: { labs: [] } } })),
      ]);
      const fetchedLabs = labsRes.data?.data?.labs || [];
      setRooms(roomsRes.data?.rooms || []);
      setTopicsCount((topicsRes.data?.topics || topicsRes.data?.data?.topics || []).length);
      setLabAssessments(fetchedLabs);
      setLabAssessmentsCount(fetchedLabs.length);
    } catch {
      toast({
        title: 'Error loading dashboard',
        description: 'Failed to fetch faculty metrics.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [toast]);

  if (isLoading) {
    return <LoadingSpinner label="Loading faculty workspace..." />;
  }

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Welcome Header */}
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
              Faculty Workspace — Welcome, {user?.name}! 👋
            </Heading>
            <Text color="text.secondary" fontSize="sm">
              Designation: {user?.profile?.designation || 'Faculty Member'} • Department: {user?.profile?.department || 'Engineering'}
            </Text>
          </VStack>
          <HStack spacing={3} wrap="wrap">
            <Button
              onClick={onOpen}
              leftIcon={<AddIcon />}
              colorScheme="brand"
            >
              Create New Room
            </Button>
            <Button as={RouterLink} to="/faculty/lab-assessments" variant="outline">
              Lab Assessments
            </Button>
            <Button as={RouterLink} to="/faculty/topics" variant="outline">
              Manage Topics
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Rooms Created</StatLabel>
              <StatNumber color="purple.300" fontSize="3xl">{rooms.length}</StatNumber>
              <StatHelpText color="gray.500">Active virtual labs</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Lab Assessments</StatLabel>
              <StatNumber color="teal.300" fontSize="3xl">{labAssessmentsCount}</StatNumber>
              <StatHelpText color="gray.500">Practical assessments</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Total Available Topics</StatLabel>
              <StatNumber color="cyan.400" fontSize="3xl">{topicsCount}</StatNumber>
              <StatHelpText color="gray.500">Curriculum repository</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Role Status</StatLabel>
              <StatNumber color="emerald.400" fontSize="2xl">Instructor</StatNumber>
              <StatHelpText color="gray.500">Full lab permissions</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Created Rooms */}
      <VStack align="stretch" spacing={4}>
        <Flex justify="space-between" align="center">
          <Heading size="md" color="white">My Lab Rooms ({rooms.length})</Heading>
          <Button as={RouterLink} to="/faculty/rooms" size="sm" variant="ghost" colorScheme="purple" rightIcon={<ArrowForwardIcon />}>
            Manage Rooms
          </Button>
        </Flex>

        {rooms.length === 0 ? (
          <Box p={8} bg="slate.800" borderRadius="xl" textAlign="center" border="1px dashed" borderColor="slate.700">
            <Text color="gray.400" mb={4}>You have not created any virtual lab rooms yet.</Text>
            <Button size="sm" colorScheme="purple" leftIcon={<AddIcon />} onClick={onOpen}>
              Create First Room
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {rooms.slice(0, 3).map((room) => (
              <Card
                key={room.room_id}
                as={RouterLink}
                to={`/faculty/rooms/${room.room_id}`}
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
                    <Heading size="sm" color="white">{room.room_name}</Heading>
                    <Text color="gray.400" fontSize="xs" noOfLines={2}>
                      {room.description || 'No description provided.'}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Lab Assessments Section */}
      <VStack align="stretch" spacing={4}>
        <Flex justify="space-between" align="center">
          <Heading size="md" color="white">Lab Assessments ({labAssessments.length})</Heading>
          <Button as={RouterLink} to="/faculty/lab-assessments" size="sm" variant="ghost" colorScheme="teal" rightIcon={<ArrowForwardIcon />}>
            Manage Assessments
          </Button>
        </Flex>

        {labAssessments.length === 0 ? (
          <Box p={8} bg="slate.800" borderRadius="xl" textAlign="center" border="1px dashed" borderColor="slate.700">
            <Text color="gray.400" mb={4}>No lab assessments configured yet.</Text>
            <Button size="sm" colorScheme="teal" as={RouterLink} to="/faculty/lab-assessments" leftIcon={<AddIcon />}>
              Create Lab Assessment
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {labAssessments.slice(0, 3).map((lab) => {
              const statusColors = { draft: 'gray', published: 'blue', active: 'green', completed: 'purple', cancelled: 'red' };
              return (
                <Card
                  key={lab.lab_id}
                  bg="slate.800"
                  borderColor="slate.700"
                  borderWidth="1px"
                  borderRadius="xl"
                  transition="all 0.2s"
                  _hover={{ transform: 'translateY(-4px)', borderColor: 'teal.400', boxShadow: 'xl' }}
                >
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <Flex justify="space-between" w="full" align="center">
                        <Badge colorScheme={statusColors[lab.status] || 'gray'} px={2} py={0.5} borderRadius="md" textTransform="capitalize">
                          {lab.status}
                        </Badge>
                        <Text color="gray.500" fontSize="xs">{lab.num_questions || 5} Questions</Text>
                      </Flex>
                      <Heading size="sm" color="white" noOfLines={2}>{lab.title}</Heading>
                      {lab.description && (
                        <Text color="gray.400" fontSize="xs" noOfLines={2}>{lab.description}</Text>
                      )}
                      <Flex justify="space-between" align="center" w="full" pt={2} borderTop="1px solid" borderColor="slate.700">
                        <Text color="gray.400" fontSize="xs">⏱ {lab.duration} mins</Text>
                        <Button
                          as={RouterLink}
                          to={`/faculty/lab-assessments/${lab.lab_id}`}
                          size="xs"
                          colorScheme="teal"
                          variant="solid"
                          rightIcon={<ArrowForwardIcon />}
                        >
                          Manage
                        </Button>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </VStack>

      <CreateRoomModal isOpen={isOpen} onClose={onClose} onRoomCreated={fetchDashboardData} />
    </VStack>
  );
};

export default FacultyDashboard;
