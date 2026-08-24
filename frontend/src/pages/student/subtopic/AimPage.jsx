import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { trackSubtopicActivityApi } from '../../../api/progressApi';

const AimPage = () => {
  const { subtopic, content, subtopicId } = useOutletContext();

  useEffect(() => {
    if (subtopicId || subtopic?.subtopic_id) {
      trackSubtopicActivityApi(subtopicId || subtopic.subtopic_id, {
        aim_viewed: true,
        time_spent: 1,
      }).catch(() => {});
    }
  }, [subtopicId, subtopic]);

  const aim = content?.aim || subtopic?.content?.aim;

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Heading size="lg" color="white">
        {subtopic.title}
      </Heading>

      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="cyan.300">
              🎯 Aim of the Experiment
            </Heading>

            {aim ? (
              <Text color="gray.200" fontSize="sm" whiteSpace="pre-wrap" lineHeight="tall">
                {aim}
              </Text>
            ) : (
              <Text color="gray.500" fontSize="sm" fontStyle="italic">
                The aim for this subtopic has not been published yet. Please check back later.
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default AimPage;
