// ──────────────────────────────────────────────
// Account Approvals Page — Administrator Console
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  useToast,
  Card,
  CardBody,
  Tabs,
  TabList,
  Tab,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  Flex,
  useColorModeValue,
  Tag,
  Divider,
} from '@chakra-ui/react';
import { SearchIcon, CheckIcon, CloseIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { getApprovalsApi, approveUserApi, rejectUserApi } from '../../api/userApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const STATUS_COLORS = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
};

const AccountApprovals = () => {
  const toast = useToast();

  const cardBg = useColorModeValue('#FFFFFF', '#1E211F');
  const cardBorder = useColorModeValue('#DDE5DD', '#333A35');
  const surfaceBg = useColorModeValue('#F2F6F3', '#252927');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#555E57', '#A3B0A5');
  const accentColor = useColorModeValue('#2F8D46', '#86EFAC');

  const [approvals, setApprovals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'student', 'faculty'
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Rejection Modal State
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Inspect Modal State
  const { isOpen: isInspectOpen, onOpen: onInspectOpen, onClose: onInspectClose } = useDisclosure();
  const [inspectUser, setInspectUser] = useState(null);

  const fetchApprovals = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (roleFilter !== 'all') params.role = roleFilter;

      const res = await getApprovalsApi(params);
      setApprovals(res.data?.approvals || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch registration records.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, roleFilter, toast]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleApprove = async (user) => {
    try {
      setIsProcessing(true);
      await approveUserApi(user.user_id);
      toast({
        title: 'Account Approved! ✅',
        description: `${user.name}'s ${user.role} account is now activated.`,
        status: 'success',
        duration: 3000,
      });
      fetchApprovals();
    } catch (err) {
      toast({
        title: 'Approval Failed',
        description: err.response?.data?.message || 'Could not approve account.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenReject = (user) => {
    setSelectedUser(user);
    setRejectionReason('');
    onRejectOpen();
  };

  const handleConfirmReject = async () => {
    if (!selectedUser) return;
    try {
      setIsProcessing(true);
      await rejectUserApi(selectedUser.user_id, { reason: rejectionReason });
      toast({
        title: 'Account Rejected ❌',
        description: `${selectedUser.name}'s registration has been rejected.`,
        status: 'info',
        duration: 3000,
      });
      onRejectClose();
      fetchApprovals();
    } catch (err) {
      toast({
        title: 'Rejection Failed',
        description: err.response?.data?.message || 'Could not reject account.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenInspect = (user) => {
    setInspectUser(user);
    onInspectOpen();
  };

  const filteredApprovals = approvals.filter((u) => {
    const term = search.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(term);
    const emailMatch = u.email?.toLowerCase().includes(term);
    const rollMatch = u.roll_number?.toLowerCase().includes(term);
    const deptMatch = u.department?.toLowerCase().includes(term);
    return nameMatch || emailMatch || rollMatch || deptMatch;
  });

  const pendingCount = approvals.filter((a) => a.approval_status === 'pending').length;

  return (
    <VStack spacing={6} align="stretch" w="full" maxW="1440px" mx="auto" pb={12}>
      {/* Header */}
      <VStack align="start" spacing={1}>
        <Heading size="lg" color={textColor} fontWeight="800">Account Registration Approvals</Heading>
        <Text color={mutedText} fontSize="sm">
          Review, approve, or reject student and faculty account registrations before lab access is authorized.
        </Text>
      </VStack>

      {/* Status Tabs */}
      <Tabs
        variant="soft-rounded"
        colorScheme="green"
        index={statusFilter === 'pending' ? 0 : statusFilter === 'approved' ? 1 : statusFilter === 'rejected' ? 2 : 3}
        onChange={(idx) => {
          const map = ['pending', 'approved', 'rejected', 'all'];
          setStatusFilter(map[idx]);
        }}
      >
        <TabList gap={2}>
          <Tab fontWeight="700" fontSize="sm">
            Pending Approvals {statusFilter === 'pending' && pendingCount > 0 && `(${pendingCount})`}
          </Tab>
          <Tab fontWeight="700" fontSize="sm">Approved Accounts</Tab>
          <Tab fontWeight="700" fontSize="sm">Rejected Records</Tab>
          <Tab fontWeight="700" fontSize="sm">All Registrations</Tab>
        </TabList>
      </Tabs>

      {/* Filters Bar */}
      <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
        <InputGroup maxW="md">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color={mutedText} />
          </InputLeftElement>
          <Input
            placeholder="Search by name, email, roll number, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg={cardBg}
            borderColor={cardBorder}
            color={textColor}
            _placeholder={{ color: mutedText }}
          />
        </InputGroup>

        <HStack spacing={3}>
          <Text fontSize="sm" color={mutedText} fontWeight="600">Role Filter:</Text>
          <Select
            size="sm"
            w="160px"
            borderRadius="md"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            bg={cardBg}
            borderColor={cardBorder}
            color={textColor}
          >
            <option value="all">All Roles</option>
            <option value="student">Students Only</option>
            <option value="faculty">Faculty Only</option>
          </Select>
        </HStack>
      </Flex>

      {/* Main Table Card */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="xl" overflow="hidden" boxShadow="sm">
        <CardBody p={0}>
          {isLoading ? (
            <Box p={8}>
              <LoadingSpinner label="Loading account registrations..." />
            </Box>
          ) : filteredApprovals.length === 0 ? (
            <EmptyState
              title={`No ${statusFilter !== 'all' ? statusFilter : ''} registrations found`}
              description="No user registrations match the current filters and search criteria."
            />
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg={surfaceBg}>
                  <Tr>
                    <Th color={mutedText}>Applicant</Th>
                    <Th color={mutedText}>Role</Th>
                    <Th color={mutedText}>Profile Details</Th>
                    <Th color={mutedText}>Status</Th>
                    <Th color={mutedText}>Registered Date</Th>
                    <Th color={mutedText}>Decision / Audit</Th>
                    <Th color={mutedText} textAlign="right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredApprovals.map((u) => {
                    const isPending = u.approval_status === 'pending';
                    const isApproved = u.approval_status === 'approved';
                    const isRejected = u.approval_status === 'rejected';

                    return (
                      <Tr key={u.user_id} _hover={{ bg: surfaceBg }}>
                        <Td>
                          <VStack align="start" spacing={0.5}>
                            <Text color={textColor} fontWeight="700">{u.name}</Text>
                            <Text color={mutedText} fontSize="xs">{u.email}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={u.role === 'student' ? 'blue' : u.role === 'faculty' ? 'purple' : 'gray'}>
                            {u.role}
                          </Badge>
                        </Td>
                        <Td>
                          {u.role === 'student' ? (
                            <VStack align="start" spacing={0} fontSize="xs">
                              <Text color={textColor}>Roll: <strong>{u.roll_number || 'N/A'}</strong></Text>
                              <Text color={mutedText}>{u.course || 'Engineering'} • Year {u.year || 'N/A'}</Text>
                            </VStack>
                          ) : (
                            <VStack align="start" spacing={0} fontSize="xs">
                              <Text color={textColor}>Dept: <strong>{u.department || 'N/A'}</strong></Text>
                              <Text color={mutedText}>{u.designation || 'Faculty Member'}</Text>
                            </VStack>
                          )}
                        </Td>
                        <Td>
                          <Badge colorScheme={STATUS_COLORS[u.approval_status] || 'gray'} textTransform="capitalize">
                            {u.approval_status}
                          </Badge>
                        </Td>
                        <Td color={mutedText} fontSize="xs">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                        </Td>
                        <Td fontSize="xs">
                          {u.approval_decision_at ? (
                            <VStack align="start" spacing={0}>
                              <Text color={mutedText}>
                                {new Date(u.approval_decision_at).toLocaleDateString()}
                              </Text>
                              {u.approved_by_name && (
                                <Text color={mutedText} fontSize="2xs">
                                  by {u.approved_by_name}
                                </Text>
                              )}
                              {u.rejection_reason && (
                                <Text color="red.500" fontSize="2xs" maxW="160px" noOfLines={1} title={u.rejection_reason}>
                                  Reason: {u.rejection_reason}
                                </Text>
                              )}
                            </VStack>
                          ) : (
                            <Text color={mutedText}>Awaiting Review</Text>
                          )}
                        </Td>
                        <Td textAlign="right">
                          <HStack justify="end" spacing={2}>
                            <Button
                              size="xs"
                              variant="ghost"
                              leftIcon={<InfoOutlineIcon />}
                              onClick={() => handleOpenInspect(u)}
                            >
                              Details
                            </Button>

                            {isPending && (
                              <>
                                <Button
                                  size="xs"
                                  colorScheme="green"
                                  leftIcon={<CheckIcon />}
                                  onClick={() => handleApprove(u)}
                                  isLoading={isProcessing}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="xs"
                                  colorScheme="red"
                                  variant="outline"
                                  leftIcon={<CloseIcon />}
                                  onClick={() => handleOpenReject(u)}
                                  isLoading={isProcessing}
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            {isRejected && (
                              <Button
                                size="xs"
                                colorScheme="green"
                                variant="outline"
                                onClick={() => handleApprove(u)}
                                isLoading={isProcessing}
                              >
                                Re-Approve
                              </Button>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Reject Modal */}
      <Modal isOpen={isRejectOpen} onClose={onRejectClose}>
        <ModalOverlay />
        <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader color={textColor}>Reject Registration</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color={mutedText}>
                Are you sure you want to reject the registration for <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
              </Text>
              <FormControl>
                <FormLabel fontSize="sm" color={textColor}>Optional Rejection Reason</FormLabel>
                <Textarea
                  placeholder="e.g. Invalid institutional roll number or duplicate entry."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  bg={surfaceBg}
                  borderColor={cardBorder}
                  color={textColor}
                  fontSize="sm"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={onRejectClose}>Cancel</Button>
            <Button colorScheme="red" onClick={handleConfirmReject} isLoading={isProcessing}>
              Confirm Rejection
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Inspect Modal */}
      <Modal isOpen={isInspectOpen} onClose={onInspectClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader color={textColor}>Registration Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {inspectUser && (
              <VStack spacing={4} align="stretch" fontSize="sm">
                <Box p={3} bg={surfaceBg} borderRadius="lg">
                  <HStack justify="space-between">
                    <Heading size="sm" color={textColor}>{inspectUser.name}</Heading>
                    <Badge colorScheme={STATUS_COLORS[inspectUser.approval_status]}>
                      {inspectUser.approval_status}
                    </Badge>
                  </HStack>
                  <Text color={mutedText} fontSize="xs" mt={1}>{inspectUser.email}</Text>
                </Box>

                <SimpleGrid columns={2} spacing={3}>
                  <Box>
                    <Text color={mutedText} fontSize="xs">Account Role:</Text>
                    <Text fontWeight="bold" color={textColor} textTransform="capitalize">{inspectUser.role}</Text>
                  </Box>
                  <Box>
                    <Text color={mutedText} fontSize="xs">Registration Date:</Text>
                    <Text color={textColor}>{inspectUser.created_at ? new Date(inspectUser.created_at).toLocaleString() : '—'}</Text>
                  </Box>
                  {inspectUser.role === 'student' ? (
                    <>
                      <Box>
                        <Text color={mutedText} fontSize="xs">Roll Number:</Text>
                        <Text fontWeight="bold" color={textColor}>{inspectUser.roll_number || 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text color={mutedText} fontSize="xs">Course / Branch:</Text>
                        <Text color={textColor}>{inspectUser.course || 'Engineering'} (Year {inspectUser.year || 'N/A'})</Text>
                      </Box>
                      <Box>
                        <Text color={mutedText} fontSize="xs">Phone Number:</Text>
                        <Text color={textColor}>{inspectUser.student_phone || 'N/A'}</Text>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box>
                        <Text color={mutedText} fontSize="xs">Department:</Text>
                        <Text fontWeight="bold" color={textColor}>{inspectUser.department || 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text color={mutedText} fontSize="xs">Designation:</Text>
                        <Text color={textColor}>{inspectUser.designation || 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text color={mutedText} fontSize="xs">Specialization:</Text>
                        <Text color={textColor}>{inspectUser.specialization || 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text color={mutedText} fontSize="xs">Phone Number:</Text>
                        <Text color={textColor}>{inspectUser.faculty_phone || 'N/A'}</Text>
                      </Box>
                    </>
                  )}
                </SimpleGrid>

                {inspectUser.approval_decision_at && (
                  <Box p={3} bg={surfaceBg} borderRadius="lg">
                    <Text fontWeight="bold" color={textColor} fontSize="xs">Decision Audit:</Text>
                    <Text color={mutedText} fontSize="xs">
                      Reviewed on {new Date(inspectUser.approval_decision_at).toLocaleString()}
                      {inspectUser.approved_by_name && ` by ${inspectUser.approved_by_name}`}
                    </Text>
                    {inspectUser.rejection_reason && (
                      <Text color="red.500" fontSize="xs" mt={1}>
                        Reason: {inspectUser.rejection_reason}
                      </Text>
                    )}
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onInspectClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default AccountApprovals;
