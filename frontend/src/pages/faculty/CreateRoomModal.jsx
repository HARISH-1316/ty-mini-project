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
} from '@chakra-ui/react';
import { createRoomApi } from '../../api/roomApi';

const CreateRoomModal = ({ isOpen, onClose, onRoomCreated }) => {
  const toast = useToast();
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
      <ModalContent bg="slate.800" borderColor="slate.700" borderWidth="1px" color="white">
        <ModalHeader>Create New Virtual Lab Room</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {error && (
                <Alert status="error" borderRadius="lg" bg="red.900" color="red.200">
                  <AlertIcon color="red.300" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel color="gray.300">Room Name</FormLabel>
                <Input
                  placeholder="e.g. Data Structures & Algorithms Lab"
                  value={formData.room_name}
                  onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                  bg="slate.900"
                  borderColor="slate.700"
                  color="white"
                  _focus={{ borderColor: 'purple.400' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Description</FormLabel>
                <Textarea
                  placeholder="Provide brief lab details, course code, or instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  bg="slate.900"
                  borderColor="slate.700"
                  color="white"
                  rows={3}
                  _focus={{ borderColor: 'purple.400' }}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" colorScheme="gray" onClick={onClose} isDisabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="purple"
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
