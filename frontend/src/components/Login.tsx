import React from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Heading,
  Text,
  Container,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  useBreakpointValue,
  Flex,
  Image,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

interface LoginResponse {
  success: boolean;
  token: string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ajustes responsivos
  const containerWidth = useBreakpointValue({ base: "100%", md: "80%", lg: "60%" });
  const headingSize = useBreakpointValue({ base: "xl", md: "2xl" });
  const textSize = useBreakpointValue({ base: "sm", md: "md" });
  const buttonSize = useBreakpointValue({ base: "md", md: "lg" });
  const padding = useBreakpointValue({ base: 4, md: 8 });
  const imageSize = useBreakpointValue({ base: "150px", md: "200px" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!username) {
      newErrors.username = 'Usuário é obrigatório';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    
    try {
      console.log('Tentando fazer login com:', { username });
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3012';
      console.log('URL da API:', `${API_URL}/api/users/login`);
      
      // Verificar se o servidor está online
      try {
        const healthCheck = await axios.get(API_URL);
        console.log('Servidor está online:', healthCheck.data);
      } catch (healthError) {
        console.error('Servidor parece estar offline:', healthError);
        toast({
          title: 'Servidor offline',
          description: 'Não foi possível conectar ao servidor. Verifique se o servidor está rodando.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }
      
      const response = await axios.post<LoginResponse>(`${API_URL}/api/users/login`, {
        username,
        password,
      });
      
      console.log('Resposta do servidor:', response.data);
      const { token } = response.data;
      
      if (!token) {
        throw new Error('Token não recebido do servidor');
      }
      
      localStorage.setItem('token', token);
      
      toast({
        title: 'Login realizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redireciona para a página anterior ou para o admin
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Dados:', error.response.data);
        
        if (error.response.status === 401) {
          setErrors({
            auth: 'Usuário ou senha incorretos',
          });
        } else if (error.response.status === 404) {
          toast({
            title: 'Rota não encontrada',
            description: 'A rota de login não foi encontrada no servidor. Verifique se o servidor está configurado corretamente.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Erro ao fazer login',
            description: error.response.data?.message || 'Ocorreu um erro ao fazer login. Tente novamente.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } else if (error.request) {
        console.error('Requisição feita mas sem resposta:', error.request);
        toast({
          title: 'Sem resposta do servidor',
          description: 'O servidor não respondeu à requisição. Verifique se o servidor está rodando.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Erro ao fazer login',
          description: error.message || 'Ocorreu um erro ao fazer login. Tente novamente.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box 
        bg="white" 
        p={padding} 
        borderRadius="lg" 
        boxShadow="xl"
        w={containerWidth}
        mx="auto"
      >
        <VStack spacing={6} align="stretch">
          <Flex direction="column" align="center" mb={6}>
            <Image 
              src="images/logo.png"
              alt="Logo Vip Barbeiro" 
              boxSize={imageSize}
              borderRadius="full"
              mb={4}
              objectFit="contain"
            />
            <Heading 
              as="h1" 
              size={headingSize} 
              textAlign="center" 
              color="barber.500"
            >
              Login Administrativo
            </Heading>
            <Text 
              textAlign="center" 
              fontSize={textSize} 
              color="gray.600"
              mt={2}
            >
              Acesse o painel administrativo
            </Text>
          </Flex>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.username}>
                <FormLabel>Usuário</FormLabel>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  size={buttonSize}
                />
                <FormErrorMessage>{errors.username}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Senha</FormLabel>
                <InputGroup size={buttonSize}>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    type={showPassword ? 'text' : 'password'}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              
              {errors.auth && (
                <Text color="red.500" fontSize="sm" textAlign="center">
                  {errors.auth}
                </Text>
              )}
              
              <Button
                type="submit"
                colorScheme="barber"
                size={buttonSize}
                width="full"
                isLoading={loading}
                loadingText="Entrando..."
              >
                Entrar
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};

export default Login; 