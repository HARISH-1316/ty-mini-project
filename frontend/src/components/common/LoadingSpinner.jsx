// ──────────────────────────────────────────────
// Reusable Loading Spinner Component
// ──────────────────────────────────────────────

import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';

const LoadingSpinner = ({ label = 'Loading...' }) => {
  return (
    <Flex minH="50vh" align="center" justify="center" p={8}>
      <VStack spacing={4}>
        <Spinner size="xl" color="purple.400" thickness="4px" speed="0.8s" />
        <Text color="gray.400" fontSize="sm" fontWeight="medium">
          {label}
        </Text>
      </VStack>
    </Flex>
  );
};

export default LoadingSpinner;
