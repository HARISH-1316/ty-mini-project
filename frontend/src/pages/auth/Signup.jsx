// ──────────────────────────────────────────────
// Registration Page — Student & Faculty Options
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
  SimpleGrid,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  Tabs,
  TabList,
  Tab,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon, AtSignIcon, PhoneIcon } from '@chakra-ui/icons';
import { signupStudentApi, signupFacultyApi } from '../../api/authApi';

const Signup = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const roleParam = searchParams.get('role');
  const [role, setRole] = useState(roleParam === 'faculty' ? 'faculty' : 'student');

  // Theme styling
  const bg = useColorModeValue('#F2F6F3', '#121413');
  const cardBg = useColorModeValue('#FFFFFF', '#1E211F');
  const cardBorder = useColorModeValue('#DDE5DD', '#333A35');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#555E57', '#A3B0A5');
  const inputBg = useColorModeValue('#FFFFFF', '#292D2A');
  const inputBorder = useColorModeValue('#CFD9D1', '#424944');
  const accentColor = useColorModeValue('#2F8D46', '#86EFAC');

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Student fields
    roll_number: '',
    course: '',
    year: '',
    // Faculty fields
    department: '',
    designation: '',
    specialization: '',
    // Shared
    phone: '',
  });

  const [errors, setErrors] = useState([]);
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setSearchParams({ role: newRole });
    setErrors([]);
    setServerError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    try {
      if (role === 'student') {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          roll_number: formData.roll_number,
          course: formData.course,
          year: formData.year ? parseInt(formData.year, 10) : null,
          phone: formData.phone,
        };
        const res = await signupStudentApi(payload);
        setSuccessMessage(res.message || 'Student registration submitted successfully.');
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          department: formData.department,
          designation: formData.designation,
          specialization: formData.specialization,
          phone: formData.phone,
        };
        const res = await signupFacultyApi(payload);
        setSuccessMessage(res.message || 'Faculty registration submitted successfully.');
      }

      setIsSuccess(true);
      toast({
        title: 'Registration Submitted',
        description: 'Your registration is awaiting administrator approval.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        setErrors(res.errors);
      } else {
        setServerError(res?.message || 'Registration failed. Please check your inputs.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bg} px={4} py={12}>
        <Box
          w="full"
          maxW="lg"
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="md"
          border="1px solid"
          borderColor={cardBorder}
          p={{ base: 6, md: 8 }}
          textAlign="center"
        >
          <VStack spacing={5}>
            <Alert
              status="success"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              borderRadius="xl"
              p={6}
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={2} fontSize="lg" fontWeight="800">
                Registration Awaiting Approval!
              </AlertTitle>
              <AlertDescription fontSize="sm" color={mutedText}>
                {successMessage}
              </AlertDescription>
            </Alert>

            <Text fontSize="sm" color={mutedText}>
              In accordance with institutional security guidelines, new student and faculty accounts must be reviewed and approved by an administrator before access to virtual labs is granted.
            </Text>

            <Button
              as={RouterLink}
              to={`/login?role=${role}`}
              colorScheme="brand"
              size="md"
              fontWeight="700"
              w="full"
            >
              Return to Sign In
            </Button>
          </VStack>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg} px={4} py={12}>
      <Box
        w="full"
        maxW="2xl"
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="md"
        border="1px solid"
        borderColor={cardBorder}
        p={{ base: 6, md: 8 }}
      >
        {/* Header */}
        <VStack spacing={2} mb={6} textAlign="center">
          <Heading as="h1" size="lg" color={textColor} fontWeight="800">
            Create an Account
          </Heading>
          <Text color={mutedText} fontSize="sm">
            Join WCE Virtual Lab for interactive learning and laboratory practicals
          </Text>
        </VStack>

        {/* Role Selection Tabs */}
        <Tabs
          isFitted
          variant="enclosed"
          colorScheme="green"
          index={role === 'faculty' ? 1 : 0}
          onChange={(index) => handleRoleChange(index === 1 ? 'faculty' : 'student')}
          mb={6}
        >
          <TabList borderColor={cardBorder}>
            <Tab
              fontWeight="700"
              fontSize="sm"
              color={mutedText}
              _selected={{ color: accentColor, borderColor: cardBorder, borderBottomColor: cardBg, fontWeight: '800' }}
            >
              Student Registration
            </Tab>
            <Tab
              fontWeight="700"
              fontSize="sm"
              color={mutedText}
              _selected={{ color: accentColor, borderColor: cardBorder, borderBottomColor: cardBg, fontWeight: '800' }}
            >
              Faculty Registration
            </Tab>
          </TabList>
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
            {/* Full Name & Email */}
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <FormControl isInvalid={!!getFieldError('name')} isRequired>
                <FormLabel fontSize="sm" color={textColor} fontWeight="600">Full Name</FormLabel>
                <Input
                  id="signup-name"
                  name="name"
                  placeholder={role === 'faculty' ? 'Dr. John Doe' : 'Jane Doe'}
                  value={formData.name}
                  onChange={handleChange}
                  bg={inputBg}
                  borderColor={inputBorder}
                  color={textColor}
                  _placeholder={{ color: mutedText }}
                  _focus={{ borderColor: accentColor }}
                />
                <FormErrorMessage fontSize="xs">{getFieldError('name')}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!getFieldError('email')} isRequired>
                <FormLabel fontSize="sm" color={textColor} fontWeight="600">Institutional Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <EmailIcon color={mutedText} />
                  </InputLeftElement>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder={role === 'faculty' ? 'faculty@wcelab.ac.in' : 'student@wcelab.ac.in'}
                    value={formData.email}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={textColor}
                    _placeholder={{ color: mutedText }}
                    _focus={{ borderColor: accentColor }}
                  />
                </InputGroup>
                <FormErrorMessage fontSize="xs">{getFieldError('email')}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            {/* Password & Confirm Password */}
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <FormControl isInvalid={!!getFieldError('password')} isRequired>
                <FormLabel fontSize="sm" color={textColor} fontWeight="600">Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <LockIcon color={mutedText} />
                  </InputLeftElement>
                  <Input
                    id="signup-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 chars, 1 uppercase, 1 symbol"
                    value={formData.password}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={textColor}
                    _placeholder={{ color: mutedText }}
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
                <FormErrorMessage fontSize="xs">{getFieldError('password')}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!getFieldError('confirmPassword')} isRequired>
                <FormLabel fontSize="sm" color={textColor} fontWeight="600">Confirm Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <LockIcon color={mutedText} />
                  </InputLeftElement>
                  <Input
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={textColor}
                    _placeholder={{ color: mutedText }}
                    _focus={{ borderColor: accentColor }}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      aria-label="Toggle confirm password"
                      icon={showConfirm ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowConfirm(!showConfirm)}
                      color={mutedText}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage fontSize="xs">{getFieldError('confirmPassword')}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            {/* Role-Specific Fields */}
            {role === 'student' ? (
              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                <FormControl isInvalid={!!getFieldError('roll_number')} isRequired>
                  <FormLabel fontSize="sm" color={textColor} fontWeight="600">Roll Number</FormLabel>
                  <Input
                    id="signup-roll"
                    name="roll_number"
                    placeholder="e.g. 2024BTECS00001"
                    value={formData.roll_number}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={textColor}
                    _placeholder={{ color: mutedText }}
                    _focus={{ borderColor: accentColor }}
                  />
                  <FormErrorMessage fontSize="xs">{getFieldError('roll_number')}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!getFieldError('course')}>
                  <FormLabel fontSize="sm" color={textColor} fontWeight="600">Course / Branch</FormLabel>
                  <Input
                    id="signup-course"
                    name="course"
                    placeholder="e.g. Computer Science"
                    value={formData.course}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={textColor}
                    _placeholder={{ color: mutedText }}
                    _focus={{ borderColor: accentColor }}
                  />
                </FormControl>

                <FormControl isInvalid={!!getFieldError('year')}>
                  <FormLabel fontSize="sm" color={textColor} fontWeight="600">Year (1-4)</FormLabel>
                  <Input
                    id="signup-year"
                    name="year"
                    type="number"
                    min="1"
                    max="6"
                    placeholder="3"
                    value={formData.year}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={textColor}
                    _placeholder={{ color: mutedText }}
                    _focus={{ borderColor: accentColor }}
                  />
                </FormControl>
              </SimpleGrid>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                <FormControl isInvalid={!!getFieldError('department')} isRequired>
                  <FormLabel fontSize="sm" color={textColor} fontWeight="600">Department</FormLabel>
                  <Input
                    id="signup-dept"
                    name="department"
                    placeholder="Computer Science & Engg."
                    value={formData.department}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={textColor}
                    _placeholder={{ color: mutedText }}
                    _focus={{ borderColor: accentColor }}
                  />
                  <FormErrorMessage fontSize="xs">{getFieldError('department')}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!getFieldError('designation')}>
                  <FormLabel fontSize="sm" color={textColor} fontWeight="600">Designation</FormLabel>
                  <Input
                    id="signup-designation"
                    name="designation"
                    placeholder="Assistant Professor"
                    value={formData.designation}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={textColor}
                    _placeholder={{ color: mutedText }}
                    _focus={{ borderColor: accentColor }}
                  />
                </FormControl>

                <FormControl isInvalid={!!getFieldError('specialization')}>
                  <FormLabel fontSize="sm" color={textColor} fontWeight="600">Specialization</FormLabel>
                  <Input
                    id="signup-spec"
                    name="specialization"
                    placeholder="Algorithms, Systems"
                    value={formData.specialization}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={textColor}
                    _placeholder={{ color: mutedText }}
                    _focus={{ borderColor: accentColor }}
                  />
                </FormControl>
              </SimpleGrid>
            )}

            {/* Phone */}
            <FormControl isInvalid={!!getFieldError('phone')}>
              <FormLabel fontSize="sm" color={textColor} fontWeight="600">Contact Number (Optional)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <PhoneIcon color={mutedText} />
                </InputLeftElement>
                <Input
                  id="signup-phone"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  bg={inputBg}
                  borderColor={inputBorder}
                  color={textColor}
                  _placeholder={{ color: mutedText }}
                  _focus={{ borderColor: accentColor }}
                />
              </InputGroup>
            </FormControl>

            {/* Notice regarding approval */}
            <Box p={3} bg={useColorModeValue('#E8F5E9', '#243026')} borderRadius="lg">
              <Text fontSize="xs" color={useColorModeValue('#1B5E20', '#A3E635')} fontWeight="500">
                ℹ️ Note: After registering, your account status will be marked as <strong>Pending</strong>. An administrator will review your account before activation.
              </Text>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              fontSize="md"
              fontWeight="700"
              w="full"
              mt={2}
              isLoading={isLoading}
              loadingText="Submitting Registration..."
            >
              Register {role === 'faculty' ? 'Faculty' : 'Student'} Account
            </Button>
          </VStack>
        </form>

        <Divider my={6} borderColor={cardBorder} />

        <Text color={mutedText} fontSize="sm" textAlign="center">
          Already registered?{' '}
          <RouterLink to={`/login?role=${role}`}>
            <Text as="span" color={accentColor} fontWeight="700" _hover={{ textDecoration: 'underline' }}>
              Sign In
            </Text>
          </RouterLink>
        </Text>
      </Box>
    </Flex>
  );
};

export default Signup;
