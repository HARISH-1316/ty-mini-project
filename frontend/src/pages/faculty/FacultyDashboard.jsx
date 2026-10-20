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
            <Button as={RouterLink} to="/faculty/rooms" variant="outline">
              Virtual Rooms
            </Button>
            <Button as={RouterLink} to="/faculty/topics" variant="outline">
              Theory & Content
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Rooms Created</StatLabel>
              <StatNumber color="accent.primary" fontSize="3xl">{rooms.length}</StatNumber>
              <StatHelpText color="text.secondary">Active virtual labs</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Lab Assessments</StatLabel>
              <StatNumber color="teal.500" fontSize="3xl">{labAssessmentsCount}</StatNumber>
              <StatHelpText color="text.secondary">Practical assessments</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Total Available Topics</StatLabel>
              <StatNumber color="cyan.500" fontSize="3xl">{topicsCount}</StatNumber>
              <StatHelpText color="text.secondary">Curriculum repository</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Role Status</StatLabel>
              <StatNumber color="accent.primary" fontSize="2xl">Instructor</StatNumber>
              <StatHelpText color="text.secondary">Full lab permissions</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Created Rooms */}
      <VStack align="stretch" spacing={4}>
        <Flex justify="space-between" align="center">
          <Heading size="md" color="text.primary">My Lab Rooms ({rooms.length})</Heading>
          <Button as={RouterLink} to="/faculty/rooms" size="sm" variant="ghost" colorScheme="brand" rightIcon={<ArrowForwardIcon />}>
            Manage Rooms
          </Button>
        </Flex>

        {rooms.length === 0 ? (
          <Box p={8} bg="bg.card" borderRadius="xl" textAlign="center" border="1px dashed" borderColor="border.primary">
            <Text color="text.secondary" mb={4}>You have not created any virtual lab rooms yet.</Text>
            <Button size="sm" colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
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
                    <Heading size="sm" color="text.primary">{room.room_name}</Heading>
                    <Text color="text.secondary" fontSize="xs" noOfLines={2}>
                      {room.description || 'No description provided.'}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      <CreateRoomModal isOpen={isOpen} onClose={onClose} onRoomCreated={fetchDashboardData} />
    </VStack>
  );
};

export default FacultyDashboard;
