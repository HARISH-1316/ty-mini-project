// ──────────────────────────────────────────────
// Student My Rooms Page
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Button,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { getMyRoomsApi } from '../../api/roomApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MyRooms = () => {
  const toast = useToast();
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getMyRoomsApi();
        setRooms(res.data?.rooms || []);
      } catch {
        toast({
          title: 'Error loading rooms',
          description: 'Could not fetch your joined lab rooms.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [toast]);

  if (isLoading) {
    return <LoadingSpinner label="Loading your virtual lab rooms..." />;
  }

  const filteredRooms = rooms.filter(
    (r) =>
      r.room_name.toLowerCase().includes(search.toLowerCase()) ||
      r.room_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* Header */}
      <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="text.primary">My Lab Rooms</Heading>
          <Text color="text.secondary" fontSize="sm">
            View all virtual laboratories you have joined
          </Text>
        </VStack>
        <Button
          as={RouterLink}
          to="/student/join-room"
          leftIcon={<AddIcon />}
          colorScheme="brand"
        >
          Join Room with Code
        </Button>
      </Flex>

      {/* Search Input */}
      <InputGroup maxW="md">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="text.secondary" />
        </InputLeftElement>
        <Input
          placeholder="Search by room name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          bg="bg.card"
          borderColor="border.primary"
          color="text.primary"
          _placeholder={{ color: 'text.secondary' }}
          _focus={{ borderColor: 'accent.primary' }}
        />
      </InputGroup>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <EmptyState
          title="No Lab Rooms Found"
          description={search ? 'No rooms match your search filter.' : 'You have not joined any virtual lab rooms yet.'}
          actionLabel={search ? undefined : 'Join a Room Now'}
          onAction={() => navigate('/student/join-room')}
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredRooms.map((room) => (
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
                <VStack align="start" spacing={4}>
                  <Flex justify="space-between" w="full" align="center">
                    <Badge colorScheme="brand" fontSize="xs" px={2} py={1} borderRadius="md">
                      CODE: {room.room_code}
                    </Badge>
                    <Text color="text.secondary" fontSize="xs">
                      Joined {room.joined_at ? new Date(room.joined_at).toLocaleDateString() : ''}
                    </Text>
                  </Flex>

                  <Heading size="md" color="text.primary">
                    {room.room_name}
                  </Heading>

                  <Text color="text.secondary" fontSize="sm" noOfLines={3}>
                    {room.description || 'No description provided.'}
                  </Text>

                  <HStack justify="space-between" w="full" pt={3} borderTop="1px solid" borderColor="border.primary">
                    <Text color="text.secondary" fontSize="xs" fontWeight="medium">
                      Faculty: {room.faculty_name || 'Faculty Member'}
                    </Text>
                    <HStack spacing={1} color="accent.primary">
                      <Text fontSize="xs" fontWeight="bold">Open Lab</Text>
                      <ArrowForwardIcon />
                    </HStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
};

export default MyRooms;
