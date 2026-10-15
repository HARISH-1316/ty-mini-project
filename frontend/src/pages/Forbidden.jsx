// ──────────────────────────────────────────────
// 403 Forbidden Page
// ──────────────────────────────────────────────

import { Link as RouterLink } from 'react-router-dom';
import { Flex, VStack, Heading, Text, Button, Box, Badge, HStack } from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';
import useAuth from '../hooks/useAuth';

const Forbidden = () => {
  const { user, logout } = useAuth();

  return (
    <Flex minH="90vh" align="center" justify="center" p={4} textAlign="center" bg="bg.primary">
      <VStack
        spacing={6}
        maxW="lg"
        bg="slate.800"
        p={8}
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="slate.700"
        boxShadow="2xl"
      >
        <WarningTwoIcon w={16} h={16} color="red.400" />
        <Heading size="lg" color="text.primary">403 — Access Denied</Heading>
        <Text color="text.secondary" fontSize="sm">
          You do not have permission to access this section or resource.
        </Text>

        {user && (
          <Box p={4} bg="slate.900" borderRadius="xl" borderWidth="1px" borderColor="slate.700" w="full">
            <Text color="gray.400" fontSize="xs" mb={1}>Current Session:</Text>
            <Text color="text.primary" fontWeight="bold" fontSize="sm">{user.name} ({user.email})</Text>
            <HStack justify="center" mt={2}>
              <Text color="gray.400" fontSize="xs">Assigned Role:</Text>
              <Badge colorScheme={user.role === 'student' ? 'orange' : user.role === 'faculty' ? 'brand' : 'red'} textTransform="uppercase">
                {user.role}
              </Badge>
            </HStack>
          </Box>
        )}

        <HStack spacing={4} pt={2}>
          {user?.role === 'student' && (
            <Button as={RouterLink} to="/student/lab-assessments" colorScheme="brand">
              Go to Student Assessments
            </Button>
          )}
          {user?.role === 'faculty' && (
            <Button as={RouterLink} to="/faculty/lab-assessments" colorScheme="brand">
              Go to Faculty Assessments
            </Button>
          )}
          <Button variant="outline" colorScheme="gray" color="text.secondary" onClick={logout}>
            Log Out / Switch Account
          </Button>
        </HStack>
      </VStack>
    </Flex>
  );
};

export default Forbidden;
