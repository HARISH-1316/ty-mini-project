// ──────────────────────────────────────────────
// SubtopicLayout — Dedicated Subtopic Page Layout
// ──────────────────────────────────────────────
// Provides: Navbar, Breadcrumbs, SubtopicSidebar, Content Outlet
// Fetches subtopic + topic data, shares via Outlet context.
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { Flex, Box, IconButton, useDisclosure } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import SubtopicSidebar from '../components/layout/SubtopicSidebar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { getTopicByIdApi, getSubtopicByIdApi, getSubtopicContentApi } from '../api/topicApi';

const SubtopicLayout = () => {
  const { topicId, subtopicId } = useParams();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [topic, setTopic] = useState(null);
  const [subtopic, setSubtopic] = useState(null);
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [topicRes, subtopicRes, contentRes] = await Promise.all([
          getTopicByIdApi(topicId),
          getSubtopicByIdApi(subtopicId),
          getSubtopicContentApi(subtopicId).catch(() => ({ data: { content: null } })),
        ]);
        setTopic(topicRes.data?.topic || null);
        setSubtopic(subtopicRes.data?.subtopic || null);
        setContent(contentRes.data?.content || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load subtopic.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [topicId, subtopicId]);

  if (isLoading) {
    return (
      <Flex direction="column" minH="100vh" bg="dark.bg">
        <Navbar onOpenSidebar={onOpen} />
        <LoadingSpinner label="Loading subtopic..." />
      </Flex>
    );
  }

  if (error || !subtopic) {
    return (
      <Flex direction="column" minH="100vh" bg="dark.bg">
        <Navbar onOpenSidebar={onOpen} />
        <Box flex={1} p={8}>
          <EmptyState
            title="Subtopic Not Found"
            description={error || 'The requested subtopic could not be loaded.'}
            actionLabel="Back to Topic"
            onAction={() => navigate(`/student/topics/${topicId}/subtopics`)}
          />
        </Box>
      </Flex>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', path: '/student/dashboard' },
    { label: topic?.title || 'Topic', path: `/student/topics/${topicId}/introduction` },
    { label: subtopic.title },
  ];

  return (
    <Flex direction="column" minH="100vh" bg="dark.bg">
      <Navbar onOpenSidebar={onOpen} />
      <Breadcrumbs items={breadcrumbItems} />

      {/* Mobile sidebar toggle */}
      <Box display={{ base: 'flex', md: 'none' }} px={4} py={2}>
        <IconButton
          aria-label="Open subtopic navigation"
          icon={<HamburgerIcon />}
          variant="ghost"
          color="gray.300"
          onClick={onOpen}
          size="sm"
        />
      </Box>

      <Flex flex={1}>
        <SubtopicSidebar
          isOpen={isOpen}
          onClose={onClose}
          topicId={topicId}
          subtopicId={subtopicId}
          subtopicTitle={subtopic.title}
        />
        <Box flex={1} p={{ base: 4, md: 8 }} maxW="5xl" w="full" overflowY="auto">
          <Outlet context={{ topic, subtopic, content, topicId, subtopicId }} />
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
};

export default SubtopicLayout;
