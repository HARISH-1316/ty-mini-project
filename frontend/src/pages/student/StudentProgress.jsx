// ──────────────────────────────────────────────
// Student Progress Dashboard — Data-Driven Learning Tracker
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  useToast,
  Divider,
  Flex,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  TimeIcon,
  ArrowForwardIcon,
  StarIcon,
  CheckIcon,
  CloseIcon,
  MinusIcon,
} from '@chakra-ui/icons';
import { getMyOverallProgressApi } from '../../api/progressApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StudentProgress = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await getMyOverallProgressApi();
        setData(res.data);
      } catch (err) {
        toast({
          title: 'Error loading progress',
          description: err.response?.data?.message || 'Could not fetch your learning progress.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [toast]);

  if (isLoading) {
    return <LoadingSpinner label="Aggregating your learning progress..." />;
  }

  if (!data || data.totalTopicsCount === 0) {
    return (
      <VStack spacing={6} align="stretch" w="full">
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="text.primary">My Progress</Heading>
          <Text color="text.secondary" fontSize="sm">Track your completed topics, quizzes, and coding assessments</Text>
        </VStack>
        <EmptyState
          title="No Progress Recorded"
          description="Start learning to see your progress here. Join a room and begin exploring assigned topics!"
          actionLabel="Go to My Rooms"
          onAction={() => navigate('/student/rooms')}
        />
      </VStack>
    );
  }

  const {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge colorScheme="green" px={2.5} py={0.5} borderRadius="full">Completed</Badge>;
      case 'In Progress':
        return <Badge colorScheme="purple" px={2.5} py={0.5} borderRadius="full">In Progress</Badge>;
      default:
        return <Badge colorScheme="gray" px={2.5} py={0.5} borderRadius="full">Not Started</Badge>;
    }
  };

  const getQuizStatusBadge = (status, score, total) => {
    switch (status) {
      case 'PASSED':
        return (
          <HStack spacing={1}>
            <Badge colorScheme="green" px={2} py={0.5} borderRadius="md">
              ✓ PASSED {score !== null && total ? `— ${score}/${total}` : ''}
            </Badge>
          </HStack>
        );
      case 'FAILED':
        return (
          <HStack spacing={1}>
            <Badge colorScheme="red" px={2} py={0.5} borderRadius="md">
              ✗ FAILED {score !== null && total ? `— ${score}/${total}` : ''}
            </Badge>
          </HStack>
        );
      case 'ATTEMPTED':
        return (
          <HStack spacing={1}>
            <Badge colorScheme="yellow" px={2} py={0.5} borderRadius="md">
              ○ ATTEMPTED {score !== null && total ? `— ${score}/${total}` : ''}
            </Badge>
          </HStack>
        );
      default:
        return (
          <Badge colorScheme="gray" px={2} py={0.5} borderRadius="md">
            NOT ATTEMPTED
          </Badge>
        );
    }
  };

  const getCodingStatusBadge = (status, score, total) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge colorScheme="green" px={2} py={0.5} borderRadius="md">
            ✓ COMPLETED {score !== null && total ? `— ${score}/${total}` : ''}
          </Badge>
        );
      case 'ATTEMPTED':
        return (
          <Badge colorScheme="yellow" px={2} py={0.5} borderRadius="md">
            ○ ATTEMPTED {score !== null && total ? `— ${score}/${total}` : ''}
          </Badge>
        );
      default:
        return (
          <Badge colorScheme="gray" px={2} py={0.5} borderRadius="md">
            NOT ATTEMPTED
          </Badge>
        );
    }
  };

  return (
    <VStack spacing={8} align="stretch" w="full" pb={12}>
      {/* Header */}
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="text.primary">My Progress</Heading>
        <Text color="text.secondary" fontSize="sm">
          Comprehensive, real-time analytics across all your enrolled topics, quizzes, and coding assessments
        </Text>
      </VStack>

      {/* Main Overall Progress Banner */}
      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
        <CardBody p={{ base: 6, md: 8 }}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} alignItems="center">
            <VStack align={{ base: 'center', md: 'start' }} spacing={2} gridColumn={{ md: 'span 2' }}>
              <HStack spacing={3}>
                <Icon as={StarIcon} color="accent.primary" w={5} h={5} />
                <Heading size="md" color="text.primary">Overall Completion</Heading>
              </HStack>
              <Text color="text.secondary" fontSize="sm">
                Calculated dynamically from topic prerequisite quizzes, subtopic learning & quizzes, topic final quiz, and coding assessments.
              </Text>
              <Box w="full" pt={3}>
                <HStack justify="space-between" mb={2}>
                  <Text color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase">
                    Total Syllabus Mastered
                  </Text>
                  <Text color="purple.300" fontSize="lg" fontWeight="bold">
                    {overallProgress}%
                  </Text>
                </HStack>
                <Progress
                  value={overallProgress}
                  colorScheme={overallProgress === 100 ? 'green' : 'purple'}
                  size="lg"
                  borderRadius="full"
                  bg="slate.950"
                />
              </Box>
            </VStack>

            <Box p={4} bg="slate.900" borderRadius="2xl" border="1px solid" borderColor="slate.700" textAlign="center">
              <Text color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase">
                Time Invested
              </Text>
              <HStack justify="center" spacing={2} my={2}>
                <Icon as={TimeIcon} color="cyan.400" w={6} h={6} />
                <Text fontSize="3xl" fontWeight="bold" color="cyan.300">
                  {totalTimeSpent}
                </Text>
                <Text fontSize="sm" color="gray.400">mins</Text>
              </HStack>
              <Text color="gray.400" fontSize="xs">Active learning, quiz & coding time</Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Metric Breakdown Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody p={5}>
            <Stat>
              <StatLabel color="gray.400" fontSize="xs" fontWeight="bold">TOPICS COMPLETED</StatLabel>
              <StatNumber color="purple.300" fontSize="2xl" mt={1}>
                {completedTopicsCount} <Text as="span" fontSize="lg" color="gray.500">/ {totalTopicsCount}</Text>
              </StatNumber>
              <Progress
                value={totalTopicsCount > 0 ? (completedTopicsCount / totalTopicsCount) * 100 : 0}
                colorScheme="purple"
                size="xs"
                mt={3}
                borderRadius="full"
              />
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody p={5}>
            <Stat>
              <StatLabel color="gray.400" fontSize="xs" fontWeight="bold">SUBTOPICS MASTERED</StatLabel>
              <StatNumber color="cyan.300" fontSize="2xl" mt={1}>
                {completedSubtopicsCount} <Text as="span" fontSize="lg" color="gray.500">/ {totalSubtopicsCount}</Text>
              </StatNumber>
              <Progress
                value={totalSubtopicsCount > 0 ? (completedSubtopicsCount / totalSubtopicsCount) * 100 : 0}
                colorScheme="cyan"
                size="xs"
                mt={3}
                borderRadius="full"
              />
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody p={5}>
            <Stat>
              <StatLabel color="gray.400" fontSize="xs" fontWeight="bold">QUIZZES PASSED</StatLabel>
              <StatNumber color="emerald.300" fontSize="2xl" mt={1}>
                {completedQuizzesCount} <Text as="span" fontSize="lg" color="gray.500">/ {totalQuizzesCount}</Text>
              </StatNumber>
              <Progress
                value={totalQuizzesCount > 0 ? (completedQuizzesCount / totalQuizzesCount) * 100 : 0}
                colorScheme="green"
                size="xs"
                mt={3}
                borderRadius="full"
              />
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody p={5}>
            <Stat>
              <StatLabel color="gray.400" fontSize="xs" fontWeight="bold">CODING ASSESSMENTS</StatLabel>
              <StatNumber color="amber.300" fontSize="2xl" mt={1}>
                {completedAssessmentsCount} <Text as="span" fontSize="lg" color="gray.500">/ {Math.max(1, totalAssessmentsCount)}</Text>
              </StatNumber>
              <Progress
                value={totalAssessmentsCount > 0 ? (completedAssessmentsCount / totalAssessmentsCount) * 100 : 0}
                colorScheme="yellow"
                size="xs"
                mt={3}
                borderRadius="full"
              />
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Recent Activity Timeline */}
      {recentActivity && recentActivity.length > 0 && (
        <VStack align="stretch" spacing={3}>
          <Heading size="md" color="text.primary">Recent Activity</Heading>
          <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
            <CardBody p={4}>
              <VStack spacing={3} align="stretch" divider={<Divider borderColor="border.primary" />}>
                {recentActivity.map((act) => (
                  <HStack key={act.attempt_id} justify="space-between" flexWrap="wrap">
                    <HStack spacing={3}>
                      <Icon as={CheckCircleIcon} color={act.passed ? 'green.400' : 'purple.400'} />
                      <VStack align="start" spacing={0}>
                        <Text color="text.primary" fontWeight="semibold" fontSize="sm">
                          {act.activity_title}
                        </Text>
                        <Text color="text.secondary" fontSize="xs">
                          {new Date(act.submitted_at).toLocaleDateString()} at {new Date(act.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack spacing={3}>
                      <Tag size="sm" colorScheme="purple" variant="subtle">
                        Score: {act.score} / {act.total_marks} ({act.percentage}%)
                      </Tag>
                      <Badge colorScheme={act.passed ? 'green' : 'yellow'} variant="solid">
                        {act.passed ? 'PASSED' : 'ATTEMPTED'}
                      </Badge>
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      )}

      {/* Topic-Wise Detailed Progress Breakdown */}
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Heading size="md" color="text.primary">Topic Progress Details</Heading>
          <Text fontSize="xs" color="text.secondary">Click any topic to view subtopics, quiz & coding assessment breakdown</Text>
        </HStack>

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
              <AccordionButton p={5} _hover={{ bg: 'accent.soft' }}>
                <Box flex="1" textAlign="left">
                  <HStack justify="space-between" pr={4} flexWrap="wrap" spacing={3}>
                    <VStack align="start" spacing={1}>
                      <HStack spacing={2}>
                        <Text color="text.primary" fontWeight="bold" fontSize="md">
                          {tp.title}
                        </Text>
                        {getStatusBadge(tp.status)}
                      </HStack>
                      <Text color="text.secondary" fontSize="xs">
                        {tp.subtopicsCompleted} of {tp.subtopicsCount} subtopics completed
                      </Text>
                    </VStack>

                    <HStack spacing={4}>
                      <Box w="140px">
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="xs" color="gray.400">Progress</Text>
                          <Text fontSize="xs" fontWeight="bold" color="purple.300">
                            {tp.progressPercentage}%
                          </Text>
                        </HStack>
                        <Progress
                          value={tp.progressPercentage}
                          colorScheme={tp.progressPercentage === 100 ? 'green' : 'purple'}
                          size="xs"
                          borderRadius="full"
                        />
                      </Box>
                    </HStack>
                  </HStack>
                </Box>
                <AccordionIcon color="gray.400" />
              </AccordionButton>

              <AccordionPanel pb={6} px={6} pt={2} bg="slate.850" borderTop="1px solid" borderColor="slate.700">
                <VStack spacing={6} align="stretch">
                  {/* Topic Quizzes & Assessment Summary Bar */}
                  <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} pt={2}>
                    <Box p={4} bg="slate.900" borderRadius="lg" border="1px solid" borderColor="slate.750">
                      <Text fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
                        Prerequisite Quiz
                      </Text>
                      <Box mt={2}>
                        {getQuizStatusBadge(tp.prereqStatus, tp.prereqScore, tp.prereqTotal)}
                      </Box>
                      {tp.prereqAttemptsCount > 0 && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {tp.prereqAttemptsCount} attempt(s) recorded
                        </Text>
                      )}
                    </Box>

                    <Box p={4} bg="slate.900" borderRadius="lg" border="1px solid" borderColor="slate.750">
                      <Text fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
                        Final Topic Quiz
                      </Text>
                      <Box mt={2}>
                        {getQuizStatusBadge(tp.finalQuizStatus, tp.finalQuizScore, tp.finalQuizTotal)}
                      </Box>
                      {tp.finalAttemptsCount > 0 && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {tp.finalAttemptsCount} attempt(s) recorded
                        </Text>
                      )}
                    </Box>

                    <Box p={4} bg="slate.900" borderRadius="lg" border="1px solid" borderColor="slate.750">
                      <Text fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
                        Topic Coding Assessment
                      </Text>
                      <Box mt={2}>
                        {getCodingStatusBadge(tp.codingStatus, tp.codingScore, tp.codingTotal)}
                      </Box>
                    </Box>
                  </SimpleGrid>

                  {/* Subtopics Checklist & Subtopic Quizzes */}
                  {tp.subtopics && tp.subtopics.length > 0 && (
                    <VStack align="stretch" spacing={3}>
                      <Text fontSize="xs" color="purple.300" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                        Subtopics & Practice Assessments
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {tp.subtopics.map((st, sIdx) => (
                          <Box
                            key={st.subtopic_id}
                            p={3.5}
                            bg="bg.secondary"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="border.primary"
                          >
                            <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                              <HStack spacing={3}>
                                <Tag size="sm" colorScheme="gray">
                                  {sIdx + 1}
                                </Tag>
                                <Text color="text.primary" fontSize="sm" fontWeight="medium">
                                  {st.title}
                                </Text>
                                <Badge
                                  colorScheme={
                                    st.status === 'Completed' ? 'green' : st.status === 'In Progress' ? 'purple' : 'gray'
                                  }
                                  fontSize="2xs"
                                >
                                  {st.status === 'Completed' ? '✓ Completed' : st.status === 'In Progress' ? '○ In Progress' : 'Not Started'}
                                </Badge>
                              </HStack>

                              <HStack spacing={3}>
                                <HStack spacing={1}>
                                  <Text fontSize="xs" color="gray.400">Quiz:</Text>
                                  {getQuizStatusBadge(st.quizStatus, st.quizScore, st.quizTotal)}
                                </HStack>
                              </HStack>
                            </Flex>
                          </Box>
                        ))}
                      </VStack>
                    </VStack>
                  )}

                  <HStack justify="flex-end" pt={2}>
                    <Button
                      size="sm"
                      colorScheme="purple"
                      rightIcon={<ArrowForwardIcon />}
                      onClick={() => navigate(`/student/topics/${tp.topic_id}`)}
                    >
                      Go to Topic
                    </Button>
                  </HStack>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </VStack>
    </VStack>
  );
};

export default StudentProgress;
