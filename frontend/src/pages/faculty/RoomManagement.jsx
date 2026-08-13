// ──────────────────────────────────────────────
// Room Management Page — Faculty Topic Assignment
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Button,
  Select,
  useToast,
  Divider,
  Flex,
  IconButton,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { getRoomByIdApi, getRoomTopicsApi, addTopicToRoomApi, removeTopicFromRoomApi } from '../../api/roomApi';
import { getAllTopicsApi } from '../../api/topicApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const RoomManagement = () => {
  const { roomId } = useParams();
  const toast = useToast();

  const [room, setRoom] = useState(null);
  const [assignedTopics, setAssignedTopics] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const fetchRoomData = async () => {
    try {
      const [roomRes, assignedRes, catalogRes] = await Promise.all([
        getRoomByIdApi(roomId),
        getRoomTopicsApi(roomId).catch(() => ({ data: { topics: [] } })),
        getAllTopicsApi().catch(() => ({ data: { topics: [] } })),
      ]);

      setRoom(roomRes.data?.room || null);
      setAssignedTopics(assignedRes.data?.topics || []);
      setAllTopics(catalogRes.data?.topics || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load room details.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [roomId]);

  const handleAddTopic = async () => {
    if (!selectedTopicId) return;
    setIsAdding(true);

    try {
      await addTopicToRoomApi(roomId, { topic_id: parseInt(selectedTopicId, 10) });
      toast({
        title: 'Topic Added',
        description: 'Topic assigned to room.',
        status: 'success',
        duration: 3000,
      });
      setSelectedTopicId('');
      fetchRoomData();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add topic.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveTopic = async (topicId) => {
    try {
      await removeTopicFromRoomApi(roomId, topicId);
      toast({
        title: 'Topic Removed',
        description: 'Topic removed from room.',
        status: 'info',
        duration: 3000,
      });
      fetchRoomData();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove topic.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading room management details..." />;
  }

  if (!room) {
    return <EmptyState title="Room Not Found" />;
  }

  // Topics in catalog not yet assigned
  const availableTopics = allTopics.filter(
    (t) => !assignedTopics.some((at) => parseInt(at.topic_id, 10) === parseInt(t.topic_id, 10))
  );

  return (
    <VStack spacing={8} align="stretch" w="full">
      <HStack>
        <Button as={RouterLink} to="/faculty/rooms" size="sm" variant="ghost" colorScheme="purple" leftIcon={<ArrowBackIcon />}>
          Back to Rooms
        </Button>
      </HStack>

      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px" p={4}>
        <CardBody>
          <VStack align="start" spacing={3}>
            <HStack spacing={3}>
              <Heading size="lg" color="white">{room.room_name}</Heading>
              <Badge colorScheme="purple" px={2} py={1} borderRadius="md">
                CODE: {room.room_code}
              </Badge>
            </HStack>
            <Text color="gray.300" fontSize="sm">{room.description}</Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Add Topic Control */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px" p={4}>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <Heading size="xs" color="purple.300" textTransform="uppercase">
              Assign Topic from Catalog
            </Heading>
            <HStack spacing={4}>
              <Select
                placeholder="Select a topic to assign..."
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                bg="slate.900"
                borderColor="slate.700"
                color="white"
              >
                {availableTopics.map((t) => (
                  <option key={t.topic_id} value={t.topic_id} style={{ background: '#1e293b' }}>
                    {t.title}
                  </option>
                ))}
              </Select>
              <Button
                colorScheme="purple"
                leftIcon={<AddIcon />}
                onClick={handleAddTopic}
                isLoading={isAdding}
                isDisabled={!selectedTopicId}
              >
                Assign Topic
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Assigned Topics List */}
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color="white">
          Assigned Room Topics ({assignedTopics.length})
        </Heading>

        {assignedTopics.length === 0 ? (
          <EmptyState
            title="No Topics Assigned"
            description="Select a topic from the catalog above to assign it to this room."
          />
        ) : (
          <VStack spacing={3} align="stretch">
            {assignedTopics.map((t, index) => (
              <Box key={t.topic_id} p={4} bg="slate.800" borderRadius="xl" border="1px solid" borderColor="slate.700">
                <Flex justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2}>
                      <Badge colorScheme="cyan">Topic #{index + 1}</Badge>
                      <Text color="white" fontWeight="bold">{t.title}</Text>
                    </HStack>
                    <Text color="gray.400" fontSize="xs">{t.description}</Text>
                  </VStack>

                  <IconButton
                    aria-label="Remove topic"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleRemoveTopic(t.topic_id)}
                  />
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </VStack>
  );
};

export default RoomManagement;
