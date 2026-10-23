// ──────────────────────────────────────────────
// Reusable Confirmation Modal Component
// ──────────────────────────────────────────────

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
} from '@chakra-ui/react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  colorScheme = 'purple',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg="bg.card" borderColor="border.primary" borderWidth="1px" color="text.primary">
        <ModalHeader fontWeight="bold">{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text color="text.secondary">{message}</Text>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" colorScheme="gray" onClick={onClose} isDisabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            colorScheme={colorScheme}
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Processing..."
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
