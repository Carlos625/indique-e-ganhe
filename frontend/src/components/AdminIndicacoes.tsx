import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Heading,
  Container,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Badge,
  Text,
  useBreakpointValue,
  TableContainer,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
  HStack,
  VStack,
  Divider,
} from '@chakra-ui/react';
import { ChevronDownIcon, CheckIcon, CloseIcon, TimeIcon, InfoIcon, RepeatIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Indicacao {
  _id: string;
  nomeIndicado: string;
  whatsappIndicado: string;
  nomeIndicador: string;
  whatsappIndicador: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  dataCriacao: string;
}

const AdminIndicacoes: React.FC = () => {
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  
  // Ajustes responsivos
  const containerWidth = useBreakpointValue({ base: "100%", md: "95%", lg: "90%" });
  const headingSize = useBreakpointValue({ base: "xl", md: "2xl" });
  const tableSize = useBreakpointValue({ base: "sm", md: "md" });
  const showFullTable = useBreakpointValue({ base: false, md: true });
  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });
  const padding = useBreakpointValue({ base: 2, md: 4 });

  useEffect(() => {
    fetchIndicacoes();
  }, []);

  const fetchIndicacoes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Buscando indicações...');
      const API_URL = 'http://84.247.133.199:3012';
      console.log('URL da API:', `${API_URL}/api/indicacoes`);

      const response = await axios.get<Indicacao[]>(`${API_URL}/api/indicacoes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Resposta:', response.data);
      setIndicacoes(response.data);
      setError(null);
    } catch (error: any) {
      console.error('Erro ao buscar indicações:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Não foi possível carregar as indicações. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, novoStatus: 'aprovado' | 'rejeitado' | 'pendente') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const API_URL = 'http://84.247.133.199:3012';
      console.log('Atualizando status da indicação:', id, 'para:', novoStatus);
      console.log('URL da API:', `${API_URL}/api/indicacoes/${id}/status`);

      await axios.patch(
        `${API_URL}/api/indicacoes/${id}/status`,
        { status: novoStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Atualiza a lista local
      setIndicacoes(prev =>
        prev.map(ind =>
          ind._id === id ? { ...ind, status: novoStatus } : ind
        )
      );

      toast({
        title: 'Status atualizado com sucesso',
        description: `Indicação ${novoStatus === 'aprovado' ? 'aprovada' : novoStatus === 'rejeitado' ? 'rejeitada' : 'marcada como pendente'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        toast({
          title: 'Erro ao atualizar status',
          description: error.response?.data?.message || 'Ocorreu um erro ao atualizar o status. Tente novamente.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const formatWhatsApp = (whatsapp: string) => {
    const cleaned = whatsapp.replace(/\D/g, '');
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 3)} ${cleaned.substring(3, 7)}-${cleaned.substring(7, 11)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge colorScheme="green" fontSize="md" px={2} py={1} borderRadius="md">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge colorScheme="red" fontSize="md" px={2} py={1} borderRadius="md">Rejeitado</Badge>;
      default:
        return <Badge colorScheme="yellow" fontSize="md" px={2} py={1} borderRadius="md">Pendente</Badge>;
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
          Administração de Indicações
        </Heading>

        {indicacoes.length === 0 ? (
          <Text textAlign="center" fontSize="lg" color="gray.600">
            Nenhuma indicação registrada ainda.
          </Text>
        ) : (
          <TableContainer overflowX="auto">
            <Table variant="simple" size={tableSize}>
              <Thead>
                <Tr>
                  <Th>Data</Th>
                  <Th>Indicado</Th>
                  {showFullTable && <Th>WhatsApp Indicado</Th>}
                  <Th>Indicador</Th>
                  {showFullTable && <Th>WhatsApp Indicador</Th>}
                  <Th>Status</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {indicacoes.map((indicacao) => (
                  <Tr key={indicacao._id}>
                    <Td>
                      <Tooltip label={formatDate(indicacao.dataCriacao)}>
                        <Text>{new Date(indicacao.dataCriacao).toLocaleDateString('pt-BR')}</Text>
                      </Tooltip>
                    </Td>
                    <Td>
                      <Tooltip label={showFullTable ? "" : formatWhatsApp(indicacao.whatsappIndicado)}>
                        <Text fontWeight="medium">{indicacao.nomeIndicado}</Text>
                      </Tooltip>
                    </Td>
                    {showFullTable && (
                      <Td>
                        <Text>{formatWhatsApp(indicacao.whatsappIndicado)}</Text>
                      </Td>
                    )}
                    <Td>
                      <Tooltip label={showFullTable ? "" : formatWhatsApp(indicacao.whatsappIndicador)}>
                        <Text fontWeight="medium">{indicacao.nomeIndicador}</Text>
                      </Tooltip>
                    </Td>
                    {showFullTable && (
                      <Td>
                        <Text>{formatWhatsApp(indicacao.whatsappIndicador)}</Text>
                      </Td>
                    )}
                    <Td>{getStatusBadge(indicacao.status)}</Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={Button}
                          rightIcon={<ChevronDownIcon />}
                          size={buttonSize}
                          colorScheme="blue"
                        >
                          Ações
                        </MenuButton>
                        <MenuList>
                          {indicacao.status !== 'aprovado' && (
                            <MenuItem
                              icon={<CheckIcon />}
                              onClick={() => handleStatusUpdate(indicacao._id, 'aprovado')}
                            >
                              Aprovar
                            </MenuItem>
                          )}
                          {indicacao.status !== 'rejeitado' && (
                            <MenuItem
                              icon={<CloseIcon />}
                              onClick={() => handleStatusUpdate(indicacao._id, 'rejeitado')}
                            >
                              Rejeitar
                            </MenuItem>
                          )}
                          {indicacao.status !== 'pendente' && (
                            <MenuItem
                              icon={<TimeIcon />}
                              onClick={() => handleStatusUpdate(indicacao._id, 'pendente')}
                            >
                              Marcar como Pendente
                            </MenuItem>
                          )}
                        </MenuList>
                      </Menu>
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

export default AdminIndicacoes; 