// ──────────────────────────────────────────────
// Feedback Page — Topic Feedback & Ratings
// ──────────────────────────────────────────────
// Migrated from the existing TopicDetails.jsx feedback section.
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  HStack,
  Button,
  Textarea,
  FormControl,
  FormLabel,
  IconButton,
  Flex,
  Box,
  useToast,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import useAuth from '../../../hooks/useAuth';
import {
  getTopicFeedbackApi,
  createTopicFeedbackApi,
  updateTopicFeedbackApi,
  deleteTopicFeedbackApi,
} from '../../../api/topicApi';
import ConfirmModal from '../../../components/common/ConfirmModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const FeedbackPage = () => {
  const { topic, topicId } = useOutletContext();
  const { user } = useAuth();
  const toast = useToast();

  const [feedbackList, setFeedbackList] = useState([]);
  const [userFeedback, setUserFeedback] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);
      try {
        const res = await getTopicFeedbackApi(topicId);
        const list = res.data?.feedback || [];
        setFeedbackList(list);

        // Find current student's feedback
        const myFb = list.find((f) => f.student_id === user?.profile?.student_id);
        if (myFb) {
          setUserFeedback(myFb);
          setRating(myFb.rating);
          setComment(myFb.comment || '');
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load feedback.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedback();
  }, [topicId, user, toast]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);

    try {
      if (userFeedback) {
        const res = await updateTopicFeedbackApi(topicId, { rating, comment });
        setUserFeedback(res.data?.feedback);
        toast({
          title: 'Feedback Updated',
          description: 'Your topic feedback has been updated.',
          status: 'success',
          duration: 3000,
        });
      } else {
        const res = await createTopicFeedbackApi(topicId, { rating, comment });
        setUserFeedback(res.data?.feedback);
        toast({
          title: 'Feedback Submitted! ⭐',
          description: 'Thank you for rating this topic.',
          status: 'success',
          duration: 3000,
        });
      }

      const updatedList = await getTopicFeedbackApi(topicId);
      setFeedbackList(updatedList.data?.feedback || []);
    } catch (err) {
      toast({
        title: 'Feedback Submission Failed',
        description: err.response?.data?.message || 'Failed to save feedback.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleDeleteFeedback = async () => {
    try {
      await deleteTopicFeedbackApi(topicId);
      setUserFeedback(null);
      setRating(5);
      setComment('');
      toast({
        title: 'Feedback Deleted',
        description: 'Your feedback has been removed.',
        status: 'info',
        duration: 3000,
      });

      const updatedList = await getTopicFeedbackApi(topicId);
      setFeedbackList(updatedList.data?.feedback || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete feedback.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading feedback..." />;
  }

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Heading size="lg" color="white">
        Topic Feedback & Ratings
      </Heading>

      <Text color="gray.400" fontSize="sm">
        {topic.title}
      </Text>

      {/* Student Feedback Form */}
      {user?.role === 'student' && (
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <form onSubmit={handleFeedbackSubmit}>
              <VStack spacing={4} align="stretch">
                <Heading size="xs" color="purple.300" textTransform="uppercase">
                  {userFeedback ? 'Your Feedback' : 'Give Feedback for this Topic'}
                </Heading>

                {/* Star Rating */}
                <FormControl isRequired>
                  <FormLabel color="gray.300" fontSize="xs">Rating (1 to 5 Stars)</FormLabel>
                  <HStack spacing={2}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconButton
                        key={star}
                        aria-label={`Rate ${star} stars`}
                        icon={<StarIcon color={star <= rating ? 'yellow.400' : 'gray.600'} w={5} h={5} />}
                        variant="ghost"
                        onClick={() => setRating(star)}
                        size="sm"
                      />
                    ))}
                    <Text color="yellow.400" fontWeight="bold" fontSize="sm" ml={2}>
                      {rating} / 5
                    </Text>
                  </HStack>
                </FormControl>

                {/* Comment */}
                <FormControl>
                  <FormLabel color="gray.300" fontSize="xs">Comment (Optional)</FormLabel>
                  <Textarea
                    placeholder="Share your thoughts on the clarity, experiments, and learning materials of this topic..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    bg="slate.900"
                    borderColor="slate.700"
                    color="white"
                    fontSize="sm"
                    rows={3}
                  />
                </FormControl>

                <HStack justify="space-between">
                  <Button
                    type="submit"
                    size="sm"
                    colorScheme="purple"
                    isLoading={isSubmittingFeedback}
                    loadingText="Saving..."
                  >
                    {userFeedback ? 'Update Feedback' : 'Submit Feedback'}
                  </Button>

                  {userFeedback && (
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      Delete My Feedback
                    </Button>
                  )}
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      )}

      {/* All Reviews */}
      {feedbackList.length > 0 ? (
        <VStack align="stretch" spacing={3}>
          <Text color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase">
            All Reviews ({feedbackList.length})
          </Text>
          {feedbackList.map((fb) => (
            <Box key={fb.feedback_id} p={4} bg="slate.800" borderRadius="xl" border="1px solid" borderColor="slate.700">
              <Flex justify="space-between" align="center" mb={1}>
                <Text color="white" fontWeight="bold" fontSize="sm">{fb.student_name || 'Student'}</Text>
                <HStack spacing={1}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} w={3} h={3} color={i < fb.rating ? 'yellow.400' : 'gray.600'} />
                  ))}
                </HStack>
              </Flex>
              {fb.comment && <Text color="gray.300" fontSize="xs" mt={1}>{fb.comment}</Text>}
            </Box>
          ))}
        </VStack>
      ) : (
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody textAlign="center">
            <Text color="gray.400" fontSize="sm">
              No feedback has been submitted for this topic yet.
            </Text>
          </CardBody>
        </Card>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteFeedback}
        title="Delete Feedback"
        message="Are you sure you want to remove your feedback for this topic?"
        confirmText="Delete"
        colorScheme="red"
      />
    </VStack>
  );
};

export default FeedbackPage;
