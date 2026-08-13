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
        <Heading size="lg" color="white">User Directory</Heading>
        <Text color="gray.400" fontSize="sm">
          Complete list of registered accounts across all roles
        </Text>
      </VStack>

      <InputGroup maxW="md">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.500" />
        </InputLeftElement>
        <Input
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          bg="slate.800"
          borderColor="slate.700"
          color="white"
          _placeholder={{ color: 'gray.500' }}
          _focus={{ borderColor: 'purple.400' }}
        />
      </InputGroup>

      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px" overflow="hidden">
        <CardBody p={0}>
          {filteredUsers.length === 0 ? (
            <EmptyState title="No Users Found" description="No accounts match your search filter." />
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="slate.900">
                  <Tr>
                    <Th color="gray.400">ID</Th>
                    <Th color="gray.400">Full Name</Th>
                    <Th color="gray.400">Email Address</Th>
                    <Th color="gray.400">Role</Th>
                    <Th color="gray.400">Registration Date</Th>
                    <Th color="gray.400">Last Login</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredUsers.map((u) => (
                    <Tr key={u.user_id} _hover={{ bg: 'slate.700' }}>
                      <Td color="gray.400" fontWeight="bold">#{u.user_id}</Td>
                      <Td color="white" fontWeight="medium">{u.name}</Td>
                      <Td color="gray.300">{u.email}</Td>
                      <Td>
                        <Badge colorScheme={roleBadgeColor[u.role] || 'gray'} textTransform="uppercase">
                          {u.role}
                        </Badge>
                      </Td>
                      <Td color="gray.400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </Td>
                      <Td color="gray.400">
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
