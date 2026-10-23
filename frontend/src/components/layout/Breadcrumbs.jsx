// ──────────────────────────────────────────────
// Breadcrumbs — Reusable Navigation Component
// ──────────────────────────────────────────────

import { Link as RouterLink } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
  Box,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';

/**
 * @param {{ items: Array<{ label: string, path?: string }> }} props
 * items — ordered breadcrumb entries. Last item renders as plain text (current page).
 */
const Breadcrumbs = ({ items = [] }) => {
  return (
    <Box
      px={{ base: 4, md: 6 }}
      py={3}
      bg="bg.card"
      borderBottom="1px solid"
      borderColor="border.primary"
    >
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="text.secondary" />}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <BreadcrumbItem key={index} isCurrentPage={isLast}>
              {isLast ? (
                <Text color="accent.primary" fontSize="sm" fontWeight="semibold">
                  {item.label}
                </Text>
              ) : (
                <BreadcrumbLink
                  as={RouterLink}
                  to={item.path || '#'}
                  color="text.secondary"
                  fontSize="sm"
                  _hover={{ color: 'accent.primary', textDecoration: 'underline' }}
                  transition="color 0.2s"
                >
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </Box>
  );
};

export default Breadcrumbs;
