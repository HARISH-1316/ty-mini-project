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
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

const getSubtopicNavItems = (topicId, subtopicId) => [
  { label: 'Aim', path: `/student/topics/${topicId}/subtopics/${subtopicId}/aim` },
  { label: 'Theory', path: `/student/topics/${topicId}/subtopics/${subtopicId}/theory` },
  { label: 'Quiz', path: `/student/topics/${topicId}/subtopics/${subtopicId}/quiz` },
  { label: 'Coding Assessment', path: `/student/topics/${topicId}/subtopics/${subtopicId}/coding-assessment` },
];

const SidebarNavItem = ({ label, path, onClick }) => {
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
        paddingLeft: '13px',
      })}
    >
      {label}
    </Box>
  );
};

export const SubtopicSidebarContent = ({ topicId, subtopicId, subtopicTitle, onClose }) => {
  const items = getSubtopicNavItems(topicId, subtopicId);
  const labelColor = useColorModeValue('#505750', '#B8C0B9');
  const titleColor = useColorModeValue('#2F8D46', '#A3E635');
  const backColor = useColorModeValue('#505750', '#B8C0B9');
  const dividerColor = useColorModeValue('#DDE5DD', '#3B423C');

  return (
    <VStack spacing={1} align="stretch" w="full">
      {/* Back to Subtopics List */}
      <Box px={4} py={2}>
        <HStack
          as={RouterLink}
          to={`/student/topics/${topicId}/subtopics`}
          spacing={2}
          color={backColor}
          fontSize="xs"
          _hover={{ color: titleColor, textDecoration: 'none' }}
          transition="color 0.15s ease"
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
          color={labelColor}
          textTransform="uppercase"
          letterSpacing="wider"
          mb={1}
        >
          Subtopic
        </Text>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color={titleColor}
          noOfLines={2}
        >
          {subtopicTitle || 'Loading...'}
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

const SubtopicSidebar = ({ isOpen, onClose, topicId, subtopicId, subtopicTitle }) => {
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
        <SubtopicSidebarContent
          topicId={topicId}
          subtopicId={subtopicId}
          subtopicTitle={subtopicTitle}
        />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg={sidebarBg} color={drawerHeaderColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} fontSize="sm">
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
