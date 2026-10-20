// ──────────────────────────────────────────────
// Forgot Password Page
// ──────────────────────────────────────────────

import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { EmailIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { forgotPasswordApi } from '../../api/authApi';

const ForgotPassword = () => {
  const toast = useToast();

  const bg = useColorModeValue('#F2F6F3', '#121413');
  const cardBg = useColorModeValue('#FFFFFF', '#1E211F');
  const cardBorder = useColorModeValue('#DDE5DD', '#333A35');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#555E57', '#A3B0A5');
  const inputBg = useColorModeValue('#FFFFFF', '#292D2A');
  const inputBorder = useColorModeValue('#CFD9D1', '#424944');
  const accentColor = useColorModeValue('#2F8D46', '#86EFAC');

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responseInfo, setResponseInfo] = useState('');
  const [testResetToken, setTestResetToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    setIsLoading(true);
    setError('');
    setServerError('');

    try {
      const res = await forgotPasswordApi({ email: email.trim() });
      setResponseInfo(res.message || 'If an account with that email exists, reset instructions have been sent.');
      if (res.data?.testResetToken || res.testResetToken) {
        setTestResetToken(res.data?.testResetToken || res.testResetToken);
      }
      setSubmitted(true);
      toast({
        title: 'Request Sent',
        description: 'Password reset instructions have been processed.',
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg} px={4} py={12}>
      <Box
        w="full"
        maxW="md"
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="md"
        border="1px solid"
        borderColor={cardBorder}
        p={{ base: 6, md: 8 }}
      >
        <VStack spacing={2} mb={6} textAlign="center">
          <Heading as="h1" size="lg" color={textColor} fontWeight="800">
            Forgot Password
          </Heading>
          <Text color={mutedText} fontSize="sm">
            Enter your registered institutional email to receive a secure recovery link
          </Text>
        </VStack>

        {submitted ? (
          <VStack spacing={5} textAlign="center">
            <Alert
              status="success"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              borderRadius="xl"
              p={5}
            >
              <AlertIcon boxSize="36px" mr={0} />
              <AlertTitle mt={3} mb={1} fontSize="md" fontWeight="700">
                Recovery Request Submitted
              </AlertTitle>
              <AlertDescription fontSize="xs" color={mutedText}>
                {responseInfo}
              </AlertDescription>
            </Alert>

            {testResetToken && (
              <Box p={3} bg={useColorModeValue('#E8F5E9', '#243026')} borderRadius="lg" w="full" textAlign="left">
                <Text fontSize="2xs" fontWeight="bold" color={accentColor} textTransform="uppercase">
                  Development Mode Recovery Link:
                </Text>
                <RouterLink to={`/reset-password?token=${testResetToken}`}>
                  <Text fontSize="xs" color={accentColor} textDecoration="underline" wordBreak="break-all" mt={1}>
                    /reset-password?token={testResetToken}
                  </Text>
                </RouterLink>
              </Box>
            )}

            <Button
              as={RouterLink}
              to="/login"
              variant="outline"
              size="md"
              w="full"
              leftIcon={<ArrowBackIcon />}
            >
              Back to Sign In
            </Button>
          </VStack>
        ) : (
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              {serverError && (
                <Alert status="error" borderRadius="xl" fontSize="sm">
                  <AlertIcon />
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <FormControl isInvalid={!!error} isRequired>
                <FormLabel fontSize="sm" color={textColor} fontWeight="600">Registered Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <EmailIcon color={mutedText} />
                  </InputLeftElement>
                  <Input
                    name="email"
                    type="email"
                    placeholder="you@wcelab.ac.in"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={textColor}
                    _placeholder={{ color: mutedText }}
                    _focus={{ borderColor: accentColor }}
                  />
                </InputGroup>
                <FormErrorMessage fontSize="xs">{error}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                fontSize="md"
                fontWeight="700"
                w="full"
                mt={2}
                isLoading={isLoading}
                loadingText="Sending Request..."
              >
                Send Recovery Instructions
              </Button>
            </VStack>
          </form>
        )}

        <Divider my={6} borderColor={cardBorder} />

        <Flex justify="center">
          <RouterLink to="/login">
            <Text color={accentColor} fontSize="sm" fontWeight="600" _hover={{ textDecoration: 'underline' }}>
              ← Return to Login
            </Text>
          </RouterLink>
        </Flex>
      </Box>
    </Flex>
  );
};

export default ForgotPassword;
