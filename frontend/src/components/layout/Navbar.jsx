// ──────────────────────────────────────────────
// Top Navigation Bar Component
// ──────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
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
  useColorMode,
  Box,
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon, SunIcon, MoonIcon, BellIcon } from '@chakra-ui/icons';
import useAuth from '../../hooks/useAuth';
import { getRecentFacultyViolationsApi } from '../../api/labApi';

const roleBadgeColor = {
  student: 'orange',
  faculty: 'brand',
  admin: 'red',
};

const Navbar = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [violations, setViolations] = useState([]);
  const lastSeenViolationIdRef = useRef(null);

  // Poll for proctoring violations if user is faculty or admin
  useEffect(() => {
    if (user?.role !== 'faculty' && user?.role !== 'admin') return;

    let isSubscribed = true;

    const pollViolations = async () => {
      try {
        const res = await getRecentFacultyViolationsApi();
        const list = res.data?.data?.violations || [];
        if (!isSubscribed) return;

        setViolations(list);

        // Check for newly arrived violations to notify faculty
        if (list.length > 0) {
          const newest = list[0];
          if (
            lastSeenViolationIdRef.current !== null &&
            newest.violation_id !== lastSeenViolationIdRef.current
          ) {
            const unseen = list.filter(
              (v) => v.violation_id > lastSeenViolationIdRef.current
            );
            unseen.forEach((v) => {
              toast({
                id: `proctor-alert-${v.violation_id}`,
                title: '🚨 Anti-Cheat Alert: Student Violation!',
                description: `${v.student_name} (${v.roll_number}) in "${v.lab_title || 'Assessment'}": ${v.violation_type?.replace(/_/g, ' ').toUpperCase()}`,
                status: 'error',
                duration: 8000,
                isClosable: true,
                position: 'top-right',
              });
            });
          }
          lastSeenViolationIdRef.current = newest.violation_id;
        }
      } catch {}
    };

    pollViolations();
    const interval = setInterval(pollViolations, 4000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [user?.role, toast]);

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
        bg="bg.surface"
        borderBottom="1px solid"
        borderColor="border.primary"
        position="sticky"
        top={0}
        zIndex={100}
        boxShadow="sm"
      >
        {/* Left: Mobile Drawer Button + Brand Logo */}
        <HStack spacing={4}>
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            aria-label="Open navigation menu"
            icon={<HamburgerIcon />}
            variant="ghost"
            color="text.secondary"
            onClick={onOpenSidebar}
          />
          <Heading
            as={RouterLink}
            to={getDashboardPath()}
            size="md"
            color="accent.primary"
            fontWeight="extrabold"
            letterSpacing="tight"
            _hover={{ textDecoration: 'none' }}
          >
            WCE Virtual Lab
          </Heading>
        </HStack>

        {/* Right: Notification Bell + Color Mode Toggle + User Menu */}
        <HStack spacing={3}>
          {/* Faculty / Admin Proctoring Notification Bell */}
          {(user?.role === 'faculty' || user?.role === 'admin') && (
            <Menu placement="bottom-end">
              <MenuButton
                as={Box}
                position="relative"
                cursor="pointer"
                p={2}
                borderRadius="full"
                _hover={{ bg: 'accent.soft' }}
              >
                <BellIcon boxSize={5} color={violations.length > 0 ? 'red.500' : 'text.secondary'} />
                {violations.length > 0 && (
                  <Badge
                    colorScheme="red"
                    variant="solid"
                    position="absolute"
                    top="-1px"
                    right="-1px"
                    borderRadius="full"
                    fontSize="2xs"
                    px={1.5}
                    py={0}
                    boxShadow="0 0 8px rgba(239, 68, 68, 0.6)"
                  >
                    {violations.length}
                  </Badge>
                )}
              </MenuButton>
              <MenuList
                bg="bg.card"
                borderColor="border.primary"
                color="text.primary"
                shadow="2xl"
                maxW="360px"
                maxH="400px"
                overflowY="auto"
                p={2}
              >
                <Flex justify="space-between" align="center" px={3} py={2} borderBottom="1px solid" borderColor="border.primary">
                  <Text fontWeight="bold" fontSize="xs">
                    🛡️ Live Anti-Cheat Alerts
                  </Text>
                  <Badge colorScheme={violations.length > 0 ? 'red' : 'green'} fontSize="2xs">
                    {violations.length > 0 ? `${violations.length} Incident(s)` : 'All Clean'}
                  </Badge>
                </Flex>
                {violations.length === 0 ? (
                  <Box p={4} textAlign="center">
                    <Text fontSize="xs" color="text.secondary">
                      ✓ No proctoring violations recorded in your rooms.
                    </Text>
                  </Box>
                ) : (
                  violations.map((v) => (
                    <MenuItem
                      key={v.violation_id}
                      bg="bg.card"
                      _hover={{ bg: 'accent.soft' }}
                      borderRadius="md"
                      my={1}
                      onClick={() => navigate(`/faculty/lab-assessments/${v.lab_id}/results`)}
                    >
                      <VStack align="start" spacing={0.5} w="full">
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold" fontSize="xs" color="red.500">
                            ⚠️ {v.violation_type?.replace(/_/g, ' ').toUpperCase()}
                          </Text>
                          <Text fontSize="2xs" color="text.secondary">
                            {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" fontWeight="600" color="text.primary">
                          {v.student_name} ({v.roll_number})
                        </Text>
                        <Text fontSize="2xs" color="text.secondary" isTruncated maxW="280px">
                          {v.lab_title || 'Lab Assessment'} • {v.details}
                        </Text>
                      </VStack>
                    </MenuItem>
                  ))
                )}
              </MenuList>
            </Menu>
          )}

          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'dark' ? <SunIcon color="accent.primary" /> : <MoonIcon color="accent.primary" />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
            borderRadius="full"
            _hover={{ bg: 'accent.soft' }}
          />

          <Menu placement="bottom-end">
            <MenuButton
              as={Button}
              variant="ghost"
              px={2}
              py={1}
              borderRadius="full"
              _hover={{ bg: 'accent.soft' }}
              rightIcon={<ChevronDownIcon color="text.secondary" />}
            >
              <HStack spacing={3}>
                <Avatar
                  size="sm"
                  name={user?.name}
                  bg="brand.500"
                  color="pureWhite"
                />
                <VStack spacing={0} align="start" display={{ base: 'none', lg: 'flex' }}>
                  <Text color="text.primary" fontSize="xs" fontWeight="bold" lineHeight="short">
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

            <MenuList bg="bg.card" borderColor="border.primary" color="text.primary" shadow="xl">
              <MenuItem bg="bg.card" _hover={{ bg: 'accent.soft' }} onClick={onOpen}>
                Profile Info
              </MenuItem>
              <MenuDivider borderColor="border.primary" />
              <MenuItem
                bg="bg.card"
                color="red.500"
                _hover={{ bg: 'accent.soft', color: 'red.600' }}
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
        <ModalContent bg="bg.card" borderColor="border.primary" borderWidth="1px" color="text.primary">
          <ModalHeader>User Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Flex justify="center" py={2}>
                <Avatar size="xl" name={user?.name} bg="brand.500" />
              </Flex>
              <HStack justify="space-between" bg="bg.secondary" p={3} borderRadius="lg">
                <Text color="text.secondary" fontSize="sm">Full Name</Text>
                <Text fontWeight="bold">{user?.name}</Text>
              </HStack>
              <HStack justify="space-between" bg="bg.secondary" p={3} borderRadius="lg">
                <Text color="text.secondary" fontSize="sm">Email</Text>
                <Text fontWeight="bold">{user?.email}</Text>
              </HStack>
              <HStack justify="space-between" bg="bg.secondary" p={3} borderRadius="lg">
                <Text color="text.secondary" fontSize="sm">Role</Text>
                <Badge colorScheme={roleBadgeColor[user?.role] || 'gray'} textTransform="uppercase">
                  {user?.role}
                </Badge>
              </HStack>

              {user?.profile && user.role === 'student' && (
                <>
                  <HStack justify="space-between" bg="bg.secondary" p={3} borderRadius="lg">
                    <Text color="text.secondary" fontSize="sm">Roll Number</Text>
                    <Text fontWeight="bold">{user.profile.roll_number}</Text>
                  </HStack>
                  {user.profile.course && (
                    <HStack justify="space-between" bg="bg.secondary" p={3} borderRadius="lg">
                      <Text color="text.secondary" fontSize="sm">Course</Text>
                      <Text fontWeight="bold">{user.profile.course}</Text>
                    </HStack>
                  )}
                </>
              )}

              {user?.profile && user.role === 'faculty' && (
                <HStack justify="space-between" bg="bg.secondary" p={3} borderRadius="lg">
                  <Text color="text.secondary" fontSize="sm">Designation</Text>
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
