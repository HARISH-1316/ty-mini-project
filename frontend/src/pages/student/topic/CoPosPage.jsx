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
      <Heading size="lg" color="text.primary">
        Course Outcomes & Program Outcomes
      </Heading>

      <Text color="text.secondary" fontSize="sm">
        {topic.title}
      </Text>

      {/* CO Section */}
      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="accent.primary">
              Course Outcomes (COs)
            </Heading>
            <Alert
              status="info"
              borderRadius="lg"
              bg="bg.surface"
              border="1px solid"
              borderColor="border.primary"
            >
              <AlertIcon color="brand.500" />
              <AlertDescription color="text.primary" fontSize="sm">
                Course Outcome information will be available once configured by the faculty for this topic.
              </AlertDescription>
            </Alert>
            <Box w="full" p={4} bg="bg.surface" borderRadius="lg" border="1px solid" borderColor="border.primary">
              <Text color="text.secondary" fontSize="sm" fontStyle="italic">
                Course Outcomes define the specific knowledge and skills students are expected to gain upon completing this topic. They are aligned with the course curriculum and mapped to Program Outcomes.
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* PO Section */}
      <Card bg="bg.card" borderColor="border.primary" borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="accent.primary">
              Program Outcomes (POs)
            </Heading>
            <Alert
              status="info"
              borderRadius="lg"
              bg="bg.surface"
              border="1px solid"
              borderColor="border.primary"
            >
              <AlertIcon color="brand.500" />
              <AlertDescription color="text.primary" fontSize="sm">
                Program Outcome mapping will be available once configured by the faculty for this topic.
              </AlertDescription>
            </Alert>
            <Box w="full" p={4} bg="bg.surface" borderRadius="lg" border="1px solid" borderColor="border.primary">
              <Text color="text.secondary" fontSize="sm" fontStyle="italic">
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
