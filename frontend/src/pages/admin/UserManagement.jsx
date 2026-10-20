// ──────────────────────────────────────────────
// User Management Page — Admin Only
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
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { getAllUsersApi } from '../../api/userApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const roleBadgeColor = {
  student: 'green',
  faculty: 'blue',
  admin: 'purple',
};

const UserManagement = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsersApi();
        setUsers(res.data?.users || []);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to fetch user list.',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  if (isLoading) {
    return <LoadingSpinner label="Loading user directory..." />;
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <VStack spacing={6} align="stretch" w="full">
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="text.primary">User Directory</Heading>
        <Text color="text.secondary" fontSize="sm">
          Complete list of registered accounts across all roles
        </Text>
      </VStack>

      <InputGroup maxW="md">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="text.secondary" />
        </InputLeftElement>
        <Input
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          bg="bg.card"
          borderColor="border.primary"
          color="text.primary"
          _placeholder={{ color: 'text.secondary' }}
          _focus={{ borderColor: 'accent.primary' }}
        />
      </InputGroup>

      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px" overflow="hidden">
        <CardBody p={0}>
          {filteredUsers.length === 0 ? (
            <EmptyState title="No Users Found" description="No accounts match your search filter." />
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="bg.secondary">
                  <Tr>
                    <Th color="text.secondary">ID</Th>
                    <Th color="text.secondary">Full Name</Th>
                    <Th color="text.secondary">Email Address</Th>
                    <Th color="text.secondary">Role</Th>
                    <Th color="text.secondary">Registration Date</Th>
                    <Th color="text.secondary">Last Login</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredUsers.map((u) => (
                    <Tr key={u.user_id} _hover={{ bg: 'accent.soft' }}>
                      <Td color="text.secondary" fontWeight="bold">#{u.user_id}</Td>
                      <Td color="text.primary" fontWeight="medium">{u.name}</Td>
                      <Td color="text.secondary">{u.email}</Td>
                      <Td>
                        <Badge colorScheme={roleBadgeColor[u.role] || 'gray'} textTransform="uppercase">
                          {u.role}
                        </Badge>
                      </Td>
                      <Td color="text.secondary">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </Td>
                      <Td color="text.secondary">
                        {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
};

export default UserManagement;
