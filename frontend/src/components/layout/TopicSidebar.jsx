// ──────────────────────────────────────────────
// TopicSidebar — Virtual Lab Topic Navigation
// ──────────────────────────────────────────────

import { NavLink as RouterNavLink } from 'react-router-dom';
import {
  Box,
  VStack,
  Text,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Divider,
} from '@chakra-ui/react';

const getTopicNavItems = (topicId) => [
  { label: 'Introduction', path: `/student/topics/${topicId}/introduction` },
  { label: 'CO / POs', path: `/student/topics/${topicId}/co-pos` },
  { label: 'Prerequisites', path: `/student/topics/${topicId}/prerequisites` },
  { label: 'Prerequisite Quiz', path: `/student/topics/${topicId}/prerequisite-quiz` },
  { label: 'Subtopics', path: `/student/topics/${topicId}/subtopics` },
  { label: 'Final Quiz', path: `/student/topics/${topicId}/final-quiz` },
  { label: 'Final Assessment', path: `/student/topics/${topicId}/final-assessment` },
  { label: 'Feedback', path: `/student/topics/${topicId}/feedback` },
];

const SidebarNavItem = ({ label, path, onClick }) => (
  <Box
    as={RouterNavLink}
    to={path}
    end={path.endsWith('/subtopics')}
    onClick={onClick}
    w="full"
    px={4}
    py={2.5}
    borderRadius="lg"
    fontSize="sm"
    fontWeight="500"
    transition="all 0.2s"
    _hover={{
      bg: 'slate.700',
      color: 'cyan.300',
    }}
    style={({ isActive }) => ({
      backgroundColor: isActive ? '#1e3a5f' : 'transparent',
      color: isActive ? '#22d3ee' : '#94a3b8',
      fontWeight: isActive ? '700' : '500',
      borderLeft: isActive ? '3px solid #22d3ee' : '3px solid transparent',
    })}
  >
    {label}
  </Box>
);

export const TopicSidebarContent = ({ topicId, topicTitle, onClose }) => {
  const items = getTopicNavItems(topicId);

  return (
    <VStack spacing={1} align="stretch" w="full">
      {/* Topic Title */}
      <Box px={4} py={3}>
        <Text
          fontSize="xs"
          fontWeight="bold"
          color="gray.500"
          textTransform="uppercase"
          letterSpacing="wider"
          mb={1}
        >
          Topic
        </Text>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="purple.300"
          noOfLines={2}
        >
          {topicTitle || 'Loading...'}
        </Text>
      </Box>

      <Divider borderColor="slate.700" />

      {/* Navigation Items */}
      <VStack spacing={0.5} align="stretch" px={2} py={2}>
        {items.map((item) => (
          <SidebarNavItem
            key={item.path}
            label={item.label}
            path={item.path}
            onClick={onClose}
          />
        ))}
      </VStack>
    </VStack>
  );
};

const TopicSidebar = ({ isOpen, onClose, topicId, topicTitle }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', md: 'block' }}
        w="250px"
        minW="250px"
        bg="slate.900"
        borderRight="1px solid"
        borderColor="slate.700"
        py={4}
        minH="calc(100vh - 110px)"
        overflowY="auto"
      >
        <TopicSidebarContent topicId={topicId} topicTitle={topicTitle} />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg="slate.900" color="white">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor="slate.700" fontSize="sm">
            Topic Navigation
          </DrawerHeader>
          <DrawerBody p={2}>
            <TopicSidebarContent
              topicId={topicId}
              topicTitle={topicTitle}
              onClose={onClose}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default TopicSidebar;
