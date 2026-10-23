// ──────────────────────────────────────────────
// Admin Progress & Global Platform Analytics
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
import { getAdminStudentsProgressApi, getAdminAnalyticsApi } from '../../api/progressApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const AdminProgress = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Global Analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAdminAnalyticsApi();
        setAnalytics(res.data);
      } catch {
        // non-critical error
      }
    };
    fetchAnalytics();
  }, []);

  // Fetch Paginated Students
  const fetchStudents = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await getAdminStudentsProgressApi({
        page,
        limit: 15,
        search: search.trim() || undefined,
        course: course || undefined,
        year: year || undefined,
      });
      setStudents(res.data?.students || []);
      setPagination(res.data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      toast({
        title: 'Error loading student progress',
        description: err.response?.data?.message || 'Could not fetch platform student data.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [search, course, year, toast]);

  useEffect(() => {
    fetchStudents(1);
  }, [fetchStudents]);

  return (
    <VStack spacing={8} align="stretch" w="full" pb={12}>
      {/* Header */}
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="text.primary">Platform-Wide Student Analytics</Heading>
        <Text color="text.secondary" fontSize="sm">
          Global overview of student learning progress, quiz attempts, and course completion
        </Text>
      </VStack>

      {/* Global Analytics Cards */}
      {analytics && (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
          <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
            <CardBody p={5}>
              <Stat>
                <StatLabel color="text.secondary" fontSize="xs" fontWeight="bold">TOTAL STUDENTS</StatLabel>
                <StatNumber color="accent.primary" fontSize="3xl" mt={1}>{analytics.totalStudents}</StatNumber>
                <Text fontSize="xs" color="text.muted" mt={1}>{analytics.activeStudents} active (last 30 days)</Text>
              </Stat>
            </CardBody>
          </Card>

          <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
            <CardBody p={5}>
              <Stat>
                <StatLabel color="text.secondary" fontSize="xs" fontWeight="bold">FACULTY & ROOMS</StatLabel>
                <StatNumber color="brand.500" fontSize="3xl" mt={1}>
                  {analytics.totalFaculty} <Text as="span" fontSize="lg" color="text.muted">/ {analytics.totalRooms} Rooms</Text>
                </StatNumber>
                <Text fontSize="xs" color="text.muted" mt={1}>Platform mentors & virtual labs</Text>
              </Stat>
            </CardBody>
          </Card>

          <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
            <CardBody p={5}>
              <Stat>
                <StatLabel color="text.secondary" fontSize="xs" fontWeight="bold">TOPICS & SUBTOPICS</StatLabel>
                <StatNumber color="green.500" fontSize="3xl" mt={1}>
                  {analytics.totalTopics} <Text as="span" fontSize="lg" color="text.muted">/ {analytics.totalSubtopics} Subtopics</Text>
                </StatNumber>
                <Text fontSize="xs" color="text.muted" mt={1}>Curated learning material</Text>
              </Stat>
            </CardBody>
          </Card>

          <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
            <CardBody p={5}>
              <Stat>
                <StatLabel color="text.secondary" fontSize="xs" fontWeight="bold">AVERAGE QUIZ SCORE</StatLabel>
                <StatNumber color="amber.500" fontSize="3xl" mt={1}>{analytics.avgQuizScore}%</StatNumber>
                <Text fontSize="xs" color="text.muted" mt={1}>{analytics.totalQuizAttempts} total submissions</Text>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Filter and Search Bar */}
      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
        <CardBody p={4}>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="text.secondary" />
              </InputLeftElement>
              <Input
                placeholder="Search student or roll no..."
                bg="bg.surface"
                borderColor="border.primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchStudents(1)}
              />
            </InputGroup>

            <Input
              placeholder="Filter by Course (e.g. CSE)"
              bg="bg.surface"
              borderColor="border.primary"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchStudents(1)}
            />

            <Select
              placeholder="All Years"
              bg="bg.surface"
              borderColor="border.primary"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </Select>

            <Button
              colorScheme="brand"
              onClick={() => fetchStudents(1)}
            >
              Apply Filter
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Student List Table */}
      {isLoading ? (
        <LoadingSpinner label="Loading platform student progress..." />
      ) : students.length === 0 ? (
        <EmptyState
          title="No Students Found"
          description="No students match the selected search or filter criteria."
        />
      ) : (
        <Card bg="bg.card" borderColor="border.primary" borderWidth="1px" overflow="hidden">
          <CardBody p={0}>
            <Table variant="simple" size="md">
              <Thead bg="bg.surface">
                <Tr>
                  <Th color="text.secondary">Student</Th>
                  <Th color="text.secondary">Roll Number</Th>
                  <Th color="text.secondary">Course & Year</Th>
                  <Th color="text.secondary" w="180px">Overall Progress</Th>
                  <Th color="text.secondary">Quizzes</Th>
                  <Th color="text.secondary">Coding</Th>
                  <Th color="text.secondary" textAlign="right">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {students.map((st) => (
                  <Tr key={st.student_id} _hover={{ bg: 'bg.secondary' }}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text color="text.primary" fontWeight="bold">{st.name}</Text>
                        <Text color="text.secondary" fontSize="xs">{st.email}</Text>
                      </VStack>
                    </Td>
                    <Td color="text.secondary">{st.roll_number || 'N/A'}</Td>
                    <Td>
                      <Tag size="sm" colorScheme="purple" variant="subtle">
                        {st.course || 'Engg'} • Y{st.year || '1'}
                      </Tag>
                    </Td>
                    <Td>
                      <VStack align="stretch" spacing={1}>
                        <HStack justify="space-between" fontSize="xs">
                          <Text color="gray.400">Progress</Text>
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
                        onClick={() => navigate(`/admin/students/${st.student_id}/progress`)}
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
          <Text color="text.secondary" fontSize="sm">
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total students)
          </Text>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              borderColor="border.primary"
              isDisabled={pagination.page <= 1}
              onClick={() => fetchStudents(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              borderColor="border.primary"
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

export default AdminProgress;
