// ──────────────────────────────────────────────
// Global Error Boundary Component
// ──────────────────────────────────────────────

import React from 'react';
import { Box, VStack, Heading, Text, Button, Code } from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          minH="100vh"
          bg="#0f172a"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={6}
        >
          <VStack
            spacing={6}
            maxW="lg"
            bg="slate.800"
            p={8}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="slate.700"
            textAlign="center"
            boxShadow="2xl"
          >
            <WarningTwoIcon w={16} h={16} color="red.400" />
            <Heading size="lg" color="white">
              Something went wrong
            </Heading>
            <Text color="gray.300" fontSize="sm">
              An unexpected error occurred while rendering this page.
            </Text>
            {this.state.error?.message && (
              <Code
                p={3}
                borderRadius="md"
                bg="blackAlpha.600"
                color="red.300"
                fontSize="xs"
                w="full"
                maxH="120px"
                overflowY="auto"
                textAlign="left"
              >
                {this.state.error.message}
              </Code>
            )}
            <Button
              colorScheme="purple"
              onClick={this.handleReset}
            >
              Back to Dashboard
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
