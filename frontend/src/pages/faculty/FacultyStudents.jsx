// ──────────────────────────────────────────────
// Faculty Students & Progress Dashboard
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Badge,
  Progress,
  Tag,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  InputGroup,
  InputLeftElement,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon, ViewIcon } from '@chakra-ui/icons';
import { getFacultyStudentsProgressApi } from '../../api/progressApi';
import { getMyRoomsApi } from '../../api/roomApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const FacultyStudents = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load faculty rooms for filter dropdown
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getMyRoomsApi();
        setRooms(res.data?.rooms || []);
      } catch {
        // non-critical error
      }
    };
    fetchRooms();
  }, []);

  const fetchStudents = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await getFacultyStudentsProgressApi({
        page,
        limit: 15,
        search: search.trim() || undefined,
        roomId: selectedRoom || undefined,
      });
      setStudents(res.data?.students || []);
      setPagination(res.data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      toast({
        title: 'Error loading students',
        description: err.response?.data?.message || 'Could not fetch students.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedRoom, toast]);

  useEffect(() => {
    fetchStudents(1);
  }, [fetchStudents]);

  return (
    <VStack spacing={6} align="stretch" w="full" pb={12}>
      {/* Header */}
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="white">Student Progress Management</Heading>
        <Text color="gray.400" fontSize="sm">
          Track learning completion, quiz performance, and coding achievements for students in your rooms
        </Text>
      </VStack>

      {/* Filter and Search Bar */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody p={4}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by student name or roll number..."
                bg="slate.900"
                borderColor="slate.700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchStudents(1)}
              />
            </InputGroup>

            <Select
              placeholder="All Rooms"
              bg="slate.900"
              borderColor="slate.700"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              {rooms.map((r) => (
                <option key={r.room_id} value={r.room_id}>
                  {r.room_name} ({r.room_code})
                </option>
              ))}
            </Select>

            <Button
              colorScheme="purple"
              onClick={() => fetchStudents(1)}
            >
              Apply Filter
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Student List Table */}
      {isLoading ? (
        <LoadingSpinner label="Loading authorized student progress..." />
      ) : students.length === 0 ? (
        <EmptyState
          title="No Students Found"
          description={
            rooms.length === 0
              ? 'You have not created any rooms yet. Create a room and share the room code with students to track their progress.'
              : 'No students are currently enrolled matching your filters.'
          }
          actionLabel={rooms.length === 0 ? 'Create a Room' : undefined}
          onAction={rooms.length === 0 ? () => navigate('/faculty/rooms') : undefined}
        />
      ) : (
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px" overflow="hidden">
          <CardBody p={0}>
            <Table variant="simple" size="md">
              <Thead bg="slate.900">
                <Tr>
                  <Th color="gray.400">Student</Th>
                  <Th color="gray.400">Roll Number</Th>
                  <Th color="gray.400">Enrolled Rooms</Th>
                  <Th color="gray.400" w="180px">Overall Progress</Th>
                  <Th color="gray.400">Quizzes</Th>
                  <Th color="gray.400">Coding</Th>
                  <Th color="gray.400" textAlign="right">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {students.map((st) => (
                  <Tr key={st.student_id} _hover={{ bg: 'slate.750' }}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text color="white" fontWeight="bold">{st.name}</Text>
                        <Text color="gray.400" fontSize="xs">{st.email}</Text>
                      </VStack>
                    </Td>
                    <Td color="gray.300">{st.roll_number || 'N/A'}</Td>
                    <Td>
                      <HStack spacing={1} flexWrap="wrap">
                        {st.rooms?.map((rm, idx) => (
                          <Tag key={idx} size="sm" colorScheme="purple" variant="subtle">
                            {rm}
                          </Tag>
                        ))}
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="stretch" spacing={1}>
                        <HStack justify="space-between" fontSize="xs">
                          <Text color="gray.400">Complete</Text>
                          <Text color="purple.300" fontWeight="bold">{st.overallProgress}%</Text>
                        </HStack>
                        <Progress
                          value={st.overallProgress}
                          colorScheme={st.overallProgress === 100 ? 'green' : 'purple'}
                          size="xs"
                          borderRadius="full"
                        />
                      </VStack>
                    </Td>
                    <Td color="emerald.300" fontWeight="semibold">
                      {st.quizzesCompleted}
                    </Td>
                    <Td color="amber.300" fontWeight="semibold">
                      {st.codingCompleted}
                    </Td>
                    <Td textAlign="right">
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="purple"
                        leftIcon={<ViewIcon />}
                        onClick={() => navigate(`/faculty/students/${st.student_id}/progress`)}
                      >
                        Inspect
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <HStack justify="space-between" pt={2}>
          <Text color="gray.400" fontSize="sm">
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total students)
          </Text>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              borderColor="slate.700"
              isDisabled={pagination.page <= 1}
              onClick={() => fetchStudents(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              borderColor="slate.700"
              isDisabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchStudents(pagination.page + 1)}
            >
              Next
            </Button>
          </HStack>
        </HStack>
      )}
    </VStack>
  );
};

export default FacultyStudents;
