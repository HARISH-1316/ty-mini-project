// ──────────────────────────────────────────────
// Create Room Modal Component
// ──────────────────────────────────────────────

import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
import { createRoomApi } from '../../api/roomApi';

const CreateRoomModal = ({ isOpen, onClose, onRoomCreated }) => {
  const toast = useToast();
  const cardBg = useColorModeValue('#FFFFFF', '#202321');
  const cardBorder = useColorModeValue('#DDE5DD', '#3B423C');
  const surfaceBg = useColorModeValue('#F2F6F3', '#292D2A');
  const textColor = useColorModeValue('#1A2024', '#F5F7F5');
  const mutedText = useColorModeValue('#505750', '#B8C0B9');

  const [formData, setFormData] = useState({ room_name: '', description: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.room_name.trim()) {
      setError('Room name is required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await createRoomApi(formData);
      toast({
        title: 'Room Created! 🎉',
        description: `Room "${res.data?.room?.room_name}" created with code: ${res.data?.room?.room_code}`,
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      setFormData({ room_name: '', description: '' });
      if (onRoomCreated) onRoomCreated(res.data?.room);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px" color={textColor}>
        <ModalHeader color={textColor}>Create New Virtual Lab Room</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {error && (
                <Alert status="error" borderRadius="lg">
                  <AlertIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel color={textColor} fontSize="sm" fontWeight="600">Room Name</FormLabel>
                <Input
                  placeholder="e.g. Data Structures & Algorithms Lab"
                  value={formData.room_name}
                  onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                  bg={surfaceBg}
                  borderColor={cardBorder}
                  color={textColor}
                  _placeholder={{ color: mutedText }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontSize="sm" fontWeight="600">Description</FormLabel>
                <Textarea
                  placeholder="Provide brief lab details, course code, or instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  bg={surfaceBg}
                  borderColor={cardBorder}
                  color={textColor}
                  _placeholder={{ color: mutedText }}
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={isLoading}
              loadingText="Creating..."
            >
              Create Room
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateRoomModal;
