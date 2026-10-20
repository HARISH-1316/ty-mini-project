// ──────────────────────────────────────────────
// Theory & Content Management — Faculty Workspace
// ──────────────────────────────────────────────
// Comprehensive curriculum content management:
// - Topic and subtopic search & filter
// - Structured educational content editor with Markdown support
// - Preview mode rendering formatted content with high-contrast theme styling
// - Save Draft vs Live Publish controls
// - Topic-level YouTube Video Reference Manager (CRUD + Watch Video preview)
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  useToast,
  useColorModeValue,
  Flex,
  IconButton,
  Badge,
  Divider,
  Icon,
  Link,
  Tooltip,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  ExternalLinkIcon,
  ChevronRightIcon,
  SearchIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import {
  getAllTopicsApi,
  getTopicByIdApi,
  createTopicApi,
  deleteTopicApi,
  createSubtopicApi,
  getSubtopicContentApi,
  upsertSubtopicContentApi,
  publishSubtopicContentApi,
  unpublishSubtopicContentApi,
  getTopicVideosApi,
  addTopicVideoApi,
  updateTopicVideoApi,
  deleteTopicVideoApi,
} from '../../api/topicApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';

const STRUCTURED_TEMPLATE = `## 1. Topic Overview
Brief summary of the concepts and fundamental purpose of this topic.

## 2. Learning Objectives
- Understand the core principles
- Analyze time and space efficiency
- Apply relevant algorithms to standard problems

## 3. Prerequisites
- Basic familiarity with programming syntax and control flow.

## 4. Core Concepts
Detailed theoretical explanation of data structures and underlying mechanics.

## 5. Algorithms and Explanations
Step-by-step description of relevant procedures and manipulations.

## 6. Pseudocode & Code Examples
\`\`\`cpp
// Example C++ implementation
void exampleSolution() {
    // algorithm implementation
}
\`\`\`

## 7. Time & Space Complexity
- **Time Complexity:** O(N) average case, O(1) best case.
- **Auxiliary Space:** O(1) in-place auxiliary storage.

## 8. Worked Examples
Walkthrough of a concrete test case tracing variable mutations.

## 9. Common Pitfalls & Mistakes
- Off-by-one errors in bounds checking.
- Null pointer / boundary condition handling.

## 10. Practical Applications
Real-world systems, databases, operating systems, and network protocols using this topic.

## 11. Summary
Key takeaways and revision notes.

## 12. References
- Standard DSA textbooks & accredited lecture materials.
`;

