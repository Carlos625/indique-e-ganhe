import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Heading,
  VStack,
  useToast,
  Badge,
  Spinner,
  Center,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001';

interface RankingItem {
  _id: string;
  nomeIndicador: string;
  whatsappIndicador: string;
  totalIndicacoes: number;
}

const Ranking: React.FC = () => {
  const [ranking, setRanking] = React.useState<RankingItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchRanking = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/indicacoes/ranking`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      setRanking(response.data || []);
    } catch (error: any) {
      console.error('Erro ao buscar ranking:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login');
        return;
      }
      setError('Não foi possível carregar o ranking.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRanking();
  }, []);

  const formatWhatsApp = (numero: string | undefined): string => {
    if (!numero) return '-';
    const cleaned = numero.replace(/\D/g, '');
    if (cleaned.length !== 11) return numero;
    return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,3)} ${cleaned.slice(3,7)}-${cleaned.slice(7)}`;
  };

  const renderWhatsAppLink = (whatsapp: string | undefined) => {
    if (!whatsapp) return '-';
    const cleaned = whatsapp.replace(/\D/g, '');
    if (!cleaned) return '-';
    
    return (
      <Link
        href={`https://wa.me/55${cleaned}`}
        color="barber.accent"
        isExternal
        _hover={{ color: 'barber.500', textDecoration: 'none' }}
      >
        {formatWhatsApp(whatsapp)}
      </Link>
    );
  };

  if (loading) {
    return (
      <Center p={8}>
        <Spinner size="xl" color="barber.accent" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" mb={4}>
        <AlertIcon />
        <Box>{error}</Box>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" color="barber.500" mb={2}>
            Ranking de Indicações
          </Heading>
          <Heading size="md" color="barber.accent">
            Concorra a R$ 1.500,00 em prêmios
          </Heading>
        </Box>

        <Box bg="white" borderRadius="lg" boxShadow="md" overflow="hidden">
          <Table variant="simple">
            <Thead bg="barber.500">
              <Tr>
                <Th color="white" textAlign="center" width="100px">POSIÇÃO</Th>
                <Th color="white">NOME</Th>
                <Th color="white">WHATSAPP</Th>
                <Th color="white" textAlign="center">INDICAÇÕES VÁLIDAS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {ranking.length > 0 ? (
                ranking.map((item, index) => (
                  <Tr key={item._id}>
                    <Td textAlign="center">
                      <Badge
                        colorScheme={index < 3 ? "yellow" : "gray"}
                        fontSize="lg"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {index + 1}º
                      </Badge>
                    </Td>
                    <Td fontWeight="bold">{item.nomeIndicador || '-'}</Td>
                    <Td>{renderWhatsAppLink(item.whatsappIndicador)}</Td>
                    <Td textAlign="center">
                      <Badge
                        colorScheme="green"
                        fontSize="lg"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {item.totalIndicacoes || 0}
                      </Badge>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={8}>
                    <Box color="gray.500" fontSize="lg">
                      Nenhuma indicação validada ainda
                    </Box>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
};

export default Ranking; 