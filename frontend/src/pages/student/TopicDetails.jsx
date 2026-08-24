// ──────────────────────────────────────────────
// Topic Details Page — Student View
// ──────────────────────────────────────────────
// Includes subtopics content viewer (Aim, Theory, Video),
// Student progress toggle (Not Started, In Progress, Completed),
// and Topic Feedback (1 to 5 star rating + comment).
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Divider,
  Flex,
  IconButton,
  Icon,
} from '@chakra-ui/react';
import { ArrowBackIcon, StarIcon, CheckCircleIcon, TimeIcon } from '@chakra-ui/icons';
import {
  getTopicByIdApi,
  getTopicFeedbackApi,
  createTopicFeedbackApi,
  updateTopicFeedbackApi,
  deleteTopicFeedbackApi,
  updateProgressApi,
  getMyProgressApi,
} from '../../api/topicApi';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';

const TopicDetails = () => {
  const { topicId } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const [topic, setTopic] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [userFeedback, setUserFeedback] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [progressStatus, setProgressStatus] = useState('Not Started');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicRes, feedbackRes, progressRes] = await Promise.all([
          getTopicByIdApi(topicId),
          getTopicFeedbackApi(topicId).catch(() => ({ data: { feedback: [] } })),
          getMyProgressApi().catch(() => ({ data: { progress: [] } })),
        ]);

        const topicData = topicRes.data?.topic || null;
        setTopic(topicData);

        const list = feedbackRes.data?.feedback || [];
        setFeedbackList(list);

        // Find current student's feedback
        const myFb = list.find((f) => f.student_id === user?.profile?.student_id);
        if (myFb) {
          setUserFeedback(myFb);
          setRating(myFb.rating);
          setComment(myFb.comment || '');
        }

        // Find current student's progress for this topic
        const myProgress = (progressRes.data?.progress || []).find(
          (p) => parseInt(p.topic_id, 10) === parseInt(topicId, 10)
        );
        if (myProgress) {
          setProgressStatus(myProgress.status);
        }
      } catch {
        toast({
          title: 'Error loading topic',
          description: 'Failed to fetch topic content.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [topicId, user, toast]);

  // Handle Progress Toggle
  const handleProgressChange = async (newStatus) => {
    try {
      await updateProgressApi(topicId, { status: newStatus });
      setProgressStatus(newStatus);
      toast({
        title: 'Progress Updated',
        description: `Topic marked as ${newStatus}.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update progress.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle Feedback Submission / Update
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);

    try {
      if (userFeedback) {
        // Update existing feedback
        const res = await updateTopicFeedbackApi(topicId, { rating, comment });
        setUserFeedback(res.data?.feedback);
        toast({
          title: 'Feedback Updated',
          description: 'Your topic feedback has been updated.',
          status: 'success',
          duration: 3000,
        });
      } else {
        // Submit new feedback
        const res = await createTopicFeedbackApi(topicId, { rating, comment });
        setUserFeedback(res.data?.feedback);
        toast({
          title: 'Feedback Submitted! ⭐',
          description: 'Thank you for rating this topic.',
          status: 'success',
          duration: 3000,
        });
      }

      // Refresh feedback list
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

  // Handle Delete Feedback
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
    return <LoadingSpinner label="Loading topic materials & subtopics..." />;
  }

  if (!topic) {
    return (
      <VStack spacing={4} p={8}>
        <Text color="white">Topic not found.</Text>
        <Button as={RouterLink} to="/student/rooms" size="sm" colorScheme="purple">
          Back to Rooms
        </Button>
      </VStack>
    );
  }

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Back Button */}
      <HStack>
        <Button as={RouterLink} to="/student/rooms" size="sm" variant="ghost" colorScheme="purple" leftIcon={<ArrowBackIcon />}>
          Back to Rooms
        </Button>
      </HStack>

      {/* Topic Header Card */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px" p={4}>
        <CardBody>
          <VStack align="start" spacing={4}>
            <Flex justify="space-between" w="full" align={{ base: 'start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={2}>
              <Heading size="lg" color="white">{topic.title}</Heading>
              <HStack spacing={2}>
                <Text color="gray.400" fontSize="xs">Status:</Text>
                <Badge colorScheme={progressStatus === 'Completed' ? 'green' : progressStatus === 'In Progress' ? 'yellow' : 'gray'}>
                  {progressStatus}
                </Badge>
              </HStack>
            </Flex>

            <Text color="gray.300" fontSize="sm">
              {topic.description || 'Comprehensive learning module for engineering laboratory experiments.'}
            </Text>

            <Divider borderColor="slate.700" />

            {/* Progress Actions */}
            <Flex justify="space-between" w="full" align="center">
              <Text color="gray.400" fontSize="xs">Mark Learning Progress:</Text>
              <HStack spacing={2}>
                <Button
                  size="xs"
                  colorScheme={progressStatus === 'In Progress' ? 'yellow' : 'gray'}
                  variant={progressStatus === 'In Progress' ? 'solid' : 'outline'}
                  onClick={() => handleProgressChange('In Progress')}
                >
                  In Progress
                </Button>
                <Button
                  size="xs"
                  colorScheme={progressStatus === 'Completed' ? 'green' : 'gray'}
                  variant={progressStatus === 'Completed' ? 'solid' : 'outline'}
                  leftIcon={<CheckCircleIcon />}
                  onClick={() => handleProgressChange('Completed')}
                >
                  Completed
                </Button>
              </HStack>
            </Flex>
          </VStack>
        </CardBody>
      </Card>

      {/* Subtopics Accordion Content */}
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color="white">
          Learning Content & Subtopics ({topic.subtopics?.length || 0})
        </Heading>

        {(!topic.subtopics || topic.subtopics.length === 0) ? (
          <Box p={6} bg="slate.800" borderRadius="xl" border="1px dashed" borderColor="slate.700" textAlign="center">
            <Text color="gray.400">No subtopics available for this topic yet.</Text>
          </Box>
        ) : (
          <Accordion allowMultiple defaultIndex={[0]}>
            {topic.subtopics.map((sub, index) => {
              const aim = sub.content?.aim || sub.aim;
              const theory = sub.content?.theory || sub.theory;
              const videoUrl = sub.content?.video_explanation_url || sub.video_explanation_url;

              return (
                <AccordionItem key={sub.subtopic_id} bg="slate.800" borderColor="slate.700" mb={3} borderRadius="xl" overflow="hidden">
                  <h2>
                    <AccordionButton _expanded={{ bg: 'slate.700', color: 'purple.300' }}>
                      <Box as="span" flex="1" textAlign="left" fontWeight="bold">
                        Subtopic {sub.order_index || index + 1}: {sub.title}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <VStack align="start" spacing={4} pt={2}>
                      {aim && (
                        <Box w="full" p={4} bg="slate.900" borderRadius="lg">
                          <Heading size="xs" color="purple.300" mb={2}>🎯 Aim</Heading>
                          <Text color="gray.200" fontSize="sm">{aim}</Text>
                        </Box>
                      )}

                      {theory && (
                        <Box w="full" p={4} bg="slate.900" borderRadius="lg">
                          <Heading size="xs" color="cyan.300" mb={2}>📖 Theory & Concepts</Heading>
                          <Text color="gray.200" fontSize="sm" whiteSpace="pre-wrap">{theory}</Text>
                        </Box>
                      )}

                      {videoUrl && (
                        <Box w="full" p={4} bg="slate.900" borderRadius="lg">
                          <Heading size="xs" color="pink.300" mb={2}>🎥 Video Explanation</Heading>
                          <Button
                            as="a"
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xs"
                            colorScheme="pink"
                          >
                            Watch Explanation Video
                          </Button>
                        </Box>
                      )}

                      {!aim && !theory && !videoUrl && (
                        <Text color="gray.500" fontSize="xs">Detailed content will be uploaded by faculty.</Text>
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </VStack>

      {/* TOPIC FEEDBACK SECTION */}
      <VStack align="stretch" spacing={6} pt={4}>
        <Heading size="md" color="white">
          Topic Feedback & Ratings
        </Heading>

        {/* Student Feedback Form */}
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <form onSubmit={handleFeedbackSubmit}>
              <VStack spacing={4} align="stretch">
                <Heading size="xs" color="purple.300" textTransform="uppercase">
                  {userFeedback ? 'Your Feedback' : 'Give Feedback for this Topic'}
                </Heading>

                {/* 1 to 5 Star Rating Selector */}
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

                {/* Comment Textarea */}
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

        {/* All Student Feedbacks */}
        {feedbackList.length > 0 && (
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
        )}
      </VStack>

      {/* Delete Feedback Modal */}
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

export default TopicDetails;
