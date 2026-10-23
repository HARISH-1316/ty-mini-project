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
        <QuestionOutlineIcon w={16} h={16} color="brand.500" />
        <Heading size="xl" color="text.primary">404 — Page Not Found</Heading>
        <Text color="text.secondary">
          The page you are looking for does not exist or has been moved.
        </Text>
        <Button as={RouterLink} to="/login" colorScheme="brand">
          Back to Main Platform
        </Button>
      </VStack>
    </Flex>
  );
};

export default NotFound;
