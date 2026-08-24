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
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { getFacultyAnalyticsApi } from '../../api/progressApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const FacultyAnalytics = () => {
  const navigate = useNavigate();
  const toast = useToast();
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
      <HStack justify="space-between" flexWrap="wrap">
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="white">Faculty Analytics</Heading>
          <Text color="gray.400" fontSize="sm">
            Performance metrics and learning trends across your managed virtual rooms
          </Text>
        </VStack>
        <Button
          colorScheme="purple"
          rightIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/faculty/students')}
        >
          View All Students
        </Button>
      </HStack>

      {/* Top Metrics Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody p={5}>
            <Stat>
              <StatLabel color="gray.400" fontSize="xs" fontWeight="bold">ENROLLED STUDENTS</StatLabel>
              <StatNumber color="purple.300" fontSize="3xl" mt={1}>{totalStudents}</StatNumber>
              <Text fontSize="xs" color="gray.500" mt={1}>Across all owned rooms</Text>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody p={5}>
            <Stat>
              <StatLabel color="gray.400" fontSize="xs" fontWeight="bold">ACTIVE (LAST 30 DAYS)</StatLabel>
              <StatNumber color="cyan.300" fontSize="3xl" mt={1}>{activeStudents}</StatNumber>
              <Text fontSize="xs" color="gray.500" mt={1}>Engaged in learning</Text>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody p={5}>
            <Stat>
              <StatLabel color="gray.400" fontSize="xs" fontWeight="bold">AVERAGE QUIZ SCORE</StatLabel>
              <StatNumber color="emerald.300" fontSize="3xl" mt={1}>{avgQuizScore}%</StatNumber>
              <Text fontSize="xs" color="gray.500" mt={1}>15-min assessment avg</Text>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody p={5}>
            <Stat>
              <StatLabel color="gray.400" fontSize="xs" fontWeight="bold">TOTAL ATTEMPTS</StatLabel>
              <StatNumber color="amber.300" fontSize="3xl" mt={1}>{totalQuizAttempts}</StatNumber>
              <Text fontSize="xs" color="gray.500" mt={1}>Quizzes completed</Text>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Room Performance Breakdown */}
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color="white">Room-Wise Learning Performance</Heading>
        {roomPerformance.length === 0 ? (
          <EmptyState
            title="No Rooms Created"
            description="Create rooms and assign topics to start collecting analytics."
            actionLabel="Create Room"
            onAction={() => navigate('/faculty/rooms')}
          />
        ) : (
          <Card bg="slate.800" borderColor="slate.700" borderWidth="1px" overflow="hidden">
            <CardBody p={0}>
              <Table variant="simple" size="md">
                <Thead bg="slate.900">
                  <Tr>
                    <Th color="gray.400">Room Name</Th>
                    <Th color="gray.400">Room Code</Th>
                    <Th color="gray.400">Enrolled Students</Th>
                    <Th color="gray.400">Assigned Topics</Th>
                    <Th color="gray.400" w="200px">Average Progress</Th>
                    <Th color="gray.400" textAlign="right">Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {roomPerformance.map((rm) => (
                    <Tr key={rm.room_id} _hover={{ bg: 'slate.750' }}>
                      <Td color="white" fontWeight="bold">{rm.room_name}</Td>
                      <Td>
                        <Badge colorScheme="purple">{rm.room_code}</Badge>
                      </Td>
                      <Td color="gray.300">{rm.student_count}</Td>
                      <Td color="gray.300">{rm.topic_count}</Td>
                      <Td>
                        <VStack align="stretch" spacing={1}>
                          <HStack justify="space-between" fontSize="xs">
                            <Text color="gray.400">Avg</Text>
                            <Text color="purple.300" fontWeight="bold">{rm.avg_progress}%</Text>
                          </HStack>
                          <Progress
                            value={parseFloat(rm.avg_progress) || 0}
                            colorScheme="purple"
                            size="xs"
                            borderRadius="full"
                          />
                        </VStack>
                      </Td>
                      <Td textAlign="right">
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="purple"
                          onClick={() => navigate(`/faculty/rooms/${rm.room_id}`)}
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
