// ──────────────────────────────────────────────
// Student: Lab Assessment Results Page
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  Flex,
  Button,
  Icon,
  Progress,
  Divider,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tag,
  Code,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  CloseIcon,
  WarningIcon,
  TimeIcon,
  ArrowBackIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import { getLabResultApi } from '../../api/labApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_CONFIG = {
  accepted: { color: 'green', label: 'Accepted', icon: CheckCircleIcon },
  partially_correct: { color: 'yellow', label: 'Partially Correct', icon: WarningIcon },
  wrong_answer: { color: 'red', label: 'Wrong Answer', icon: CloseIcon },
  compilation_error: { color: 'orange', label: 'Compilation Error', icon: CloseIcon },
  runtime_error: { color: 'orange', label: 'Runtime Error', icon: CloseIcon },
  time_limit_exceeded: { color: 'orange', label: 'Time Limit Exceeded', icon: TimeIcon },
  not_attempted: { color: 'gray', label: 'Not Attempted', icon: CloseIcon },
};

const formatDT = (dt) => {
  if (!dt) return 'N/A';
  return new Date(dt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const LabAssessmentResult = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [resultData, setResultData] = useState(null);

  // View code modal
  const { isOpen: isCodeOpen, onOpen: onCodeOpen, onClose: onCodeClose } = useDisclosure();
  const [activeCodeView, setActiveCodeView] = useState({ title: '', code: '', lang: 'cpp' });

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setIsLoading(true);
        const res = await getLabResultApi(labId);
        setResultData(res.data?.data || null);
      } catch (err) {
        toast({
          title: 'Could not load result',
          description: err.response?.data?.message || 'Assessment result not available yet.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
        navigate('/student/lab-assessments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [labId, navigate, toast]);

  if (isLoading) {
    return <LoadingSpinner label="Compiling your assessment report..." />;
  }

  if (!resultData) {
    return null;
  }

  const { lab, attempt, questionResults, totalObtained, totalMarks, percentage } = resultData;

  const acceptedCount = (questionResults || []).filter(
    (q) => q.submission?.status === 'accepted'
  ).length;

  const partiallyCorrectCount = (questionResults || []).filter(
    (q) => q.submission?.status === 'partially_correct'
  ).length;

  const handleOpenCode = (q) => {
    setActiveCodeView({
      title: q.title || `Question #${q.question_order}`,
      code: q.submission?.source_code || '// No code submitted for this question',
      lang: q.submission?.language || 'cpp',
    });
    onCodeOpen();
  };

  const getPercentageColor = (pct) => {
    if (pct >= 75) return 'green.400';
    if (pct >= 50) return 'yellow.400';
    return 'red.400';
  };

  return (
    <VStack spacing={8} align="stretch" w="full" maxW="5xl" mx="auto">
      {/* Back button */}
      <Box>
        <Button
          as={RouterLink}
          to="/student/lab-assessments"
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          colorScheme="purple"
          size="sm"
        >
          Back to Assessments
        </Button>
      </Box>

      {/* Hero Result Banner */}
      <Card
        bg="bg.card"
        borderColor="border.primary"
        borderWidth="1px"
        p={8}
        borderRadius="2xl"
        boxShadow="sm"
      >
        <Flex
          justify="space-between"
          align={{ base: 'start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={6}
        >
          <VStack align="start" spacing={2}>
            <Badge colorScheme="brand" px={3} py={1} borderRadius="md" textTransform="uppercase">
              Assessment Report
            </Badge>
            <Heading size="lg" color="text.primary">
              {lab?.title || 'Practical Lab Assessment'}
            </Heading>
            <Text color="gray.300" fontSize="sm">
              Submitted on: {formatDT(attempt?.submitted_at || attempt?.effective_deadline)}
            </Text>
          </VStack>

          {/* Score Block */}
          <Box
            bg="slate.900"
            border="2px solid"
            borderColor={getPercentageColor(percentage)}
            p={6}
            borderRadius="2xl"
            textAlign="center"
            minW="200px"
            boxShadow="lg"
          >
            <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
              Total Score
            </Text>
            <Heading size="2xl" color={getPercentageColor(percentage)} my={1}>
              {totalObtained}
              <Text as="span" fontSize="lg" color="gray.500">
                /{totalMarks}
              </Text>
            </Heading>
            <Badge colorScheme={percentage >= 50 ? 'green' : 'red'} px={2.5} py={0.5} borderRadius="md">
              {percentage}%
            </Badge>
          </Box>
        </Flex>

        <Box mt={6}>
          <HStack justify="space-between" mb={2} fontSize="xs" color="gray.400">
            <Text>Overall Performance</Text>
            <Text>{percentage}%</Text>
          </HStack>
          <Progress
            value={percentage}
            colorScheme={percentage >= 75 ? 'green' : percentage >= 50 ? 'yellow' : 'red'}
            borderRadius="full"
            size="sm"
          />
        </Box>
      </Card>

      {/* Summary Metrics */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={6}>
        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Text color="gray.400" fontSize="xs" textTransform="uppercase" fontWeight="bold">
              Fully Accepted
            </Text>
            <Heading size="lg" color="green.400" mt={1}>
              {acceptedCount} <Text as="span" fontSize="sm" color="gray.500">of {questionResults?.length || 0}</Text>
            </Heading>
            <Text color="gray.500" fontSize="xs" mt={1}>100% test cases passed</Text>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Text color="gray.400" fontSize="xs" textTransform="uppercase" fontWeight="bold">
              Partially Solved
            </Text>
            <Heading size="lg" color="yellow.400" mt={1}>
              {partiallyCorrectCount} <Text as="span" fontSize="sm" color="gray.500">questions</Text>
            </Heading>
            <Text color="gray.500" fontSize="xs" mt={1}>Partial marks credited</Text>
          </CardBody>
        </Card>

        <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
          <CardBody>
            <Text color="gray.400" fontSize="xs" textTransform="uppercase" fontWeight="bold">
              Attempt Status
            </Text>
            <Heading size="lg" color="purple.300" mt={1} textTransform="capitalize">
              {attempt?.status?.replace(/_/g, ' ') || 'Submitted'}
            </Heading>
            <Text color="gray.500" fontSize="xs" mt={1}>Locked and finalized</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Question-by-Question Breakdown */}
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color="white">
          Question Breakdown ({questionResults?.length || 0})
        </Heading>

        <Accordion allowMultiple defaultIndex={[0]} reduceMotion>
          {questionResults && questionResults.map((q, idx) => {
            const sub = q.submission || {};
            const statusConfig = STATUS_CONFIG[sub.status] || STATUS_CONFIG.not_attempted;
            const StatusIcon = statusConfig.icon;
            const questionMarks = q.marks || 10;
            const marksObtained = sub.marks_obtained || 0;

            return (
              <AccordionItem
                key={q.lab_question_id || idx}
                bg="slate.800"
                borderColor="slate.700"
                borderWidth="1px"
                borderRadius="xl"
                mb={4}
                overflow="hidden"
              >
                <AccordionButton p={4} _hover={{ bg: 'slate.750' }}>
                  <Flex justify="space-between" align="center" w="full" mr={3}>
                    <HStack spacing={3}>
                      <Icon as={StatusIcon} color={`${statusConfig.color}.400`} boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <HStack>
                          <Text fontWeight="bold" color="white" fontSize="sm">
                            Q{idx + 1}. {q.title || `Question #${idx + 1}`}
                          </Text>
                          <Badge
                            colorScheme={q.difficulty === 'easy' ? 'green' : q.difficulty === 'hard' ? 'red' : 'yellow'}
                            fontSize="2xs"
                            textTransform="capitalize"
                          >
                            {q.difficulty || 'medium'}
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.400">
                          {sub.passed_test_cases ?? 0}/{sub.total_test_cases ?? 0} Test Cases Passed • Language: {sub.language?.toUpperCase() || 'N/A'}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack spacing={3}>
                      <Badge colorScheme={statusConfig.color} px={2} py={0.5} borderRadius="md" fontSize="xs">
                        {statusConfig.label}
                      </Badge>
                      <Text fontWeight="bold" color="cyan.400" fontSize="sm" minW="75px" textAlign="right">
                        {marksObtained} / {questionMarks} M
                      </Text>
                    </HStack>
                  </Flex>
                  <AccordionIcon color="gray.400" />
                </AccordionButton>

                <AccordionPanel pb={5} pt={2} px={5} borderTop="1px solid" borderColor="slate.700">
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontWeight="semibold" color="gray.300" fontSize="xs" mb={1}>
                        Problem Statement:
                      </Text>
                      <Text color="gray.300" fontSize="xs" whiteSpace="pre-wrap">
                        {q.problem_statement}
                      </Text>
                    </Box>

                    {/* View code button */}
                    <Box>
                      <Button
                        size="xs"
                        leftIcon={<ViewIcon />}
                        colorScheme="purple"
                        variant="outline"
                        onClick={() => handleOpenCode(q)}
                      >
                        View Your Submitted Code ({sub.language?.toUpperCase() || 'Code'})
                      </Button>
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </VStack>

      {/* Code Viewer Modal */}
      <Modal isOpen={isCodeOpen} onClose={onCodeClose} size="3xl" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg="slate.900" borderColor="slate.700" borderWidth="1px" color="white">
          <ModalHeader fontSize="md">
            Submitted Code — {activeCodeView.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box h="400px" borderRadius="md" overflow="hidden" border="1px solid" borderColor="slate.800">
              <Editor
                height="100%"
                language={activeCodeView.lang || 'cpp'}
                theme="vs-dark"
                value={activeCodeView.code}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                }}
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default LabAssessmentResult;
