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
          borderColor="border.primary"
          color="text.primary"
          _hover={{ bg: 'bg.secondary' }}
          onClick={() => navigate(backRoute)}
        >
          Back to Student List
        </Button>
        <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
          {isFaculty ? 'Faculty Student Inspector' : 'Admin Global Inspector'}
        </Badge>
      </HStack>

      {/* Student Profile Card */}
      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
        <CardBody p={6}>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} alignItems="center">
            <VStack align="start" spacing={1} gridColumn={{ md: 'span 2' }}>
              <Heading size="md" color="text.primary">{student?.name || 'Student'}</Heading>
              <Text color="text.secondary" fontSize="sm">{student?.email}</Text>
              <HStack spacing={2} pt={2}>
                <Tag colorScheme="cyan" size="sm">Roll No: {student?.roll_number || 'N/A'}</Tag>
                <Tag colorScheme="purple" size="sm">{student?.course || 'Engineering'} • Year {student?.year || '1'}</Tag>
              </HStack>
            </VStack>

            <Box p={4} bg="bg.surface" borderRadius="xl" border="1px solid" borderColor="border.primary" textAlign="center">
              <Text fontSize="xs" color="text.secondary" fontWeight="bold">OVERALL PROGRESS</Text>
              <Text fontSize="3xl" fontWeight="bold" color="accent.primary" my={1}>{overallProgress}%</Text>
              <Progress
                value={overallProgress}
                colorScheme={overallProgress === 100 ? 'green' : 'purple'}
                size="xs"
                borderRadius="full"
              />
            </Box>

            <Box p={4} bg="bg.surface" borderRadius="xl" border="1px solid" borderColor="border.primary" textAlign="center">
              <Text fontSize="xs" color="text.secondary" fontWeight="bold">TIME INVESTED</Text>
              <Text fontSize="3xl" fontWeight="bold" color="brand.500" my={1}>{totalTimeSpent}</Text>
              <Text fontSize="xs" color="text.secondary">Total Minutes</Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Metric Breakdown Stats */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody p={4}>
            <Stat>
              <StatLabel color="text.secondary" fontSize="xs">Topics Completed</StatLabel>
              <StatNumber color="accent.primary" fontSize="2xl">
                {completedTopicsCount} / {totalTopicsCount}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody p={4}>
            <Stat>
              <StatLabel color="text.secondary" fontSize="xs">Subtopics Completed</StatLabel>
              <StatNumber color="brand.500" fontSize="2xl">
                {completedSubtopicsCount} / {totalSubtopicsCount}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody p={4}>
            <Stat>
              <StatLabel color="text.secondary" fontSize="xs">Quizzes Attempted</StatLabel>
              <StatNumber color="green.500" fontSize="2xl">
                {completedQuizzesCount} / {totalQuizzesCount}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody p={4}>
            <Stat>
              <StatLabel color="text.secondary" fontSize="xs">Assessments Solved</StatLabel>
              <StatNumber color="amber.500" fontSize="2xl">
                {completedAssessmentsCount} / {Math.max(1, totalAssessmentsCount)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Topic Progress Accordion */}
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color="text.primary">Topic Progress Details</Heading>
        {topicsProgress && topicsProgress.length > 0 ? (
          <Accordion allowMultiple defaultIndex={[0]}>
            {topicsProgress.map((tp) => (
              <AccordionItem
                key={tp.topic_id}
                border="1px solid"
                borderColor="border.primary"
                bg="bg.card"
                borderRadius="xl"
                mb={4}
                overflow="hidden"
              >
                <AccordionButton p={4} _hover={{ bg: 'bg.secondary' }}>
                  <Box flex="1" textAlign="left">
                    <HStack justify="space-between" pr={4} flexWrap="wrap">
                      <VStack align="start" spacing={0}>
                        <Text color="text.primary" fontWeight="bold" fontSize="md">{tp.title}</Text>
                        <Text color="text.secondary" fontSize="xs">{tp.subtopicsCompleted}/{tp.subtopicsCount} subtopics finished</Text>
                      </VStack>
                      <HStack spacing={4}>
                        <Badge colorScheme={tp.status === 'Completed' ? 'green' : tp.status === 'In Progress' ? 'purple' : 'gray'}>
                          {tp.status}
                        </Badge>
                        <Text color="accent.primary" fontWeight="bold" fontSize="sm">{tp.progressPercentage}%</Text>
                      </HStack>
                    </HStack>
                  </Box>
                  <AccordionIcon color="text.secondary" />
                </AccordionButton>
                <AccordionPanel p={5} bg="bg.surface" borderTop="1px solid" borderColor="border.primary">
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                    <Box p={3} bg="bg.card" borderRadius="lg" border="1px solid" borderColor="border.primary">
                      <Text fontSize="xs" color="text.secondary" fontWeight="bold">PREREQUISITE</Text>
                      <Text fontSize="sm" color="text.primary" mt={1}>{tp.prereqCompleted ? '✓ Completed' : 'Pending'}</Text>
                    </Box>
                    <Box p={3} bg="bg.card" borderRadius="lg" border="1px solid" borderColor="border.primary">
                      <Text fontSize="xs" color="text.secondary" fontWeight="bold">SUBTOPICS</Text>
                      <Text fontSize="sm" color="text.primary" mt={1}>{tp.subtopicsCompleted} / {tp.subtopicsCount} Completed</Text>
                    </Box>
                    <Box p={3} bg="bg.card" borderRadius="lg" border="1px solid" borderColor="border.primary">
                      <Text fontSize="xs" color="text.secondary" fontWeight="bold">FINAL QUIZ</Text>
                      <Text fontSize="sm" color="text.primary" mt={1}>{tp.finalQuizCompleted ? `Score: ${tp.finalQuizScore}/${tp.finalQuizTotal}` : 'Pending'}</Text>
                    </Box>
                    <Box p={3} bg="bg.card" borderRadius="lg" border="1px solid" borderColor="border.primary">
                      <Text fontSize="xs" color="text.secondary" fontWeight="bold">CODING ASSESSMENT</Text>
                      <Text fontSize="sm" color="text.primary" mt={1}>{tp.codingCompleted ? `Score: ${tp.codingScore}/${tp.codingTotal}` : 'Pending'}</Text>
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
          <Heading size="md" color="text.primary">Quiz Activity History</Heading>
          <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
            <CardBody p={0}>
              <Table variant="simple" size="sm">
                <Thead bg="bg.surface">
                  <Tr>
                    <Th color="text.secondary">Quiz Title</Th>
                    <Th color="text.secondary">Score</Th>
                    <Th color="text.secondary">Percentage</Th>
                    <Th color="text.secondary">Result</Th>
                    <Th color="text.secondary">Submitted At</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentActivity.map((act) => (
                    <Tr key={act.attempt_id} _hover={{ bg: 'bg.secondary' }}>
                      <Td color="text.primary" fontWeight="medium">{act.activity_title}</Td>
                      <Td color="text.secondary">{act.score} / {act.total_marks}</Td>
                      <Td color="accent.primary" fontWeight="bold">{act.percentage}%</Td>
                      <Td>
                        <Badge colorScheme={act.passed ? 'green' : 'yellow'}>
                          {act.passed ? 'PASSED' : 'COMPLETED'}
                        </Badge>
                      </Td>
                      <Td color="text.secondary" fontSize="xs">{new Date(act.submitted_at).toLocaleString()}</Td>
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
