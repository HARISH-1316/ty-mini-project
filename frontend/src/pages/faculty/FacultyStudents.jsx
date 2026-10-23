// ──────────────────────────────────────────────
// Faculty Students & Progress Dashboard
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  InputGroup,
  InputLeftElement,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon, ViewIcon } from '@chakra-ui/icons';
import { getFacultyStudentsProgressApi } from '../../api/progressApi';
import { getMyRoomsApi } from '../../api/roomApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const FacultyStudents = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#292D2A');
  const tableHeaderBg = useColorModeValue('#E8EFE9', '#1A1D1B');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#B8C0B9');
  const tableHoverBg = useColorModeValue('#F7FAF8', '#252926');

  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(searchParams.get('roomId') || '');
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
    setStudents([]);
    fetchStudents(1);
  }, [fetchStudents]);

  return (
    <VStack spacing={6} align="stretch" w="full" pb={12}>
      {/* Header */}
      <VStack align="start" spacing={1}>
        <Heading size="lg" color={textColor}>Student Progress Management</Heading>
        <Text color={mutedText} fontSize="sm">
          Track learning completion, quiz performance, and coding achievements strictly for students in your selected room
        </Text>
      </VStack>

      {/* Filter and Search Bar */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" boxShadow="sm">
        <CardBody p={4}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={mutedText} />
              </InputLeftElement>
              <Input
                placeholder="Search by student name or roll number..."
                bg={surfaceBg}
                borderColor={cardBorder}
                color={textColor}
                _placeholder={{ color: mutedText }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchStudents(1)}
              />
            </InputGroup>

            <Select
              placeholder="All Rooms"
              bg={surfaceBg}
              borderColor={cardBorder}
              color={textColor}
              value={selectedRoom}
              onChange={(e) => {
                const val = e.target.value;
                setStudents([]);
                setSelectedRoom(val);
                if (val) {
                  setSearchParams({ roomId: val });
                } else {
                  setSearchParams({});
                }
              }}
            >
              {rooms.map((r) => (
                <option key={r.room_id} value={r.room_id}>
                  {r.room_name} ({r.room_code})
                </option>
              ))}
            </Select>

            <Button
              colorScheme="brand"
              onClick={() => {
                setStudents([]);
                fetchStudents(1);
              }}
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
              : selectedRoom
              ? 'No students are currently enrolled in this room matching your search query.'
              : 'No students are currently enrolled matching your filters.'
          }
          actionLabel={rooms.length === 0 ? 'Create a Room' : undefined}
          onAction={rooms.length === 0 ? () => navigate('/faculty/rooms') : undefined}
        />
      ) : (
        <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" overflow="hidden" boxShadow="sm">
          <CardBody p={0}>
            <Table variant="simple" size="md">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th color={mutedText} borderColor={cardBorder}>Student</Th>
                  <Th color={mutedText} borderColor={cardBorder}>Roll Number</Th>
                  <Th color={mutedText} borderColor={cardBorder}>Enrolled Rooms</Th>
                  <Th color={mutedText} borderColor={cardBorder} w="180px">Room Progress</Th>
                  <Th color={mutedText} borderColor={cardBorder}>Quizzes</Th>
                  <Th color={mutedText} borderColor={cardBorder}>Coding</Th>
                  <Th color={mutedText} borderColor={cardBorder} textAlign="right">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {students.map((st) => (
                  <Tr key={st.student_id} _hover={{ bg: tableHoverBg }}>
                    <Td borderColor={cardBorder}>
                      <VStack align="start" spacing={0}>
                        <Text color={textColor} fontWeight="bold">{st.name}</Text>
                        <Text color={mutedText} fontSize="xs">{st.email}</Text>
                      </VStack>
                    </Td>
                    <Td borderColor={cardBorder} color={textColor}>{st.roll_number || 'N/A'}</Td>
                    <Td borderColor={cardBorder}>
                      <HStack spacing={1} flexWrap="wrap">
                        {st.rooms?.map((rm, idx) => (
                          <Tag key={idx} size="sm" colorScheme="brand" variant="subtle">
                            {rm}
                          </Tag>
                        ))}
                      </HStack>
                    </Td>
                    <Td borderColor={cardBorder}>
                      <VStack align="stretch" spacing={1}>
                        <HStack justify="space-between" fontSize="xs">
                          <Text color={mutedText}>Complete</Text>
                          <Text color="green.600" fontWeight="bold">{st.overallProgress}%</Text>
                        </HStack>
                        <Progress
                          value={st.overallProgress}
                          colorScheme={st.overallProgress === 100 ? 'green' : 'brand'}
                          size="xs"
                          borderRadius="full"
                        />
                      </VStack>
                    </Td>
                    <Td borderColor={cardBorder} color="green.600" fontWeight="semibold">
                      {st.quizzesCompleted}
                    </Td>
                    <Td borderColor={cardBorder} color="blue.600" fontWeight="semibold">
                      {st.codingCompleted}
                    </Td>
                    <Td borderColor={cardBorder} textAlign="right">
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="brand"
                        leftIcon={<ViewIcon />}
                        onClick={() =>
                          navigate(
                            `/faculty/students/${st.student_id}/progress${
                              selectedRoom ? `?roomId=${selectedRoom}` : ''
                            }`
                          )
                        }
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
          <Text color={mutedText} fontSize="sm">
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total students)
          </Text>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              borderColor={cardBorder}
              color={textColor}
              isDisabled={pagination.page <= 1}
              onClick={() => fetchStudents(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              borderColor={cardBorder}
              color={textColor}
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
