// ──────────────────────────────────────────────
// Faculty: Lab Assessment Results Dashboard
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, VStack, HStack, Heading, Text, Button, Badge, Card, CardBody,
  Table, Thead, Tbody, Tr, Th, Td, Spinner, Flex, useToast, Select,
  Progress, SimpleGrid, Stat, StatLabel, StatNumber, Tooltip,
  Input, InputGroup, InputLeftElement, Tag, TagLabel,
} from '@chakra-ui/react';
import { ArrowBackIcon, SearchIcon, DownloadIcon } from '@chakra-ui/icons';
import { getLabResultsApi } from '../../api/labApi';

const STATUS_COLORS = {
  accepted: 'green',
  partially_correct: 'yellow',
  wrong_answer: 'red',
  compilation_error: 'orange',
  runtime_error: 'red',
  time_limit_exceeded: 'orange',
  not_attempted: 'gray',
  attempted: 'blue',
  in_progress: 'blue',
  submitted: 'green',
  timed_out: 'red',
  expired: 'red',
};

const formatDT = (dt) => dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—';
const formatStatus = (s) => s ? s.replace(/_/g, ' ') : 'N/A';

const LabAssessmentResults = () => {
  const { labId } = useParams();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadResults = useCallback(async () => {
    try {
      const res = await getLabResultsApi(labId);
      setData(res.data?.data);
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Failed to load results', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  }, [labId, toast]);

  useEffect(() => { loadResults(); }, [loadResults]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="300px">
        <VStack><Spinner size="xl" color="purple.400" thickness="4px" /><Text color="gray.400">Loading results...</Text></VStack>
      </Flex>
    );
  }

  const { lab, attempts } = data || {};

  const filteredAttempts = (attempts || []).filter(a => {
    const matchFilter = filter === 'all' || a.status === filter;
    const matchSearch = !search || a.student_name?.toLowerCase().includes(search.toLowerCase()) || a.roll_number?.includes(search);
    return matchFilter && matchSearch;
  });

  const totalStudents = attempts?.length || 0;
  const submitted = attempts?.filter(a => a.status === 'submitted').length || 0;
  const inProgress = attempts?.filter(a => a.status === 'in_progress').length || 0;
  const timedOut = attempts?.filter(a => a.status === 'timed_out').length || 0;
  const avgScore = totalStudents > 0
    ? Math.round(attempts.filter(a => a.status === 'submitted').reduce((sum, a) => sum + (a.obtained_marks || 0), 0) / Math.max(submitted, 1))
    : 0;

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Header */}
      <Box>
        <Button
          as={RouterLink}
          to={`/faculty/lab-assessments/${labId}`}
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          colorScheme="gray"
          size="sm"
          mb={4}
        >
          Back to Assessment
        </Button>
        <Flex justify="space-between" align="start" gap={4} direction={{ base: 'column', md: 'row' }}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="white">Results — {lab?.title}</Heading>
            <Text color="gray.400" fontSize="sm">
              {totalStudents} students started • Total marks: {lab?.num_questions * lab?.marks_per_question || 0}
            </Text>
          </VStack>
        </Flex>
      </Box>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {[
          { label: 'Submitted', value: submitted, color: 'green.400' },
          { label: 'In Progress', value: inProgress, color: 'blue.400' },
          { label: 'Timed Out', value: timedOut, color: 'red.400' },
          { label: 'Avg Score', value: `${avgScore}/${lab?.num_questions * lab?.marks_per_question || 0}`, color: 'purple.300' },
        ].map(s => (
          <Card key={s.label} bg="slate.800" borderColor="slate.700" borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel color="gray.400" fontSize="xs">{s.label}</StatLabel>
                <StatNumber color={s.color} fontSize="2xl">{s.value}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Filters */}
      <HStack spacing={4} wrap="wrap">
        <InputGroup maxW="280px">
          <InputLeftElement pointerEvents="none"><SearchIcon color="gray.400" /></InputLeftElement>
          <Input
            placeholder="Search by name or roll no..."
            bg="dark.bg"
            borderColor="slate.600"
            color="white"
            value={search}
            onChange={e => setSearch(e.target.value)}
            _placeholder={{ color: 'gray.500' }}
          />
        </InputGroup>
        <Select
          maxW="180px"
          bg="dark.bg"
          borderColor="slate.600"
          color="white"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all" style={{ background: '#1e293b' }}>All Statuses</option>
          <option value="submitted" style={{ background: '#1e293b' }}>Submitted</option>
          <option value="in_progress" style={{ background: '#1e293b' }}>In Progress</option>
          <option value="timed_out" style={{ background: '#1e293b' }}>Timed Out</option>
        </Select>
      </HStack>

      {/* Results Table */}
      {filteredAttempts.length === 0 ? (
        <Box p={10} bg="slate.800" borderRadius="xl" textAlign="center">
          <Text color="gray.400">No student attempts yet.</Text>
        </Box>
      ) : (
        <Box overflowX="auto" bg="slate.800" borderRadius="xl" borderWidth="1px" borderColor="slate.700">
          <Table size="sm" variant="unstyled">
            <Thead>
              <Tr borderBottom="1px solid" borderColor="slate.700">
                <Th color="gray.400" py={4} px={4}>Student</Th>
                <Th color="gray.400">Roll No</Th>
                <Th color="gray.400">Status</Th>
                <Th color="gray.400" isNumeric>Score</Th>
                <Th color="gray.400" isNumeric>%</Th>
                <Th color="gray.400">Started</Th>
                <Th color="gray.400">Submitted</Th>
                <Th color="gray.400">Q Statuses</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredAttempts.map((attempt) => {
                const totalMarks = attempt.total_marks || (lab?.num_questions * lab?.marks_per_question) || 0;
                const pct = totalMarks > 0 ? Math.round((attempt.obtained_marks / totalMarks) * 100) : 0;
                return (
                  <Tr key={attempt.attempt_id} borderBottom="1px solid" borderColor="slate.700" _hover={{ bg: 'slate.700' }} transition="background 0.15s">
                    <Td px={4} py={3}>
                      <Text color="white" fontSize="sm" fontWeight="medium">{attempt.student_name}</Text>
                    </Td>
                    <Td>
                      <Text color="gray.400" fontSize="sm">{attempt.roll_number}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={STATUS_COLORS[attempt.status] || 'gray'} textTransform="capitalize" fontSize="xs">
                        {formatStatus(attempt.status)}
                      </Badge>
                    </Td>
                    <Td isNumeric>
                      <Text color={pct >= 80 ? 'green.400' : pct >= 50 ? 'yellow.400' : 'red.400'} fontWeight="bold" fontSize="sm">
                        {attempt.obtained_marks}/{totalMarks}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <HStack justify="flex-end" spacing={2}>
                        <Progress
                          value={pct}
                          size="xs"
                          w="50px"
                          colorScheme={pct >= 80 ? 'green' : pct >= 50 ? 'yellow' : 'red'}
                          borderRadius="full"
                        />
                        <Text color="gray.300" fontSize="xs">{pct}%</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Text color="gray.400" fontSize="xs">{formatDT(attempt.started_at)}</Text>
                    </Td>
                    <Td>
                      <Text color="gray.400" fontSize="xs">{formatDT(attempt.submitted_at)}</Text>
                    </Td>
                    <Td>
                      <HStack spacing={1} wrap="wrap">
                        {(attempt.questionSubmissions || []).slice(0, 5).map((qs, i) => (
                          <Tooltip key={i} label={formatStatus(qs.status)} placement="top">
                            <Box
                              w="18px"
                              h="18px"
                              borderRadius="sm"
                              bg={
                                qs.status === 'accepted' ? 'green.500' :
                                qs.status === 'partially_correct' ? 'yellow.500' :
                                qs.status === 'not_attempted' ? 'gray.600' : 'red.500'
                              }
                              cursor="pointer"
                            />
                          </Tooltip>
                        ))}
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}
    </VStack>
  );
};

export default LabAssessmentResults;
