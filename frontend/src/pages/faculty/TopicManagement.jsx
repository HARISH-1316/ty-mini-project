// ──────────────────────────────────────────────
// Topic Catalog & Content Management — Faculty/Admin
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  getAllTopicsApi,
  createTopicApi,
  deleteTopicApi,
  createSubtopicApi,
  upsertSubtopicContentApi,
} from '../../api/topicApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const TopicManagement = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Topic State
  const [newTopic, setNewTopic] = useState({ title: '', description: '' });
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  // Subtopic Creation Modal State
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [subtopicTitle, setSubtopicTitle] = useState('');
  const [isSubtopicModalOpen, setIsSubtopicModalOpen] = useState(false);

  // Subtopic Content State
  const [activeSubtopicId, setActiveSubtopicId] = useState(null);
  const [contentForm, setContentForm] = useState({ aim: '', theory: '', video_explanation_url: '' });
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  const fetchTopics = async () => {
    try {
      const res = await getAllTopicsApi();
      setTopics(res.data?.topics || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch topic catalog.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.title.trim()) return;
    setIsCreatingTopic(true);

    try {
      await createTopicApi(newTopic);
      toast({
        title: 'Topic Created! 📚',
        description: `Topic "${newTopic.title}" created successfully.`,
        status: 'success',
        duration: 3000,
      });
      setNewTopic({ title: '', description: '' });
      onClose();
      fetchTopics();
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

  const handleDeleteTopic = async (topicId) => {
    try {
      await deleteTopicApi(topicId);
      toast({ title: 'Topic Deleted', status: 'info', duration: 2000 });
      fetchTopics();
    } catch {
      toast({ title: 'Error deleting topic', status: 'error', duration: 2000 });
    }
  };

  const handleAddSubtopic = async (e) => {
    e.preventDefault();
    if (!subtopicTitle.trim() || !activeTopicId) return;

    try {
      await createSubtopicApi(activeTopicId, { title: subtopicTitle.trim() });
      toast({ title: 'Subtopic Added', status: 'success', duration: 2000 });
      setSubtopicTitle('');
      setIsSubtopicModalOpen(false);
      fetchTopics();
    } catch {
      toast({ title: 'Error adding subtopic', status: 'error', duration: 2000 });
    }
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    if (!activeSubtopicId) return;

    try {
      await upsertSubtopicContentApi(activeSubtopicId, contentForm);
      toast({ title: 'Content Saved', status: 'success', duration: 2000 });
      setIsContentModalOpen(false);
      fetchTopics();
    } catch {
      toast({ title: 'Error saving content', status: 'error', duration: 2000 });
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading topic catalog..." />;
  }

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Flex justify="space-between" align="center" direction={{ base: 'column', sm: 'row' }} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="white">Topic Catalog & Content Editor</Heading>
          <Text color="gray.400" fontSize="sm">
            Create lab topics, add subtopics, and write aim/theory/video materials
          </Text>
        </VStack>
        <Button onClick={onOpen} leftIcon={<AddIcon />} colorScheme="purple">
          Create New Topic
        </Button>
      </Flex>

      {topics.length === 0 ? (
        <EmptyState
          title="No Topics in Catalog"
          description="Create your first topic to build out lab experiments and theory modules."
          actionLabel="Create Topic Now"
          onAction={onOpen}
        />
      ) : (
        <VStack spacing={6} align="stretch">
          {topics.map((t) => (
            <Card key={t.topic_id} bg="slate.800" borderColor="slate.700" borderWidth="1px" borderRadius="xl">
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Flex justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                      <Heading size="md" color="white">{t.title}</Heading>
                      <Text color="gray.400" fontSize="sm">{t.description || 'No description provided.'}</Text>
                    </VStack>
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        colorScheme="purple"
                        leftIcon={<AddIcon />}
                        onClick={() => {
                          setActiveTopicId(t.topic_id);
                          setIsSubtopicModalOpen(true);
                        }}
                      >
                        Add Subtopic
                      </Button>
                      <IconButton
                        aria-label="Delete topic"
                        icon={<DeleteIcon />}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteTopic(t.topic_id)}
                      />
                    </HStack>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      {/* Create Topic Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="slate.800" borderColor="slate.700" borderWidth="1px" color="white">
          <ModalHeader>Create New Topic</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleCreateTopic}>
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="gray.300">Topic Title</FormLabel>
                  <Input
                    placeholder="e.g. Binary Search Trees & Applications"
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
                    placeholder="Brief description of learning objectives..."
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
              <Button variant="ghost" colorScheme="gray" onClick={onClose}>Cancel</Button>
              <Button type="submit" colorScheme="purple" isLoading={isCreatingTopic}>Create Topic</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Create Subtopic Modal */}
      <Modal isOpen={isSubtopicModalOpen} onClose={() => setIsSubtopicModalOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="slate.800" borderColor="slate.700" borderWidth="1px" color="white">
          <ModalHeader>Add Subtopic</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleAddSubtopic}>
            <ModalBody pb={6}>
              <FormControl isRequired>
                <FormLabel color="gray.300">Subtopic Title</FormLabel>
                <Input
                  placeholder="e.g. BST Insertion Algorithm"
                  value={subtopicTitle}
                  onChange={(e) => setSubtopicTitle(e.target.value)}
                  bg="slate.900"
                  borderColor="slate.700"
                  color="white"
                />
              </FormControl>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button variant="ghost" colorScheme="gray" onClick={() => setIsSubtopicModalOpen(false)}>Cancel</Button>
              <Button type="submit" colorScheme="purple">Add Subtopic</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default TopicManagement;
