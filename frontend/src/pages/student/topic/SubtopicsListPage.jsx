// ──────────────────────────────────────────────
// Subtopics List Page — Browse All Subtopics
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useOutletContext, Link as RouterLink } from 'react-router-dom';
import {
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  Flex,
  HStack,
  Box,
  useToast,
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { getTopicSubtopicsApi } from '../../../api/topicApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';

const SubtopicsListPage = () => {
  const { topic, topicId } = useOutletContext();
  const toast = useToast();
  const [subtopics, setSubtopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubtopics = async () => {
      setIsLoading(true);
      try {
        const res = await getTopicSubtopicsApi(topicId);
        setSubtopics(res.data?.subtopics || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load subtopics.');
        toast({
          title: 'Error',
          description: 'Failed to load subtopics.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubtopics();
  }, [topicId, toast]);

  if (isLoading) {
    return <LoadingSpinner label="Loading subtopics..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to Load Subtopics"
        description={error}
      />
    );
  }

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Heading size="lg" color="white">
        Subtopics
      </Heading>

      <Text color="gray.400" fontSize="sm">
        {topic.title} — {subtopics.length} subtopic{subtopics.length !== 1 ? 's' : ''} available
      </Text>

      {subtopics.length === 0 ? (
        <EmptyState
          title="No Subtopics Available"
          description="No published subtopics are available for this topic yet. Please check back later."
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {subtopics.map((sub, index) => {
            const hasContent = sub.content && (sub.content.aim || sub.content.theory);

            return (
              <Card
                key={sub.subtopic_id}
                as={RouterLink}
                to={`/student/topics/${topicId}/subtopics/${sub.subtopic_id}/aim`}
                bg="slate.800"
                borderColor="slate.700"
                borderWidth="1px"
                borderRadius="xl"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-3px)',
                  borderColor: 'cyan.500',
                  boxShadow: '0 4px 20px rgba(34, 211, 238, 0.15)',
                }}
                cursor="pointer"
                textDecoration="none"
              >
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <Flex justify="space-between" w="full" align="center">
                      <HStack spacing={2}>
                        <Badge
                          bg="slate.700"
                          color="cyan.300"
                          px={2}
                          py={0.5}
                          borderRadius="md"
                          fontSize="xs"
                        >
                          {sub.order_index || index + 1}
                        </Badge>
                        {hasContent && (
                          <Badge colorScheme="green" fontSize="9px" px={1.5}>
                            Content Available
                          </Badge>
                        )}
                      </HStack>
                      <ArrowForwardIcon color="cyan.400" />
                    </Flex>

                    <Heading size="sm" color="white" noOfLines={2}>
                      {sub.title}
                    </Heading>

                    {sub.content?.aim && (
                      <Text color="gray.400" fontSize="xs" noOfLines={2}>
                        {sub.content.aim}
                      </Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </VStack>
  );
};

export default SubtopicsListPage;
