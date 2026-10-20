// ──────────────────────────────────────────────
// Login Page — Role-Specific Tabs
// ──────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
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
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import useAuth from '../../hooks/useAuth';

const ROLE_TABS = ['student', 'faculty', 'admin'];

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('role');
  const initialTabIndex = ROLE_TABS.indexOf(initialRole) >= 0 ? ROLE_TABS.indexOf(initialRole) : 0;
  const [tabIndex, setTabIndex] = useState(initialTabIndex);

  const activeRole = ROLE_TABS[tabIndex];

  // Theme colors: ensure bright surfaces with dark text in light mode, dark surfaces with light text in dark mode
  const bg = useColorModeValue('#F2F6F3', '#121413');
  const cardBg = useColorModeValue('#FFFFFF', '#1E211F');
  const cardBorder = useColorModeValue('#DDE5DD', '#333A35');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#555E57', '#A3B0A5');
  const inputBg = useColorModeValue('#FFFFFF', '#292D2A');
  const inputBorder = useColorModeValue('#CFD9D1', '#424944');
  const accentColor = useColorModeValue('#2F8D46', '#86EFAC');

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

  const handleTabChange = (index) => {
    setTabIndex(index);
    setServerError('');
    setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    setServerError('');

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
        role: activeRole,
      });

      const user = response.data?.user || response.user;

      toast({
        title: 'Welcome back!',
        description: `Logged in successfully as ${user.name} (${user.role}).`,
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
        {/* Header */}
        <VStack spacing={2} mb={6} textAlign="center">
          <Heading
            as="h1"
            size="lg"
            color={textColor}
            fontWeight="800"
            letterSpacing="tight"
          >
            WCE Virtual Lab
          </Heading>
          <Text color={mutedText} fontSize="sm">
            Sign in to access virtual laboratories & assessments
          </Text>
        </VStack>

        {/* 3 Role-Specific Tabs */}
        <Tabs
          isFitted
          variant="enclosed"
          colorScheme="green"
          index={tabIndex}
          onChange={handleTabChange}
          mb={6}
        >
          <TabList borderColor={cardBorder}>
            <Tab
              fontWeight="700"
              fontSize="sm"
              color={mutedText}
              _selected={{ color: accentColor, borderColor: cardBorder, borderBottomColor: cardBg, fontWeight: '800' }}
            >
              Student
            </Tab>
            <Tab
              fontWeight="700"
              fontSize="sm"
              color={mutedText}
              _selected={{ color: accentColor, borderColor: cardBorder, borderBottomColor: cardBg, fontWeight: '800' }}
            >
              Faculty
            </Tab>
            <Tab
              fontWeight="700"
              fontSize="sm"
              color={mutedText}
              _selected={{ color: accentColor, borderColor: cardBorder, borderBottomColor: cardBg, fontWeight: '800' }}
            >
              Admin
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={4}>
              <Text fontSize="xs" color={mutedText} textAlign="center">
                Student portal for virtual rooms, coding labs, and practical assessments.
              </Text>
            </TabPanel>
            <TabPanel p={0} pt={4}>
              <Text fontSize="xs" color={mutedText} textAlign="center">
                Faculty workspace for managing rooms, curriculum, question banks, and assessments.
              </Text>
            </TabPanel>
            <TabPanel p={0} pt={4}>
              <Text fontSize="xs" color={mutedText} textAlign="center">
                Administrative console for reviewing registrations and platform management.
              </Text>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Server Error Alert */}
        {serverError && (
          <Alert status="error" borderRadius="xl" mb={5} fontSize="sm">
            <AlertIcon />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            {/* Email */}
            <FormControl isInvalid={!!getFieldError('email')} isRequired>
              <FormLabel fontSize="sm" color={textColor} fontWeight="600">Email Address</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <EmailIcon color={mutedText} />
                </InputLeftElement>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder={
                    activeRole === 'student'
                      ? 'student@wcelab.ac.in'
                      : activeRole === 'faculty'
                      ? 'faculty@wcelab.ac.in'
                      : 'admin@wcelab.ac.in'
                  }
                  value={formData.email}
                  onChange={handleChange}
                  bg={inputBg}
                  borderColor={inputBorder}
                  color={textColor}
                  _placeholder={{ color: mutedText }}
                  _hover={{ borderColor: accentColor }}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </InputGroup>
              <FormErrorMessage fontSize="xs">{getFieldError('email')}</FormErrorMessage>
            </FormControl>

            {/* Password */}
            <FormControl isInvalid={!!getFieldError('password')} isRequired>
              <Flex justify="space-between" align="center" mb={1}>
                <FormLabel fontSize="sm" color={textColor} fontWeight="600" mb={0}>Password</FormLabel>
                <RouterLink to="/forgot-password">
                  <Text fontSize="xs" color={accentColor} fontWeight="600" _hover={{ textDecoration: 'underline' }}>
                    Forgot Password?
                  </Text>
                </RouterLink>
              </Flex>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <LockIcon color={mutedText} />
                </InputLeftElement>
                <Input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  bg={inputBg}
                  borderColor={inputBorder}
                  color={textColor}
                  _placeholder={{ color: mutedText }}
                  _hover={{ borderColor: accentColor }}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
                <InputRightElement>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    color={mutedText}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage fontSize="xs">{getFieldError('password')}</FormErrorMessage>
            </FormControl>

            {/* Submit Button */}
            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              fontSize="md"
              fontWeight="700"
              w="full"
              mt={3}
              isLoading={isLoading}
              loadingText="Signing In..."
            >
              Sign In as {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
            </Button>
          </VStack>
        </form>

        <Divider my={6} borderColor={cardBorder} />

        {/* Footer Registration Action (Student & Faculty only) */}
        {activeRole === 'student' && (
          <Text color={mutedText} fontSize="sm" textAlign="center">
            New student?{' '}
            <RouterLink to="/signup?role=student">
              <Text as="span" color={accentColor} fontWeight="700" _hover={{ textDecoration: 'underline' }}>
                Create Student Account
              </Text>
            </RouterLink>
          </Text>
        )}

        {activeRole === 'faculty' && (
          <Text color={mutedText} fontSize="sm" textAlign="center">
            New faculty member?{' '}
            <RouterLink to="/signup?role=faculty">
              <Text as="span" color={accentColor} fontWeight="700" _hover={{ textDecoration: 'underline' }}>
                Register for Faculty Access
              </Text>
            </RouterLink>
          </Text>
        )}

        {activeRole === 'admin' && (
          <Text color={mutedText} fontSize="xs" textAlign="center">
            Administrator accounts are securely pre-provisioned. Self-registration is restricted.
          </Text>
        )}
      </Box>
    </Flex>
  );
};

export default Login;
