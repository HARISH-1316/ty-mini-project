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
  useColorModeValue,
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

  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#171918');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#A3B19B');
  const scoreBoxBg = useColorModeValue('#F2F6F3', '#171918');
  const monacoTheme = useColorModeValue('vs', 'vs-dark');
  const hoverBg = useColorModeValue('#F5F7F5', '#252926');

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
        bg={cardBg}
        borderColor={cardBorder}
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
            <Heading size="lg" color={textColor}>
              {lab?.title || 'Practical Lab Assessment'}
            </Heading>
            <Text color={mutedText} fontSize="sm">
              Submitted on: {formatDT(attempt?.submitted_at || attempt?.effective_deadline)}
            </Text>
          </VStack>

          {/* Score Block */}
          <Box
            bg={scoreBoxBg}
            border="2px solid"
            borderColor={getPercentageColor(percentage)}
            p={6}
            borderRadius="2xl"
            textAlign="center"
            minW="200px"
            boxShadow="sm"
          >
            <Text fontSize="xs" fontWeight="bold" color={mutedText} textTransform="uppercase">
              Total Score
            </Text>
            <Heading size="2xl" color={getPercentageColor(percentage)} my={1}>
              {totalObtained}
              <Text as="span" fontSize="lg" color={mutedText}>
                /{totalMarks}
              </Text>
            </Heading>
            <Badge colorScheme={percentage >= 50 ? 'green' : 'red'} px={2.5} py={0.5} borderRadius="md">
              {percentage}%
            </Badge>
          </Box>
        </Flex>

        <Box mt={6}>
          <HStack justify="space-between" mb={2} fontSize="xs" color={mutedText}>
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
        <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Text color={mutedText} fontSize="xs" textTransform="uppercase" fontWeight="bold">
              Fully Accepted
            </Text>
            <Heading size="lg" color="green.600" mt={1}>
              {acceptedCount} <Text as="span" fontSize="sm" color={mutedText}>of {questionResults?.length || 0}</Text>
            </Heading>
            <Text color={mutedText} fontSize="xs" mt={1}>100% test cases passed</Text>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Text color={mutedText} fontSize="xs" textTransform="uppercase" fontWeight="bold">
              Partially Solved
            </Text>
            <Heading size="lg" color="orange.500" mt={1}>
              {partiallyCorrectCount} <Text as="span" fontSize="sm" color={mutedText}>questions</Text>
            </Heading>
            <Text color={mutedText} fontSize="xs" mt={1}>Partial marks credited</Text>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Text color={mutedText} fontSize="xs" textTransform="uppercase" fontWeight="bold">
              Attempt Status
            </Text>
            <Heading size="lg" color="brand.500" mt={1} textTransform="capitalize">
              {attempt?.status?.replace(/_/g, ' ') || 'Submitted'}
            </Heading>
            <Text color={mutedText} fontSize="xs" mt={1}>Locked and finalized</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Question-by-Question Breakdown */}
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color={textColor}>
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
                bg={cardBg}
                borderColor={cardBorder}
                borderWidth="1px"
                borderRadius="xl"
                mb={4}
                overflow="hidden"
                boxShadow="sm"
              >
                <AccordionButton p={4} _hover={{ bg: hoverBg }}>
                  <Flex justify="space-between" align="center" w="full" mr={3}>
                    <HStack spacing={3}>
                      <Icon as={StatusIcon} color={`${statusConfig.color}.500`} boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <HStack>
                          <Text fontWeight="bold" color={textColor} fontSize="sm">
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
                        <Text fontSize="xs" color={mutedText}>
                          {sub.passed_test_cases ?? 0}/{sub.total_test_cases ?? 0} Test Cases Passed • Language: {sub.language?.toUpperCase() || 'N/A'}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack spacing={3}>
                      <Badge colorScheme={statusConfig.color} px={2} py={0.5} borderRadius="md" fontSize="xs">
                        {statusConfig.label}
                      </Badge>
                      <Text fontWeight="bold" color="brand.600" fontSize="sm" minW="75px" textAlign="right">
                        {marksObtained} / {questionMarks} M
                      </Text>
                    </HStack>
                  </Flex>
                  <AccordionIcon color={mutedText} />
                </AccordionButton>

                <AccordionPanel pb={5} pt={2} px={5} borderTop="1px solid" borderColor={cardBorder}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color="brand.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" mb={1}>
                        Problem Statement:
                      </Text>
                      <Text color={textColor} fontSize="sm" lineHeight="tall" whiteSpace="pre-wrap">
                        {q.problem_statement}
                      </Text>
                    </Box>

                    {/* View code button */}
                    <Box>
                      <Button
                        size="xs"
                        leftIcon={<ViewIcon />}
                        colorScheme="brand"
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

      {/* Multiple-Choice Questions Breakdown */}
      {resultData.mcqs && resultData.mcqs.length > 0 && (
        <VStack align="stretch" spacing={4}>
          <Heading size="md" color={textColor}>
            Multiple-Choice Questions ({resultData.mcqs.length})
          </Heading>

          <VStack spacing={4} align="stretch">
            {resultData.mcqs.map((mcq, idx) => {
              const isCorrect = mcq.is_correct;
              const hasAnswered = Boolean(mcq.selected_option);
              const marksAwarded = mcq.marks_awarded ?? (isCorrect ? (mcq.marks || 2) : 0);
              const maxMarks = mcq.marks || 2;

              return (
                <Card
                  key={mcq.mcq_id || idx}
                  bg={cardBg}
                  borderColor={isCorrect ? 'green.500' : hasAnswered ? 'red.400' : cardBorder}
                  borderWidth="1px"
                  borderRadius="xl"
                  boxShadow="sm"
                >
                  <CardBody p={5}>
                    <VStack align="stretch" spacing={3}>
                      <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                        <HStack spacing={2}>
                          <Badge colorScheme="purple">
                            MCQ #{idx + 1}
                          </Badge>
                          {mcq.topic_title && (
                            <Badge colorScheme="cyan" variant="subtle">
                              {mcq.topic_title}
                            </Badge>
                          )}
                          <Badge colorScheme={isCorrect ? 'green' : hasAnswered ? 'red' : 'gray'}>
                            {isCorrect ? 'CORRECT' : hasAnswered ? 'INCORRECT' : 'NOT ANSWERED'}
                          </Badge>
                        </HStack>

                        <Text fontWeight="bold" color={isCorrect ? 'green.500' : 'red.400'} fontSize="sm">
                          {marksAwarded} / {maxMarks} Marks
                        </Text>
                      </Flex>

                      <Text fontWeight="semibold" fontSize="md" color={textColor}>
                        {mcq.question_text}
                      </Text>

                      {/* Options */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} pt={1}>
                        {['A', 'B', 'C', 'D'].map((optKey) => {
                          const isOptionCorrect = mcq.correct_option === optKey;
                          const isStudentChoice = mcq.selected_option === optKey;
                          const optText = mcq[`option_${optKey.toLowerCase()}`];

                          let optBorderColor = cardBorder;
                          let optBg = 'transparent';

                          if (isOptionCorrect) {
                            optBorderColor = 'green.500';
                            optBg = surfaceBg;
                          } else if (isStudentChoice && !isOptionCorrect) {
                            optBorderColor = 'red.400';
                            optBg = surfaceBg;
                          }

                          return (
                            <Box
                              key={optKey}
                              p={2.5}
                              borderRadius="md"
                              bg={optBg}
                              border="1px solid"
                              borderColor={optBorderColor}
                            >
                              <HStack spacing={2} align="start">
                                <Badge
                                  colorScheme={
                                    isOptionCorrect
                                      ? 'green'
                                      : isStudentChoice
                                      ? 'red'
                                      : 'gray'
                                  }
                                >
                                  {optKey}
                                </Badge>
                                <Text fontSize="sm" color={textColor} fontWeight={isStudentChoice || isOptionCorrect ? 'bold' : 'normal'}>
                                  {optText}
                                </Text>
                                {isStudentChoice && (
                                  <Badge colorScheme={isOptionCorrect ? 'green' : 'red'} ml="auto" fontSize="2xs">
                                    Your Choice
                                  </Badge>
                                )}
                                {isOptionCorrect && !isStudentChoice && (
                                  <Badge colorScheme="green" ml="auto" fontSize="2xs">
                                    Correct Answer
                                  </Badge>
                                )}
                              </HStack>
                            </Box>
                          );
                        })}
                      </SimpleGrid>

                      {/* Explanation */}
                      {mcq.explanation && (
                        <Box bg={surfaceBg} p={3} borderRadius="md" borderLeft="3px solid" borderColor="green.500">
                          <Text fontSize="xs" fontWeight="bold" color="green.600" mb={0.5}>
                            Solution Explanation:
                          </Text>
                          <Text fontSize="xs" color={textColor}>
                            {mcq.explanation}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </VStack>
        </VStack>
      )}

      {/* Code Viewer Modal */}
      <Modal isOpen={isCodeOpen} onClose={onCodeClose} size="3xl" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px" color={textColor} borderRadius="2xl" boxShadow="xl">
          <ModalHeader fontSize="md" color={textColor} borderBottomWidth="1px" borderColor={cardBorder}>
            Submitted Code — {activeCodeView.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} pt={4}>
            <Box h="400px" borderRadius="md" overflow="hidden" border="1px solid" borderColor={cardBorder}>
              <Editor
                height="100%"
                language={activeCodeView.lang || 'cpp'}
                theme={monacoTheme}
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
