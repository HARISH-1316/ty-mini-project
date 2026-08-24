// ──────────────────────────────────────────────
// Final Topic Coding Assessment Page
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import {
  VStack,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';
import { getCodingQuestionsApi } from '../../../api/editorApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import CodingWorkspace from '../../../components/editor/CodingWorkspace';

const FinalAssessmentPage = () => {
  const { topic, topicId } = useOutletContext();
  const { roomId } = useParams();
  const toast = useToast();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!topicId) return;

      try {
        setIsLoading(true);
        const res = await getCodingQuestionsApi({
          roomId,
          assessmentType: 'topic',
          refId: topicId,
        });
        setQuestions(res.data?.questions || []);
      } catch (err) {
        toast({
          title: 'Error loading assessment questions',
          description: err.response?.data?.message || 'Could not fetch coding questions.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [topicId, roomId, toast]);

  if (isLoading) {
    return <LoadingSpinner label="Loading topic coding assessment..." />;
  }

  if (!questions || questions.length === 0) {
    return (
      <VStack spacing={6} align="stretch" w="full">
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="white">
            {topic?.title || 'Topic'} — Final Coding Assessment
          </Heading>
          <Text color="gray.400" fontSize="sm">
            Comprehensive practical coding evaluation.
          </Text>
        </VStack>

        <EmptyState
          title="No Assessment Questions Configured"
          description="Your instructor has not configured topic coding questions for this module yet."
        />
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch" w="full">
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="white">
          {topic?.title} — Final Coding Assessment
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Solve these programming challenges to demonstrate your practical problem-solving mastery in this topic.
        </Text>
      </VStack>

      <CodingWorkspace
        assessmentTitle={`${topic?.title} Final Coding Assessment`}
        questions={questions}
        assessmentType="topic"
        roomId={roomId}
      />
    </VStack>
  );
};

export default FinalAssessmentPage;
