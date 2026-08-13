// ──────────────────────────────────────────────
// Reusable Empty State Component
// ──────────────────────────────────────────────

import { Box, VStack, Heading, Text, Button } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';

const EmptyState = ({
  title = 'No Data Found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
}) => {
  return (
    <Box
      w="full"
      p={10}
      textAlign="center"
      bg="slate.800"
      borderRadius="2xl"
      border="1px dashed"
      borderColor="slate.700"
      my={4}
    >
      <VStack spacing={4}>
        <InfoOutlineIcon w={10} h={10} color="purple.400" />
        <Heading size="md" color="white">
          {title}
        </Heading>
        <Text color="gray.400" maxW="md">
          {description}
        </Text>
        {actionLabel && onAction && (
          <Button
            size="sm"
            bgGradient="linear(to-r, purple.500, pink.500)"
            color="white"
            onClick={onAction}
            mt={2}
          >
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default EmptyState;
