// ──────────────────────────────────────────────
// Subtopic Coding Assessment Page
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

const CodingAssessmentPage = () => {
  const { subtopic, content, subtopicId } = useOutletContext();
  const { roomId } = useParams();
  const toast = useToast();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!content || !content.content_id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await getCodingQuestionsApi({
          roomId,
          assessmentType: 'subtopic',
          refId: content.content_id,
        });
        setQuestions(res.data?.questions || []);
      } catch (err) {
        toast({
          title: 'Error loading coding questions',
          description: err.response?.data?.message || 'Could not fetch assessment questions.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [content, subtopicId, roomId, toast]);

  if (isLoading) {
    return <LoadingSpinner label="Loading coding assessment..." />;
  }

  if (!questions || questions.length === 0) {
    return (
      <VStack spacing={6} align="stretch" w="full">
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="white">
            {subtopic?.title || 'Subtopic'} — Coding Practice
          </Heading>
          <Text color="gray.400" fontSize="sm">
            Hands-on programming challenges for this module.
          </Text>
        </VStack>

        <EmptyState
          title="No Coding Questions Available"
          description="Your instructor has not configured coding questions for this subtopic yet."
        />
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch" w="full">
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="white">
          {subtopic?.title} — Coding Assessment
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Write and run real code against test cases in the sandboxed execution environment.
        </Text>
      </VStack>

      <CodingWorkspace
        assessmentTitle={`${subtopic?.title} Coding Practice`}
        questions={questions}
        assessmentType="subtopic"
        roomId={roomId}
      />
    </VStack>
  );
};

export default CodingAssessmentPage;
