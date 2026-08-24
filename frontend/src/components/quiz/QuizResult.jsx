// ──────────────────────────────────────────────
// QuizResult — Standardized Quiz Result Card Component
// ──────────────────────────────────────────────
// Displays immediate post-submission evaluation, score, percentage,
// pass/fail status, and question-by-question breakdown with student
// choice, correct answer, and correctness badges.
// ──────────────────────────────────────────────

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  SimpleGrid,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Icon,
  Divider,
  Tag,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  WarningIcon,
  RepeatIcon,
  ArrowBackIcon,
  CheckIcon,
  CloseIcon,
  QuestionOutlineIcon,
} from '@chakra-ui/icons';

const QuizResult = ({
  quizTitle,
  result,
  onRetake,
  onBack,
  backButtonLabel = 'Back to Topic',
}) => {
  const {
    score = 0,
    totalMarks = 0,
    percentage = 0,
    correctAnswers = 0,
    incorrectAnswers = 0,
    unanswered = 0,
    passed = false,
    status = null,
    answers = [],
  } = result || {};

  const isPass = passed !== undefined ? passed : (status === 'PASSED' || percentage >= 50);
  const statusLabel = status || (isPass ? 'PASSED' : 'FAILED');

  return (
    <VStack spacing={8} align="stretch" w="full" maxW="4xl" mx="auto" pb={8}>
      {/* ── Main Result Summary Card ──────────────────── */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px" borderRadius="2xl" overflow="hidden" boxShadow="2xl">
        {/* Top Banner */}
        <Box
          p={6}
          bgGradient={
            isPass
              ? 'linear(to-r, rgba(6, 78, 59, 0.9), rgba(15, 23, 42, 0.95))'
              : 'linear(to-r, rgba(127, 29, 29, 0.9), rgba(15, 23, 42, 0.95))'
          }
          borderBottom="1px solid"
          borderColor={isPass ? 'emerald.600' : 'red.700'}
        >
          <Flex justify="space-between" align="center" direction={{ base: 'column', sm: 'row' }} gap={4}>
            <VStack align={{ base: 'center', sm: 'start' }} spacing={1}>
              <HStack spacing={2}>
                <Icon
                  as={isPass ? CheckCircleIcon : WarningIcon}
                  w={6}
                  h={6}
                  color={isPass ? 'emerald.400' : 'red.400'}
                />
                <Heading size="md" color="white">
                  Quiz Result
                </Heading>
              </HStack>
              <Text color="gray.300" fontSize="sm">
                {quizTitle}
              </Text>
            </VStack>

            <Badge
              colorScheme={isPass ? 'green' : 'red'}
              fontSize="sm"
              px={4}
              py={1.5}
              borderRadius="full"
              textTransform="uppercase"
              letterSpacing="wider"
              fontWeight="bold"
            >
              {isPass ? 'STATUS: PASSED 🎉' : 'STATUS: FAILED'}
            </Badge>
          </Flex>
        </Box>

        <CardBody p={{ base: 6, md: 8 }}>
          <VStack spacing={6} align="stretch">
            {/* Score circle & summary */}
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-around"
              align="center"
              gap={6}
              p={6}
              bg="slate.900"
              borderRadius="xl"
              border="1px solid"
              borderColor="slate.700"
            >
              {/* Circular percentage */}
              <VStack spacing={2}>
                <CircularProgress
                  value={percentage}
                  size="120px"
                  thickness="10px"
                  color={isPass ? 'green.400' : 'red.400'}
                  trackColor="slate.800"
                >
                  <CircularProgressLabel color="white" fontWeight="bold" fontSize="xl">
                    {Math.round(percentage)}%
                  </CircularProgressLabel>
                </CircularProgress>
                <Text color="gray.400" fontSize="xs" fontWeight="medium" textTransform="uppercase">
                  Percentage
                </Text>
              </VStack>

              {/* Marks text */}
              <VStack align={{ base: 'center', md: 'start' }} spacing={1}>
                <Text color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">
                  Score
                </Text>
                <Heading size="2xl" color={isPass ? 'emerald.300' : 'red.300'}>
                  {score} <Text as="span" fontSize="lg" color="gray.500">/ {totalMarks}</Text>
                </Heading>
                <HStack spacing={2} pt={1}>
                  <Badge colorScheme={isPass ? 'green' : 'red'} fontSize="xs" px={2} py={0.5}>
                    {statusLabel}
                  </Badge>
                  <Text color="gray.400" fontSize="xs">
                    {isPass
                      ? 'Great work! You have met the passing threshold.'
                      : 'Review the questions below and try again to improve.'}
                  </Text>
                </HStack>
              </VStack>
            </Flex>

            {/* Detailed Metrics Breakdown */}
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
              <Card bg="slate.900" borderColor="emerald.900" borderWidth="1px" p={2}>
                <CardBody p={3} textAlign="center">
                  <HStack justify="center" spacing={2} mb={1}>
                    <Icon as={CheckIcon} color="emerald.400" />
                    <Text color="emerald.400" fontSize="2xl" fontWeight="bold">
                      {correctAnswers}
                    </Text>
                  </HStack>
                  <Text color="gray.400" fontSize="xs">Correct Answers</Text>
                </CardBody>
              </Card>

              <Card bg="slate.900" borderColor="red.900" borderWidth="1px" p={2}>
                <CardBody p={3} textAlign="center">
                  <HStack justify="center" spacing={2} mb={1}>
                    <Icon as={CloseIcon} color="red.400" w={3} h={3} />
                    <Text color="red.400" fontSize="2xl" fontWeight="bold">
                      {incorrectAnswers}
                    </Text>
                  </HStack>
                  <Text color="gray.400" fontSize="xs">Incorrect Answers</Text>
                </CardBody>
              </Card>

              <Card bg="slate.900" borderColor="slate.700" borderWidth="1px" p={2}>
                <CardBody p={3} textAlign="center">
                  <HStack justify="center" spacing={2} mb={1}>
                    <Icon as={QuestionOutlineIcon} color="amber.400" />
                    <Text color="gray.300" fontSize="2xl" fontWeight="bold">
                      {unanswered}
                    </Text>
                  </HStack>
                  <Text color="gray.400" fontSize="xs">Unanswered</Text>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Action Buttons */}
            <HStack spacing={4} justify="center" pt={2}>
              {onRetake && (
                <Button
                  leftIcon={<RepeatIcon />}
                  variant="outline"
                  borderColor="slate.600"
                  color="white"
                  _hover={{ bg: 'slate.700' }}
                  onClick={onRetake}
                >
                  Retake Quiz
                </Button>
              )}

              {onBack && (
                <Button
                  leftIcon={<ArrowBackIcon />}
                  colorScheme="purple"
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  _hover={{ bgGradient: 'linear(to-r, purple.600, pink.600)' }}
                  onClick={onBack}
                >
                  {backButtonLabel}
                </Button>
              )}
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* ── Question-by-Question Detailed Review ───────── */}
      {answers && answers.length > 0 && (
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center" px={1}>
            <Heading size="md" color="white">
              Answer Review & Explanations
            </Heading>
            <Tag size="sm" colorScheme="purple">
              {answers.length} Questions Evaluated
            </Tag>
          </Flex>

          <VStack spacing={4} align="stretch">
            {answers.map((item, index) => {
              const isCorrect = item.isCorrect;
              const hasAnswered = Boolean(item.selectedOption);

              return (
                <Card
                  key={item.questionId || index}
                  bg="slate.800"
                  borderColor={
                    isCorrect ? 'emerald.600' : hasAnswered ? 'red.600' : 'slate.600'
                  }
                  borderWidth="1px"
                  borderRadius="xl"
                  overflow="hidden"
                >
                  {/* Question Header */}
                  <Box
                    p={4}
                    bg={
                      isCorrect
                        ? 'rgba(6, 78, 59, 0.3)'
                        : hasAnswered
                        ? 'rgba(127, 29, 29, 0.3)'
                        : 'slate.900'
                    }
                    borderBottom="1px solid"
                    borderColor="slate.700"
                  >
                    <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                      <HStack spacing={3}>
                        <Tag
                          size="md"
                          colorScheme={isCorrect ? 'green' : hasAnswered ? 'red' : 'gray'}
                          variant="solid"
                          fontWeight="bold"
                        >
                          Q{index + 1}
                        </Tag>
                        <Badge
                          colorScheme={isCorrect ? 'green' : hasAnswered ? 'red' : 'yellow'}
                          fontSize="xs"
                          px={2.5}
                          py={0.5}
                          borderRadius="full"
                        >
                          {isCorrect ? '✓ Correct' : hasAnswered ? '✗ Incorrect' : '○ Unanswered'}
                        </Badge>
                      </HStack>

                      <Tag size="sm" colorScheme="cyan" variant="subtle">
                        Marks: {item.marksObtained !== undefined ? item.marksObtained : (isCorrect ? item.marks : 0)} / {item.marks || 1}
                      </Tag>
                    </Flex>
                  </Box>

                  <CardBody p={5}>
                    <VStack align="stretch" spacing={4}>
                      {/* Question Text */}
                      <Text color="white" fontSize="md" fontWeight="medium">
                        {item.questionText}
                      </Text>

                      {/* Options List */}
                      {item.options && (
                        <VStack spacing={2} align="stretch" pt={1}>
                          {Object.entries(item.options).map(([optKey, optText]) => {
                            if (!optText) return null;
                            const isStudentPick = item.selectedOption === optKey;
                            const isCorrectPick = item.correctOption === optKey;

                            let optBg = 'slate.900';
                            let optBorder = 'slate.700';
                            let optBadgeScheme = 'gray';

                            if (isCorrectPick) {
                              optBg = 'rgba(16, 185, 129, 0.15)';
                              optBorder = 'emerald.500';
                              optBadgeScheme = 'green';
                            } else if (isStudentPick && !isCorrect) {
                              optBg = 'rgba(239, 68, 68, 0.15)';
                              optBorder = 'red.500';
                              optBadgeScheme = 'red';
                            }

                            return (
                              <Box
                                key={optKey}
                                p={3}
                                borderRadius="lg"
                                border="1px solid"
                                borderColor={optBorder}
                                bg={optBg}
                              >
                                <HStack justify="space-between">
                                  <HStack spacing={3}>
                                    <Badge colorScheme={optBadgeScheme} px={2} py={0.5} borderRadius="md">
                                      {optKey}
                                    </Badge>
                                    <Text color={isCorrectPick ? 'emerald.200' : isStudentPick ? 'red.200' : 'gray.300'} fontSize="sm">
                                      {optText}
                                    </Text>
                                  </HStack>

                                  <HStack spacing={2}>
                                    {isStudentPick && (
                                      <Badge colorScheme={isCorrect ? 'green' : 'red'} variant="subtle" fontSize="xs">
                                        Your Choice
                                      </Badge>
                                    )}
                                    {isCorrectPick && (
                                      <Badge colorScheme="green" variant="solid" fontSize="xs">
                                        Correct Option
                                      </Badge>
                                    )}
                                  </HStack>
                                </HStack>
                              </Box>
                            );
                          })}
                        </VStack>
                      )}

                      {/* Summary Footnote for Question */}
                      <Divider borderColor="slate.700" />
                      <HStack justify="space-between" fontSize="xs" color="gray.400" wrap="wrap">
                        <Text>
                          Your Answer:{' '}
                          <Text as="span" fontWeight="bold" color={isCorrect ? 'emerald.300' : 'red.300'}>
                            {item.selectedOption ? item.selectedOption : 'None (Unanswered)'}
                          </Text>
                        </Text>
                        <Text>
                          Correct Answer:{' '}
                          <Text as="span" fontWeight="bold" color="emerald.300">
                            {item.correctOption}
                          </Text>
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </VStack>
        </VStack>
      )}
    </VStack>
  );
};

export default QuizResult;
