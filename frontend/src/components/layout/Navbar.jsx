// ──────────────────────────────────────────────
// Top Navigation Bar Component
// ──────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Flex,
  Heading,
  HStack,
  Text,
  Badge,
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import useAuth from '../../hooks/useAuth';

const roleBadgeColor = {
  student: 'green',
  faculty: 'blue',
  admin: 'purple',
};

const Navbar = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been signed out successfully.',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      navigate('/login', { replace: true });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to log out.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getDashboardPath = () => {
    if (user?.role === 'student') return '/student/dashboard';
    if (user?.role === 'faculty') return '/faculty/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/login';
  };

  return (
    <>
      <Flex
        as="header"
        align="center"
        justify="space-between"
        px={{ base: 4, md: 8 }}
        py={3}
        bg="slate.900"
        borderBottom="1px solid"
        borderColor="slate.800"
        position="sticky"
        top={0}
        zIndex={100}
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.4)"
      >
        {/* Left: Mobile Drawer Button + Brand Logo */}
        <HStack spacing={4}>
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            aria-label="Open navigation menu"
            icon={<HamburgerIcon />}
            variant="ghost"
            color="gray.300"
            onClick={onOpenSidebar}
          />
          <Heading
            as={RouterLink}
            to={getDashboardPath()}
            size="md"
            bgGradient="linear(to-r, purple.400, pink.400, cyan.400)"
            bgClip="text"
            fontWeight="extrabold"
            letterSpacing="tight"
            _hover={{ textDecoration: 'none' }}
          >
            WCE Virtual Lab
          </Heading>
        </HStack>

        {/* Right: User Menu */}
        <HStack spacing={4}>
          <Menu placement="bottom-end">
            <MenuButton
              as={Button}
              variant="ghost"
              px={2}
              py={1}
              borderRadius="full"
              _hover={{ bg: 'slate.800' }}
              rightIcon={<ChevronDownIcon color="gray.400" />}
            >
              <HStack spacing={3}>
                <Avatar
                  size="sm"
                  name={user?.name}
                  bg="purple.500"
                  color="white"
                />
                <VStack spacing={0} align="start" display={{ base: 'none', lg: 'flex' }}>
                  <Text color="white" fontSize="xs" fontWeight="bold" lineHeight="short">
                    {user?.name}
                  </Text>
                  <Badge
                    colorScheme={roleBadgeColor[user?.role] || 'gray'}
                    fontSize="9px"
                    px={1.5}
                    py={0}
                    borderRadius="sm"
                    textTransform="uppercase"
                  >
                    {user?.role}
                  </Badge>
                </VStack>
              </HStack>
            </MenuButton>

            <MenuList bg="slate.800" borderColor="slate.700" color="white" shadow="xl">
              <MenuItem bg="slate.800" _hover={{ bg: 'slate.700' }} onClick={onOpen}>
                Profile Info
              </MenuItem>
              <MenuDivider borderColor="slate.700" />
              <MenuItem
                bg="slate.800"
                color="red.300"
                _hover={{ bg: 'red.900', color: 'red.100' }}
                onClick={handleLogout}
                isDisabled={isLoggingOut}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* User Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="slate.800" borderColor="slate.700" borderWidth="1px" color="white">
          <ModalHeader>User Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Flex justify="center" py={2}>
                <Avatar size="xl" name={user?.name} bg="purple.500" />
              </Flex>
              <HStack justify="space-between" bg="slate.900" p={3} borderRadius="lg">
                <Text color="gray.400" fontSize="sm">Full Name</Text>
                <Text fontWeight="bold">{user?.name}</Text>
              </HStack>
              <HStack justify="space-between" bg="slate.900" p={3} borderRadius="lg">
                <Text color="gray.400" fontSize="sm">Email</Text>
                <Text fontWeight="bold">{user?.email}</Text>
              </HStack>
              <HStack justify="space-between" bg="slate.900" p={3} borderRadius="lg">
                <Text color="gray.400" fontSize="sm">Role</Text>
                <Badge colorScheme={roleBadgeColor[user?.role] || 'gray'} textTransform="uppercase">
                  {user?.role}
                </Badge>
              </HStack>

              {user?.profile && user.role === 'student' && (
                <>
                  <HStack justify="space-between" bg="slate.900" p={3} borderRadius="lg">
                    <Text color="gray.400" fontSize="sm">Roll Number</Text>
                    <Text fontWeight="bold">{user.profile.roll_number}</Text>
                  </HStack>
                  {user.profile.course && (
                    <HStack justify="space-between" bg="slate.900" p={3} borderRadius="lg">
                      <Text color="gray.400" fontSize="sm">Course</Text>
                      <Text fontWeight="bold">{user.profile.course}</Text>
                    </HStack>
                  )}
                </>
              )}

              {user?.profile && user.role === 'faculty' && (
                <HStack justify="space-between" bg="slate.900" p={3} borderRadius="lg">
                  <Text color="gray.400" fontSize="sm">Designation</Text>
                  <Text fontWeight="bold">{user.profile.designation}</Text>
                </HStack>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Navbar;
