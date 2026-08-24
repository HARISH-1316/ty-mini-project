// ──────────────────────────────────────────────
// TopicLayout — Dedicated Topic Page Layout
// ──────────────────────────────────────────────
// Provides: Navbar, Breadcrumbs, TopicSidebar, Content Outlet
// Fetches topic data once, shares via Outlet context.
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { Flex, Box, IconButton, useDisclosure } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import TopicSidebar from '../components/layout/TopicSidebar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { getTopicByIdApi } from '../api/topicApi';

const TopicLayout = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [topic, setTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopic = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getTopicByIdApi(topicId);
        setTopic(res.data?.topic || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load topic.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopic();
  }, [topicId]);

  if (isLoading) {
    return (
      <Flex direction="column" minH="100vh" bg="dark.bg">
        <Navbar onOpenSidebar={onOpen} />
        <LoadingSpinner label="Loading topic..." />
      </Flex>
    );
  }

  if (error || !topic) {
    return (
      <Flex direction="column" minH="100vh" bg="dark.bg">
        <Navbar onOpenSidebar={onOpen} />
        <Box flex={1} p={8}>
          <EmptyState
            title="Topic Not Found"
            description={error || 'The requested topic could not be loaded.'}
            actionLabel="Back to Dashboard"
            onAction={() => navigate('/student/dashboard')}
          />
        </Box>
      </Flex>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', path: '/student/dashboard' },
    { label: 'Topics', path: '/student/dashboard' },
    { label: topic.title },
  ];

  return (
    <Flex direction="column" minH="100vh" bg="dark.bg">
      <Navbar onOpenSidebar={onOpen} />
      <Breadcrumbs items={breadcrumbItems} />

      {/* Mobile sidebar toggle */}
      <Box display={{ base: 'flex', md: 'none' }} px={4} py={2}>
        <IconButton
          aria-label="Open topic navigation"
          icon={<HamburgerIcon />}
          variant="ghost"
          color="gray.300"
          onClick={onOpen}
          size="sm"
        />
      </Box>

      <Flex flex={1}>
        <TopicSidebar
          isOpen={isOpen}
          onClose={onClose}
          topicId={topicId}
          topicTitle={topic.title}
        />
        <Box flex={1} p={{ base: 4, md: 8 }} maxW="5xl" w="full" overflowY="auto">
          <Outlet context={{ topic, topicId }} />
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
};

export default TopicLayout;
