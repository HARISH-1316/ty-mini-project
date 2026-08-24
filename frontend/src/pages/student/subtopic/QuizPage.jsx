// ──────────────────────────────────────────────
// Subtopic Quiz Page — Subtopic Mastery Assessment
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
} from '@chakra-ui/react';
import { CheckCircleIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { getSubtopicQuizApi, startSubtopicAttemptApi, submitQuizAttemptApi } from '../../../api/quizApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import QuizAttempt from '../../../components/quiz/QuizAttempt';
import QuizResult from '../../../components/quiz/QuizResult';

const QuizPage = () => {
  const { subtopic, subtopicId, topicId } = useOutletContext();
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
      const data = await getSubtopicQuizApi(subtopicId);
      setQuizData(data.data || null);
    } catch (err) {
      toast({
        title: 'Error loading subtopic quiz',
        description: err.response?.data?.message || 'Could not fetch quiz details.',
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
  }, [subtopicId]);

  const handleStartAttempt = async () => {
    try {
      setIsStarting(true);
      const data = await startSubtopicAttemptApi(subtopicId);
      setAttempt(data.data?.attempt || null);
      setQuizData((prev) => ({
        ...prev,
        questions: data.data?.questions || prev?.questions || [],
      }));
      setResult(null);
    } catch (err) {
      toast({
        title: 'Could not start quiz',
        description: err.response?.data?.message || 'Failed to initialize quiz attempt.',
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
        title: 'Quiz Submitted! 🎉',
        description: `Your score: ${res.data?.score} / ${res.data?.totalMarks} (${res.data?.percentage}%)`,
        status: res.data?.passed ? 'success' : 'info',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Submission Failed',
        description: err.response?.data?.message || 'Could not submit quiz answers.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading subtopic quiz..." />;
  }

  // 1. Result View
  if (result) {
    return (
      <QuizResult
        quizTitle={`${subtopic?.title || 'Subtopic'} — Quiz Assessment`}
        result={result}
        onRetake={handleStartAttempt}
        onBack={() => navigate(`/student/topics/${topicId}/subtopics/${subtopicId}/theory`)}
        backButtonLabel="Back to Theory"
      />
    );
  }

  // 2. Active Quiz Taking View
  if (attempt && quizData?.questions) {
    return (
      <QuizAttempt
        quizTitle={`${subtopic?.title} — Quiz`}
        questions={quizData.questions}
        timeLimit={quizData.time_limit || 15}
        onSubmit={handleSubmitAttempt}
        isSubmitting={isSubmitting}
      />
    );
  }

  // 3. Quiz Overview / Intro View
  const questionsCount = quizData?.questions?.length || 0;
  const totalMarks = quizData?.total_marks || questionsCount;
  const timeLimit = quizData?.time_limit || 15;

  return (
    <VStack spacing={6} align="stretch" w="full">
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="white">
          {subtopic?.title} — Practice Quiz
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Evaluate your understanding of the concepts covered in this subtopic.
        </Text>
      </VStack>

      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody p={{ base: 6, md: 8 }}>
          <VStack spacing={6} textAlign="center" py={4} maxW="lg" mx="auto">
            <Box p={4} borderRadius="full" bg="slate.900" display="inline-flex">
              <Icon as={CheckCircleIcon} w={8} h={8} color="purple.400" />
            </Box>

            <VStack spacing={2}>
              <Heading size="md" color="white">
                Concept Review Quiz
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Complete this multiple-choice quiz to solidify your understanding.
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

            {questionsCount === 0 ? (
              <EmptyState
                title="No Questions Available"
                description="Your instructor has not configured quiz questions for this subtopic yet."
              />
            ) : (
              <Button
                size="lg"
                colorScheme="purple"
                bgGradient="linear(to-r, purple.500, pink.500)"
                _hover={{ bgGradient: 'linear(to-r, purple.600, pink.600)' }}
                rightIcon={<ArrowForwardIcon />}
                onClick={handleStartAttempt}
                isLoading={isStarting}
                loadingText="Preparing Quiz..."
                px={8}
              >
                Start Subtopic Quiz
              </Button>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default QuizPage;
