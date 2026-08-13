// ──────────────────────────────────────────────
// Student Progress Page
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useToast,
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon } from '@chakra-ui/icons';
import { getMyProgressApi } from '../../api/topicApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StudentProgress = () => {
  const toast = useToast();
  const [progressList, setProgressList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await getMyProgressApi();
        setProgressList(res.data?.progress || []);
      } catch {
        toast({
          title: 'Error loading progress',
          description: 'Could not fetch your learning progress.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [toast]);

  if (isLoading) {
    return <LoadingSpinner label="Loading your topic progress..." />;
  }

  const completed = progressList.filter((p) => p.status === 'Completed').length;
  const inProgress = progressList.filter((p) => p.status === 'In Progress').length;
  const total = progressList.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Header */}
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="white">My Learning Progress</Heading>
        <Text color="gray.400" fontSize="sm">
          Track your completed topics and active experiments
        </Text>
      </VStack>

      {/* Progress Stats */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={6}>
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Total Tracked Topics</StatLabel>
              <StatNumber color="purple.300" fontSize="3xl">{total}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Completed Topics</StatLabel>
              <StatNumber color="emerald.400" fontSize="3xl">{completed}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Overall Completion</StatLabel>
              <StatNumber color="cyan.400" fontSize="3xl">{percentage}%</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Progress Items List */}
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color="white">Topic Completion Status</Heading>

        {progressList.length === 0 ? (
          <EmptyState
            title="No Progress Recorded"
            description="Start viewing lab topics to track your progress here."
          />
        ) : (
          <VStack spacing={4} align="stretch">
            {progressList.map((item) => (
              <Card key={item.progress_id} bg="slate.800" borderColor="slate.700" borderWidth="1px">
                <CardBody p={5}>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Heading size="sm" color="white">
                        {item.topic_title || `Topic #${item.topic_id}`}
                      </Heading>
                      <Badge colorScheme={item.status === 'Completed' ? 'green' : 'yellow'}>
                        {item.status}
                      </Badge>
                    </HStack>

                    <Progress
                      value={item.status === 'Completed' ? 100 : item.status === 'In Progress' ? 50 : 0}
                      colorScheme={item.status === 'Completed' ? 'green' : 'purple'}
                      size="sm"
                      borderRadius="full"
                    />

                    <HStack justify="space-between" fontSize="xs" color="gray.400" pt={1}>
                      <Text>
                        Last Accessed: {item.last_accessed ? new Date(item.last_accessed).toLocaleString() : 'N/A'}
                      </Text>
                      {item.time_spent > 0 && <Text>{item.time_spent} mins spent</Text>}
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>
    </VStack>
  );
};

export default StudentProgress;
