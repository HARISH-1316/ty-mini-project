// ──────────────────────────────────────────────
// Faculty Rooms Management Page
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
  useDisclosure,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { AddIcon, ArrowForwardIcon, DeleteIcon } from '@chakra-ui/icons';
import { getMyRoomsApi, deleteRoomApi } from '../../api/roomApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import CreateRoomModal from './CreateRoomModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const FacultyRooms = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await getMyRoomsApi();
      setRooms(res.data?.rooms || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch rooms.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    setIsDeleting(true);

    try {
      await deleteRoomApi(selectedRoom.room_id);
      toast({
        title: 'Room Deleted',
        description: `Room "${selectedRoom.room_name}" was deleted.`,
        status: 'info',
        duration: 3000,
      });
      fetchRooms();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete room.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setSelectedRoom(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading faculty rooms..." />;
  }

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Flex justify="space-between" align="center" direction={{ base: 'column', sm: 'row' }} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="white">Virtual Lab Rooms</Heading>
          <Text color="gray.400" fontSize="sm">
            Manage your virtual laboratories and assign topics
          </Text>
        </VStack>
        <Button onClick={onOpen} leftIcon={<AddIcon />} colorScheme="purple">
          Create New Room
        </Button>
      </Flex>

      {rooms.length === 0 ? (
        <EmptyState
          title="No Rooms Created"
          description="Click the button below to create your first virtual lab room."
          actionLabel="Create Room Now"
          onAction={onOpen}
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {rooms.map((room) => (
            <Card key={room.room_id} bg="slate.800" borderColor="slate.700" borderWidth="1px" borderRadius="xl">
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Flex justify="space-between" w="full" align="center">
                    <Badge colorScheme="purple" fontSize="xs" px={2} py={1} borderRadius="md">
                      CODE: {room.room_code}
                    </Badge>
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      icon={<DeleteIcon />}
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsDeleteOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </Flex>

                  <Heading size="md" color="white">{room.room_name}</Heading>
                  <Text color="gray.400" fontSize="xs" noOfLines={2}>
                    {room.description || 'No description provided.'}
                  </Text>

                  <Button
                    as={RouterLink}
                    to={`/faculty/rooms/${room.room_id}`}
                    w="full"
                    size="sm"
                    colorScheme="purple"
                    variant="outline"
                    rightIcon={<ArrowForwardIcon />}
                  >
                    Manage Room Topics
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <CreateRoomModal isOpen={isOpen} onClose={onClose} onRoomCreated={fetchRooms} />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteRoom}
        title="Delete Room"
        message={`Are you sure you want to delete "${selectedRoom?.room_name}"?`}
        confirmText="Delete Room"
        colorScheme="red"
        isLoading={isDeleting}
      />
    </VStack>
  );
};

export default FacultyRooms;
