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
  useColorModeValue,
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

  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#B8C0B9');

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
          <Heading size="lg" color={textColor}>Virtual Lab Rooms</Heading>
          <Text color={mutedText} fontSize="sm">
            Manage your virtual laboratories, assessments, and curriculum topics
          </Text>
        </VStack>
        <Button onClick={onOpen} leftIcon={<AddIcon />} colorScheme="brand">
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
            <Card
              key={room.room_id}
              bg={cardBg}
              borderColor={cardBorder}
              borderWidth="1px"
              borderRadius="xl"
              boxShadow="sm"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            >
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Flex justify="space-between" w="full" align="center">
                    <Badge colorScheme="brand" fontSize="xs" px={2} py={1} borderRadius="md">
                      CODE: {room.room_code}
                    </Badge>
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      leftIcon={<DeleteIcon />}
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsDeleteOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </Flex>

                  <Heading size="md" color={textColor}>{room.room_name}</Heading>
                  <Text color={mutedText} fontSize="xs" noOfLines={2}>
                    {room.description || 'No description provided.'}
                  </Text>

                  <Button
                    as={RouterLink}
                    to={`/faculty/rooms/${room.room_id}`}
                    w="full"
                    size="sm"
                    colorScheme="brand"
                    variant="solid"
                    rightIcon={<ArrowForwardIcon />}
                  >
                    Open Room Dashboard
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
        title="Delete Virtual Room"
        message={`Are you sure you want to permanently delete room "${selectedRoom?.room_name}"? All assigned room topics and student links will be disconnected.`}
        confirmLabel="Delete Room"
        confirmColorScheme="red"
        isLoading={isDeleting}
      />
    </VStack>
  );
};

export default FacultyRooms;
