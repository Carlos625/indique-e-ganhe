import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  Badge,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  useToast,
  Link,
  Tooltip,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Container,
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001';

interface Indicacao {
  _id: string;
  nomeIndicador: string;
  whatsappIndicador: string;
  nomeIndicado: string;
  whatsappIndicado: string;
  status: 'pendente' | 'validado' | 'invalido';
  dataCriacao: string;
}

interface Stats {
  total: number;
  pendentes: number;
  validadas: number;
  invalidas: number;
}

const AdminIndicacoes: React.FC = () => {
  const [indicacoes, setIndicacoes] = React.useState<Indicacao[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const stats = React.useMemo(() => {
    return {
      total: indicacoes.length,
      pendentes: indicacoes.filter(i => i.status === 'pendente').length,
      validadas: indicacoes.filter(i => i.status === 'validado').length,
      invalidas: indicacoes.filter(i => i.status === 'invalido').length
    };
  }, [indicacoes]);

  const fetchIndicacoes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/indicacoes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setIndicacoes(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar indicações:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    console.log('AdminIndicacoes montado');
    console.log('API URL:', API_URL);
    fetchIndicacoes();
  }, []);

  const getStatusBadge = (status: 'pendente' | 'validado' | 'invalido') => {
    const statusProps = {
      pendente: { colorScheme: 'yellow', text: 'PENDENTE' },
      validado: { colorScheme: 'green', text: 'VALIDADO' },
      invalido: { colorScheme: 'red', text: 'INVÁLIDO' }
    }[status];

    return (
      <Badge
        colorScheme={statusProps?.colorScheme}
        px={3}
        py={1}
        borderRadius="full"
        textTransform="uppercase"
        fontWeight="bold"
      >
        {statusProps?.text}
      </Badge>
    );
  };

  const formatWhatsApp = (whatsapp: string | undefined): string => {
    if (!whatsapp) return '-';
    const cleaned = whatsapp.replace(/\D/g, '');
    if (cleaned.length !== 11) return whatsapp;
    return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`;
  };

  const renderWhatsAppLink = (whatsapp: string | undefined) => {
    if (!whatsapp) return '-';
    const formattedNumber = formatWhatsApp(whatsapp);
    return (
      <Link href={`https://wa.me/55${whatsapp}`} isExternal color="blue.500">
        {formattedNumber}
      </Link>
    );
  };

  const handleStatusUpdate = async (id: string, newStatus: Indicacao['status']) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.patch(
        `${API_URL}/api/indicacoes/${id}/status`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      await fetchIndicacoes();
      toast({
        title: 'Status atualizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      toast({
        title: 'Erro ao atualizar status',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      {loading ? (
        <Center p={8}>
          <Spinner size="xl" />
        </Center>
      ) : error ? (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <Box>{error}</Box>
        </Alert>
      ) : indicacoes.length === 0 ? (
        <Alert status="info" mb={4}>
          <AlertIcon />
          <Box>Nenhuma indicação encontrada.</Box>
        </Alert>
      ) : (
        <Box>
          <Box mb={8}>
            <Heading size="lg" color="barber.500" mb={6}>
              Dashboard de Indicações
            </Heading>
            
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
              <Box p={5} bg="white" borderRadius="lg" boxShadow="md" border="1px" borderColor="gray.200">
                <Stat>
                  <StatLabel fontSize="lg" color="gray.500">Total</StatLabel>
                  <StatNumber fontSize="3xl" color="barber.500">{stats.total}</StatNumber>
                </Stat>
              </Box>
              <Box p={5} bg="white" borderRadius="lg" boxShadow="md" border="1px" borderColor="yellow.200">
                <Stat>
                  <StatLabel fontSize="lg" color="yellow.500">Pendentes</StatLabel>
                  <StatNumber fontSize="3xl" color="yellow.500">{stats.pendentes}</StatNumber>
                </Stat>
              </Box>
              <Box p={5} bg="white" borderRadius="lg" boxShadow="md" border="1px" borderColor="green.200">
                <Stat>
                  <StatLabel fontSize="lg" color="green.500">Validadas</StatLabel>
                  <StatNumber fontSize="3xl" color="green.500">{stats.validadas}</StatNumber>
                </Stat>
              </Box>
              <Box p={5} bg="white" borderRadius="lg" boxShadow="md" border="1px" borderColor="red.200">
                <Stat>
                  <StatLabel fontSize="lg" color="red.500">Inválidas</StatLabel>
                  <StatNumber fontSize="3xl" color="red.500">{stats.invalidas}</StatNumber>
                </Stat>
              </Box>
            </SimpleGrid>

            <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="md">
              <Table variant="simple">
                <Thead bg="barber.500">
                  <Tr>
                    <Th color="white">DATA</Th>
                    <Th color="white">INDICADOR</Th>
                    <Th color="white">WHATSAPP INDICADOR</Th>
                    <Th color="white">INDICADO</Th>
                    <Th color="white">WHATSAPP INDICADO</Th>
                    <Th color="white">STATUS</Th>
                    <Th color="white">AÇÕES</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {indicacoes.map((indicacao) => (
                    <Tr key={indicacao._id}>
                      <Td>{new Date(indicacao.dataCriacao).toLocaleDateString()}</Td>
                      <Td fontWeight="medium">{indicacao.nomeIndicador}</Td>
                      <Td>{renderWhatsAppLink(indicacao.whatsappIndicador)}</Td>
                      <Td fontWeight="medium">{indicacao.nomeIndicado}</Td>
                      <Td>{renderWhatsAppLink(indicacao.whatsappIndicado)}</Td>
                      <Td>{getStatusBadge(indicacao.status)}</Td>
                      <Td>
                        {indicacao.status === 'pendente' ? (
                          <HStack spacing={2}>
                            <Tooltip label="Validar indicação">
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleStatusUpdate(indicacao._id, 'validado')}
                              >
                                ✓
                              </Button>
                            </Tooltip>
                            <Tooltip label="Invalidar indicação">
                              <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleStatusUpdate(indicacao._id, 'invalido')}
                              >
                                ✕
                              </Button>
                            </Tooltip>
                          </HStack>
                        ) :
                          <Tooltip label="Marcar como pendente">
                            <Button
                              size="sm"
                              colorScheme="yellow"
                              onClick={() => handleStatusUpdate(indicacao._id, 'pendente')}
                            >
                              ↺
                            </Button>
                          </Tooltip>
                        }
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default AdminIndicacoes; 