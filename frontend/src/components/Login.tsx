import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Container,
  Center,
  Card,
  CardBody,
  Image,
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = 'http://localhost:3001';

const Login: React.FC = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/users/login`, {
        username,
        password
      });

      localStorage.setItem('token', response.data.token);
      toast({
        title: 'Login realizado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Redireciona para a página anterior ou para a home
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from);
    } catch (error: any) {
      console.error('Erro no login:', error.response || error);
      toast({
        title: 'Erro ao fazer login',
        description: error.response?.data?.error || 'Credenciais inválidas',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Center flexDirection="column">
        <Card
          w="100%"
          maxW="400px"
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          borderWidth={2}
          borderColor="barber.accent"
          overflow="hidden"
        >
          <CardBody p={0}>
            <Box
              bg="barber.500"
              p={6}
              borderBottomWidth={3}
              borderBottomColor="barber.accent"
            >
              <VStack spacing={3}>
                <Image
                  src="/logo.png"
                  alt="Logo"
                  boxSize="100px"
                  objectFit="contain"
                  fallback={
                    <Center
                      w="100px"
                      h="100px"
                      bg="barber.accent"
                      borderRadius="full"
                    >
                      <Heading size="lg" color="white">VB</Heading>
                    </Center>
                  }
                />
                <Heading size="lg" color="white" textAlign="center">
                  Vip Barbeiro
                </Heading>
                <Heading size="md" color="barber.accent" textAlign="center">
                  Indique e Ganhe
                </Heading>
              </VStack>
            </Box>

            <Box p={8}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="barber.500">Usuário</FormLabel>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Digite seu usuário"
                      borderColor="barber.accent"
                      _hover={{ borderColor: 'barber.500' }}
                      _focus={{ borderColor: 'barber.500', boxShadow: '0 0 0 1px var(--chakra-colors-barber-500)' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="barber.500">Senha</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      borderColor="barber.accent"
                      _hover={{ borderColor: 'barber.500' }}
                      _focus={{ borderColor: 'barber.500', boxShadow: '0 0 0 1px var(--chakra-colors-barber-500)' }}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    size="lg"
                    width="100%"
                    bg="barber.500"
                    color="white"
                    _hover={{ bg: 'barber.accent' }}
                    isLoading={loading}
                    loadingText="Entrando..."
                  >
                    Entrar
                  </Button>
                </VStack>
              </form>
            </Box>
          </CardBody>
        </Card>
      </Center>
    </Container>
  );
};

export default Login; 