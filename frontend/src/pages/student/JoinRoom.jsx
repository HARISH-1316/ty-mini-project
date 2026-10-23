// ──────────────────────────────────────────────
// Join Room Page
// ──────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { joinRoomApi } from '../../api/roomApi';

const JoinRoom = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError('Please enter a room code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await joinRoomApi({ room_code: roomCode.trim().toUpperCase() });
      toast({
        title: 'Joined Successfully! 🎉',
        description: `You have joined ${res.data?.room?.room_name || 'the lab room'}.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      navigate(`/student/rooms/${res.data?.room?.room_id}`, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to join room. Please check the code.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="60vh" align="center" justify="center">
      <Box
        w="full"
        maxW="md"
        bg="bg.card"
        borderRadius="2xl"
        border="1px solid"
        borderColor="border.primary"
        p={8}
        boxShadow="md"
      >
        <VStack spacing={6} align="stretch">
          <VStack spacing={2} textAlign="center">
            <Heading size="lg" color="text.primary">
              Join Virtual Lab Room
            </Heading>
            <Text color="text.secondary" fontSize="sm">
              Enter the unique 6-character room code provided by your faculty instructor.
            </Text>
          </VStack>

          {error && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel color="text.secondary" textAlign="center" fontSize="sm">
                  Room Code
                </FormLabel>
                <Input
                  id="room-code-input"
                  type="text"
                  placeholder="e.g. A1B2C3"
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  maxLength={20}
                  textAlign="center"
                  fontSize="2xl"
                  fontWeight="bold"
                  letterSpacing="widest"
                  bg="bg.surface"
                  borderColor="border.primary"
                  color="accent.primary"
                  _placeholder={{ color: 'text.muted', letterSpacing: 'normal', fontSize: 'lg' }}
                  _hover={{ borderColor: 'brand.500' }}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </FormControl>

              <Button
                type="submit"
                w="full"
                size="lg"
                colorScheme="brand"
                isLoading={isLoading}
                loadingText="Joining Room..."
              >
                Join Room
              </Button>
            </VStack>
          </form>

          <Button variant="ghost" colorScheme="gray" size="sm" onClick={() => navigate('/student/rooms')}>
            Back to My Rooms
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default JoinRoom;
