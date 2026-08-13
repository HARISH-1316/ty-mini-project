// ──────────────────────────────────────────────
// 403 Forbidden Page
// ──────────────────────────────────────────────

import { Link as RouterLink } from 'react-router-dom';
import { Flex, VStack, Heading, Text, Button } from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';

const Forbidden = () => {
  return (
    <Flex minH="80vh" align="center" justify="center" p={4} textAlign="center">
      <VStack spacing={6} maxW="md">
        <WarningTwoIcon w={16} h={16} color="red.400" />
        <Heading size="xl" color="white">403 — Access Denied</Heading>
        <Text color="gray.400">
          You do not have permission to access this page or resource. Please log in with authorized credentials.
        </Text>
        <Button as={RouterLink} to="/login" colorScheme="purple">
          Return to Login / Dashboard
        </Button>
      </VStack>
    </Flex>
  );
};

export default Forbidden;
