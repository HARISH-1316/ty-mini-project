// ──────────────────────────────────────────────
// Final Quiz Page — Module Comprehensive Assessment
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  Box,
  Badge,
  Button,
  useToast,
  HStack,
  SimpleGrid,
  Icon,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { TimeIcon, CheckCircleIcon, ArrowForwardIcon, InfoIcon } from '@chakra-ui/icons';
import { getFinalQuizApi, startFinalAttemptApi, submitQuizAttemptApi } from '../../../api/quizApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import QuizAttempt from '../../../components/quiz/QuizAttempt';
import QuizResult from '../../../components/quiz/QuizResult';

const FinalQuizPage = () => {
  const { topic, topicId } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();

  const [quizData, setQuizData] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuizInfo = async () => {
    try {
      setIsLoading(true);
      const data = await getFinalQuizApi(topicId);
      setQuizData(data.data || null);
    } catch (err) {
      toast({
        title: 'Error loading final quiz',
        description: err.response?.data?.message || 'Could not fetch final quiz details.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizInfo();
  }, [topicId]);

  const handleStartAttempt = async () => {
    try {
      setIsStarting(true);
      const data = await startFinalAttemptApi(topicId);
      setAttempt(data.data?.attempt || null);
      setQuizData((prev) => ({
        ...prev,
        questions: data.data?.questions || prev?.questions || [],
      }));
      setResult(null);
    } catch (err) {
      toast({
        title: 'Could not start quiz',
        description: err.response?.data?.message || 'Failed to initialize final quiz attempt.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAttempt = async (answers) => {
    if (!attempt) return;
    try {
      setIsSubmitting(true);
      const res = await submitQuizAttemptApi(attempt.attempt_id, answers);
      setResult(res.data);
      setAttempt(null);
      toast({
        title: 'Final Quiz Submitted! 🎉',
        description: `Your score: ${res.data?.score} / ${res.data?.totalMarks} (${res.data?.percentage}%)`,
        status: res.data?.passed ? 'success' : 'info',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Submission Failed',
        description: err.response?.data?.message || 'Could not submit final quiz answers.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading final quiz details..." />;
  }

  // 1. Result View
  if (result) {
    return (
      <QuizResult
        quizTitle={quizData?.quiz?.title || `${topic?.title} — Final Quiz`}
        result={result}
        onRetake={handleStartAttempt}
        onBack={() => navigate(`/student/topics/${topicId}/introduction`)}
        backButtonLabel="Back to Topic"
      />
    );
  }

  // 2. Active Timed Quiz Taking View
  if (attempt && quizData?.questions) {
    return (
      <QuizAttempt
        quizTitle={quizData.quiz?.title || 'Final Module Quiz'}
        questions={quizData.questions}
        timeLimit={quizData.quiz?.time_limit || 15}
        onSubmit={handleSubmitAttempt}
        isSubmitting={isSubmitting}
      />
    );
  }

  // 3. Quiz Overview / Intro View
  const questionsCount = quizData?.questions?.length || 0;
  const totalMarks = quizData?.quiz?.total_marks || questionsCount;
  const timeLimit = quizData?.quiz?.time_limit || 15;

  return (
    <VStack spacing={6} align="stretch" w="full">
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="white">
          Final Module Quiz
        </Heading>
        <Text color="gray.400" fontSize="sm">
          {topic?.title}
        </Text>
      </VStack>

      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody p={{ base: 6, md: 8 }}>
          <VStack spacing={6} textAlign="center" py={4} maxW="lg" mx="auto">
            <Box p={4} borderRadius="full" bg="slate.900" display="inline-flex">
              <Icon as={TimeIcon} w={8} h={8} color="purple.400" />
            </Box>

            <VStack spacing={2}>
              <Heading size="md" color="white">
                {quizData?.quiz?.title || 'Comprehensive Topic Assessment'}
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Evaluate your overall mastery across all subtopics in this module under timed conditions.
              </Text>
            </VStack>

            {/* Metrics */}
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} w="full">
              <Box p={4} bg="slate.900" borderRadius="xl" border="1px solid" borderColor="slate.700">
                <Text fontSize="2xl" fontWeight="bold" color="purple.300">
                  {questionsCount}
                </Text>
                <Text fontSize="xs" color="gray.400">Total Questions</Text>
              </Box>
              <Box p={4} bg="slate.900" borderRadius="xl" border="1px solid" borderColor="slate.700">
                <Text fontSize="2xl" fontWeight="bold" color="cyan.300">
                  {totalMarks}
                </Text>
                <Text fontSize="xs" color="gray.400">Total Marks</Text>
              </Box>
              <Box p={4} bg="slate.900" borderRadius="xl" border="1px solid" borderColor="slate.700">
                <Text fontSize="2xl" fontWeight="bold" color="amber.300">
                  {timeLimit} mins
                </Text>
                <Text fontSize="xs" color="gray.400">Time Limit</Text>
              </Box>
            </SimpleGrid>

            {/* Guidelines */}
            <Box p={4} bg="slate.900" borderRadius="xl" border="1px solid" borderColor="slate.700" textAlign="left" w="full">
              <Text fontSize="xs" fontWeight="bold" color="purple.300" textTransform="uppercase" letterSpacing="wider" mb={2}>
                Exam Guidelines
              </Text>
              <List spacing={2} fontSize="xs" color="gray.300">
                <ListItem>
                  <ListIcon as={InfoIcon} color="purple.400" />
                  Once started, the countdown timer of {timeLimit} minutes will begin immediately.
                </ListItem>
                <ListItem>
                  <ListIcon as={InfoIcon} color="purple.400" />
                  When the timer expires, your answers will be automatically submitted.
                </ListItem>
                <ListItem>
                  <ListIcon as={InfoIcon} color="purple.400" />
                  You can navigate between questions freely and change answers before submitting.
                </ListItem>
              </List>
            </Box>

            {questionsCount === 0 ? (
              <EmptyState
                title="No Questions Available"
                description="Your instructor has not configured final quiz questions for this topic yet."
              />
            ) : (
              <Button
                size="lg"
                colorScheme="brand"
                rightIcon={<ArrowForwardIcon />}
                onClick={handleStartAttempt}
                isLoading={isStarting}
                loadingText="Starting Exam..."
                px={8}
              >
                Start Final Quiz Now
              </Button>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default FinalQuizPage;
