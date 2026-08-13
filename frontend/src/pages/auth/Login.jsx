// ──────────────────────────────────────────────
// Login Page
// ──────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
} from '@chakra-ui/react';
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState([]);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => prev.filter((err) => err.field !== e.target.name));
    setServerError('');
  };

  const getFieldError = (field) => {
    const error = errors.find((err) => err.field === field);
    return error ? error.message : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    setServerError('');

    try {
      const response = await login(formData);
      const user = response.data.user;

      toast({
        title: 'Welcome back!',
        description: `Logged in successfully as ${user.name}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });

      // Role-based navigation
      if (user.role === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else if (user.role === 'faculty') {
        navigate('/faculty/dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        setErrors(res.errors);
      } else {
        setServerError(res?.message || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="dark.bg" px={4} py={8}>
      <Box
        w="full"
        maxW="md"
        bg="dark.card"
        borderRadius="2xl"
        boxShadow="0 0 40px rgba(128, 90, 213, 0.15)"
        border="1px solid"
        borderColor="dark.border"
        p={8}
      >
        {/* Header */}
        <VStack spacing={2} mb={8}>
          <Heading
            as="h1"
            size="xl"
            bgGradient="linear(to-r, purple.400, pink.400, cyan.400)"
            bgClip="text"
            fontWeight="extrabold"
            letterSpacing="tight"
          >
            WCE Virtual Lab
          </Heading>
          <Text color="gray.400" fontSize="md">
            Sign in to your account
          </Text>
        </VStack>

        {/* Server Error Alert */}
        {serverError && (
          <Alert status="error" borderRadius="lg" mb={4} bg="red.900" color="red.200">
            <AlertIcon color="red.300" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <VStack spacing={5}>
            {/* Email */}
            <FormControl isInvalid={!!getFieldError('email')} isRequired>
              <FormLabel color="gray.300">Email Address</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <EmailIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@wcelab.ac.in"
                  value={formData.email}
                  onChange={handleChange}
                  bg="slate.900"
                  border="1px solid"
                  borderColor="slate.700"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                />
              </InputGroup>
              <FormErrorMessage>{getFieldError('email')}</FormErrorMessage>
            </FormControl>

            {/* Password */}
            <FormControl isInvalid={!!getFieldError('password')} isRequired>
              <FormLabel color="gray.300">Password</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <LockIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  bg="slate.900"
                  border="1px solid"
                  borderColor="slate.700"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'purple.300' }}
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{getFieldError('password')}</FormErrorMessage>
            </FormControl>

            {/* Submit */}
            <Button
              id="login-submit"
              type="submit"
              w="full"
              size="lg"
              bgGradient="linear(to-r, purple.500, pink.500)"
              color="white"
              _hover={{ bgGradient: 'linear(to-r, purple.600, pink.600)', transform: 'translateY(-1px)', boxShadow: 'lg' }}
              _active={{ transform: 'translateY(0)' }}
              isLoading={isLoading}
              loadingText="Signing in..."
              transition="all 0.2s"
            >
              Sign In
            </Button>
          </VStack>
        </form>

        {/* Footer */}
        <Text mt={6} textAlign="center" color="gray.400" fontSize="sm">
          Don&apos;t have a student account?{' '}
          <Text as={RouterLink} to="/signup" color="purple.300" _hover={{ color: 'purple.200', textDecoration: 'underline' }}>
            Register here
          </Text>
        </Text>
      </Box>
    </Flex>
  );
};

export default Login;
