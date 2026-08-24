// ──────────────────────────────────────────────
// SubtopicSidebar — Virtual Lab Subtopic Navigation
// ──────────────────────────────────────────────

import { NavLink as RouterNavLink, Link as RouterLink } from 'react-router-dom';
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
  HStack,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

const getSubtopicNavItems = (topicId, subtopicId) => [
  { label: 'Aim', path: `/student/topics/${topicId}/subtopics/${subtopicId}/aim` },
  { label: 'Theory', path: `/student/topics/${topicId}/subtopics/${subtopicId}/theory` },
  { label: 'Quiz', path: `/student/topics/${topicId}/subtopics/${subtopicId}/quiz` },
  { label: 'Coding Assessment', path: `/student/topics/${topicId}/subtopics/${subtopicId}/coding-assessment` },
];

const SidebarNavItem = ({ label, path, onClick }) => (
  <Box
    as={RouterNavLink}
    to={path}
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

export const SubtopicSidebarContent = ({ topicId, subtopicId, subtopicTitle, onClose }) => {
  const items = getSubtopicNavItems(topicId, subtopicId);

  return (
    <VStack spacing={1} align="stretch" w="full">
      {/* Back to Subtopics List */}
      <Box px={4} py={2}>
        <HStack
          as={RouterLink}
          to={`/student/topics/${topicId}/subtopics`}
          spacing={2}
          color="gray.400"
          fontSize="xs"
          _hover={{ color: 'purple.300' }}
          transition="color 0.2s"
          onClick={onClose}
        >
          <ArrowBackIcon />
          <Text>All Subtopics</Text>
        </HStack>
      </Box>

      {/* Subtopic Title */}
      <Box px={4} py={2}>
        <Text
          fontSize="xs"
          fontWeight="bold"
          color="gray.500"
          textTransform="uppercase"
          letterSpacing="wider"
          mb={1}
        >
          Subtopic
        </Text>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="purple.300"
          noOfLines={2}
        >
          {subtopicTitle || 'Loading...'}
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

const SubtopicSidebar = ({ isOpen, onClose, topicId, subtopicId, subtopicTitle }) => {
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
        <SubtopicSidebarContent
          topicId={topicId}
          subtopicId={subtopicId}
          subtopicTitle={subtopicTitle}
        />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg="slate.900" color="white">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor="slate.700" fontSize="sm">
            Subtopic Navigation
          </DrawerHeader>
          <DrawerBody p={2}>
            <SubtopicSidebarContent
              topicId={topicId}
              subtopicId={subtopicId}
              subtopicTitle={subtopicTitle}
              onClose={onClose}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SubtopicSidebar;
