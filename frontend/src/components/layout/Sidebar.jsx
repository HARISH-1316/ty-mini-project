// ──────────────────────────────────────────────
// Sidebar Navigation Component
// ──────────────────────────────────────────────

import { NavLink as RouterNavLink } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
} from '@chakra-ui/react';
import useAuth from '../../hooks/useAuth';

// Role-based Navigation Links
const navItemsByRole = {
  student: [
    { label: 'Dashboard', path: '/student/dashboard', icon: 'home' },
    { label: 'My Rooms', path: '/student/rooms', icon: 'rooms' },
    { label: 'Join Room', path: '/student/join-room', icon: 'join' },
    { label: 'Lab Assessments', path: '/student/lab-assessments', icon: 'assessment' },
    { label: 'My Progress', path: '/student/progress', icon: 'progress' },
  ],
  faculty: [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: 'home' },
    { label: 'My Rooms', path: '/faculty/rooms', icon: 'rooms' },
    { label: 'Topic Catalog', path: '/faculty/topics', icon: 'topics' },
    { label: 'Lab Assessments', path: '/faculty/lab-assessments', icon: 'assessment' },
    { label: 'Question Bank', path: '/faculty/lab-questions', icon: 'questions' },
    { label: 'Students & Progress', path: '/faculty/students', icon: 'students' },
    { label: 'Analytics', path: '/faculty/analytics', icon: 'analytics' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'All Users', path: '/admin/users', icon: 'users' },
    { label: 'Role Management', path: '/admin/roles', icon: 'roles' },
    { label: 'Virtual Rooms', path: '/faculty/rooms', icon: 'rooms' },
    { label: 'Topics Catalog', path: '/faculty/topics', icon: 'topics' },
    { label: 'Lab Assessments', path: '/faculty/lab-assessments', icon: 'assessment' },
    { label: 'Question Bank', path: '/faculty/lab-questions', icon: 'questions' },
    { label: 'Student Progress', path: '/admin/progress', icon: 'progress' },
  ],
};

const NavItem = ({ label, path, onClick }) => {
  return (
    <Box
      as={RouterNavLink}
      to={path}
      onClick={onClick}
      w="full"
      px={4}
      py={3}
      borderRadius="xl"
      color="text.primary"
      transition="all 0.2s"
      _hover={{
        bg: 'accent.soft',
        color: 'accent.primary',
      }}
      style={({ isActive }) => ({
        backgroundColor: isActive ? 'var(--chakra-colors-accent-soft)' : 'transparent',
        color: isActive ? 'var(--chakra-colors-accent-primary)' : 'var(--chakra-colors-text-primary)',
        fontWeight: isActive ? '700' : '600',
      })}
    >
      <HStack spacing={3}>
        <Text fontSize="sm">{label}</Text>
      </HStack>
    </Box>
  );
};

export const SidebarContent = ({ onClose }) => {
  const { user } = useAuth();
  const items = navItemsByRole[user?.role] || [];

  return (
    <VStack spacing={2} align="stretch" w="full">
      <Box px={4} py={2}>
        <Text fontSize="xs" fontWeight="bold" color="text.secondary" textTransform="uppercase" letterSpacing="wider">
          {user?.role} Workspace
        </Text>
      </Box>
      {items.map((item) => (
        <NavItem key={item.path} label={item.label} path={item.path} onClick={onClose} />
      ))}
    </VStack>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', md: 'block' }}
        w="240px"
        bg="bg.surface"
        borderRight="1px solid"
        borderColor="border.primary"
        p={4}
        minH="calc(100vh - 61px)"
      >
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg="bg.surface" color="text.primary">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor="border.primary">
            WCE Virtual Lab
          </DrawerHeader>
          <DrawerBody p={4}>
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
