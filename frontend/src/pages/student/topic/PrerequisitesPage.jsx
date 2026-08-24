// ──────────────────────────────────────────────
// Prerequisites Page — Topic Prerequisites
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  Box,
  OrderedList,
  ListItem,
  useToast,
} from '@chakra-ui/react';
import { getTopicPrerequisitesApi } from '../../../api/topicApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';

const PrerequisitesPage = () => {
  const { topic, topicId } = useOutletContext();
  const toast = useToast();
  const [prerequisites, setPrerequisites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrerequisites = async () => {
      setIsLoading(true);
      try {
        const res = await getTopicPrerequisitesApi(topicId);
        setPrerequisites(res.data?.prerequisites || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load prerequisites.');
        toast({
          title: 'Error',
          description: 'Failed to load prerequisites.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrerequisites();
  }, [topicId, toast]);

  if (isLoading) {
    return <LoadingSpinner label="Loading prerequisites..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to Load Prerequisites"
        description={error}
      />
    );
  }

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Heading size="lg" color="white">
        Prerequisites
      </Heading>

      <Text color="gray.400" fontSize="sm">
        {topic.title}
      </Text>

      {prerequisites.length === 0 ? (
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Box p={4} textAlign="center">
              <Text color="gray.400" fontSize="sm">
                No specific prerequisites have been defined for this topic yet.
              </Text>
              <Text color="gray.500" fontSize="xs" mt={2}>
                Prerequisites will appear here once configured by the faculty.
              </Text>
            </Box>
          </CardBody>
        </Card>
      ) : (
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <VStack align="start" spacing={4}>
              <Text color="gray.300" fontSize="sm">
                Before starting this topic, students should understand:
              </Text>

              <OrderedList spacing={3} pl={4}>
                {prerequisites.map((prereq) => (
                  <ListItem key={prereq.prereq_id} color="gray.200" fontSize="sm">
                    <Box>
                      <Text fontWeight="semibold" color="white">
                        {prereq.description}
                      </Text>
                      {prereq.content && (
                        <Text color="gray.400" fontSize="xs" mt={1} whiteSpace="pre-wrap">
                          {prereq.content}
                        </Text>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </OrderedList>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default PrerequisitesPage;
