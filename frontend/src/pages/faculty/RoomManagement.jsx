// ──────────────────────────────────────────────
// Room Management Page — Faculty Topic Assignment
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
  Select,
  useToast,
  Divider,
  Flex,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Tag,
  SimpleGrid,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, DeleteIcon, TimeIcon, CheckCircleIcon, ViewIcon } from '@chakra-ui/icons';
import { getRoomByIdApi, getRoomTopicsApi, addTopicToRoomApi, removeTopicFromRoomApi, getRoomStudentsApi, getRoomLabAssessmentsApi } from '../../api/roomApi';
import { getAllTopicsApi } from '../../api/topicApi';
import { publishLabAssessmentApi } from '../../api/labApi';
import { formatDisplayDateTime } from '../../utils/dateUtils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const RoomManagement = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#292D2A');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#B8C0B9');
  const accentColor = useColorModeValue('#2F8D46', '#A3E635');

  const [room, setRoom] = useState(null);
  const [assignedTopics, setAssignedTopics] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [students, setStudents] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const fetchRoomData = async () => {
    try {
      const [roomRes, assignedRes, catalogRes, studentsRes, assessmentsRes] = await Promise.all([
        getRoomByIdApi(roomId),
        getRoomTopicsApi(roomId).catch(() => ({ data: { topics: [] } })),
        getAllTopicsApi().catch(() => ({ data: { topics: [] } })),
        getRoomStudentsApi(roomId).catch(() => ({ data: { students: [] } })),
        getRoomLabAssessmentsApi(roomId).catch(() => ({ data: { assessments: [] } })),
      ]);

      setRoom(roomRes.data?.room || null);
      setAssignedTopics(assignedRes.data?.topics || []);
      setAllTopics(catalogRes.data?.topics || catalogRes.topics || []);
      setStudents(studentsRes.data?.students || studentsRes.students || []);
      const rawAssessments =
        assessmentsRes.data?.assessments ||
        assessmentsRes.data?.labs ||
        assessmentsRes.assessments ||
        assessmentsRes.labs ||
        [];
      setAssessments(Array.isArray(rawAssessments) ? rawAssessments : []);
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

  const handlePublishAssessment = async (labId) => {
    try {
      await publishLabAssessmentApi(labId);
      toast({
        title: 'Assessment Published! 🚀',
        description: 'Students in this room can now take this assessment during the scheduled window.',
        status: 'success',
        duration: 3000,
      });
      fetchRoomData();
    } catch (err) {
      toast({
        title: 'Failed to publish assessment',
        description: err.response?.data?.message || 'Error publishing assessment.',
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
    <VStack spacing={8} align="stretch" w="full" maxW="1440px" mx="auto" pb={12}>
      <HStack>
        <Button as={RouterLink} to="/faculty/rooms" size="sm" variant="ghost" colorScheme="brand" leftIcon={<ArrowBackIcon />}>
          Back to Rooms
        </Button>
      </HStack>

      {/* Room Details Banner */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" p={4} borderRadius="xl" boxShadow="sm">
        <CardBody>
          <VStack align="start" spacing={3}>
            <HStack spacing={3} wrap="wrap">
              <Heading size="lg" color={textColor}>{room.room_name}</Heading>
              <Badge colorScheme="brand" px={2.5} py={1} borderRadius="md" fontSize="sm">
                CODE: {room.room_code}
              </Badge>
            </HStack>
            <Text color={mutedText} fontSize="sm">{room.description || 'Virtual Lab Room for class discussions, topics, and practical assessments.'}</Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Tabs Navigation */}
      <Tabs variant="enclosed" colorScheme="green">
        <TabList borderColor={cardBorder}>
          <Tab fontWeight="bold" color={textColor} _selected={{ color: 'green.600', borderColor: cardBorder, borderBottomColor: cardBg }}>
            Lab Assessments ({assessments.length})
          </Tab>
          <Tab fontWeight="bold" color={textColor} _selected={{ color: 'green.600', borderColor: cardBorder, borderBottomColor: cardBg }}>
            Assigned Topics ({assignedTopics.length})
          </Tab>
          <Tab fontWeight="bold" color={textColor} _selected={{ color: 'green.600', borderColor: cardBorder, borderBottomColor: cardBg }}>
            Enrolled Students ({students.length})
          </Tab>
        </TabList>

        <TabPanels pt={6}>
          {/* TAB 1: LAB ASSESSMENTS */}
          <TabPanel p={0}>
            <VStack align="stretch" spacing={6}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={textColor}>Room Lab Assessments</Heading>
                  <Text fontSize="xs" color={mutedText}>
                    Practical assessments configured strictly for students of this room
                  </Text>
                </VStack>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="brand"
                  size="sm"
                  onClick={() => navigate(`/faculty/lab-assessments?roomId=${roomId}`)}
                >
                  Create Lab Assessment in Room
                </Button>
              </Flex>

              {assessments.length === 0 ? (
                <EmptyState
                  title="No Lab Assessments in this Room"
                  description="Create your first practical hybrid assessment with coding questions and MCQs for this room."
                  actionLabel="Create Lab Assessment"
                  onAction={() => navigate(`/faculty/lab-assessments?roomId=${roomId}`)}
                />
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {assessments.map((la) => (
                    <Card
                      key={la.lab_id}
                      bg={cardBg}
                      borderColor={cardBorder}
                      borderWidth="1px"
                      borderRadius="xl"
                      boxShadow="sm"
                      transition="all 0.2s"
                      _hover={{ borderColor: accentColor }}
                    >
                      <CardBody p={5}>
                        <VStack align="stretch" spacing={3}>
                          <Flex justify="space-between" align="start">
                            <Heading size="sm" color={textColor} noOfLines={1}>
                              {la.title}
                            </Heading>
                            <Badge
                              colorScheme={
                                la.status === 'published' || la.status === 'active'
                                  ? 'green'
                                  : la.status === 'draft'
                                  ? 'yellow'
                                  : 'purple'
                              }
                            >
                              {la.status}
                            </Badge>
                          </Flex>

                          <Text fontSize="xs" color={mutedText} noOfLines={2}>
                            {la.description || 'Room practical assessment.'}
                          </Text>

                          <HStack spacing={2} wrap="wrap" pt={1}>
                            <Tag size="sm" colorScheme="blue">
                              {la.num_coding_questions ?? la.num_questions ?? 0} Coding
                            </Tag>
                            <Tag size="sm" colorScheme="purple">
                              {la.num_mcq_questions ?? 0} MCQs
                            </Tag>
                            <Tag size="sm" colorScheme="teal">
                              {la.duration} mins
                            </Tag>
                            <Tag size="sm" colorScheme="orange">
                              {la.total_marks || ((la.num_coding_questions || la.num_questions || 0) * 10 + (la.num_mcq_questions || 0) * (la.marks_per_mcq || 2))} marks
                            </Tag>
                          </HStack>

                          {(la.start_time || la.end_time) && (
                            <HStack spacing={1.5} fontSize="xs" color={mutedText} pt={0.5}>
                              <TimeIcon />
                              <Text>
                                {la.start_time ? formatDisplayDateTime(la.start_time) : 'Immediate'} — {la.end_time ? formatDisplayDateTime(la.end_time) : 'No due date'}
                              </Text>
                            </HStack>
                          )}

                          <Divider borderColor={cardBorder} />

                          <Flex justify="space-between" align="center" pt={1} gap={2} wrap="wrap">
                            <HStack spacing={2}>
                              <Button
                                as={RouterLink}
                                to={`/faculty/lab-assessments/${la.lab_id}`}
                                size="xs"
                                variant="outline"
                                colorScheme="brand"
                              >
                                Configure & Questions
                              </Button>
                              <Button
                                as={RouterLink}
                                to={`/faculty/lab-assessments/${la.lab_id}/results`}
                                size="xs"
                                colorScheme="brand"
                              >
                                View Results
                              </Button>
                            </HStack>
                            {la.status === 'draft' && (
                              <Button
                                size="xs"
                                colorScheme="green"
                                variant="solid"
                                onClick={() => handlePublishAssessment(la.lab_id)}
                              >
                                Publish
                              </Button>
                            )}
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </VStack>
          </TabPanel>

          {/* TAB 2: ASSIGNED TOPICS */}
          <TabPanel p={0}>
            <VStack align="stretch" spacing={6}>
              {/* Add Topic Control */}
              <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" p={4} borderRadius="xl">
                <CardBody p={0}>
                  <VStack align="stretch" spacing={3}>
                    <Heading size="xs" color={mutedText} textTransform="uppercase">
                      Assign Topic from Catalog
                    </Heading>
                    <HStack spacing={4}>
                      <Select
                        placeholder="Select a topic to assign..."
                        value={selectedTopicId}
                        onChange={(e) => setSelectedTopicId(e.target.value)}
                        bg={surfaceBg}
                        borderColor={cardBorder}
                        color={textColor}
                      >
                        {availableTopics.map((t) => (
                          <option key={t.topic_id} value={t.topic_id}>
                            {t.title}
                          </option>
                        ))}
                      </Select>
                      <Button
                        colorScheme="brand"
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
                <Heading size="md" color={textColor}>
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
                      <Box key={t.topic_id} p={4} bg={cardBg} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <Badge colorScheme="cyan">Topic #{index + 1}</Badge>
                              <Text color={textColor} fontWeight="bold">{t.title}</Text>
                            </HStack>
                            <Text color={mutedText} fontSize="xs">{t.description}</Text>
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
          </TabPanel>

          {/* TAB 3: ENROLLED STUDENTS */}
          <TabPanel p={0}>
            <VStack align="stretch" spacing={4}>
              <Heading size="md" color={textColor}>
                Enrolled Students ({students.length})
              </Heading>

              {students.length === 0 ? (
                <EmptyState
                  title="No Students Enrolled"
                  description="No students have joined this room yet. Share the room code with your students."
                />
              ) : (
                <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl">
                  <CardBody p={0}>
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th color={mutedText} borderColor={cardBorder}>#</Th>
                            <Th color={mutedText} borderColor={cardBorder}>Name</Th>
                            <Th color={mutedText} borderColor={cardBorder}>Email</Th>
                            <Th color={mutedText} borderColor={cardBorder}>Roll No</Th>
                            <Th color={mutedText} borderColor={cardBorder}>Course</Th>
                            <Th color={mutedText} borderColor={cardBorder}>Year</Th>
                            <Th color={mutedText} borderColor={cardBorder}>Joined</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {students.map((s, index) => (
                            <Tr key={s.student_id || index}>
                              <Td color={mutedText} borderColor={cardBorder} fontSize="xs">{index + 1}</Td>
                              <Td color={textColor} borderColor={cardBorder} fontWeight="medium" fontSize="sm">{s.name}</Td>
                              <Td color={mutedText} borderColor={cardBorder} fontSize="sm">{s.email}</Td>
                              <Td borderColor={cardBorder}>
                                <Badge colorScheme="purple" fontSize="xs">{s.roll_number}</Badge>
                              </Td>
                              <Td color={mutedText} borderColor={cardBorder} fontSize="sm">{s.course || '—'}</Td>
                              <Td color={mutedText} borderColor={cardBorder} fontSize="sm">{s.year || '—'}</Td>
                              <Td color={mutedText} borderColor={cardBorder} fontSize="xs">
                                {s.joined_at ? new Date(s.joined_at).toLocaleDateString() : '—'}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default RoomManagement;
