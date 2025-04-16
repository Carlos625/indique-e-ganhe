import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  useToast,
  VStack,
  Code,
  Divider,
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TesteRanking: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const criarIndicacoesTeste = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.log('Criando indicações de teste...');
      
      const response = await axios.post(`${API_URL}/api/teste/indicacoes`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Resposta:', response.data);
      setResult(response.data);
      
      toast({
        title: 'Indicações de teste criadas',
        description: `Foram criadas ${response.data.count} indicações de teste.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Erro ao criar indicações de teste:', error);
      
      toast({
        title: 'Erro ao criar indicações de teste',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const verificarRanking = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.log('Verificando ranking...');
      
      const response = await axios.get(`${API_URL}/api/indicacoes/ranking`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Ranking:', response.data);
      setResult(response.data);
      
      toast({
        title: 'Ranking verificado',
        description: `O ranking contém ${response.data.length} participantes.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Erro ao verificar ranking:', error);
      
      toast({
        title: 'Erro ao verificar ranking',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Box 
        bg="white" 
        p={6} 
        borderRadius="lg" 
        boxShadow="xl"
      >
        <Heading 
          as="h1" 
          size="xl" 
          textAlign="center" 
          color="barber.500"
          mb={6}
        >
          Teste do Ranking
        </Heading>
        
        <VStack spacing={4} align="stretch">
          <Button
            colorScheme="blue"
            onClick={criarIndicacoesTeste}
            isLoading={loading}
            loadingText="Criando..."
          >
            Criar Indicações de Teste
          </Button>
          
          <Button
            colorScheme="green"
            onClick={verificarRanking}
            isLoading={loading}
            loadingText="Verificando..."
          >
            Verificar Ranking
          </Button>
          
          {result && (
            <>
              <Divider my={4} />
              <Heading as="h2" size="md" mb={2}>
                Resultado:
              </Heading>
              <Box 
                p={4} 
                bg="gray.50" 
                borderRadius="md" 
                overflowX="auto"
              >
                <Code display="block" whiteSpace="pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </Code>
              </Box>
            </>
          )}
        </VStack>
      </Box>
    </Container>
  );
};

export default TesteRanking; 