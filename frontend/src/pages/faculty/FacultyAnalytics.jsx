// ──────────────────────────────────────────────
// Faculty Analytics Dashboard
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Badge,
  Button,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowForwardIcon, SettingsIcon } from '@chakra-ui/icons';
import { getFacultyAnalyticsApi } from '../../api/progressApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const FacultyAnalytics = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#292D2A');
  const tableHeaderBg = useColorModeValue('#E8EFE9', '#1A1D1B');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#B8C0B9');
  const tableHoverBg = useColorModeValue('#F7FAF8', '#252926');

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getFacultyAnalyticsApi();
        setData(res.data);
      } catch (err) {
        toast({
          title: 'Error loading analytics',
          description: err.response?.data?.message || 'Could not fetch faculty analytics.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [toast]);

  if (isLoading) {
    return <LoadingSpinner label="Loading faculty room analytics..." />;
  }

  const {
    totalStudents = 0,
    activeStudents = 0,
    avgQuizScore = 0,
    totalQuizAttempts = 0,
    roomPerformance = [],
  } = data || {};

  return (
    <VStack spacing={8} align="stretch" w="full" pb={12}>
      {/* Header */}
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={textColor}>Faculty Analytics</Heading>
          <Text color={mutedText} fontSize="sm">
            Performance metrics and learning trends across your managed virtual rooms
          </Text>
        </VStack>
        <Button
          colorScheme="brand"
          rightIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/faculty/students')}
        >
          View All Students
        </Button>
      </HStack>

      {/* Top Metrics Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
        <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" boxShadow="sm">
          <CardBody p={5}>
            <Stat>
              <StatLabel color={mutedText} fontSize="xs" fontWeight="bold">ENROLLED STUDENTS</StatLabel>
              <StatNumber color="green.600" fontSize="3xl" mt={1}>{totalStudents}</StatNumber>
              <Text fontSize="xs" color={mutedText} mt={1}>Across all owned rooms</Text>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" boxShadow="sm">
          <CardBody p={5}>
            <Stat>
              <StatLabel color={mutedText} fontSize="xs" fontWeight="bold">ACTIVE (LAST 30 DAYS)</StatLabel>
              <StatNumber color="teal.600" fontSize="3xl" mt={1}>{activeStudents}</StatNumber>
              <Text fontSize="xs" color={mutedText} mt={1}>Engaged in learning</Text>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" boxShadow="sm">
          <CardBody p={5}>
            <Stat>
              <StatLabel color={mutedText} fontSize="xs" fontWeight="bold">AVERAGE QUIZ SCORE</StatLabel>
              <StatNumber color="blue.600" fontSize="3xl" mt={1}>{avgQuizScore}%</StatNumber>
              <Text fontSize="xs" color={mutedText} mt={1}>15-min assessment avg</Text>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" boxShadow="sm">
          <CardBody p={5}>
            <Stat>
              <StatLabel color={mutedText} fontSize="xs" fontWeight="bold">TOTAL ATTEMPTS</StatLabel>
              <StatNumber color="purple.600" fontSize="3xl" mt={1}>{totalQuizAttempts}</StatNumber>
              <Text fontSize="xs" color={mutedText} mt={1}>Quizzes completed</Text>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Room Performance Breakdown */}
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color={textColor}>Room-Wise Learning Performance</Heading>
        {roomPerformance.length === 0 ? (
          <EmptyState
            title="No Rooms Created"
            description="Create rooms and assign topics to start collecting analytics."
            actionLabel="Create Room"
            onAction={() => navigate('/faculty/rooms')}
          />
        ) : (
          <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" overflow="hidden" boxShadow="sm">
            <CardBody p={0}>
              <Table variant="simple" size="md">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th color={mutedText} borderColor={cardBorder}>Room Name</Th>
                    <Th color={mutedText} borderColor={cardBorder}>Room Code</Th>
                    <Th color={mutedText} borderColor={cardBorder}>Enrolled Students</Th>
                    <Th color={mutedText} borderColor={cardBorder}>Assigned Topics</Th>
                    <Th color={mutedText} borderColor={cardBorder} w="200px">Average Progress</Th>
                    <Th color={mutedText} borderColor={cardBorder} textAlign="right">Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {roomPerformance.map((rm) => (
                    <Tr key={rm.room_id} _hover={{ bg: tableHoverBg }}>
                      <Td borderColor={cardBorder} color={textColor} fontWeight="bold">{rm.room_name}</Td>
                      <Td borderColor={cardBorder}>
                        <Badge colorScheme="brand" px={2} py={0.5} borderRadius="md">{rm.room_code}</Badge>
                      </Td>
                      <Td borderColor={cardBorder} color={textColor}>{rm.student_count}</Td>
                      <Td borderColor={cardBorder} color={textColor}>{rm.topic_count}</Td>
                      <Td borderColor={cardBorder}>
                        <VStack align="stretch" spacing={1}>
                          <HStack justify="space-between" fontSize="xs">
                            <Text color={mutedText}>Avg</Text>
                            <Text color="green.600" fontWeight="bold">{rm.avg_progress}%</Text>
                          </HStack>
                          <Progress
                            value={parseFloat(rm.avg_progress) || 0}
                            colorScheme="brand"
                            size="xs"
                            borderRadius="full"
                          />
                        </VStack>
                      </Td>
                      <Td borderColor={cardBorder} textAlign="right">
                        <Button
                          size="sm"
                          variant="solid"
                          colorScheme="brand"
                          leftIcon={<SettingsIcon />}
                          boxShadow="xs"
                          _hover={{ transform: 'translateY(-1px)', boxShadow: 'sm' }}
                          _active={{ transform: 'translateY(0)' }}
                          onClick={() => navigate(`/faculty/rooms/${rm.room_id}`)}
                          aria-label={`Manage Room ${rm.room_name}`}
                        >
                          Manage Room
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        )}
      </VStack>
    </VStack>
  );
};

export default FacultyAnalytics;
