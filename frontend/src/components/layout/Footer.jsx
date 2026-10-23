// ──────────────────────────────────────────────
// Platform Footer Component
// ──────────────────────────────────────────────

import { Box, Text, Flex } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box
      as="footer"
      py={4}
      px={8}
      bg="bg.surface"
      borderTop="1px solid"
      borderColor="border.primary"
      mt="auto"
    >
      <Flex justify="space-between" align="center" direction={{ base: 'column', sm: 'row' }} gap={2}>
        <Text color="text.secondary" fontSize="xs">
          © {new Date().getFullYear()} Walchand College of Engineering — Virtual Lab Platform
        </Text>
        <Text color="text.secondary" fontSize="xs">
          Smart Assessment & Learning System
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer;
