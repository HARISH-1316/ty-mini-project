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
        bg="slate.800"
        borderRadius="2xl"
        border="1px solid"
        borderColor="slate.700"
        p={8}
        boxShadow="xl"
      >
        <VStack spacing={6} align="stretch">
          <VStack spacing={2} textAlign="center">
            <Heading size="lg" color="white">
              Join Virtual Lab Room
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Enter the unique 6-character room code provided by your faculty instructor.
            </Text>
          </VStack>

          {error && (
            <Alert status="error" borderRadius="lg" bg="red.900" color="red.200">
              <AlertIcon color="red.300" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel color="gray.300" textAlign="center" fontSize="sm">
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
                  bg="slate.900"
                  borderColor="slate.600"
                  color="purple.300"
                  _placeholder={{ color: 'gray.600', letterSpacing: 'normal', fontSize: 'lg' }}
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 2px var(--chakra-colors-purple-400)' }}
                />
              </FormControl>

              <Button
                type="submit"
                w="full"
                size="lg"
                bgGradient="linear(to-r, purple.500, pink.500)"
                color="white"
                _hover={{ bgGradient: 'linear(to-r, purple.600, pink.600)' }}
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
