import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  useColorModeValue,
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

/**
 * MarkdownRenderer — renders Markdown content using semantic Chakra UI tokens
 * so both light and dark themes have full contrast and correct styling.
 */
const MarkdownRenderer = ({ content }) => {
  const headingColor = useColorModeValue('#2F8D46', '#A3E635');
  const bodyColor = useColorModeValue('#202124', '#F5F7F5');
  const secondaryColor = useColorModeValue('#505750', '#B8C0B9');
  const codeBg = useColorModeValue('#F5F7F5', '#292D2A');
  const codeColor = useColorModeValue('#1E5E2E', '#BEF264');
  const codeBlockBg = useColorModeValue('#F0F4F0', '#202321');
  const borderColor = useColorModeValue('#DDE5DD', '#3B423C');
  const linkColor = useColorModeValue('#2F8D46', '#A3E635');

  const components = {
    // Headings
    h1: ({ children }) => (
      <Box as="h1" fontSize="2xl" fontWeight="800" color={headingColor} mt={6} mb={3} lineHeight="shorter">
        {children}
      </Box>
    ),
    h2: ({ children }) => (
      <Box
        as="h2"
        fontSize="xl"
        fontWeight="700"
        color={headingColor}
        mt={6}
        mb={2}
        pb={1}
        borderBottom="2px solid"
        borderColor={borderColor}
        lineHeight="shorter"
      >
        {children}
      </Box>
    ),
    h3: ({ children }) => (
      <Box as="h3" fontSize="lg" fontWeight="700" color={headingColor} mt={4} mb={2} lineHeight="shorter">
        {children}
      </Box>
    ),
    h4: ({ children }) => (
      <Box as="h4" fontSize="md" fontWeight="600" color={secondaryColor} mt={3} mb={1}>
        {children}
      </Box>
    ),
    // Paragraphs
    p: ({ children }) => (
      <Box as="p" fontSize="sm" color={bodyColor} lineHeight="tall" mb={3}>
        {children}
      </Box>
    ),
    // Bold
    strong: ({ children }) => (
      <Box as="strong" fontWeight="700" color={bodyColor}>
        {children}
      </Box>
    ),
    // Emphasis
    em: ({ children }) => (
      <Box as="em" fontStyle="italic" color={secondaryColor}>
        {children}
      </Box>
    ),
    // Inline code
    code: ({ inline, className, children }) => {
      if (inline) {
        return (
          <Box
            as="code"
            px={1.5}
            py={0.5}
            bg={codeBg}
            color={codeColor}
            borderRadius="md"
            fontSize="0.85em"
            fontFamily="'Fira Code', 'Consolas', 'Courier New', monospace"
            fontWeight="600"
          >
            {children}
          </Box>
        );
      }
      // Code block
      const language = className?.replace('language-', '') || '';
      return (
        <Box
          as="pre"
          bg={codeBlockBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="lg"
          p={4}
          overflowX="auto"
          my={4}
          fontSize="sm"
          fontFamily="'Fira Code', 'Consolas', 'Courier New', monospace"
          color={bodyColor}
          lineHeight="tall"
          whiteSpace="pre"
        >
          <Box as="code" className={className} color={bodyColor} bg="transparent">
            {children}
          </Box>
          {language && (
            <Box
              as="span"
              display="block"
              textAlign="right"
              fontSize="xs"
              color={secondaryColor}
              mt={2}
              opacity={0.7}
            >
              {language}
            </Box>
          )}
        </Box>
      );
    },
    // Pre wrapper (code blocks come through as pre > code)
    pre: ({ children }) => <>{children}</>,
    // Unordered list
    ul: ({ children }) => (
      <Box as="ul" pl={5} mb={3} color={bodyColor} fontSize="sm" lineHeight="tall"
        sx={{ listStyleType: 'disc', '& li': { mb: 1 } }}>
        {children}
      </Box>
    ),
    // Ordered list
    ol: ({ children }) => (
      <Box as="ol" pl={5} mb={3} color={bodyColor} fontSize="sm" lineHeight="tall"
        sx={{ listStyleType: 'decimal', '& li': { mb: 1 } }}>
        {children}
      </Box>
    ),
    li: ({ children }) => (
      <Box as="li" color={bodyColor} fontSize="sm" lineHeight="tall" mb={1}>
        {children}
      </Box>
    ),
    // Blockquote
    blockquote: ({ children }) => (
      <Box
        borderLeft="4px solid"
        borderColor={headingColor}
        pl={4}
        py={1}
        my={3}
        bg={codeBg}
        borderRadius="md"
        color={secondaryColor}
        fontStyle="italic"
        fontSize="sm"
      >
        {children}
      </Box>
    ),
    // Horizontal rule
    hr: () => (
      <Box as="hr" borderColor={borderColor} my={4} />
    ),
    // Links
    a: ({ href, children }) => (
      <Box
        as="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        color={linkColor}
        textDecoration="underline"
        _hover={{ opacity: 0.8 }}
      >
        {children}
      </Box>
    ),
    // Tables
    table: ({ children }) => (
      <Box overflowX="auto" my={4}>
        <Box
          as="table"
          w="full"
          borderCollapse="collapse"
          border="1px solid"
          borderColor={borderColor}
          borderRadius="lg"
          fontSize="sm"
        >
          {children}
        </Box>
      </Box>
    ),
    thead: ({ children }) => (
      <Box as="thead" bg={codeBg}>
        {children}
      </Box>
    ),
    th: ({ children }) => (
      <Box
        as="th"
        px={3}
        py={2}
        textAlign="left"
        fontWeight="700"
        color={headingColor}
        border="1px solid"
        borderColor={borderColor}
        fontSize="xs"
        textTransform="uppercase"
        letterSpacing="wide"
      >
        {children}
      </Box>
    ),
    td: ({ children }) => (
      <Box
        as="td"
        px={3}
        py={2}
        border="1px solid"
        borderColor={borderColor}
        color={bodyColor}
        fontSize="sm"
        verticalAlign="top"
      >
        {children}
      </Box>
    ),
    tr: ({ children }) => (
      <Box as="tr" _even={{ bg: codeBg }}>
        {children}
      </Box>
    ),
  };

  return (
    <Box w="full" overflow="hidden">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </Box>
  );
};

const TheoryPage = () => {
  const { subtopic, content, subtopicId } = useOutletContext();

  const theory = content?.theory || subtopic?.content?.theory;
  const videoUrl = content?.video_explanation_url || subtopic?.content?.video_explanation_url;
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  // Theme tokens
  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const headingColor = useColorModeValue('#2F8D46', '#A3E635');
  const titleColor = useColorModeValue('#202124', '#F5F7F5');
  const emptyTextColor = useColorModeValue('#505750', '#B8C0B9');
  const alertBg = useColorModeValue('#F5F7F5', '#171918');
  const alertBorderColor = useColorModeValue('#DDE5DD', '#3B423C');

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
      <Heading size="lg" color={titleColor}>
        {subtopic.title}
      </Heading>

      {/* Theory Content — Markdown Rendered */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color={headingColor}>
              📖 Theory &amp; Concepts
            </Heading>

            {theory ? (
              <MarkdownRenderer content={theory} />
            ) : (
              <Text color={emptyTextColor} fontSize="sm" fontStyle="italic">
                Theory content for this subtopic has not been published yet. Please check back later.
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Video Explanation */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color={headingColor}>
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
                bg={alertBg}
                border="1px solid"
                borderColor={alertBorderColor}
              >
                <AlertIcon color={emptyTextColor} />
                <AlertDescription color={emptyTextColor} fontSize="sm">
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
