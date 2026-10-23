// ──────────────────────────────────────────────
// Admin Dashboard
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  VStack,
  HStack,
  Button,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import useAuth from '../../hooks/useAuth';
import { getAllUsersApi } from '../../api/userApi';
import { getMyRoomsApi } from '../../api/roomApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [roomsCount, setRoomsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminMetrics = async () => {
      try {
        const [usersRes, roomsRes] = await Promise.all([
          getAllUsersApi(),
          getMyRoomsApi().catch(() => ({ data: { rooms: [] } })),
        ]);
        setUsers(usersRes.data?.users || []);
        setRoomsCount((roomsRes.data?.rooms || []).length);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load system metrics.',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminMetrics();
  }, [toast]);

  if (isLoading) {
    return <LoadingSpinner label="Loading admin system overview..." />;
  }

  const studentCount = users.filter((u) => u.role === 'student').length;
  const facultyCount = users.filter((u) => u.role === 'faculty').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Welcome Banner */}
      <Box
        p={8}
        borderRadius="2xl"
        bg="bg.card"
        border="1px solid"
        borderColor="border.primary"
        boxShadow="sm"
      >
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
          <VStack align="start" spacing={2}>
            <Heading size="lg" color="text.primary">
              System Administration — Welcome, {user?.name}! 🛡️
            </Heading>
            <Text color="text.secondary" fontSize="sm">
              WCE Virtual Lab Platform Overview & User Control Panel
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button as={RouterLink} to="/admin/users" colorScheme="brand">
              User List
            </Button>
            <Button as={RouterLink} to="/admin/roles" colorScheme="purple" variant="outline">
              Role Management
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Metrics Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Total Users</StatLabel>
              <StatNumber color="accent.primary" fontSize="3xl">{users.length}</StatNumber>
              <StatHelpText color="text.muted">Registered platform accounts</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Students</StatLabel>
              <StatNumber color="green.500" fontSize="3xl">{studentCount}</StatNumber>
              <StatHelpText color="text.muted">Active learners</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Faculty Members</StatLabel>
              <StatNumber color="brand.500" fontSize="3xl">{facultyCount}</StatNumber>
              <StatHelpText color="text.muted">Lab instructors</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Administrators</StatLabel>
              <StatNumber color="purple.500" fontSize="3xl">{adminCount}</StatNumber>
              <StatHelpText color="text.muted">System admins</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Navigation Quick Links */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px" p={4}>
          <CardBody>
            <VStack align="start" spacing={3}>
              <Heading size="md" color="text.primary">User Directory</Heading>
              <Text color="text.secondary" fontSize="sm">
                View all registered accounts, emails, registration dates, and user profiles.
              </Text>
              <Button as={RouterLink} to="/admin/users" size="sm" colorScheme="brand" rightIcon={<ArrowForwardIcon />}>
                View All Users
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px" p={4}>
          <CardBody>
            <VStack align="start" spacing={3}>
              <Heading size="md" color="text.primary">Role Management</Heading>
              <Text color="text.secondary" fontSize="sm">
                Update user roles (student ↔ faculty ↔ admin) with transactional profile sync.
              </Text>
              <Button as={RouterLink} to="/admin/roles" size="sm" colorScheme="brand" rightIcon={<ArrowForwardIcon />}>
                Manage User Roles
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );
};

export default AdminDashboard;
