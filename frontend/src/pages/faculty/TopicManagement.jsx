// ──────────────────────────────────────────────
// Topic Catalog & Content Management — Faculty/Admin
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
  Flex,
  IconButton,
  Badge,
  Divider,
  Icon,
  Link,
  Tooltip,
} from '@chakra-ui/react';
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  CheckCircleIcon,
  WarningIcon,
  ExternalLinkIcon,
  ChevronRightIcon,
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
} from '../../api/topicApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const TopicManagement = () => {
  const toast = useToast();
  const { isOpen: isTopicOpen, onOpen: onTopicOpen, onClose: onTopicClose } = useDisclosure();
  const { isOpen: isSubtopicOpen, onOpen: onSubtopicOpen, onClose: onSubtopicClose } = useDisclosure();

  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);

  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [isLoadingSubtopics, setIsLoadingSubtopics] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

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

  // Load all topics on mount
  const fetchTopics = async () => {
    try {
      setIsLoadingTopics(true);
      const res = await getAllTopicsApi();
      const topicList = res.data?.topics || [];
      setTopics(topicList);

      // Auto-select first topic if available and none selected
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

  // Handle Topic Selection
  const handleSelectTopic = async (topic) => {
    setSelectedTopic(topic);
    setSelectedSubtopic(null);
    setContentForm({ aim: '', theory: '', video_explanation_url: '' });

    try {
      setIsLoadingSubtopics(true);
      const res = await getTopicByIdApi(topic.topic_id);
      const subList = res.data?.topic?.subtopics || [];
      setSubtopics(subList);

      // Auto-select first subtopic if present
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
      toast({
        title: 'Content Loading Notice',
        description: 'No content found yet for this subtopic. You can write and save content below.',
        status: 'info',
        duration: 2500,
      });
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

  // Delete Topic
  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic and all its subtopics?')) return;
    try {
      await deleteTopicApi(topicId);
      toast({ title: 'Topic Deleted', status: 'info', duration: 2000 });
      if (selectedTopic?.topic_id === topicId) {
        setSelectedTopic(null);
        setSelectedSubtopic(null);
      }
      fetchTopics();
    } catch {
      toast({ title: 'Error deleting topic', status: 'error', duration: 2000 });
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
  const handleSaveContent = async (e) => {
    e.preventDefault();
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

      toast({
        title: 'Content Saved Successfully! 💾',
        description: `Updated content for "${selectedSubtopic.title}".`,
        status: 'success',
        duration: 3000,
      });

      // Refresh current subtopic content
      handleSelectSubtopic(selectedSubtopic);
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

  // Publish / Unpublish Toggle
  const handleTogglePublish = async () => {
    if (!selectedSubtopic) return;
    setIsTogglingPublish(true);

    const isCurrentlyPublished = selectedSubtopic.is_published;

    try {
      let res;
      if (isCurrentlyPublished) {
        res = await unpublishSubtopicContentApi(selectedSubtopic.subtopic_id);
        toast({
          title: 'Subtopic Unpublished 🔒',
          description: `"${selectedSubtopic.title}" is now hidden from students.`,
          status: 'info',
          duration: 3000,
        });
      } else {
        res = await publishSubtopicContentApi(selectedSubtopic.subtopic_id);
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

      // Update subtopics list in state
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

  if (isLoadingTopics) {
    return <LoadingSpinner label="Loading topic catalog..." />;
  }

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* Top Header */}
      <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="white">Faculty Content Management</Heading>
          <Text color="gray.400" fontSize="sm">
            Select a topic, navigate subtopics, update educational aim & theory content, and control student publication status.
          </Text>
        </VStack>

        <HStack spacing={3}>
          {selectedTopic && (
            <Button
              as={RouterLink}
              to={`/faculty/topics/${selectedTopic.topic_id}/quizzes`}
              variant="outline"
              colorScheme="purple"
            >
              Manage Quizzes ({selectedTopic.title})
            </Button>
          )}
          <Button onClick={onTopicOpen} leftIcon={<AddIcon />} colorScheme="purple">
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
            <Card bg="slate.800" borderColor="slate.700" borderWidth="1px" borderRadius="xl">
              <CardBody p={4}>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold" color="purple.300" textTransform="uppercase" fontSize="xs" letterSpacing="wider">
                      1. Topics ({topics.length})
                    </Text>
                    <IconButton
                      aria-label="Add topic"
                      icon={<AddIcon />}
                      size="xs"
                      colorScheme="purple"
                      variant="ghost"
                      onClick={onTopicOpen}
                    />
                  </Flex>
                  <Divider borderColor="slate.700" />

                  <VStack align="stretch" spacing={2} maxH="500px" overflowY="auto">
                    {topics.map((t) => {
                      const isSelected = selectedTopic?.topic_id === t.topic_id;
                      return (
                        <Box
                          key={t.topic_id}
                          p={3}
                          borderRadius="md"
                          cursor="pointer"
                          bg={isSelected ? 'purple.900' : 'slate.900'}
                          borderColor={isSelected ? 'purple.500' : 'slate.700'}
                          borderWidth="1px"
                          _hover={{ bg: isSelected ? 'purple.800' : 'slate.700' }}
                          transition="all 0.2s"
                          onClick={() => handleSelectTopic(t)}
                        >
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={0} pr={2}>
                              <Text color={isSelected ? 'white' : 'gray.200'} fontWeight="semibold" fontSize="sm">
                                {t.title}
                              </Text>
                              <Text color="gray.400" fontSize="xs" noOfLines={1}>
                                {t.description || 'No description'}
                              </Text>
                            </VStack>
                            <ChevronRightIcon color={isSelected ? 'purple.300' : 'gray.500'} />
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
          <Box gridColumn={{ base: 'span 1', lg: 'span 4' }}>
            <Card bg="slate.800" borderColor="slate.700" borderWidth="1px" borderRadius="xl">
              <CardBody p={4}>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" color="purple.300" textTransform="uppercase" fontSize="xs" letterSpacing="wider">
                        2. Subtopics ({subtopics.length})
                      </Text>
                      {selectedTopic && (
                        <Text color="gray.400" fontSize="xs" fontWeight="medium" noOfLines={1}>
                          Topic: {selectedTopic.title}
                        </Text>
                      )}
                    </VStack>

                    {selectedTopic && (
                      <Button
                        size="xs"
                        colorScheme="purple"
                        leftIcon={<AddIcon />}
                        onClick={() => {
                          setSubtopicOrder(subtopics.length + 1);
                          onSubtopicOpen();
                        }}
                      >
                        Add Subtopic
                      </Button>
                    )}
                  </Flex>
                  <Divider borderColor="slate.700" />

                  {isLoadingSubtopics ? (
                    <LoadingSpinner label="Loading subtopics..." />
                  ) : subtopics.length === 0 ? (
                    <Text color="gray.400" fontSize="sm" py={4} textAlign="center">
                      No subtopics created for this topic yet. Click "Add Subtopic" above.
                    </Text>
                  ) : (
                    <VStack align="stretch" spacing={2} maxH="500px" overflowY="auto">
                      {subtopics.map((sub) => {
                        const isSelected = selectedSubtopic?.subtopic_id === sub.subtopic_id;
                        return (
                          <Box
                            key={sub.subtopic_id}
                            p={3}
                            borderRadius="md"
                            cursor="pointer"
                            bg={isSelected ? 'slate.700' : 'slate.900'}
                            borderColor={isSelected ? 'purple.400' : 'slate.700'}
                            borderWidth="1px"
                            _hover={{ bg: isSelected ? 'slate.650' : 'slate.750' }}
                            transition="all 0.2s"
                            onClick={() => handleSelectSubtopic(sub)}
                          >
                            <Flex justify="space-between" align="center">
                              <HStack spacing={2}>
                                <Text color="purple.300" fontWeight="bold" fontSize="xs" minW="20px">
                                  #{sub.order_index || '-'}
                                </Text>
                                <Text color={isSelected ? 'white' : 'gray.200'} fontWeight="medium" fontSize="sm">
                                  {sub.title}
                                </Text>
                              </HStack>

                              <Badge colorScheme={sub.is_published ? 'green' : 'orange'} fontSize="10px" px={2} borderRadius="full">
                                {sub.is_published ? 'Published' : 'Draft'}
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

          {/* Column 3: Content Editor Panel */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 5' }}>
            <Card bg="slate.800" borderColor="slate.700" borderWidth="1px" borderRadius="xl">
              <CardBody p={5}>
                {!selectedSubtopic ? (
                  <VStack py={12} spacing={3} align="center">
                    <Icon as={EditIcon} w={8} h={8} color="gray.500" />
                    <Text color="gray.400" fontSize="sm" textAlign="center">
                      Select a topic and subtopic from the left panels to edit educational aim, theory, and video explanation URL.
                    </Text>
                  </VStack>
                ) : isLoadingContent ? (
                  <LoadingSpinner label="Loading subtopic content..." />
                ) : (
                  <form onSubmit={handleSaveContent}>
                    <VStack align="stretch" spacing={4}>
                      {/* Context Breadcrumb & Status */}
                      <Flex justify="space-between" align="start">
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                              {selectedTopic?.title}
                            </Badge>
                            <Text color="gray.500" fontSize="xs">/</Text>
                            <Text color="purple.200" fontWeight="bold" fontSize="sm">
                              {selectedSubtopic.title}
                            </Text>
                          </HStack>
                          <Text color="gray.400" fontSize="xs">
                            Order Index: {selectedSubtopic.order_index}
                          </Text>
                        </VStack>

                        <HStack spacing={2}>
                          <Badge
                            colorScheme={selectedSubtopic.is_published ? 'green' : 'orange'}
                            px={2.5}
                            py={1}
                            borderRadius="md"
                            fontSize="xs"
                          >
                            {selectedSubtopic.is_published ? 'LIVE PUBLISHED' : 'UNPUBLISHED DRAFT'}
                          </Badge>

                          <Button
                            size="xs"
                            colorScheme={selectedSubtopic.is_published ? 'amber' : 'teal'}
                            variant="outline"
                            isLoading={isTogglingPublish}
                            onClick={handleTogglePublish}
                          >
                            {selectedSubtopic.is_published ? 'Unpublish' : 'Publish'}
                          </Button>
                        </HStack>
                      </Flex>

                      <Divider borderColor="slate.700" />

                      {/* Aim Field */}
                      <FormControl isRequired>
                        <FormLabel color="gray.200" fontSize="sm" fontWeight="bold">
                          Aim / Learning Objective
                        </FormLabel>
                        <Textarea
                          placeholder="State the academic aim and key learning objectives of this subtopic..."
                          value={contentForm.aim}
                          onChange={(e) => setContentForm({ ...contentForm, aim: e.target.value })}
                          bg="slate.900"
                          borderColor="slate.700"
                          color="white"
                          fontSize="sm"
                          rows={3}
                          _focus={{ borderColor: 'purple.400' }}
                        />
                      </FormControl>

                      {/* Theory Area */}
                      <FormControl isRequired>
                        <FormLabel color="gray.200" fontSize="sm" fontWeight="bold">
                          Theory & Comprehensive Content (Markdown supported)
                        </FormLabel>
                        <Textarea
                          placeholder="Write detailed educational material including definition, core concepts, working principles, algorithm pseudocode/code examples, time & space complexities..."
                          value={contentForm.theory}
                          onChange={(e) => setContentForm({ ...contentForm, theory: e.target.value })}
                          bg="slate.900"
                          borderColor="slate.700"
                          color="white"
                          fontSize="sm"
                          rows={14}
                          fontFamily="mono"
                          _focus={{ borderColor: 'purple.400' }}
                        />
                      </FormControl>

                      {/* Video URL Input */}
                      <FormControl>
                        <FormLabel color="gray.200" fontSize="sm" fontWeight="bold">
                          Video Explanation URL (Optional)
                        </FormLabel>
                        <Input
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={contentForm.video_explanation_url}
                          onChange={(e) => setContentForm({ ...contentForm, video_explanation_url: e.target.value })}
                          bg="slate.900"
                          borderColor="slate.700"
                          color="white"
                          fontSize="sm"
                          _focus={{ borderColor: 'purple.400' }}
                        />
                        {contentForm.video_explanation_url && (
                          <HStack pt={1} spacing={1}>
                            <ExternalLinkIcon color="purple.400" w={3} h={3} />
                            <Link href={contentForm.video_explanation_url} isExternal color="purple.300" fontSize="xs">
                              Open Video Link
                            </Link>
                          </HStack>
                        )}
                      </FormControl>

                      {/* Save & Action Controls */}
                      <Flex justify="space-between" align="center" pt={2}>
                        <Button
                          colorScheme={selectedSubtopic.is_published ? 'orange' : 'green'}
                          variant="ghost"
                          size="sm"
                          isLoading={isTogglingPublish}
                          onClick={handleTogglePublish}
                        >
                          {selectedSubtopic.is_published ? 'Unpublish Content' : 'Publish Content'}
                        </Button>

                        <Button
                          type="submit"
                          colorScheme="purple"
                          size="md"
                          isLoading={isSavingContent}
                          px={6}
                        >
                          Save Changes
                        </Button>
                      </Flex>
                    </VStack>
                  </form>
                )}
              </CardBody>
            </Card>
          </Box>
        </SimpleGrid>
      )}

      {/* Create Topic Modal */}
      <Modal isOpen={isTopicOpen} onClose={onTopicClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="slate.800" borderColor="slate.700" borderWidth="1px" color="white">
          <ModalHeader>Create Main Topic</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleCreateTopic}>
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="gray.300">Topic Title</FormLabel>
                  <Input
                    placeholder="e.g. Data Structures and Algorithms"
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                    bg="slate.900"
                    borderColor="slate.700"
                    color="white"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.300">Description</FormLabel>
                  <Textarea
                    placeholder="Brief summary of overall module..."
                    value={newTopic.description}
                    onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                    bg="slate.900"
                    borderColor="slate.700"
                    color="white"
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button variant="ghost" colorScheme="gray" onClick={onTopicClose}>Cancel</Button>
              <Button type="submit" colorScheme="purple" isLoading={isCreatingTopic}>Create Topic</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Create Subtopic Modal */}
      <Modal isOpen={isSubtopicOpen} onClose={onSubtopicClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="slate.800" borderColor="slate.700" borderWidth="1px" color="white">
          <ModalHeader>Add Subtopic under "{selectedTopic?.title}"</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleCreateSubtopic}>
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="gray.300">Subtopic Title</FormLabel>
                  <Input
                    placeholder="e.g. Dynamic Programming"
                    value={subtopicTitle}
                    onChange={(e) => setSubtopicTitle(e.target.value)}
                    bg="slate.900"
                    borderColor="slate.700"
                    color="white"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.300">Order Index</FormLabel>
                  <Input
                    type="number"
                    value={subtopicOrder}
                    onChange={(e) => setSubtopicOrder(parseInt(e.target.value) || 1)}
                    bg="slate.900"
                    borderColor="slate.700"
                    color="white"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button variant="ghost" colorScheme="gray" onClick={onSubtopicClose}>Cancel</Button>
              <Button type="submit" colorScheme="purple" isLoading={isCreatingSubtopic}>Add Subtopic</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default TopicManagement;
