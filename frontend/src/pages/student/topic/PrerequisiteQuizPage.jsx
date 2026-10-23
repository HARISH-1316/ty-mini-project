// ──────────────────────────────────────────────
// Prerequisite Quiz Page — Interactive Assessment
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
import { CheckCircleIcon, TimeIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { getPrerequisiteQuizApi, startPrerequisiteAttemptApi, submitQuizAttemptApi } from '../../../api/quizApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import QuizAttempt from '../../../components/quiz/QuizAttempt';
import QuizResult from '../../../components/quiz/QuizResult';

const PrerequisiteQuizPage = () => {
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
      const data = await getPrerequisiteQuizApi(topicId);
      setQuizData(data.data || null);
    } catch (err) {
      toast({
        title: 'Error loading prerequisite quiz',
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
  }, [topicId]);

  const handleStartAttempt = async () => {
    try {
      setIsStarting(true);
      const data = await startPrerequisiteAttemptApi(topicId);
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
    return <LoadingSpinner label="Loading prerequisite quiz..." />;
  }

  // 1. Result View
  if (result) {
    return (
      <QuizResult
        quizTitle={quizData?.quiz?.title || `${topic?.title} — Prerequisite Quiz`}
        result={result}
        onRetake={handleStartAttempt}
        onBack={() => navigate(`/student/topics/${topicId}/introduction`)}
        backButtonLabel="Back to Topic"
      />
    );
  }

  // 2. Active Quiz Taking View
  if (attempt && quizData?.questions) {
    return (
      <QuizAttempt
        quizTitle={quizData.quiz?.title || 'Prerequisite Quiz'}
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
        <Heading size="lg" color="text.primary">
          Prerequisite Quiz
        </Heading>
        <Text color="text.secondary" fontSize="sm">
          {topic?.title}
        </Text>
      </VStack>

      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
        <CardBody p={{ base: 6, md: 8 }}>
          <VStack spacing={6} textAlign="center" py={4} maxW="lg" mx="auto">
            <Box p={4} borderRadius="full" bg="bg.surface" border="1px solid" borderColor="border.primary" display="inline-flex">
              <Icon as={CheckCircleIcon} w={8} h={8} color="brand.500" />
            </Box>

            <VStack spacing={2}>
              <Heading size="md" color="text.primary">
                {quizData?.quiz?.title || 'Prerequisite Self-Assessment'}
              </Heading>
              <Text color="text.secondary" fontSize="sm">
                Test your fundamental knowledge and preparedness before learning this module.
              </Text>
            </VStack>

            {/* Metrics */}
            <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={3} w="full">
              <Box p={3} bg="bg.surface" borderRadius="xl" border="1px solid" borderColor="border.primary">
                <Text fontSize="xl" fontWeight="bold" color="accent.primary">
                  {questionsCount}
                </Text>
                <Text fontSize="xs" color="text.secondary">Questions</Text>
              </Box>
              <Box p={3} bg="bg.surface" borderRadius="xl" border="1px solid" borderColor="border.primary">
                <Text fontSize="xl" fontWeight="bold" color="brand.500">
                  {totalMarks}
                </Text>
                <Text fontSize="xs" color="text.secondary">Total Marks</Text>
              </Box>
              <Box p={3} bg="bg.surface" borderRadius="xl" border="1px solid" borderColor="border.primary">
                <Text fontSize="xl" fontWeight="bold" color="brand.600">
                  {timeLimit} mins
                </Text>
                <Text fontSize="xs" color="text.secondary">Time Limit</Text>
              </Box>
              <Box p={3} bg="bg.surface" borderRadius="xl" border="1px solid" borderColor="border.primary">
                <Text fontSize="xl" fontWeight="bold" color="brand.500">
                  {quizData?.quiz?.passing_criteria || 50}%
                </Text>
                <Text fontSize="xs" color="text.secondary">Passing Criteria</Text>
              </Box>
            </SimpleGrid>

            {questionsCount === 0 ? (
              <EmptyState
                title="No Questions Available"
                description="Your instructor has not added questions to this prerequisite quiz yet."
              />
            ) : (
              <Button
                size="lg"
                colorScheme="brand"
                rightIcon={<ArrowForwardIcon />}
                onClick={handleStartAttempt}
                isLoading={isStarting}
                loadingText="Preparing Quiz..."
                px={8}
              >
                Start Prerequisite Quiz
              </Button>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default PrerequisiteQuizPage;
