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
      <Box p={8} textAlign="center" bg="bg.card" border="1px solid" borderColor="border.primary" borderRadius="xl">
        <Text color="text.secondary">No questions available in this quiz.</Text>
      </Box>
    );
  }

  const selectedAnswer = answers[currentQId] || '';

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* Header bar */}
      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
        <CardBody p={4}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <VStack align="start" spacing={1}>
              <Heading size="md" color="text.primary">
                {quizTitle}
              </Heading>
              <HStack spacing={2}>
                <Badge colorScheme="brand" fontSize="xs" px={2} py={0.5} borderRadius="md">
                  Question {currentIndex + 1} of {totalQuestions}
                </Badge>
                <Badge colorScheme="purple" fontSize="xs" px={2} py={0.5} borderRadius="md">
                  Marks: {currentQuestion.marks || 1}
                </Badge>
              </HStack>
            </VStack>

            {/* Timer if available */}
            {timeLeft !== null && (
              <HStack
                px={4}
                py={2}
                bg="bg.surface"
                borderRadius="lg"
                border="1px solid"
                borderColor={timeLeft < 60 ? 'red.500' : timeLeft < 300 ? 'amber.400' : 'brand.500'}
              >
                <Icon as={TimeIcon} color={timeLeft < 60 ? 'red.400' : timeLeft < 300 ? 'amber.500' : 'brand.500'} />
                <Text
                  fontWeight="bold"
                  fontSize="md"
                  color={timeLeft < 60 ? 'red.400' : timeLeft < 300 ? 'amber.500' : 'brand.500'}
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
      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px" boxShadow="lg">
        <CardBody p={{ base: 4, md: 6 }}>
          <VStack align="stretch" spacing={6}>
            {/* Question Text */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="accent.primary" textTransform="uppercase" letterSpacing="wider" mb={2}>
                Question {currentIndex + 1}
              </Text>
              <Text fontSize={{ base: 'md', md: 'lg' }} color="text.primary" fontWeight="medium" lineHeight="tall">
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
                      borderColor={isSelected ? 'accent.primary' : 'border.primary'}
                      bg={isSelected ? 'accent.soft' : 'bg.secondary'}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ borderColor: 'accent.primary', bg: isSelected ? 'accent.soft' : 'bg.primary' }}
                      onClick={() => handleOptionSelect(opt.key)}
                    >
                      <HStack spacing={4} align="center">
                        <Radio value={opt.key} colorScheme="brand" size="lg" />
                        <HStack spacing={2} flex={1}>
                          <Badge
                            colorScheme={isSelected ? 'brand' : 'gray'}
                            fontSize="sm"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                          >
                            {opt.key}
                          </Badge>
                          <Text color="text.primary" fontSize="md">
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
            borderColor="border.primary"
            color="text.primary"
            _hover={{ bg: 'bg.secondary' }}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            isDisabled={currentIndex === 0}
          >
            Previous
          </Button>
          <Button
            rightIcon={<ArrowForwardIcon />}
            variant="outline"
            borderColor="border.primary"
            color="text.primary"
            _hover={{ bg: 'bg.secondary' }}
            onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
            isDisabled={currentIndex === totalQuestions - 1}
          >
            Next
          </Button>
        </HStack>

        <Button
          colorScheme="brand"
          px={8}
          onClick={onOpen}
          isLoading={isSubmitting}
          loadingText="Submitting..."
        >
          Submit Quiz
        </Button>
      </Flex>

      {/* Question Palette Grid */}
      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
        <CardBody p={4}>
          <VStack align="stretch" spacing={3}>
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" fontWeight="bold" color="text.secondary" textTransform="uppercase" letterSpacing="wider">
                Question Navigator
              </Text>
              <HStack spacing={3} fontSize="xs">
                <HStack spacing={1}>
                  <Box w={3} h={3} borderRadius="full" bg="brand.500" />
                  <Text color="text.secondary">Answered ({answeredCount})</Text>
                </HStack>
                <HStack spacing={1}>
                  <Box w={3} h={3} borderRadius="full" bg="border.primary" />
                  <Text color="text.secondary">Unanswered ({unansweredCount})</Text>
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
                    colorScheme={isAnswered ? 'brand' : 'gray'}
                    bg={isAnswered ? 'brand.500' : 'bg.surface'}
                    borderColor={isCurrent ? 'accent.primary' : 'border.primary'}
                    borderWidth={isCurrent ? '2px' : '1px'}
                    color={isAnswered ? 'white' : 'text.primary'}
                    _hover={{ bg: isAnswered ? 'brand.600' : 'bg.secondary' }}
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
        <ModalContent bg="bg.card" borderColor="border.primary" borderWidth="1px" color="text.primary">
          <ModalHeader>Submit Quiz?</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color="text.secondary" fontSize="sm">
                Are you sure you want to finish and submit your quiz attempt?
              </Text>
              <Box p={4} bg="bg.surface" borderRadius="lg" border="1px solid" borderColor="border.primary">
                <SimpleGrid columns={2} spacing={3} textAlign="center">
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold" color="accent.primary">
                      {answeredCount}
                    </Text>
                    <Text fontSize="xs" color="text.secondary">Answered Questions</Text>
                  </Box>
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold" color={unansweredCount > 0 ? 'amber.500' : 'text.secondary'}>
                      {unansweredCount}
                    </Text>
                    <Text fontSize="xs" color="text.secondary">Unanswered Questions</Text>
                  </Box>
                </SimpleGrid>
              </Box>
              {unansweredCount > 0 && (
                <HStack color="amber.500" fontSize="xs">
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
              colorScheme="brand"
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
