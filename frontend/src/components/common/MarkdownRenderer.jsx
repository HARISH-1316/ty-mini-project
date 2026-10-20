import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, useColorModeValue } from '@chakra-ui/react';

/**
 * Theme-aware MarkdownRenderer for Virtual Lab.
 * Conforms to strict theme rules:
 * - Light theme: clean light backgrounds, dark text (#1A2024 / #202124), rich green accents (#2F8D46).
 * - Dark theme: sleek dark backgrounds (#202321 / #292D2A), high-contrast light text (#F5F7F5), bright accents (#A3E635).
 */
const MarkdownRenderer = ({ content }) => {
  const headingColor = useColorModeValue('#2F8D46', '#A3E635');
  const bodyColor = useColorModeValue('#1A2024', '#F5F7F5');
  const secondaryColor = useColorModeValue('#505750', '#B8C0B9');
  const codeBg = useColorModeValue('#F2F6F3', '#292D2A');
  const codeColor = useColorModeValue('#1E5E2E', '#BEF264');
  const codeBlockBg = useColorModeValue('#EBF1EC', '#1B1E1C');
  const borderColor = useColorModeValue('#DDE5DD', '#3B423C');
  const linkColor = useColorModeValue('#2F8D46', '#A3E635');

  if (!content) return null;

  const components = {
    h1: ({ children }) => (
      <Box as="h1" fontSize="2xl" fontWeight="800" color={headingColor} mt={5} mb={3} lineHeight="shorter">
        {children}
      </Box>
    ),
    h2: ({ children }) => (
      <Box
        as="h2"
        fontSize="xl"
        fontWeight="700"
        color={headingColor}
        mt={5}
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
    p: ({ children }) => (
      <Box as="p" fontSize="sm" color={bodyColor} lineHeight="tall" mb={3}>
        {children}
      </Box>
    ),
    strong: ({ children }) => (
      <Box as="strong" fontWeight="700" color={bodyColor}>
        {children}
      </Box>
    ),
    em: ({ children }) => (
      <Box as="em" fontStyle="italic" color={secondaryColor}>
        {children}
      </Box>
    ),
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
    pre: ({ children }) => <>{children}</>,
    ul: ({ children }) => (
      <Box as="ul" pl={5} mb={3} color={bodyColor} fontSize="sm" lineHeight="tall"
        sx={{ listStyleType: 'disc', '& li': { mb: 1 } }}>
        {children}
      </Box>
    ),
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
    hr: () => (
      <Box as="hr" borderColor={borderColor} my={4} />
    ),
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

export default MarkdownRenderer;
