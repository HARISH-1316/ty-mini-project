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
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Flex
              justify="space-between"
              w="full"
              align={{ base: 'start', sm: 'center' }}
              direction={{ base: 'column', sm: 'row' }}
              gap={2}
            >
              <Heading size="lg" color="white">
                {topic.title}
              </Heading>
              {user?.role === 'student' && (
                <HStack spacing={2}>
                  <Text color="gray.400" fontSize="xs">Status:</Text>
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

            <Text color="gray.300" fontSize="sm">
              {topic.description || 'Comprehensive learning module for engineering laboratory experiments.'}
            </Text>

            {/* Progress Actions (Student only) */}
            {user?.role === 'student' && (
              <>
                <Divider borderColor="slate.700" />
                <Flex justify="space-between" w="full" align="center">
                  <Text color="gray.400" fontSize="xs">Mark Learning Progress:</Text>
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
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="cyan.300">
              Introduction
            </Heading>
            <Text color="gray.200" fontSize="sm" whiteSpace="pre-wrap" lineHeight="tall">
              {topic.description || 'This topic provides a structured learning experience covering key concepts, practical experiments, and assessments. Navigate through the sections using the sidebar to explore all available materials.'}
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Learning Overview */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="cyan.300">
              What You'll Learn
            </Heading>
            <Box w="full" p={4} bg="slate.900" borderRadius="lg">
              <VStack align="start" spacing={2}>
                <Text color="gray.300" fontSize="sm">
                  📖 Explore theoretical foundations and key concepts
                </Text>
                <Text color="gray.300" fontSize="sm">
                  🎯 Understand the aims and objectives of each experiment
                </Text>
                <Text color="gray.300" fontSize="sm">
                  🧪 Work through structured subtopics and lab materials
                </Text>
                <Text color="gray.300" fontSize="sm">
                  📝 Attempt quizzes and assessments to test your understanding
                </Text>
                <Text color="gray.300" fontSize="sm">
                  🎥 Watch video explanations for enhanced learning
                </Text>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Topic Stats */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <VStack align="start" spacing={1}>
              <Text color="gray.500" fontSize="xs" textTransform="uppercase">Subtopics</Text>
              <Text color="purple.300" fontSize="lg" fontWeight="bold">
                {topic.subtopics?.length || 0}
              </Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text color="gray.500" fontSize="xs" textTransform="uppercase">Status</Text>
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
