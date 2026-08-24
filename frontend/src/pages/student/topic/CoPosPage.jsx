// ──────────────────────────────────────────────
// CO/POs Page — Course Outcomes & Program Outcomes
// ──────────────────────────────────────────────

import { useOutletContext } from 'react-router-dom';
import {
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  Box,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';

const CoPosPage = () => {
  const { topic } = useOutletContext();

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Heading size="lg" color="white">
        Course Outcomes & Program Outcomes
      </Heading>

      <Text color="gray.400" fontSize="sm">
        {topic.title}
      </Text>

      {/* CO Section */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="cyan.300">
              Course Outcomes (COs)
            </Heading>
            <Alert
              status="info"
              borderRadius="lg"
              bg="slate.900"
              border="1px solid"
              borderColor="slate.700"
            >
              <AlertIcon color="cyan.400" />
              <AlertDescription color="gray.300" fontSize="sm">
                Course Outcome information will be available once configured by the faculty for this topic.
              </AlertDescription>
            </Alert>
            <Box w="full" p={4} bg="slate.900" borderRadius="lg">
              <Text color="gray.500" fontSize="sm" fontStyle="italic">
                Course Outcomes define the specific knowledge and skills students are expected to gain upon completing this topic. They are aligned with the course curriculum and mapped to Program Outcomes.
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* PO Section */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="cyan.300">
              Program Outcomes (POs)
            </Heading>
            <Alert
              status="info"
              borderRadius="lg"
              bg="slate.900"
              border="1px solid"
              borderColor="slate.700"
            >
              <AlertIcon color="cyan.400" />
              <AlertDescription color="gray.300" fontSize="sm">
                Program Outcome mapping will be available once configured by the faculty for this topic.
              </AlertDescription>
            </Alert>
            <Box w="full" p={4} bg="slate.900" borderRadius="lg">
              <Text color="gray.500" fontSize="sm" fontStyle="italic">
                Program Outcomes describe the broader educational goals of the engineering program. Each Course Outcome is mapped to one or more Program Outcomes to ensure curriculum alignment.
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default CoPosPage;
