import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  Box,
  AspectRatio,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { trackSubtopicActivityApi } from '../../../api/progressApi';

/**
 * Extracts a YouTube embed URL from various YouTube URL formats.
 */
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    let videoId = null;

    if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes('youtube.com')) {
      videoId = parsed.searchParams.get('v');
      if (!videoId && parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1];
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  } catch {
    return null;
  }
};

const TheoryPage = () => {
  const { subtopic, content, subtopicId } = useOutletContext();

  const theory = content?.theory || subtopic?.content?.theory;
  const videoUrl = content?.video_explanation_url || subtopic?.content?.video_explanation_url;
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  useEffect(() => {
    if (subtopicId || subtopic?.subtopic_id) {
      trackSubtopicActivityApi(subtopicId || subtopic.subtopic_id, {
        theory_viewed: true,
        video_viewed: !!embedUrl,
        time_spent: 2,
      }).catch(() => {});
    }
  }, [subtopicId, subtopic, embedUrl]);

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Heading size="lg" color="white">
        {subtopic.title}
      </Heading>

      {/* Theory Content */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="cyan.300">
              📖 Theory & Concepts
            </Heading>

            {theory ? (
              <Text color="gray.200" fontSize="sm" whiteSpace="pre-wrap" lineHeight="tall">
                {theory}
              </Text>
            ) : (
              <Text color="gray.500" fontSize="sm" fontStyle="italic">
                Theory content for this subtopic has not been published yet. Please check back later.
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Video Explanation */}
      <Card bg="slate.800" borderColor="slate.700" borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="pink.300">
              🎥 Video Explanation
            </Heading>

            {embedUrl ? (
              <Box w="full" borderRadius="lg" overflow="hidden">
                <AspectRatio ratio={16 / 9} w="full">
                  <iframe
                    src={embedUrl}
                    title={`Video explanation for ${subtopic.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: '8px' }}
                  />
                </AspectRatio>
              </Box>
            ) : (
              <Alert
                status="info"
                borderRadius="lg"
                bg="slate.900"
                border="1px solid"
                borderColor="slate.700"
              >
                <AlertIcon color="gray.500" />
                <AlertDescription color="gray.400" fontSize="sm">
                  Video explanation not available for this subtopic.
                </AlertDescription>
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default TheoryPage;
