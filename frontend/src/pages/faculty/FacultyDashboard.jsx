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
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CreateRoomModal from './CreateRoomModal';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [rooms, setRooms] = useState([]);
  const [topicsCount, setTopicsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [roomsRes, topicsRes] = await Promise.all([
        getMyRoomsApi(),
        getAllTopicsApi().catch(() => ({ data: { topics: [] } })),
      ]);
      setRooms(roomsRes.data?.rooms || []);
      setTopicsCount((topicsRes.data?.topics || []).length);
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
        bgGradient="linear(to-r, blue.900, slate.900, dark.card)"
        border="1px solid"
        borderColor="blue.800"
        boxShadow="xl"
      >
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
          <VStack align="start" spacing={2}>
            <Heading size="lg" color="white">
              Faculty Workspace — Welcome, {user?.name}! 👋
            </Heading>
            <Text color="gray.300" fontSize="sm">
              Designation: {user?.profile?.designation || 'Faculty Member'} • Department: {user?.profile?.department || 'Engineering'}
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              onClick={onOpen}
              leftIcon={<AddIcon />}
              bgGradient="linear(to-r, purple.500, pink.500)"
              color="white"
              _hover={{ bgGradient: 'linear(to-r, purple.600, pink.600)' }}
            >
              Create New Room
            </Button>
            <Button as={RouterLink} to="/faculty/topics" variant="outline" colorScheme="purple">
              Manage Topics
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={6}>
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

      <CreateRoomModal isOpen={isOpen} onClose={onClose} onRoomCreated={fetchDashboardData} />
    </VStack>
  );
};

export default FacultyDashboard;
