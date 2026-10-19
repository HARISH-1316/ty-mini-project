// ──────────────────────────────────────────────
// Faculty Workspace Layout
// ──────────────────────────────────────────────

import { Outlet } from 'react-router-dom';
import { Flex, Box, useDisclosure } from '@chakra-ui/react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const FacultyLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex direction="column" minH="100vh" bg="bg.secondary">
      <Navbar onOpenSidebar={onOpen} />
      <Flex flex={1}>
        <Sidebar isOpen={isOpen} onClose={onClose} />
        <Box flex={1} p={{ base: 4, md: 8 }} maxW="7xl" mx="auto" w="full">
          <Outlet />
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
};

export default FacultyLayout;
