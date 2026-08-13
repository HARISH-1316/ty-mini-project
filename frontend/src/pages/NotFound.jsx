// ──────────────────────────────────────────────
// 404 Not Found Page
// ──────────────────────────────────────────────

import { Link as RouterLink } from 'react-router-dom';
import { Flex, VStack, Heading, Text, Button } from '@chakra-ui/react';
import { QuestionOutlineIcon } from '@chakra-ui/icons';

const NotFound = () => {
  return (
    <Flex minH="80vh" align="center" justify="center" p={4} textAlign="center">
      <VStack spacing={6} maxW="md">
        <QuestionOutlineIcon w={16} h={16} color="purple.400" />
        <Heading size="xl" color="white">404 — Page Not Found</Heading>
        <Text color="gray.400">
          The page you are looking for does not exist or has been moved.
        </Text>
        <Button as={RouterLink} to="/login" colorScheme="purple">
          Back to Main Platform
        </Button>
      </VStack>
    </Flex>
  );
};

export default NotFound;
