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
      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px" borderRadius="2xl" overflow="hidden" boxShadow="md">
        {/* Top Banner */}
        <Box
          p={6}
          bg={isPass ? 'green.600' : 'red.600'}
          borderBottom="1px solid"
          borderColor="border.primary"
        >
          <Flex justify="space-between" align="center" direction={{ base: 'column', sm: 'row' }} gap={4}>
            <VStack align={{ base: 'center', sm: 'start' }} spacing={1}>
              <HStack spacing={2}>
                <Icon
                  as={isPass ? CheckCircleIcon : WarningIcon}
                  w={6}
                  h={6}
                  color="white"
                />
                <Heading size="md" color="white">
                  Quiz Result
                </Heading>
              </HStack>
              <Text color="whiteAlpha.900" fontSize="sm">
                {quizTitle}
              </Text>
            </VStack>

            <Badge
              bg="white"
              color={isPass ? 'green.800' : 'red.800'}
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
              bg="bg.surface"
              borderRadius="xl"
              border="1px solid"
              borderColor="border.primary"
            >
              {/* Circular percentage */}
              <VStack spacing={2}>
                <CircularProgress
                  value={percentage}
                  size="120px"
                  thickness="10px"
                  color={isPass ? 'green.500' : 'red.500'}
                  trackColor="border.primary"
                >
                  <CircularProgressLabel color="text.primary" fontWeight="bold" fontSize="xl">
                    {Math.round(percentage)}%
                  </CircularProgressLabel>
                </CircularProgress>
                <Text color="text.secondary" fontSize="xs" fontWeight="medium" textTransform="uppercase">
                  Percentage
                </Text>
              </VStack>

              {/* Marks text */}
              <VStack align={{ base: 'center', md: 'start' }} spacing={1}>
                <Text color="text.secondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider">
                  Score
                </Text>
                <Heading size="2xl" color={isPass ? 'green.500' : 'red.500'}>
                  {score} <Text as="span" fontSize="lg" color="text.muted">/ {totalMarks}</Text>
                </Heading>
                <HStack spacing={2} pt={1}>
                  <Badge colorScheme={isPass ? 'green' : 'red'} fontSize="xs" px={2} py={0.5}>
                    {statusLabel}
                  </Badge>
                  <Text color="text.secondary" fontSize="xs">
                    {isPass
                      ? 'Great work! You have met the passing threshold.'
                      : 'Review the questions below and try again to improve.'}
                  </Text>
                </HStack>
              </VStack>
            </Flex>

            {/* Detailed Metrics Breakdown */}
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
              <Card bg="bg.surface" borderColor="green.500" borderWidth="1px" p={2}>
                <CardBody p={3} textAlign="center">
                  <HStack justify="center" spacing={2} mb={1}>
                    <Icon as={CheckIcon} color="green.500" />
                    <Text color="green.500" fontSize="2xl" fontWeight="bold">
                      {correctAnswers}
                    </Text>
                  </HStack>
                  <Text color="text.secondary" fontSize="xs">Correct Answers</Text>
                </CardBody>
              </Card>

              <Card bg="bg.surface" borderColor="red.500" borderWidth="1px" p={2}>
                <CardBody p={3} textAlign="center">
                  <HStack justify="center" spacing={2} mb={1}>
                    <Icon as={CloseIcon} color="red.500" w={3} h={3} />
                    <Text color="red.500" fontSize="2xl" fontWeight="bold">
                      {incorrectAnswers}
                    </Text>
                  </HStack>
                  <Text color="text.secondary" fontSize="xs">Incorrect Answers</Text>
                </CardBody>
              </Card>

              <Card bg="bg.surface" borderColor="border.primary" borderWidth="1px" p={2}>
                <CardBody p={3} textAlign="center">
                  <HStack justify="center" spacing={2} mb={1}>
                    <Icon as={QuestionOutlineIcon} color="amber.500" />
                    <Text color="text.primary" fontSize="2xl" fontWeight="bold">
                      {unanswered}
                    </Text>
                  </HStack>
                  <Text color="text.secondary" fontSize="xs">Unanswered</Text>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Action Buttons */}
            <HStack spacing={4} justify="center" pt={2}>
              {onRetake && (
                <Button
                  leftIcon={<RepeatIcon />}
                  variant="outline"
                  borderColor="border.primary"
                  color="text.primary"
                  _hover={{ bg: 'bg.secondary' }}
                  onClick={onRetake}
                >
                  Retake Quiz
                </Button>
              )}

              {onBack && (
                <Button
                  leftIcon={<ArrowBackIcon />}
                  colorScheme="brand"
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
            <Heading size="md" color="text.primary">
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
                  bg="bg.card"
                  borderColor={
                    isCorrect ? 'green.500' : hasAnswered ? 'red.500' : 'border.primary'
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
                        ? 'rgba(16, 185, 129, 0.1)'
                        : hasAnswered
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'bg.surface'
                    }
                    borderBottom="1px solid"
                    borderColor="border.primary"
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
                      <Text color="text.primary" fontSize="md" fontWeight="medium">
                        {item.questionText}
                      </Text>

                      {/* Options List */}
                      {item.options && (
                        <VStack spacing={2} align="stretch" pt={1}>
                          {Object.entries(item.options).map(([optKey, optText]) => {
                            if (!optText) return null;
                            const isStudentPick = item.selectedOption === optKey;
                            const isCorrectPick = item.correctOption === optKey;

                            let optBg = 'bg.surface';
                            let optBorder = 'border.primary';
                            let optBadgeScheme = 'gray';

                            if (isCorrectPick) {
                              optBg = 'rgba(16, 185, 129, 0.15)';
                              optBorder = 'green.500';
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
                                    <Text color="text.primary" fontSize="sm" fontWeight={isCorrectPick || isStudentPick ? 'semibold' : 'normal'}>
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
                      <Divider borderColor="border.primary" />
                      <HStack justify="space-between" fontSize="xs" color="text.secondary" wrap="wrap">
                        <Text>
                          Your Answer:{' '}
                          <Text as="span" fontWeight="bold" color={isCorrect ? 'green.500' : 'red.500'}>
                            {item.selectedOption ? item.selectedOption : 'None (Unanswered)'}
                          </Text>
                        </Text>
                        <Text>
                          Correct Answer:{' '}
                          <Text as="span" fontWeight="bold" color="green.500">
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
