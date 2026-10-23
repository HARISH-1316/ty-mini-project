// ──────────────────────────────────────────────
// WorkspaceHeader Component
// Prominent filled-in workspace identifier badge/header for Student, Faculty, and Admin
// ──────────────────────────────────────────────

import { Box, HStack, Text, useColorModeValue } from '@chakra-ui/react';

export const WORKSPACE_THEMES = {
  student: {
    title: 'STUDENT WORKSPACE',
    bg: { light: '#DCFCE7', dark: '#1F4726' },
    border: { light: '#86EFAC', dark: '#3E7E4B' },
    color: { light: '#14532D', dark: '#DCFCE7' },
    dot: { light: '#16A34A', dark: '#4ADE80' },
    iconBg: { light: '#FFFFFF', dark: 'rgba(255, 255, 255, 0.12)' },
    iconPath:
      'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 8.82L4.2 9 12 4.75 19.8 9 12 11.82zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z',
  },
  faculty: {
    title: 'FACULTY WORKSPACE',
    bg: { light: '#E0F2FE', dark: '#1A3B60' },
    border: { light: '#7DD3FC', dark: '#2B6CB0' },
    color: { light: '#0369A1', dark: '#E0F2FE' },
    dot: { light: '#0284C7', dark: '#38BDF8' },
    iconBg: { light: '#FFFFFF', dark: 'rgba(255, 255, 255, 0.12)' },
    iconPath:
      'M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.93V17a1 1 0 11-2 0v-.07A7.003 7.003 0 015.07 11H5a1 1 0 110-2h.07A7.003 7.003 0 0111 5.07V5a1 1 0 112 0v.07A7.003 7.003 0 0118.93 11H19a1 1 0 110 2h-.07A7.003 7.003 0 0113 16.93zM12 14a2 2 0 100-4 2 2 0 000 4z',
  },
  admin: {
    title: 'ADMIN WORKSPACE',
    bg: { light: '#F3E8FF', dark: '#3C1F5C' },
    border: { light: '#D8B4FE', dark: '#7E22CE' },
    color: { light: '#581C87', dark: '#F3E8FF' },
    dot: { light: '#9333EA', dark: '#C084FC' },
    iconBg: { light: '#FFFFFF', dark: 'rgba(255, 255, 255, 0.12)' },
    iconPath:
      'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
  },
};

export const WorkspaceHeader = ({ role, title, ...props }) => {
  const currentRole = role?.toLowerCase() || 'student';
  const theme = WORKSPACE_THEMES[currentRole] || WORKSPACE_THEMES.student;

  const bg = useColorModeValue(theme.bg.light, theme.bg.dark);
  const border = useColorModeValue(theme.border.light, theme.border.dark);
  const textColor = useColorModeValue(theme.color.light, theme.color.dark);
  const dotColor = useColorModeValue(theme.dot.light, theme.dot.dark);
  const iconBg = useColorModeValue(theme.iconBg.light, theme.iconBg.dark);

  const displayTitle = title || theme.title;

  return (
    <Box
      w="full"
      px={3}
      py={2.5}
      borderRadius="xl"
      bg={bg}
      border="1px solid"
      borderColor={border}
      boxShadow="sm"
      mb={3}
      transition="all 0.2s ease"
      {...props}
    >
      <HStack spacing={2.5} align="center" w="full">
        <Box
          w="22px"
          h="22px"
          borderRadius="md"
          bg={iconBg}
          border="1px solid"
          borderColor={border}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ color: textColor }}
          >
            <path d={theme.iconPath} />
          </svg>
        </Box>
        <Text
          fontSize="xs"
          fontWeight="800"
          color={textColor}
          letterSpacing="0.03em"
          textTransform="uppercase"
          whiteSpace="nowrap"
        >
          {displayTitle}
        </Text>
      </HStack>
    </Box>
  );
};

export const StudentWorkspaceHeader = (props) => <WorkspaceHeader role="student" {...props} />;
export const FacultyWorkspaceHeader = (props) => <WorkspaceHeader role="faculty" {...props} />;
export const AdminWorkspaceHeader = (props) => <WorkspaceHeader role="admin" {...props} />;

export default WorkspaceHeader;
