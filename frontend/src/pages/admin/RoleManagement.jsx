// ──────────────────────────────────────────────
// Role Management Page — Admin Only
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  useToast,
  Card,
  CardBody,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { getAllUsersApi, updateUserRoleApi } from '../../api/userApi';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';

const roleBadgeColor = {
  student: 'green',
  faculty: 'blue',
  admin: 'purple',
};

const RoleManagement = () => {
  const toast = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Role Change Confirmation State
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsersApi();
      setUsers(res.data?.users || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch user list for role management.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectRole = (targetUser, newRole) => {
    if (newRole === targetUser.role) return;

    // Self-demotion protection
    if (parseInt(targetUser.user_id, 10) === parseInt(currentUser?.user_id, 10)) {
      toast({
        title: 'Action Prohibited',
        description: 'You cannot modify your own administrator role.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setSelectedUser(targetUser);
    setTargetRole(newRole);
    setIsConfirmOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedUser || !targetRole) return;
    setIsUpdating(true);

    try {
      await updateUserRoleApi(selectedUser.user_id, { role: targetRole });
      toast({
        title: 'Role Updated! 🛡️',
        description: `${selectedUser.name}'s role changed from ${selectedUser.role} to ${targetRole}.`,
        status: 'success',
        duration: 4000,
        position: 'top',
      });
      fetchUsers();
    } catch (err) {
      toast({
        title: 'Role Update Failed',
        description: err.response?.data?.message || 'Failed to update user role.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsUpdating(false);
      setIsConfirmOpen(false);
      setSelectedUser(null);
      setTargetRole('');
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading user role management..." />;
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <VStack spacing={6} align="stretch" w="full">
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="text.primary">Admin Role Control Panel</Heading>
        <Text color="text.secondary" fontSize="sm">
          Assign or update user roles (student ↔ faculty ↔ admin)
        </Text>
      </VStack>

      <InputGroup maxW="md">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="text.secondary" />
        </InputLeftElement>
        <Input
          placeholder="Search user by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          bg="bg.surface"
          borderColor="border.primary"
          color="text.primary"
          _placeholder={{ color: 'text.muted' }}
          _focus={{ borderColor: 'brand.500' }}
        />
      </InputGroup>

      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px" overflow="hidden">
        <CardBody p={0}>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="bg.surface">
                <Tr>
                  <Th color="text.secondary">User ID</Th>
                  <Th color="text.secondary">Name</Th>
                  <Th color="text.secondary">Email</Th>
                  <Th color="text.secondary">Current Role</Th>
                  <Th color="text.secondary">Change Role To</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.map((u) => {
                  const isSelf = parseInt(u.user_id, 10) === parseInt(currentUser?.user_id, 10);
                  return (
                    <Tr key={u.user_id} _hover={{ bg: 'bg.secondary' }}>
                      <Td color="text.secondary" fontWeight="bold">#{u.user_id}</Td>
                      <Td color="text.primary" fontWeight="medium">{u.name}</Td>
                      <Td color="text.secondary">{u.email}</Td>
                      <Td>
                        <Badge colorScheme={roleBadgeColor[u.role] || 'gray'} textTransform="uppercase">
                          {u.role}
                        </Badge>
                      </Td>
                      <Td w="220px">
                        <Select
                          size="xs"
                          value={u.role}
                          onChange={(e) => handleSelectRole(u, e.target.value)}
                          bg="bg.surface"
                          borderColor="border.primary"
                          color="accent.primary"
                          fontWeight="bold"
                          isDisabled={isSelf}
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="admin">Admin</option>
                        </Select>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* Role Change Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmRoleChange}
        title="Confirm Role Change"
        message={`Are you sure you want to change ${selectedUser?.name}'s role from "${selectedUser?.role?.toUpperCase()}" to "${targetRole?.toUpperCase()}"?`}
        confirmText="Change Role"
        colorScheme="purple"
        isLoading={isUpdating}
      />
    </VStack>
  );
};

export default RoleManagement;
