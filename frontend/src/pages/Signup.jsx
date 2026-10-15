// ──────────────────────────────────────────────
// Signup Page — Student Registration
// ──────────────────────────────────────────────
// NO role selector — all public signups register as STUDENT.
// Collects student info: name, email, password, roll_number, course, year, phone.
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
  HStack,
  SimpleGrid,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon, AtSignIcon, PhoneIcon } from '@chakra-ui/icons';
import useAuth from '../hooks/useAuth';

const Signup = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roll_number: '',
    course: '',
    year: '',
    phone: '',
  });

  const [errors, setErrors] = useState([]);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => prev.filter((err) => err.field !== name));
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

    const payload = {
      ...formData,
      year: formData.year ? parseInt(formData.year, 10) : null,
    };

    try {
      await signup(payload);
      toast({
        title: 'Account created!',
        description: 'Your student account has been registered successfully.',
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      navigate('/login', { replace: true });
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        setErrors(res.errors);
      } else {
        setServerError(res?.message || 'Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.900" px={4} py={8}>
      <Box
        w="full"
        maxW="lg"
        bg="gray.800"
        borderRadius="2xl"
        boxShadow="0 0 40px rgba(128, 90, 213, 0.15)"
        border="1px solid"
        borderColor="gray.700"
        p={8}
      >
        {/* Header */}
        <VStack spacing={2} mb={8}>
          <Heading
            as="h1"
            size="xl"
            color="accent.primary"
            fontWeight="extrabold"
          >
            WCE Virtual Lab
          </Heading>
          <Text color="gray.400" fontSize="md">
            Student Registration
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
            {/* Full Name */}
            <FormControl isInvalid={!!getFieldError('name')} isRequired>
              <FormLabel color="gray.300">Full Name</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <AtSignIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                />
              </InputGroup>
              <FormErrorMessage>{getFieldError('name')}</FormErrorMessage>
            </FormControl>

            {/* Email */}
            <FormControl isInvalid={!!getFieldError('email')} isRequired>
              <FormLabel color="gray.300">Email Address</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <EmailIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="student@wcelab.ac.in"
                  value={formData.email}
                  onChange={handleChange}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                />
              </InputGroup>
              <FormErrorMessage>{getFieldError('email')}</FormErrorMessage>
            </FormControl>

            {/* Roll Number & Phone in a Grid */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
              <FormControl isInvalid={!!getFieldError('roll_number')} isRequired>
                <FormLabel color="gray.300">Roll Number</FormLabel>
                <Input
                  id="signup-roll"
                  name="roll_number"
                  type="text"
                  placeholder="2024CS001"
                  value={formData.roll_number}
                  onChange={handleChange}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{ borderColor: 'purple.400' }}
                />
                <FormErrorMessage>{getFieldError('roll_number')}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!getFieldError('phone')}>
                <FormLabel color="gray.300">Phone</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <PhoneIcon color="gray.500" />
                  </InputLeftElement>
                  <Input
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'purple.400' }}
                    _focus={{ borderColor: 'purple.400' }}
                  />
                </InputGroup>
                <FormErrorMessage>{getFieldError('phone')}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            {/* Course & Year in a Grid */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
              <FormControl isInvalid={!!getFieldError('course')}>
                <FormLabel color="gray.300">Course / Department</FormLabel>
                <Input
                  id="signup-course"
                  name="course"
                  type="text"
                  placeholder="B.Tech Computer Science"
                  value={formData.course}
                  onChange={handleChange}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{ borderColor: 'purple.400' }}
                />
                <FormErrorMessage>{getFieldError('course')}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!getFieldError('year')}>
                <FormLabel color="gray.300">Year</FormLabel>
                <Input
                  id="signup-year"
                  name="year"
                  type="number"
                  min="1"
                  max="6"
                  placeholder="3"
                  value={formData.year}
                  onChange={handleChange}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{ borderColor: 'purple.400' }}
                />
                <FormErrorMessage>{getFieldError('year')}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            {/* Password */}
            <FormControl isInvalid={!!getFieldError('password')} isRequired>
              <FormLabel color="gray.300">Password</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <LockIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit, 1 special"
                  value={formData.password}
                  onChange={handleChange}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{ borderColor: 'purple.400' }}
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

            {/* Confirm Password */}
            <FormControl isInvalid={!!getFieldError('confirmPassword')} isRequired>
              <FormLabel color="gray.300">Confirm Password</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <LockIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{ borderColor: 'purple.400' }}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    icon={showConfirm ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowConfirm(!showConfirm)}
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'purple.300' }}
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{getFieldError('confirmPassword')}</FormErrorMessage>
            </FormControl>

            {/* Submit */}
            <Button
              id="signup-submit"
              type="submit"
              w="full"
              size="lg"
              colorScheme="brand"
              isLoading={isLoading}
              loadingText="Creating account..."
              transition="all 0.2s"
            >
              Register as Student
            </Button>
          </VStack>
        </form>

        {/* Footer */}
        <Text mt={6} textAlign="center" color="gray.400" fontSize="sm">
          Already have an account?{' '}
          <Text as={RouterLink} to="/login" color="purple.300" _hover={{ color: 'purple.200', textDecoration: 'underline' }}>
            Sign in
          </Text>
        </Text>
      </Box>
    </Flex>
  );
};

export default Signup;
