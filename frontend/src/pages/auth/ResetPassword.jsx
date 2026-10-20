// ──────────────────────────────────────────────
// Reset Password Page
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
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
  InputRightElement,
  IconButton,
  Text,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { LockIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { verifyResetTokenApi, resetPasswordApi } from '../../api/authApi';

const ResetPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const bg = useColorModeValue('#F2F6F3', '#121413');
  const cardBg = useColorModeValue('#FFFFFF', '#1E211F');
  const cardBorder = useColorModeValue('#DDE5DD', '#333A35');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#555E57', '#A3B0A5');
  const inputBg = useColorModeValue('#FFFFFF', '#292D2A');
  const inputBorder = useColorModeValue('#CFD9D1', '#424944');
  const accentColor = useColorModeValue('#2F8D46', '#86EFAC');

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState('');
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenError('No password reset token was provided.');
        setIsVerifying(false);
        return;
      }

      try {
        const res = await verifyResetTokenApi({ token });
        setTokenValid(true);
        setTokenEmail(res.data?.email || res.email || '');
      } catch (err) {
        setTokenError(err.response?.data?.message || 'Password reset token is invalid, expired, or has already been used.');
      } finally {
        setIsVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      setFormError('New password is required.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setFormError('');

    try {
      await resetPasswordApi({ token, password, confirmPassword });
      toast({
        title: 'Password Reset Successful! 🎉',
        description: 'You can now sign in with your new password.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      navigate('/login', { replace: true });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to reset password. Please request a new recovery link.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bg}>
        <VStack spacing={3}>
          <Spinner size="xl" color={accentColor} thickness="4px" />
          <Text color={mutedText} fontSize="sm">Validating recovery link...</Text>
        </VStack>
      </Flex>
    );
  }

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
            Reset Password
          </Heading>
          <Text color={mutedText} fontSize="sm">
            {tokenValid
              ? `Enter your new password for ${tokenEmail}`
              : 'Secure account recovery'}
          </Text>
        </VStack>

        {!tokenValid ? (
          <VStack spacing={5} textAlign="center">
            <Alert status="error" borderRadius="xl" flexDirection="column" p={5}>
              <AlertIcon boxSize="36px" mr={0} />
              <AlertTitle mt={3} mb={1} fontSize="md" fontWeight="700">
                Invalid or Expired Link
              </AlertTitle>
              <AlertDescription fontSize="xs">
                {tokenError}
              </AlertDescription>
            </Alert>

            <Button as={RouterLink} to="/forgot-password" colorScheme="brand" size="md" w="full">
              Request New Reset Link
            </Button>
          </VStack>
        ) : (
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              {formError && (
                <Alert status="error" borderRadius="xl" fontSize="xs">
                  <AlertIcon />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel fontSize="sm" color={textColor} fontWeight="600">New Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <LockIcon color={mutedText} />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 chars, 1 uppercase, 1 symbol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={textColor}
                    _focus={{ borderColor: accentColor }}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      aria-label="Toggle password"
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      color={mutedText}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color={textColor} fontWeight="600">Confirm New Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <LockIcon color={mutedText} />
                  </InputLeftElement>
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={textColor}
                    _focus={{ borderColor: accentColor }}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      aria-label="Toggle confirm"
                      icon={showConfirm ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowConfirm(!showConfirm)}
                      color={mutedText}
                    />
                  </InputRightElement>
                </InputGroup>
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
                loadingText="Updating Password..."
              >
                Set New Password
              </Button>
            </VStack>
          </form>
        )}
      </Box>
    </Flex>
  );
};

export default ResetPassword;
