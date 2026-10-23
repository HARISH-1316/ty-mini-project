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
      bg="bg.card"
      borderRadius="2xl"
      border="1px dashed"
      borderColor="border.primary"
      my={4}
    >
      <VStack spacing={4}>
        <InfoOutlineIcon w={10} h={10} color="accent.primary" />
        <Heading size="md" color="text.primary">
          {title}
        </Heading>
        <Text color="text.secondary" maxW="md">
          {description}
        </Text>
        {actionLabel && onAction && (
          <Button
            size="sm"
            colorScheme="brand"
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
