// ──────────────────────────────────────────────
// Topic Details Page — Student View
// ──────────────────────────────────────────────
// Includes:
// - Room-scoped Topic Theory & Subtopics viewer with Markdown rendering
// - Verified Educational YouTube Video References with "Watch Video" actions
// - Student progress tracker (Not Started, In Progress, Completed)
// - Topic Feedback & Rating (1 to 5 stars)
// - Theme-aware styling complying with strict light/dark theme rules
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
  SimpleGrid,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  StarIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
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
import MarkdownRenderer from '../../components/common/MarkdownRenderer';

const TopicDetails = () => {
  const { topicId } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  // Strict theme tokens:
  // Light: light card background (#FFFFFF), surface (#F2F6F3), dark text (#1A2024), borders (#DDE5DD)
  // Dark: dark card background (#202321), surface (#292D2A), light text (#F5F7F5), borders (#3B423C)
  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#292D2A');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#B8C0B9');
  const accentColor = useColorModeValue('#2F8D46', '#A3E635');

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
          description: 'Failed to fetch topic content or verify room enrollment.',
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
        <Text color={textColor}>Topic not found or access restricted.</Text>
        <Button as={RouterLink} to="/student/rooms" size="sm" colorScheme="green">
          Back to Rooms
        </Button>
      </VStack>
    );
  }

  const videoReferences = topic.videoReferences || [];

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* Back Button */}
      <HStack>
        <Button
          as={RouterLink}
          to="/student/rooms"
          size="sm"
          variant="ghost"
          colorScheme="green"
          leftIcon={<ArrowBackIcon />}
        >
          Back to Rooms
        </Button>
      </HStack>

      {/* Topic Header Card */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" p={4} boxShadow="sm">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Flex
              justify="space-between"
              w="full"
              align={{ base: 'start', sm: 'center' }}
              direction={{ base: 'column', sm: 'row' }}
              gap={2}
            >
              <Heading size="lg" color={textColor} fontWeight="800">
                {topic.title}
              </Heading>
              <HStack spacing={2}>
                <Text color={mutedText} fontSize="xs">
                  Progress:
                </Text>
                <Badge
                  colorScheme={progressStatus === 'Completed' ? 'green' : progressStatus === 'In Progress' ? 'yellow' : 'gray'}
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                  fontSize="xs"
                >
                  {progressStatus}
                </Badge>
              </HStack>
            </Flex>

            <Text color={mutedText} fontSize="sm">
              {topic.description || 'Comprehensive learning module for engineering laboratory experiments.'}
            </Text>

            <Divider borderColor={cardBorder} />

            {/* Progress Actions */}
            <Flex justify="space-between" w="full" align="center" wrap="wrap" gap={2}>
              <Text color={mutedText} fontSize="xs">
                Mark Learning Progress:
              </Text>
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

      {/* SECTION 9: VERIFIED EDUCATIONAL YOUTUBE VIDEOS */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm">
        <CardBody p={5}>
          <VStack align="stretch" spacing={3}>
            <Flex justify="space-between" align="center">
              <Heading size="md" color={textColor} fontWeight="700">
                🎥 Verified Video Lectures &amp; References ({videoReferences.length})
              </Heading>
              <Badge colorScheme="purple" fontSize="xs" px={2} borderRadius="full">
                Curated References
              </Badge>
            </Flex>

            <Text color={mutedText} fontSize="xs">
              Hand-picked educational video lectures from top channels (Striver / take U forward, Apna College) covering the algorithms and patterns of this topic.
            </Text>

            <Divider borderColor={cardBorder} />

            {videoReferences.length === 0 ? (
              <Box p={4} bg={surfaceBg} borderRadius="lg" textAlign="center">
                <Text color={mutedText} fontSize="xs">
                  No video references currently assigned to this topic.
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} pt={1}>
                {videoReferences.map((vid) => (
                  <Box
                    key={vid.video_id}
                    p={4}
                    bg={surfaceBg}
                    borderColor={cardBorder}
                    borderWidth="1px"
                    borderRadius="lg"
                    _hover={{ borderColor: accentColor }}
                    transition="all 0.2s"
                  >
                    <VStack align="start" spacing={2} justify="space-between" h="full">
                      <VStack align="start" spacing={1} w="full">
                        <HStack justify="space-between" w="full">
                          <Badge colorScheme="purple" fontSize="10px">
                            {vid.channel_name || 'YouTube'}
                          </Badge>
                        </HStack>
                        <Text fontWeight="bold" fontSize="sm" color={textColor} noOfLines={2}>
                          {vid.title}
                        </Text>
                        {vid.description && (
                          <Text fontSize="xs" color={mutedText} noOfLines={2}>
                            {vid.description}
                          </Text>
                        )}
                      </VStack>

                      <Button
                        as="a"
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="xs"
                        colorScheme="green"
                        rightIcon={<ExternalLinkIcon />}
                        w="full"
                        mt={2}
                      >
                        Watch Video
                      </Button>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Subtopics Accordion Content */}
      <VStack align="stretch" spacing={3}>
        <Heading size="md" color={textColor} fontWeight="700">
          📖 Learning Content &amp; Subtopics ({topic.subtopics?.length || 0})
        </Heading>

        {(!topic.subtopics || topic.subtopics.length === 0) ? (
          <Box p={6} bg={cardBg} borderRadius="xl" border="1px dashed" borderColor={cardBorder} textAlign="center">
            <Text color={mutedText} fontSize="sm">
              No subtopics published for this topic yet.
            </Text>
          </Box>
        ) : (
          <Accordion allowMultiple defaultIndex={[0]}>
            {topic.subtopics.map((sub, index) => {
              const aim = sub.content?.aim || sub.aim;
              const theory = sub.content?.theory || sub.theory;
              const videoUrl = sub.content?.video_explanation_url || sub.video_explanation_url;

              return (
                <AccordionItem
                  key={sub.subtopic_id}
                  bg={cardBg}
                  borderColor={cardBorder}
                  mb={3}
                  borderRadius="xl"
                  borderWidth="1px"
                  overflow="hidden"
                >
                  <h2>
                    <AccordionButton _expanded={{ bg: surfaceBg, color: accentColor }}>
                      <Box as="span" flex="1" textAlign="left" fontWeight="bold" fontSize="sm" color={textColor}>
                        Subtopic {sub.order_index || index + 1}: {sub.title}
                      </Box>
                      <AccordionIcon color={accentColor} />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <VStack align="start" spacing={4} pt={2}>
                      {aim && (
                        <Box w="full" p={4} bg={surfaceBg} borderRadius="lg" borderWidth="1px" borderColor={cardBorder}>
                          <Heading size="xs" color={accentColor} mb={2}>
                            🎯 Aim &amp; Objectives
                          </Heading>
                          <Text color={textColor} fontSize="sm">
                            {aim}
                          </Text>
                        </Box>
                      )}

                      {theory && (
                        <Box w="full" p={4} bg={surfaceBg} borderRadius="lg" borderWidth="1px" borderColor={cardBorder}>
                          <Heading size="xs" color={accentColor} mb={2}>
                            📖 Theory &amp; Concepts
                          </Heading>
                          <MarkdownRenderer content={theory} />
                        </Box>
                      )}

                      {videoUrl && (
                        <Box w="full" p={4} bg={surfaceBg} borderRadius="lg" borderWidth="1px" borderColor={cardBorder}>
                          <Heading size="xs" color="purple.400" mb={2}>
                            🎥 Subtopic Video Explanation
                          </Heading>
                          <Button
                            as="a"
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xs"
                            colorScheme="purple"
                            rightIcon={<ExternalLinkIcon />}
                          >
                            Watch Subtopic Video
                          </Button>
                        </Box>
                      )}

                      {!aim && !theory && !videoUrl && (
                        <Text color={mutedText} fontSize="xs">
                          Detailed content will be published by faculty.
                        </Text>
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
      <VStack align="stretch" spacing={4} pt={2}>
        <Heading size="md" color={textColor} fontWeight="700">
          Topic Feedback &amp; Ratings
        </Heading>

        {/* Student Feedback Form */}
        <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl">
          <CardBody>
            <form onSubmit={handleFeedbackSubmit}>
              <VStack spacing={4} align="stretch">
                <Heading size="xs" color={accentColor} textTransform="uppercase">
                  {userFeedback ? 'Your Feedback' : 'Give Feedback for this Topic'}
                </Heading>

                {/* 1 to 5 Star Rating Selector */}
                <FormControl isRequired>
                  <FormLabel fontSize="xs" color={textColor}>
                    Rating (1 to 5 Stars)
                  </FormLabel>
                  <HStack spacing={2}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconButton
                        key={star}
                        aria-label={`Rate ${star} stars`}
                        icon={<StarIcon color={star <= rating ? 'yellow.400' : 'gray.400'} boxSize={4} />}
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
                  <FormLabel fontSize="xs" color={textColor}>
                    Comment (Optional)
                  </FormLabel>
                  <Textarea
                    placeholder="Share your thoughts on the clarity, experiments, and learning materials of this topic..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    fontSize="sm"
                    rows={3}
                    bg={surfaceBg}
                    borderColor={cardBorder}
                    color={textColor}
                  />
                </FormControl>

                <HStack justify="space-between">
                  <Button
                    type="submit"
                    size="sm"
                    colorScheme="green"
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
            <Text color={mutedText} fontSize="xs" fontWeight="bold" textTransform="uppercase">
              All Reviews ({feedbackList.length})
            </Text>
            {feedbackList.map((fb) => (
              <Box
                key={fb.feedback_id}
                p={4}
                bg={surfaceBg}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={cardBorder}
              >
                <Flex justify="space-between" align="center" mb={1}>
                  <Text color={textColor} fontWeight="bold" fontSize="sm">
                    {fb.student_name || 'Student'}
                  </Text>
                  <HStack spacing={1}>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} boxSize={3} color={i < fb.rating ? 'yellow.400' : 'gray.400'} />
                    ))}
                  </HStack>
                </Flex>
                {fb.comment && <Text color={mutedText} fontSize="xs" mt={1}>{fb.comment}</Text>}
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
