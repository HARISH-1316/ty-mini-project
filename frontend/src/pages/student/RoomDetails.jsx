// ──────────────────────────────────────────────
// Room Details Page
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
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
  SimpleGrid,
  useToast,
  Flex,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { getRoomByIdApi, getRoomTopicsApi, leaveRoomApi } from '../../api/roomApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';

const RoomDetails = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [room, setRoom] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Theme tokens
  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const headingColor = useColorModeValue('#202124', '#F5F7F5');
  const bodyColor = useColorModeValue('#202124', '#F5F7F5');
  const secondaryColor = useColorModeValue('#505750', '#B8C0B9');
  const dividerColor = useColorModeValue('#DDE5DD', '#3B423C');
  const accentColor = useColorModeValue('#2F8D46', '#A3E635');
  const topicCardHoverBorder = useColorModeValue('#2F8D46', '#A3E635');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomRes, topicsRes] = await Promise.all([
          getRoomByIdApi(roomId),
          getRoomTopicsApi(roomId).catch(() => ({ data: { topics: [] } })),
        ]);
        setRoom(roomRes.data?.room || null);
        setTopics(topicsRes.data?.topics || []);
      } catch {
        toast({
          title: 'Error loading room',
          description: 'Could not fetch room details.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roomId, toast]);

  const handleLeaveRoom = async () => {
    setIsLeaving(true);
    try {
      await leaveRoomApi(roomId);
      toast({
        title: 'Left Room',
        description: 'You have left the lab room.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      navigate('/student/rooms');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to leave room.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLeaving(false);
      setIsLeaveModalOpen(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading room details..." />;
  }

  if (!room) {
    return (
      <EmptyState
        title="Room Not Found"
        description="The requested room does not exist or has been removed."
        actionLabel="Back to My Rooms"
        onAction={() => navigate('/student/rooms')}
      />
    );
  }

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Back Button */}
      <HStack>
        <Button as={RouterLink} to="/student/rooms" size="sm" variant="ghost" colorScheme="brand" leftIcon={<ArrowBackIcon />}>
          Back to Rooms
        </Button>
      </HStack>

      {/* Room Header Card */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" p={4}>
        <CardBody>
          <VStack align="start" spacing={4}>
            <Flex justify="space-between" w="full" align="start" direction={{ base: 'column', sm: 'row' }} gap={2}>
              <VStack align="start" spacing={1}>
                <HStack spacing={3}>
                  <Heading size="lg" color={headingColor}>{room.room_name}</Heading>
                  <Badge colorScheme="brand" fontSize="sm" px={2} py={1} borderRadius="md">
                    CODE: {room.room_code}
                  </Badge>
                </HStack>
                <Text color={secondaryColor} fontSize="sm">
                  Instructor: {room.faculty_name || 'Faculty Member'}
                </Text>
              </VStack>

              <Button size="sm" variant="outline" colorScheme="red" onClick={() => setIsLeaveModalOpen(true)}>
                Leave Room
              </Button>
            </Flex>

            <Divider borderColor={dividerColor} />

            <Text color={bodyColor} fontSize="sm">
              {room.description || 'No description provided for this virtual lab.'}
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Assigned Topics List */}
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color={headingColor}>
          Lab Topics &amp; Course Material ({topics.length})
        </Heading>

        {topics.length === 0 ? (
          <EmptyState
            title="No Topics Assigned Yet"
            description="Your instructor has not assigned any topics to this room yet."
          />
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {topics.map((t, index) => (
              <Card
                key={t.topic_id}
                as={RouterLink}
                to={`/student/topics/${t.topic_id}/introduction`}
                bg={cardBg}
                borderColor={cardBorder}
                borderWidth="1px"
                borderRadius="xl"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-3px)',
                  borderColor: topicCardHoverBorder,
                  boxShadow: 'md',
                  textDecoration: 'none',
                }}
              >
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <Flex justify="space-between" w="full" align="center">
                      <Badge colorScheme="brand">Topic #{index + 1}</Badge>
                      <ArrowForwardIcon color={accentColor} />
                    </Flex>
                    <Heading size="sm" color={headingColor}>
                      {t.title}
                    </Heading>
                    <Text color={secondaryColor} fontSize="xs" noOfLines={2}>
                      {t.description || 'Click to view subtopics, learning content, and topic feedback.'}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Leave Room Modal */}
      <ConfirmModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={handleLeaveRoom}
        title="Leave Room"
        message={`Are you sure you want to leave ${room.room_name}?`}
        confirmText="Leave Room"
        colorScheme="red"
        isLoading={isLeaving}
      />
    </VStack>
  );
};

export default RoomDetails;
