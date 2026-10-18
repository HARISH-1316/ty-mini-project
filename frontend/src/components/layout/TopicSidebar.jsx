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
  useColorModeValue,
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

const SidebarNavItem = ({ label, path, onClick }) => {
  // Use inline style for active/inactive states to leverage CSS variables from Chakra
  // These must be defined at render time, not inside the style callback
  const activeBg = useColorModeValue('#E8F5E9', '#292D2A');
  const activeColor = useColorModeValue('#1E5E2E', '#A3E635');
  const activeBorderColor = useColorModeValue('#2F8D46', '#A3E635');
  const inactiveColor = useColorModeValue('#202124', '#F5F7F5');
  const hoverBg = useColorModeValue('#F0F7F0', '#292D2A');
  const hoverColor = useColorModeValue('#2F8D46', '#A3E635');

  return (
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
      transition="all 0.15s ease"
      color={inactiveColor}
      _hover={{
        bg: hoverBg,
        color: hoverColor,
        textDecoration: 'none',
      }}
      style={({ isActive }) => ({
        backgroundColor: isActive ? activeBg : 'transparent',
        color: isActive ? activeColor : inactiveColor,
        fontWeight: isActive ? '700' : '500',
        borderLeft: isActive
          ? `3px solid ${activeBorderColor}`
          : '3px solid transparent',
        paddingLeft: '13px', // compensate for border
      })}
    >
      {label}
    </Box>
  );
};

export const TopicSidebarContent = ({ topicId, topicTitle, onClose }) => {
  const items = getTopicNavItems(topicId);
  const labelColor = useColorModeValue('#505750', '#B8C0B9');
  const titleColor = useColorModeValue('#2F8D46', '#A3E635');
  const dividerColor = useColorModeValue('#DDE5DD', '#3B423C');

  return (
    <VStack spacing={1} align="stretch" w="full">
      {/* Topic Title */}
      <Box px={4} py={3}>
        <Text
          fontSize="xs"
          fontWeight="bold"
          color={labelColor}
          textTransform="uppercase"
          letterSpacing="wider"
          mb={1}
        >
          Topic
        </Text>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color={titleColor}
          noOfLines={2}
        >
          {topicTitle || 'Loading...'}
        </Text>
      </Box>

      <Divider borderColor={dividerColor} />

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
  const sidebarBg = useColorModeValue('#F5F7F5', '#171918');
  const borderColor = useColorModeValue('#DDE5DD', '#3B423C');
  const drawerHeaderColor = useColorModeValue('#202124', '#F5F7F5');

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', md: 'block' }}
        w="250px"
        minW="250px"
        bg={sidebarBg}
        borderRight="1px solid"
        borderColor={borderColor}
        py={4}
        minH="calc(100vh - 110px)"
        overflowY="auto"
      >
        <TopicSidebarContent topicId={topicId} topicTitle={topicTitle} />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg={sidebarBg} color={drawerHeaderColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} fontSize="sm">
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