const TopicManagement = () => {
  const toast = useToast();

  // Color tokens aligned with normal light/dark theme rules
  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#292D2A');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#B8C0B9');
  const accentColor = useColorModeValue('#2F8D46', '#A3E635');
  const selectedBg = useColorModeValue('#E8F5E9', '#303B22');
  const selectedBorder = useColorModeValue('#2F8D46', '#A3E635');

  const { isOpen: isTopicOpen, onOpen: onTopicOpen, onClose: onTopicClose } = useDisclosure();
  const { isOpen: isSubtopicOpen, onOpen: onSubtopicOpen, onClose: onSubtopicClose } = useDisclosure();
  const { isOpen: isVideoModalOpen, onOpen: onVideoModalOpen, onClose: onVideoModalClose } = useDisclosure();

  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [topicVideos, setTopicVideos] = useState([]);

  // Search & Filters
  const [topicSearch, setTopicSearch] = useState('');
  const [subtopicSearch, setSubtopicSearch] = useState('');

  // Loading states
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [isLoadingSubtopics, setIsLoadingSubtopics] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  // New Topic Form State
  const [newTopic, setNewTopic] = useState({ title: '', description: '' });
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  // New Subtopic Form State
  const [subtopicTitle, setSubtopicTitle] = useState('');
  const [subtopicOrder, setSubtopicOrder] = useState(1);
  const [isCreatingSubtopic, setIsCreatingSubtopic] = useState(false);

  // Content Form State
  const [contentForm, setContentForm] = useState({
    aim: '',
    theory: '',
    video_explanation_url: '',
  });
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState(0); // 0 = Edit, 1 = Preview

  // Video Reference Form State
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    channel_name: '',
    url: '',
    description: '',
    order_index: 0,
  });
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  // Fetch topics
  const fetchTopics = async () => {
    try {
      setIsLoadingTopics(true);
      const res = await getAllTopicsApi();
      const topicList = res.data?.topics || [];
      setTopics(topicList);

      if (topicList.length > 0 && !selectedTopic) {
        handleSelectTopic(topicList[0]);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch topic catalog.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoadingTopics(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // Fetch Videos for Selected Topic
  const fetchVideosForTopic = async (topicId) => {
    try {
      setIsLoadingVideos(true);
      const res = await getTopicVideosApi(topicId);
      setTopicVideos(res.data?.videos || []);
    } catch {
      setTopicVideos([]);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Handle Topic Selection
  const handleSelectTopic = async (topic) => {
    setSelectedTopic(topic);
    setSelectedSubtopic(null);
    setContentForm({ aim: '', theory: '', video_explanation_url: '' });

    try {
      setIsLoadingSubtopics(true);
      const [topicRes] = await Promise.all([
        getTopicByIdApi(topic.topic_id),
        fetchVideosForTopic(topic.topic_id),
      ]);
      const subList = topicRes.data?.topic?.subtopics || [];
      setSubtopics(subList);

      if (subList.length > 0) {
        handleSelectSubtopic(subList[0]);
      }
    } catch {
      toast({
        title: 'Error',
        description: `Failed to load subtopics for ${topic.title}.`,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoadingSubtopics(false);
    }
  };

  // Handle Subtopic Selection
  const handleSelectSubtopic = async (subtopic) => {
    setSelectedSubtopic(subtopic);
    try {
      setIsLoadingContent(true);
      const res = await getSubtopicContentApi(subtopic.subtopic_id);
      const content = res.data?.content || {};
      setContentForm({
        aim: content.aim || '',
        theory: content.theory || '',
        video_explanation_url: content.video_explanation_url || '',
      });
    } catch {
      setContentForm({ aim: '', theory: '', video_explanation_url: '' });
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Create Topic
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.title.trim()) return;
    setIsCreatingTopic(true);

    try {
      const res = await createTopicApi(newTopic);
      toast({
        title: 'Topic Created 📚',
        description: `Topic "${newTopic.title}" created successfully.`,
        status: 'success',
        duration: 3000,
      });
      setNewTopic({ title: '', description: '' });
      onTopicClose();
      await fetchTopics();
      if (res.data?.topic) {
        handleSelectTopic(res.data.topic);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create topic.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsCreatingTopic(false);
    }
  };

  // Create Subtopic
  const handleCreateSubtopic = async (e) => {
    e.preventDefault();
    if (!subtopicTitle.trim() || !selectedTopic) return;
    setIsCreatingSubtopic(true);

    try {
      await createSubtopicApi(selectedTopic.topic_id, {
        title: subtopicTitle.trim(),
        order_index: subtopicOrder,
        is_published: true,
      });
      toast({ title: 'Subtopic Added ✨', status: 'success', duration: 2000 });
      setSubtopicTitle('');
      onSubtopicClose();
      handleSelectTopic(selectedTopic);
    } catch (err) {
      toast({
        title: 'Error adding subtopic',
        description: err.response?.data?.message || 'Failed to add subtopic.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsCreatingSubtopic(false);
    }
  };

  // Save Content Changes
  const handleSaveContent = async (asPublished = null) => {
    if (!selectedSubtopic) return;

    if (!contentForm.aim.trim() || !contentForm.theory.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Both Aim and Theory are required fields and cannot be empty.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSavingContent(true);

    try {
      await upsertSubtopicContentApi(selectedSubtopic.subtopic_id, {
        aim: contentForm.aim,
        theory: contentForm.theory,
        video_explanation_url: contentForm.video_explanation_url.trim() || null,
      });

      if (asPublished === true && !selectedSubtopic.is_published) {
        await publishSubtopicContentApi(selectedSubtopic.subtopic_id);
        setSelectedSubtopic((prev) => ({ ...prev, is_published: true }));
        setSubtopics((prev) =>
          prev.map((s) => (s.subtopic_id === selectedSubtopic.subtopic_id ? { ...s, is_published: true } : s))
        );
      } else if (asPublished === false && selectedSubtopic.is_published) {
        await unpublishSubtopicContentApi(selectedSubtopic.subtopic_id);
        setSelectedSubtopic((prev) => ({ ...prev, is_published: false }));
        setSubtopics((prev) =>
          prev.map((s) => (s.subtopic_id === selectedSubtopic.subtopic_id ? { ...s, is_published: false } : s))
        );
      }

      toast({
        title: asPublished === true ? 'Published Live! 🚀' : 'Draft Saved 💾',
        description: `Content for "${selectedSubtopic.title}" updated successfully.`,
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Error Saving Content',
        description: err.response?.data?.message || 'Failed to save subtopic content.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSavingContent(false);
    }
  };

  // Toggle Publish
  const handleTogglePublish = async () => {
    if (!selectedSubtopic) return;
    setIsTogglingPublish(true);

    const isCurrentlyPublished = selectedSubtopic.is_published;

    try {
      if (isCurrentlyPublished) {
        await unpublishSubtopicContentApi(selectedSubtopic.subtopic_id);
        toast({
          title: 'Subtopic Unpublished 🔒',
          description: `"${selectedSubtopic.title}" is now hidden from students.`,
          status: 'info',
          duration: 3000,
        });
      } else {
        await publishSubtopicContentApi(selectedSubtopic.subtopic_id);
        toast({
          title: 'Subtopic Published 🚀',
          description: `"${selectedSubtopic.title}" is now visible to students.`,
          status: 'success',
          duration: 3000,
        });
      }

      const updatedSubtopic = {
        ...selectedSubtopic,
        is_published: !isCurrentlyPublished,
      };

      setSelectedSubtopic(updatedSubtopic);
      setSubtopics((prev) =>
        prev.map((s) => (s.subtopic_id === selectedSubtopic.subtopic_id ? updatedSubtopic : s))
      );
    } catch (err) {
      toast({
        title: 'Error Toggling Publish Status',
        description: err.response?.data?.message || 'Action failed.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsTogglingPublish(false);
    }
  };

  // Video Management Handlers
  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoForm({
      title: '',
      channel_name: '',
      url: '',
      description: '',
      order_index: topicVideos.length,
    });
    onVideoModalOpen();
  };

  const handleOpenEditVideo = (video) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      channel_name: video.channel_name || '',
      url: video.url,
      description: video.description || '',
      order_index: video.order_index || 0,
    });
    onVideoModalOpen();
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!selectedTopic || !videoForm.title.trim() || !videoForm.url.trim()) return;

    setIsSavingVideo(true);
    try {
      if (editingVideo) {
        await updateTopicVideoApi(selectedTopic.topic_id, editingVideo.video_id, videoForm);
        toast({ title: 'Video Reference Updated', status: 'success', duration: 2000 });
      } else {
        await addTopicVideoApi(selectedTopic.topic_id, videoForm);
        toast({ title: 'Video Reference Added 🎥', status: 'success', duration: 2000 });
      }
      onVideoModalClose();
      fetchVideosForTopic(selectedTopic.topic_id);
    } catch (err) {
      toast({
        title: 'Error Saving Video',
        description: err.response?.data?.message || 'Failed to save video reference.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Delete this YouTube video reference from this topic?')) return;
    try {
      await deleteTopicVideoApi(selectedTopic.topic_id, videoId);
      toast({ title: 'Video Reference Removed', status: 'info', duration: 2000 });
      fetchVideosForTopic(selectedTopic.topic_id);
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete video.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Filtered topics and subtopics
  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(topicSearch.toLowerCase())
  );
  const filteredSubtopics = subtopics.filter((s) =>
    s.title.toLowerCase().includes(subtopicSearch.toLowerCase())
  );

  if (isLoadingTopics) {
    return <LoadingSpinner label="Loading topic catalog & theory content..." />;
  }

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* Top Header */}
      <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={textColor} fontWeight="800">
            Theory &amp; Content Management
          </Heading>
          <Text color={mutedText} fontSize="sm">
            Manage structured curriculum theory, Markdown formatting, publication draft states, and verified YouTube references per topic.
          </Text>
        </VStack>

        <HStack spacing={3}>
          {selectedTopic && (
            <Button
              as={RouterLink}
              to={`/faculty/topics/${selectedTopic.topic_id}/quizzes`}
              variant="outline"
              colorScheme="green"
            >
              Topic Quizzes ({selectedTopic.title})
            </Button>
          )}
          <Button onClick={onTopicOpen} leftIcon={<AddIcon />} colorScheme="green">
            New Main Topic
          </Button>
        </HStack>
      </Flex>

      {/* Main 3-Column / Grid Layout */}
      {topics.length === 0 ? (
        <EmptyState
          title="No Topics Available"
          description="Create your first main topic to begin adding subtopics and educational content."
          actionLabel="Create First Topic"
          onAction={onTopicOpen}
        />
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={6} w="full">
          {/* Column 1: Topics Selector Card */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 3' }}>
            <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm">
              <CardBody p={4}>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold" color={accentColor} textTransform="uppercase" fontSize="xs" letterSpacing="wider">
                      1. Topics ({filteredTopics.length})
                    </Text>
                    <IconButton
                      aria-label="Add topic"
                      icon={<AddIcon />}
                      size="xs"
                      colorScheme="green"
                      variant="ghost"
                      onClick={onTopicOpen}
                    />
                  </Flex>

                  {/* Topic Search Input */}
                  <HStack bg={surfaceBg} px={2} py={1} borderRadius="md" borderWidth="1px" borderColor={cardBorder}>
                    <SearchIcon color={mutedText} boxSize={3} />
                    <Input
                      placeholder="Search topics..."
                      size="xs"
                      variant="unstyled"
                      value={topicSearch}
                      onChange={(e) => setTopicSearch(e.target.value)}
                      color={textColor}
                    />
                  </HStack>

                  <Divider borderColor={cardBorder} />

                  <VStack align="stretch" spacing={2} maxH="550px" overflowY="auto">
                    {filteredTopics.map((t) => {
                      const isSelected = selectedTopic?.topic_id === t.topic_id;
                      return (
                        <Box
                          key={t.topic_id}
                          p={3}
                          borderRadius="md"
                          cursor="pointer"
                          bg={isSelected ? selectedBg : cardBg}
                          borderColor={isSelected ? selectedBorder : cardBorder}
                          borderWidth="1px"
                          _hover={{ bg: isSelected ? selectedBg : surfaceBg }}
                          transition="all 0.2s"
                          onClick={() => handleSelectTopic(t)}
                        >
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={0} pr={2}>
                              <Text color={isSelected ? accentColor : textColor} fontWeight="semibold" fontSize="sm">
                                {t.title}
                              </Text>
                              <Text color={mutedText} fontSize="xs" noOfLines={1}>
                                {t.description || 'No description'}
                              </Text>
                            </VStack>
                            <ChevronRightIcon color={isSelected ? accentColor : mutedText} />
                          </Flex>
                        </Box>
                      );
                    })}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* Column 2: Subtopics Selector Card */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 3' }}>
            <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm">
              <CardBody p={4}>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" color={accentColor} textTransform="uppercase" fontSize="xs" letterSpacing="wider">
                        2. Subtopics ({filteredSubtopics.length})
                      </Text>
                      {selectedTopic && (
                        <Text color={mutedText} fontSize="xs" fontWeight="medium" noOfLines={1}>
                          {selectedTopic.title}
                        </Text>
                      )}
                    </VStack>

                    {selectedTopic && (
                      <Button
                        size="xs"
                        colorScheme="green"
                        leftIcon={<AddIcon />}
                        onClick={() => {
                          setSubtopicOrder(subtopics.length + 1);
                          onSubtopicOpen();
                        }}
                      >
                        Add
                      </Button>
                    )}
                  </Flex>

                  {/* Subtopic Search Input */}
                  <HStack bg={surfaceBg} px={2} py={1} borderRadius="md" borderWidth="1px" borderColor={cardBorder}>
                    <SearchIcon color={mutedText} boxSize={3} />
                    <Input
                      placeholder="Search subtopics..."
                      size="xs"
                      variant="unstyled"
                      value={subtopicSearch}
                      onChange={(e) => setSubtopicSearch(e.target.value)}
                      color={textColor}
                    />
                  </HStack>

                  <Divider borderColor={cardBorder} />

                  {isLoadingSubtopics ? (
                    <LoadingSpinner label="Loading subtopics..." />
                  ) : filteredSubtopics.length === 0 ? (
                    <Text color={mutedText} fontSize="xs" py={4} textAlign="center">
                      No subtopics found for this topic.
                    </Text>
                  ) : (
                    <VStack align="stretch" spacing={2} maxH="550px" overflowY="auto">
                      {filteredSubtopics.map((sub) => {
                        const isSelected = selectedSubtopic?.subtopic_id === sub.subtopic_id;
                        return (
                          <Box
                            key={sub.subtopic_id}
                            p={3}
                            borderRadius="md"
                            cursor="pointer"
                            bg={isSelected ? selectedBg : cardBg}
                            borderColor={isSelected ? selectedBorder : cardBorder}
                            borderWidth="1px"
                            _hover={{ bg: isSelected ? selectedBg : surfaceBg }}
                            transition="all 0.2s"
                            onClick={() => handleSelectSubtopic(sub)}
                          >
                            <Flex justify="space-between" align="center">
                              <HStack spacing={2} maxW="70%">
                                <Text color={accentColor} fontWeight="bold" fontSize="xs" minW="18px">
                                  #{sub.order_index || '-'}
                                </Text>
                                <Text color={isSelected ? accentColor : textColor} fontWeight="medium" fontSize="xs" noOfLines={1}>
                                  {sub.title}
                                </Text>
                              </HStack>

                              <Badge
                                colorScheme={sub.is_published ? 'green' : 'orange'}
                                fontSize="9px"
                                px={1.5}
                                borderRadius="full"
                              >
                                {sub.is_published ? 'Live' : 'Draft'}
                              </Badge>
                            </Flex>
                          </Box>
                        );
                      })}
                    </VStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* Column 3: Theory Content & Video Reference Panels */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 6' }}>
            <Tabs colorScheme="green" isLazy>
              <TabList borderColor={cardBorder} mb={3}>
                <Tab color={textColor} _selected={{ color: accentColor, borderColor: accentColor, fontWeight: 'bold' }}>
                  📖 Theory Editor {selectedSubtopic ? `(${selectedSubtopic.title})` : ''}
                </Tab>
                <Tab color={textColor} _selected={{ color: accentColor, borderColor: accentColor, fontWeight: 'bold' }}>
                  🎥 YouTube References ({topicVideos.length})
                </Tab>
              </TabList>

              <TabPanels>
                {/* Panel 1: Subtopic Theory Editor & Live Preview */}
                <TabPanel p={0}>
                  <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm">
                    <CardBody p={5}>
                      {!selectedSubtopic ? (
                        <VStack py={12} spacing={3} align="center">
                          <Icon as={EditIcon} w={8} h={8} color={accentColor} />
                          <Text color={mutedText} fontSize="sm" textAlign="center">
                            Select a subtopic from the middle panel to edit its learning objectives, Markdown theory, and draft/published status.
                          </Text>
                        </VStack>
                      ) : isLoadingContent ? (
                        <LoadingSpinner label="Loading subtopic content..." />
                      ) : (
                        <VStack align="stretch" spacing={4}>
                          {/* Header / Meta Bar */}
                          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                            <VStack align="start" spacing={0}>
                              <HStack spacing={2}>
                                <Badge colorScheme="green" variant="subtle" fontSize="xs">
                                  {selectedTopic?.title}
                                </Badge>
                                <Text color={mutedText} fontSize="xs">/</Text>
                                <Text color={accentColor} fontWeight="bold" fontSize="sm">
                                  {selectedSubtopic.title}
                                </Text>
                              </HStack>
                              <Text color={mutedText} fontSize="xs">
                                Publication Status: {selectedSubtopic.is_published ? 'Published to Students' : 'Draft (Faculty Only)'}
                              </Text>
                            </VStack>

                            <HStack spacing={2}>
                              <Button
                                size="xs"
                                colorScheme={selectedSubtopic.is_published ? 'orange' : 'green'}
                                variant="outline"
                                isLoading={isTogglingPublish}
                                onClick={handleTogglePublish}
                              >
                                {selectedSubtopic.is_published ? 'Unpublish' : 'Publish Live'}
                              </Button>

                              <Button
                                size="xs"
                                colorScheme="purple"
                                variant="ghost"
                                onClick={() =>
                                  setContentForm((prev) => ({
                                    ...prev,
                                    theory: prev.theory ? prev.theory + '\n\n' + STRUCTURED_TEMPLATE : STRUCTURED_TEMPLATE,
                                  }))
                                }
                              >
                                + Insert Structure Template
                              </Button>
                            </HStack>
                          </Flex>

                          <Divider borderColor={cardBorder} />

                          {/* Aim / Learning Objective */}
                          <FormControl isRequired>
                            <FormLabel color={textColor} fontSize="xs" fontWeight="bold">
                              Aim &amp; Learning Objectives
                            </FormLabel>
                            <Textarea
                              placeholder="State academic aim and key learning outcomes..."
                              value={contentForm.aim}
                              onChange={(e) => setContentForm({ ...contentForm, aim: e.target.value })}
                              bg={surfaceBg}
                              borderColor={cardBorder}
                              color={textColor}
                              fontSize="xs"
                              rows={2}
                              _focus={{ borderColor: accentColor }}
                            />
                          </FormControl>

                          {/* Theory Markdown Area with Edit / Preview Switch */}
                          <Box>
                            <Flex justify="space-between" align="center" mb={1}>
                              <FormLabel color={textColor} fontSize="xs" fontWeight="bold" m={0}>
                                Theory Content (Markdown, Tables &amp; Code Supported)
                              </FormLabel>
                              <HStack spacing={1}>
                                <Button
                                  size="xs"
                                  variant={activeEditorTab === 0 ? 'solid' : 'ghost'}
                                  colorScheme="green"
                                  onClick={() => setActiveEditorTab(0)}
                                >
                                  Edit Markdown
                                </Button>
                                <Button
                                  size="xs"
                                  variant={activeEditorTab === 1 ? 'solid' : 'ghost'}
                                  colorScheme="green"
                                  leftIcon={<ViewIcon />}
                                  onClick={() => setActiveEditorTab(1)}
                                >
                                  Preview
                                </Button>
                              </HStack>
                            </Flex>

                            {activeEditorTab === 0 ? (
                              <Textarea
                                placeholder="Write detailed educational theory, code blocks, algorithm complexity..."
                                value={contentForm.theory}
                                onChange={(e) => setContentForm({ ...contentForm, theory: e.target.value })}
                                bg={surfaceBg}
                                borderColor={cardBorder}
                                color={textColor}
                                fontSize="xs"
                                rows={14}
                                fontFamily="'Fira Code', 'Consolas', monospace"
                                _focus={{ borderColor: accentColor }}
                              />
                            ) : (
                              <Box
                                p={4}
                                bg={surfaceBg}
                                borderColor={cardBorder}
                                borderWidth="1px"
                                borderRadius="md"
                                minH="300px"
                                maxH="500px"
                                overflowY="auto"
                              >
                                {contentForm.theory ? (
                                  <MarkdownRenderer content={contentForm.theory} />
                                ) : (
                                  <Text color={mutedText} fontSize="xs" fontStyle="italic">
                                    No theory content written yet. Switch to "Edit Markdown" to write content.
                                  </Text>
                                )}
                              </Box>
                            )}
                          </Box>

                          {/* Subtopic Optional Video URL */}
                          <FormControl>
                            <FormLabel color={textColor} fontSize="xs" fontWeight="bold">
                              Subtopic Video Link (Optional)
                            </FormLabel>
                            <Input
                              placeholder="https://www.youtube.com/watch?v=..."
                              value={contentForm.video_explanation_url}
                              onChange={(e) =>
                                setContentForm({ ...contentForm, video_explanation_url: e.target.value })
                              }
                              bg={surfaceBg}
                              borderColor={cardBorder}
                              color={textColor}
                              fontSize="xs"
                              _focus={{ borderColor: accentColor }}
                            />
                          </FormControl>

                          {/* Save & Draft Buttons */}
                          <Flex justify="space-between" align="center" pt={2}>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="gray"
                              isLoading={isSavingContent}
                              onClick={() => handleSaveContent(false)}
                            >
                              Save Draft (Hidden)
                            </Button>

                            <Button
                              size="sm"
                              colorScheme="green"
                              isLoading={isSavingContent}
                              onClick={() => handleSaveContent(true)}
                              px={6}
                            >
                              Save &amp; Publish Live
                            </Button>
                          </Flex>
                        </VStack>
                      )}
                    </CardBody>
                  </Card>
                </TabPanel>

                {/* Panel 2: Topic YouTube Video References Manager */}
                <TabPanel p={0}>
                  <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm">
                    <CardBody p={5}>
                      <VStack align="stretch" spacing={4}>
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Heading size="sm" color={textColor}>
                              Verified Video References
                            </Heading>
                            <Text color={mutedText} fontSize="xs">
                              Topic: {selectedTopic?.title || 'None Selected'}
                            </Text>
                          </VStack>

                          {selectedTopic && (
                            <Button
                              size="xs"
                              colorScheme="green"
                              leftIcon={<AddIcon />}
                              onClick={handleOpenAddVideo}
                            >
                              Add Video Reference
                            </Button>
                          )}
                        </Flex>

                        <Divider borderColor={cardBorder} />

                        {isLoadingVideos ? (
                          <LoadingSpinner label="Loading video references..." />
                        ) : topicVideos.length === 0 ? (
                          <VStack py={8} spacing={2} align="center">
                            <Text color={mutedText} fontSize="xs">
                              No video references associated with this topic yet.
                            </Text>
                            <Button size="xs" colorScheme="green" onClick={handleOpenAddVideo}>
                              Add First Video
                            </Button>
                          </VStack>
                        ) : (
                          <VStack align="stretch" spacing={3} maxH="500px" overflowY="auto">
                            {topicVideos.map((vid) => (
                              <Box
                                key={vid.video_id}
                                p={3}
                                bg={surfaceBg}
                                borderWidth="1px"
                                borderColor={cardBorder}
                                borderRadius="lg"
                              >
                                <Flex justify="space-between" align="start">
                                  <VStack align="start" spacing={1} maxW="70%">
                                    <Text fontWeight="bold" fontSize="xs" color={textColor}>
                                      {vid.title}
                                    </Text>
                                    <HStack spacing={2}>
                                      <Badge colorScheme="purple" fontSize="10px">
                                        {vid.channel_name || 'YouTube'}
                                      </Badge>
                                      <Link
                                        href={vid.url}
                                        isExternal
                                        color={accentColor}
                                        fontSize="xs"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        Watch Video <ExternalLinkIcon boxSize={3} />
                                      </Link>
                                    </HStack>
                                    {vid.description && (
                                      <Text color={mutedText} fontSize="xs" noOfLines={2}>
                                        {vid.description}
                                      </Text>
                                    )}
                                  </VStack>

                                  <HStack spacing={1}>
                                    <IconButton
                                      aria-label="Edit video"
                                      icon={<EditIcon />}
                                      size="xs"
                                      variant="ghost"
                                      colorScheme="blue"
                                      onClick={() => handleOpenEditVideo(vid)}
                                    />
                                    <IconButton
                                      aria-label="Delete video"
                                      icon={<DeleteIcon />}
                                      size="xs"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() => handleDeleteVideo(vid.video_id)}
                                    />
                                  </HStack>
                                </Flex>
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </SimpleGrid>
      )}

      {/* Create Topic Modal */}
      <Modal isOpen={isTopicOpen} onClose={onTopicClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px" color={textColor} borderRadius="2xl">
          <ModalHeader color={textColor}>Create Main Topic</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleCreateTopic}>
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="xs">Topic Title</FormLabel>
                  <Input
                    placeholder="e.g. Data Structures and Algorithms"
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                    bg={surfaceBg}
                    borderColor={cardBorder}
                    color={textColor}
                    fontSize="sm"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor} fontSize="xs">Description</FormLabel>
                  <Textarea
                    placeholder="Brief summary of overall module..."
                    value={newTopic.description}
                    onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                    bg={surfaceBg}
                    borderColor={cardBorder}
                    color={textColor}
                    rows={3}
                    fontSize="sm"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button variant="ghost" onClick={onTopicClose} size="sm">Cancel</Button>
              <Button type="submit" colorScheme="green" isLoading={isCreatingTopic} size="sm">Create Topic</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Create Subtopic Modal */}
      <Modal isOpen={isSubtopicOpen} onClose={onSubtopicClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px" color={textColor} borderRadius="2xl">
          <ModalHeader color={textColor}>Add Subtopic under "{selectedTopic?.title}"</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleCreateSubtopic}>
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="xs">Subtopic Title</FormLabel>
                  <Input
                    placeholder="e.g. Dynamic Programming Memoization"
                    value={subtopicTitle}
                    onChange={(e) => setSubtopicTitle(e.target.value)}
                    bg={surfaceBg}
                    borderColor={cardBorder}
                    color={textColor}
                    fontSize="sm"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="xs">Order Index</FormLabel>
                  <Input
                    type="number"
                    value={subtopicOrder}
                    onChange={(e) => setSubtopicOrder(parseInt(e.target.value) || 1)}
                    bg={surfaceBg}
                    borderColor={cardBorder}
                    color={textColor}
                    fontSize="sm"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button variant="ghost" onClick={onSubtopicClose} size="sm">Cancel</Button>
              <Button type="submit" colorScheme="green" isLoading={isCreatingSubtopic} size="sm">Add Subtopic</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Add / Edit Video Modal */}
      <Modal isOpen={isVideoModalOpen} onClose={onVideoModalClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px" color={textColor} borderRadius="2xl">
          <ModalHeader color={textColor}>
            {editingVideo ? 'Edit Video Reference' : `Add YouTube Reference (${selectedTopic?.title})`}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSaveVideo}>
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="xs">Video Title</FormLabel>
                  <Input
                    placeholder="e.g. Complete Dynamic Programming Roadmap"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    bg={surfaceBg}
                    borderColor={cardBorder}
                    color={textColor}
                    fontSize="sm"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="xs">Channel / Educator Name</FormLabel>
                  <Input
                    placeholder="e.g. Striver (take U forward) / Apna College"
                    value={videoForm.channel_name}
                    onChange={(e) => setVideoForm({ ...videoForm, channel_name: e.target.value })}
                    bg={surfaceBg}
                    borderColor={cardBorder}
                    color={textColor}
                    fontSize="sm"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="xs">YouTube URL</FormLabel>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoForm.url}
                    onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                    bg={surfaceBg}
                    borderColor={cardBorder}
                    color={textColor}
                    fontSize="sm"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor} fontSize="xs">Description / Coverage</FormLabel>
                  <Textarea
                    placeholder="Brief description of what this video lecture covers..."
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    bg={surfaceBg}
                    borderColor={cardBorder}
                    color={textColor}
                    rows={2}
                    fontSize="sm"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button variant="ghost" onClick={onVideoModalClose} size="sm">Cancel</Button>
              <Button type="submit" colorScheme="green" isLoading={isSavingVideo} size="sm">
                {editingVideo ? 'Update Video' : 'Add Video'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default TopicManagement;
