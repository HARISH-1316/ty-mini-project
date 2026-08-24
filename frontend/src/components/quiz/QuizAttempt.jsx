// ──────────────────────────────────────────────
// QuizAttempt — Interactive Student Quiz Interface
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Radio,
  RadioGroup,
  Card,
  CardBody,
  Badge,
  Flex,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Icon,
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon, CheckIcon, TimeIcon, WarningTwoIcon } from '@chakra-ui/icons';

const QuizAttempt = ({
  quizTitle,
  questions = [],
  timeLimit = null, // in minutes (for final quiz)
  onSubmit,
  isSubmitting = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [question_id]: 'A' | 'B' | 'C' | 'D' }
  const [timeLeft, setTimeLeft] = useState(timeLimit ? timeLimit * 60 : null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const currentQuestion = questions[currentIndex] || null;
  const currentQId = currentQuestion ? (currentQuestion.pq_question_id || currentQuestion.stq_id || currentQuestion.fq_question_id) : null;

  // Handle countdown timer for timed quizzes
  const handleAutoSubmit = useCallback(() => {
    onSubmit(answers);
  }, [answers, onSubmit]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleAutoSubmit]);

  const formatTimer = (seconds) => {
    if (seconds === null) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (value) => {
    if (!currentQId) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQId]: value,
    }));
  };

  const handleClearOption = () => {
    if (!currentQId) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQId];
      return copy;
    });
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const unansweredCount = totalQuestions - answeredCount;

  if (!currentQuestion || questions.length === 0) {
    return (
      <Box p={8} textAlign="center" bg="slate.800" borderRadius="xl">
        <Text color="gray.400">No questions available in this quiz.</Text>
      </Box>
    );
  }

  const selectedAnswer = answers[currentQId] || '';

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* Header bar */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody p={4}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <VStack align="start" spacing={1}>
              <Heading size="md" color="white">
                {quizTitle}
              </Heading>
              <HStack spacing={2}>
                <Badge colorScheme="purple" fontSize="xs" px={2} py={0.5} borderRadius="md">
                  Question {currentIndex + 1} of {totalQuestions}
                </Badge>
                <Badge colorScheme="cyan" fontSize="xs" px={2} py={0.5} borderRadius="md">
                  Marks: {currentQuestion.marks || 1}
                </Badge>
              </HStack>
            </VStack>

            {/* Timer if available */}
            {timeLeft !== null && (
              <HStack
                px={4}
                py={2}
                bg="slate.900"
                borderRadius="lg"
                border="1px solid"
                borderColor={timeLeft < 60 ? 'red.500' : timeLeft < 300 ? 'amber.400' : 'purple.500'}
              >
                <Icon as={TimeIcon} color={timeLeft < 60 ? 'red.400' : timeLeft < 300 ? 'amber.300' : 'purple.300'} />
                <Text
                  fontWeight="bold"
                  fontSize="md"
                  color={timeLeft < 60 ? 'red.400' : timeLeft < 300 ? 'amber.300' : 'purple.300'}
                  letterSpacing="wider"
                >
                  {formatTimer(timeLeft)}
                </Text>
              </HStack>
            )}
          </Flex>
        </CardBody>
      </Card>

      {/* Main Question Card */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px" boxShadow="lg">
        <CardBody p={{ base: 4, md: 6 }}>
          <VStack align="stretch" spacing={6}>
            {/* Question Text */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="purple.300" textTransform="uppercase" letterSpacing="wider" mb={2}>
                Question {currentIndex + 1}
              </Text>
              <Text fontSize={{ base: 'md', md: 'lg' }} color="white" fontWeight="medium" lineHeight="tall">
                {currentQuestion.question_text}
              </Text>
            </Box>

            {/* Options */}
            <RadioGroup value={selectedAnswer} onChange={handleOptionSelect}>
              <VStack spacing={3} align="stretch">
                {[
                  { key: 'A', text: currentQuestion.option_a },
                  { key: 'B', text: currentQuestion.option_b },
                  { key: 'C', text: currentQuestion.option_c },
                  { key: 'D', text: currentQuestion.option_d },
                ].map((opt) => {
                  const isSelected = selectedAnswer === opt.key;
                  return (
                    <Box
                      key={opt.key}
                      p={4}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={isSelected ? 'purple.400' : 'slate.700'}
                      bg={isSelected ? 'rgba(168, 85, 247, 0.15)' : 'slate.900'}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ borderColor: 'purple.400', bg: 'slate.800' }}
                      onClick={() => handleOptionSelect(opt.key)}
                    >
                      <HStack spacing={4} align="center">
                        <Radio value={opt.key} colorScheme="purple" size="lg" />
                        <HStack spacing={2} flex={1}>
                          <Badge
                            colorScheme={isSelected ? 'purple' : 'gray'}
                            fontSize="sm"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                          >
                            {opt.key}
                          </Badge>
                          <Text color={isSelected ? 'white' : 'gray.200'} fontSize="md">
                            {opt.text}
                          </Text>
                        </HStack>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </RadioGroup>

            {/* Clear option button */}
            {selectedAnswer && (
              <Flex justify="flex-end">
                <Button size="xs" variant="ghost" colorScheme="gray" onClick={handleClearOption}>
                  Clear Selection
                </Button>
              </Flex>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Navigation and Submission Bar */}
      <Flex justify="space-between" align="center" direction={{ base: 'column-reverse', sm: 'row' }} gap={4}>
        <HStack spacing={3}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="outline"
            borderColor="slate.700"
            color="white"
            _hover={{ bg: 'slate.800' }}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            isDisabled={currentIndex === 0}
          >
            Previous
          </Button>
          <Button
            rightIcon={<ArrowForwardIcon />}
            variant="outline"
            borderColor="slate.700"
            color="white"
            _hover={{ bg: 'slate.800' }}
            onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
            isDisabled={currentIndex === totalQuestions - 1}
          >
            Next
          </Button>
        </HStack>

        <Button
          colorScheme="purple"
          bgGradient="linear(to-r, purple.500, pink.500)"
          _hover={{ bgGradient: 'linear(to-r, purple.600, pink.600)' }}
          px={8}
          onClick={onOpen}
          isLoading={isSubmitting}
          loadingText="Submitting..."
        >
          Submit Quiz
        </Button>
      </Flex>

      {/* Question Palette Grid */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody p={4}>
          <VStack align="stretch" spacing={3}>
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                Question Navigator
              </Text>
              <HStack spacing={3} fontSize="xs">
                <HStack spacing={1}>
                  <Box w={3} h={3} borderRadius="full" bg="purple.500" />
                  <Text color="gray.400">Answered ({answeredCount})</Text>
                </HStack>
                <HStack spacing={1}>
                  <Box w={3} h={3} borderRadius="full" bg="slate.700" />
                  <Text color="gray.400">Unanswered ({unansweredCount})</Text>
                </HStack>
              </HStack>
            </Flex>

            <SimpleGrid columns={{ base: 5, sm: 10 }} spacing={2}>
              {questions.map((q, idx) => {
                const qId = q.pq_question_id || q.stq_id || q.fq_question_id;
                const isAnswered = !!answers[qId];
                const isCurrent = idx === currentIndex;

                return (
                  <Button
                    key={qId || idx}
                    size="sm"
                    variant={isAnswered ? 'solid' : 'outline'}
                    colorScheme={isAnswered ? 'purple' : 'gray'}
                    bg={isAnswered ? 'purple.600' : 'slate.900'}
                    borderColor={isCurrent ? 'purple.300' : 'slate.700'}
                    borderWidth={isCurrent ? '2px' : '1px'}
                    color="white"
                    _hover={{ bg: isAnswered ? 'purple.500' : 'slate.800' }}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    {idx + 1}
                  </Button>
                );
              })}
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Submit Confirmation Dialog */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="slate.800" borderColor="slate.700" borderWidth="1px" color="white">
          <ModalHeader>Submit Quiz?</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color="gray.300" fontSize="sm">
                Are you sure you want to finish and submit your quiz attempt?
              </Text>
              <Box p={4} bg="slate.900" borderRadius="lg" border="1px solid" borderColor="slate.700">
                <SimpleGrid columns={2} spacing={3} textAlign="center">
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.300">
                      {answeredCount}
                    </Text>
                    <Text fontSize="xs" color="gray.400">Answered Questions</Text>
                  </Box>
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold" color={unansweredCount > 0 ? 'amber.400' : 'gray.400'}>
                      {unansweredCount}
                    </Text>
                    <Text fontSize="xs" color="gray.400">Unanswered Questions</Text>
                  </Box>
                </SimpleGrid>
              </Box>
              {unansweredCount > 0 && (
                <HStack color="amber.300" fontSize="xs">
                  <Icon as={WarningTwoIcon} />
                  <Text>You have {unansweredCount} unanswered questions.</Text>
                </HStack>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" colorScheme="gray" mr={3} onClick={onClose}>
              Continue Quiz
            </Button>
            <Button
              colorScheme="purple"
              bgGradient="linear(to-r, purple.500, pink.500)"
              onClick={() => {
                onClose();
                onSubmit(answers);
              }}
              isLoading={isSubmitting}
            >
              Confirm & Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default QuizAttempt;
