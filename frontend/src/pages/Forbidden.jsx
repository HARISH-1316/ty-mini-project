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
        bg="bg.card"
        p={8}
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="border.primary"
        boxShadow="xl"
      >
        <WarningTwoIcon w={16} h={16} color="red.500" />
        <Heading size="lg" color="text.primary">403 — Access Denied</Heading>
        <Text color="text.secondary" fontSize="sm">
          You do not have permission to access this section or resource.
        </Text>

        {user && (
          <Box p={4} bg="bg.surface" borderRadius="xl" borderWidth="1px" borderColor="border.primary" w="full">
            <Text color="text.secondary" fontSize="xs" mb={1}>Current Session:</Text>
            <Text color="text.primary" fontWeight="bold" fontSize="sm">{user.name} ({user.email})</Text>
            <HStack justify="center" mt={2}>
              <Text color="text.secondary" fontSize="xs">Assigned Role:</Text>
              <Badge colorScheme={user.role === 'student' ? 'orange' : user.role === 'faculty' ? 'brand' : 'red'} textTransform="uppercase">
                {user.role}
              </Badge>
            </HStack>
          </Box>
        )}

        <HStack spacing={4} pt={2}>
          {user?.role === 'student' && (
            <Button as={RouterLink} to="/student/rooms" colorScheme="brand">
              Go to My Rooms
            </Button>
          )}
          {user?.role === 'faculty' && (
            <Button as={RouterLink} to="/faculty/rooms" colorScheme="brand">
              Go to My Rooms
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
