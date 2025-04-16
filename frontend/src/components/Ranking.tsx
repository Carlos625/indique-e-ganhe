import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Container,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  useBreakpointValue,
  TableContainer,
  Badge,
  Flex,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface RankingItem {
  _id: string;
  nomeIndicador: string;
  whatsappIndicador: string;
  totalIndicacoes: number;
}

const Ranking: React.FC = () => {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Ajustes responsivos
  const containerWidth = useBreakpointValue({ base: "100%", md: "90%", lg: "80%" });
  const headingSize = useBreakpointValue({ base: "xl", md: "2xl" });
  const tableSize = useBreakpointValue({ base: "sm", md: "md" });
  const showFullTable = useBreakpointValue({ base: false, md: true });
  const padding = useBreakpointValue({ base: 2, md: 4 });

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        console.log('Buscando dados do ranking...');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        console.log('URL da API:', `${API_URL}/api/indicacoes/ranking`);
        
        const response = await axios.get(`${API_URL}/api/indicacoes/ranking`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Dados do ranking recebidos:', response.data);
        
        // Verificar se os dados estão no formato esperado
        if (Array.isArray(response.data)) {
          // Garantir que cada item tenha um _id
          const rankingData = response.data.map((item, index) => ({
            ...item,
            _id: item._id || `temp-${index}`,
            totalIndicacoes: Number(item.totalIndicacoes) || 0
          }));
          
          console.log('Dados do ranking processados:', rankingData);
          setRanking(rankingData);
          setError(null);
        } else {
          console.error('Formato de dados inválido:', response.data);
          setError('Formato de dados inválido recebido do servidor.');
        }
      } catch (error: any) {
        console.error('Erro ao buscar ranking:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Não foi possível carregar o ranking. Tente novamente mais tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [navigate]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Icon as={FaTrophy} color="yellow.400" boxSize={6} />;
      case 1:
        return <Icon as={FaMedal} color="gray.400" boxSize={5} />;
      case 2:
        return <Icon as={FaAward} color="orange.400" boxSize={5} />;
      default:
        return null;
    }
  };

  const formatWhatsApp = (whatsapp: string | undefined) => {
    if (!whatsapp) return 'N/A';
    
    try {
      const cleaned = whatsapp.replace(/\D/g, '');
      if (cleaned.length < 11) return whatsapp;
      
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 3)} ${cleaned.substring(3, 7)}-${cleaned.substring(7, 11)}`;
    } catch (error) {
      console.error('Erro ao formatar WhatsApp:', error);
      return whatsapp;
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="barber.500" thickness="4px" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box 
        bg="white" 
        p={{ base: 4, md: 8 }} 
        borderRadius="lg" 
        boxShadow="xl"
        w={containerWidth}
        mx="auto"
      >
        <Heading 
          as="h1" 
          size={headingSize} 
          textAlign="center" 
          color="barber.500"
          mb={6}
        >
          Ranking de Indicações
        </Heading>

        {ranking.length === 0 ? (
          <Text textAlign="center" fontSize="lg" color="gray.600">
            Nenhuma indicação registrada ainda.
          </Text>
        ) : (
          <TableContainer>
            <Table variant="simple" size={tableSize}>
              <Thead>
                <Tr>
                  <Th width="10%">Posição</Th>
                  <Th>Nome</Th>
                  {showFullTable && <Th>WhatsApp</Th>}
                  <Th isNumeric>Indicações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {ranking.map((item, index) => (
                  <Tr key={item._id || index}>
                    <Td>
                      <Flex align="center" gap={2}>
                        {getPositionIcon(index)}
                        <Text fontWeight="bold">{index + 1}º</Text>
                      </Flex>
                    </Td>
                    <Td>
                      <Tooltip label={showFullTable ? "" : formatWhatsApp(item.whatsappIndicador)}>
                        <Text fontWeight="medium">{item.nomeIndicador || 'Anônimo'}</Text>
                      </Tooltip>
                    </Td>
                    {showFullTable && (
                      <Td>
                        <Text>{formatWhatsApp(item.whatsappIndicador)}</Text>
                      </Td>
                    )}
                    <Td isNumeric>
                      <Badge colorScheme="blue" fontSize="md" px={2} py={1} borderRadius="md">
                        {item.totalIndicacoes || 0}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default Ranking; 