// ──────────────────────────────────────────────
// Introduction Page — Topic Overview
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  HStack,
  Badge,
  Button,
  Divider,
  Flex,
  Box,
  useToast,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import useAuth from '../../../hooks/useAuth';
import { updateProgressApi, getMyProgressApi } from '../../../api/topicApi';

const IntroductionPage = () => {
  const { topic, topicId } = useOutletContext();
  const { user } = useAuth();
  const toast = useToast();
  const [progressStatus, setProgressStatus] = useState('Not Started');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await getMyProgressApi();
        const myProgress = (res.data?.progress || []).find(
          (p) => parseInt(p.topic_id, 10) === parseInt(topicId, 10)
        );
        if (myProgress) {
          setProgressStatus(myProgress.status);
        }
      } catch {
        // Progress may not exist yet
      }
    };
    if (user?.role === 'student') {
      fetchProgress();
    }
  }, [topicId, user]);

  const handleProgressChange = async (newStatus) => {
    try {
      await updateProgressApi(topicId, { status: newStatus });
      setProgressStatus(newStatus);
      toast({
        title: 'Progress Updated',
        description: `Topic marked as ${newStatus}.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update progress.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* Topic Header */}
      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Flex
              justify="space-between"
              w="full"
              align={{ base: 'start', sm: 'center' }}
              direction={{ base: 'column', sm: 'row' }}
              gap={2}
            >
              <Heading size="lg" color="text.primary">
                {topic.title}
              </Heading>
              {user?.role === 'student' && (
                <HStack spacing={2}>
                  <Text color="text.secondary" fontSize="xs">Status:</Text>
                  <Badge
                    colorScheme={
                      progressStatus === 'Completed' ? 'green' :
                      progressStatus === 'In Progress' ? 'yellow' : 'gray'
                    }
                  >
                    {progressStatus}
                  </Badge>
                </HStack>
              )}
            </Flex>

            <Text color="text.secondary" fontSize="sm">
              {topic.description || 'Comprehensive learning module for engineering laboratory experiments.'}
            </Text>

            {/* Progress Actions (Student only) */}
            {user?.role === 'student' && (
              <>
                <Divider borderColor="border.primary" />
                <Flex justify="space-between" w="full" align="center">
                  <Text color="text.secondary" fontSize="xs">Mark Learning Progress:</Text>
                  <HStack spacing={2}>
                    <Button
                      size="xs"
                      colorScheme={progressStatus === 'In Progress' ? 'yellow' : 'gray'}
                      variant={progressStatus === 'In Progress' ? 'solid' : 'outline'}
                      onClick={() => handleProgressChange('In Progress')}
                    >
                      In Progress
                    </Button>
                    <Button
                      size="xs"
                      colorScheme={progressStatus === 'Completed' ? 'green' : 'gray'}
                      variant={progressStatus === 'Completed' ? 'solid' : 'outline'}
                      leftIcon={<CheckCircleIcon />}
                      onClick={() => handleProgressChange('Completed')}
                    >
                      Completed
                    </Button>
                  </HStack>
                </Flex>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Introduction Content */}
      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="accent.primary">
              Introduction
            </Heading>
            <Text color="text.primary" fontSize="sm" whiteSpace="pre-wrap" lineHeight="tall">
              {topic.description || 'This topic provides a structured learning experience covering key concepts, practical experiments, and assessments. Navigate through the sections using the sidebar to explore all available materials.'}
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Learning Overview */}
      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="accent.primary">
              What You'll Learn
            </Heading>
            <Box w="full" p={4} bg="bg.surface" borderRadius="lg" border="1px solid" borderColor="border.primary">
              <VStack align="start" spacing={2}>
                <Text color="text.secondary" fontSize="sm">
                  📖 Explore theoretical foundations and key concepts
                </Text>
                <Text color="text.secondary" fontSize="sm">
                  🎯 Understand the aims and objectives of each experiment
                </Text>
                <Text color="text.secondary" fontSize="sm">
                  🧪 Work through structured subtopics and lab materials
                </Text>
                <Text color="text.secondary" fontSize="sm">
                  📝 Attempt quizzes and assessments to test your understanding
                </Text>
                <Text color="text.secondary" fontSize="sm">
                  🎥 Watch video explanations for enhanced learning
                </Text>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Topic Stats */}
      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
        <CardBody>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <VStack align="start" spacing={1}>
              <Text color="text.secondary" fontSize="xs" textTransform="uppercase">Subtopics</Text>
              <Text color="accent.primary" fontSize="lg" fontWeight="bold">
                {topic.subtopics?.length || 0}
              </Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text color="text.secondary" fontSize="xs" textTransform="uppercase">Status</Text>
              <Badge
                colorScheme={
                  progressStatus === 'Completed' ? 'green' :
                  progressStatus === 'In Progress' ? 'yellow' : 'gray'
                }
                fontSize="sm"
              >
                {progressStatus}
              </Badge>
            </VStack>
          </Flex>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default IntroductionPage;
