// ──────────────────────────────────────────────
// Detailed Student Progress Inspector — Faculty & Admin View
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tag,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Divider,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  CheckCircleIcon,
  TimeIcon,
  InfoOutlineIcon,
} from '@chakra-ui/icons';
import { getFacultyStudentDetailApi, getAdminStudentDetailApi } from '../../api/progressApi';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StudentProgressDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isFaculty = user?.role === 'faculty';
  const backRoute = isFaculty ? '/faculty/students' : '/admin/progress';

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = isFaculty
          ? await getFacultyStudentDetailApi(studentId)
          : await getAdminStudentDetailApi(studentId);
        setData(res.data);
      } catch (err) {
        toast({
          title: 'Error loading student progress',
          description: err.response?.data?.message || 'Could not fetch student progress details.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [studentId, isFaculty, toast]);

  if (isLoading) {
    return <LoadingSpinner label="Loading student comprehensive progress..." />;
  }

  if (!data) {
    return (
      <VStack spacing={6} align="stretch">
        <Button leftIcon={<ArrowBackIcon />} variant="ghost" color="gray.400" onClick={() => navigate(backRoute)}>
          Back to Students
        </Button>
        <EmptyState
          title="Student Progress Unavailable"
          description="Could not load progress data for this student."
        />
      </VStack>
    );
  }

  const {
    student,
    overallProgress,
    completedTopicsCount,
    totalTopicsCount,
    completedSubtopicsCount,
    totalSubtopicsCount,
    completedQuizzesCount,
    totalQuizzesCount,
    completedAssessmentsCount,
    totalAssessmentsCount,
    totalTimeSpent,
    recentActivity,
    topicsProgress,
  } = data;

  return (
    <VStack spacing={8} align="stretch" w="full" pb={12}>
      {/* Navigation Header */}
      <HStack justify="space-between" flexWrap="wrap">
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="outline"
          borderColor="slate.700"
          color="gray.300"
          _hover={{ bg: 'slate.800', color: 'white' }}
          onClick={() => navigate(backRoute)}
        >
          Back to Student List
        </Button>
        <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
          {isFaculty ? 'Faculty Student Inspector' : 'Admin Global Inspector'}
        </Badge>
      </HStack>

      {/* Student Profile Card */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody p={6}>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} alignItems="center">
            <VStack align="start" spacing={1} gridColumn={{ md: 'span 2' }}>
              <Heading size="md" color="white">{student?.name || 'Student'}</Heading>
              <Text color="gray.400" fontSize="sm">{student?.email}</Text>
              <HStack spacing={2} pt={2}>
                <Tag colorScheme="cyan" size="sm">Roll No: {student?.roll_number || 'N/A'}</Tag>
                <Tag colorScheme="purple" size="sm">{student?.course || 'Engineering'} • Year {student?.year || '1'}</Tag>
              </HStack>
            </VStack>

            <Box p={4} bg="slate.900" borderRadius="xl" border="1px solid" borderColor="slate.700" textAlign="center">
              <Text fontSize="xs" color="gray.400" fontWeight="bold">OVERALL PROGRESS</Text>
              <Text fontSize="3xl" fontWeight="bold" color="purple.300" my={1}>{overallProgress}%</Text>
              <Progress
                value={overallProgress}
                colorScheme={overallProgress === 100 ? 'green' : 'purple'}
                size="xs"
                borderRadius="full"
              />
            </Box>

            <Box p={4} bg="slate.900" borderRadius="xl" border="1px solid" borderColor="slate.700" textAlign="center">
              <Text fontSize="xs" color="gray.400" fontWeight="bold">TIME INVESTED</Text>
              <Text fontSize="3xl" fontWeight="bold" color="cyan.300" my={1}>{totalTimeSpent}</Text>
              <Text fontSize="xs" color="gray.400">Total Minutes</Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Metric Breakdown Stats */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody p={4}>
            <Stat>
              <StatLabel color="gray.400" fontSize="xs">Topics Completed</StatLabel>
              <StatNumber color="purple.300" fontSize="2xl">
                {completedTopicsCount} / {totalTopicsCount}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody p={4}>
            <Stat>
              <StatLabel color="gray.400" fontSize="xs">Subtopics Completed</StatLabel>
              <StatNumber color="cyan.300" fontSize="2xl">
                {completedSubtopicsCount} / {totalSubtopicsCount}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody p={4}>
            <Stat>
              <StatLabel color="gray.400" fontSize="xs">Quizzes Attempted</StatLabel>
              <StatNumber color="emerald.300" fontSize="2xl">
                {completedQuizzesCount} / {totalQuizzesCount}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody p={4}>
            <Stat>
              <StatLabel color="gray.400" fontSize="xs">Assessments Solved</StatLabel>
              <StatNumber color="amber.300" fontSize="2xl">
                {completedAssessmentsCount} / {Math.max(1, totalAssessmentsCount)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Topic Progress Accordion */}
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color="white">Topic Progress Details</Heading>
        {topicsProgress && topicsProgress.length > 0 ? (
          <Accordion allowMultiple defaultIndex={[0]}>
            {topicsProgress.map((tp) => (
              <AccordionItem
                key={tp.topic_id}
                border="1px solid"
                borderColor="slate.700"
                bg="slate.800"
                borderRadius="xl"
                mb={4}
                overflow="hidden"
              >
                <AccordionButton p={4} _hover={{ bg: 'slate.750' }}>
                  <Box flex="1" textAlign="left">
                    <HStack justify="space-between" pr={4} flexWrap="wrap">
                      <VStack align="start" spacing={0}>
                        <Text color="white" fontWeight="bold" fontSize="md">{tp.title}</Text>
                        <Text color="gray.400" fontSize="xs">{tp.subtopicsCompleted}/{tp.subtopicsCount} subtopics finished</Text>
                      </VStack>
                      <HStack spacing={4}>
                        <Badge colorScheme={tp.status === 'Completed' ? 'green' : tp.status === 'In Progress' ? 'purple' : 'gray'}>
                          {tp.status}
                        </Badge>
                        <Text color="purple.300" fontWeight="bold" fontSize="sm">{tp.progressPercentage}%</Text>
                      </HStack>
                    </HStack>
                  </Box>
                  <AccordionIcon color="gray.400" />
                </AccordionButton>
                <AccordionPanel p={5} bg="slate.850" borderTop="1px solid" borderColor="slate.700">
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                    <Box p={3} bg="slate.900" borderRadius="lg">
                      <Text fontSize="xs" color="gray.400" fontWeight="bold">PREREQUISITE</Text>
                      <Text fontSize="sm" color="white" mt={1}>{tp.prereqCompleted ? '✓ Completed' : 'Pending'}</Text>
                    </Box>
                    <Box p={3} bg="slate.900" borderRadius="lg">
                      <Text fontSize="xs" color="gray.400" fontWeight="bold">SUBTOPICS</Text>
                      <Text fontSize="sm" color="white" mt={1}>{tp.subtopicsCompleted} / {tp.subtopicsCount} Completed</Text>
                    </Box>
                    <Box p={3} bg="slate.900" borderRadius="lg">
                      <Text fontSize="xs" color="gray.400" fontWeight="bold">FINAL QUIZ</Text>
                      <Text fontSize="sm" color="white" mt={1}>{tp.finalQuizCompleted ? `Score: ${tp.finalQuizScore}/${tp.finalQuizTotal}` : 'Pending'}</Text>
                    </Box>
                    <Box p={3} bg="slate.900" borderRadius="lg">
                      <Text fontSize="xs" color="gray.400" fontWeight="bold">CODING ASSESSMENT</Text>
                      <Text fontSize="sm" color="white" mt={1}>{tp.codingCompleted ? `Score: ${tp.codingScore}/${tp.codingTotal}` : 'Pending'}</Text>
                    </Box>
                  </SimpleGrid>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <EmptyState title="No Topics Enrolled" description="Student is not currently enrolled in any topics." />
        )}
      </VStack>

      {/* Quiz Attempt History Table */}
      {recentActivity && recentActivity.length > 0 && (
        <VStack align="stretch" spacing={3}>
          <Heading size="md" color="white">Quiz Activity History</Heading>
          <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
            <CardBody p={0}>
              <Table variant="simple" size="sm">
                <Thead bg="slate.900">
                  <Tr>
                    <Th color="gray.400">Quiz Title</Th>
                    <Th color="gray.400">Score</Th>
                    <Th color="gray.400">Percentage</Th>
                    <Th color="gray.400">Result</Th>
                    <Th color="gray.400">Submitted At</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentActivity.map((act) => (
                    <Tr key={act.attempt_id} _hover={{ bg: 'slate.750' }}>
                      <Td color="white" fontWeight="medium">{act.activity_title}</Td>
                      <Td color="gray.300">{act.score} / {act.total_marks}</Td>
                      <Td color="purple.300" fontWeight="bold">{act.percentage}%</Td>
                      <Td>
                        <Badge colorScheme={act.passed ? 'green' : 'yellow'}>
                          {act.passed ? 'PASSED' : 'COMPLETED'}
                        </Badge>
                      </Td>
                      <Td color="gray.400" fontSize="xs">{new Date(act.submitted_at).toLocaleString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </VStack>
      )}
    </VStack>
  );
};

export default StudentProgressDetail;
