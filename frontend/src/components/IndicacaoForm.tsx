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
  Card,
  CardBody,
  InputGroup,
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001';

interface FormData {
  nomeIndicador: string;
  whatsappIndicador: string;
  nomeIndicado: string;
  whatsappIndicado: string;
}

const IndicacaoForm: React.FC = () => {
  const [formData, setFormData] = React.useState<FormData>({
    nomeIndicador: '',
    whatsappIndicador: '',
    nomeIndicado: '',
    whatsappIndicado: '',
  });
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const formatWhatsApp = (value: string) => {
    // Remove tudo que não é número
    const numero = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (numero.length <= 11) {
      return numero.replace(/^(\d{2})(\d{1})?(\d{4})?(\d{4})?/, function(_, ddd, n1, n2, n3) {
        if (n3) return `(${ddd}) ${n1} ${n2}-${n3}`;
        if (n2) return `(${ddd}) ${n1} ${n2}`;
        if (n1) return `(${ddd}) ${n1}`;
        if (ddd) return `(${ddd}`;
        return '';
      });
    }
    
    // Se passar de 11 dígitos, corta
    return value.slice(0, 16);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Se for campo de WhatsApp, formata o número
    if (name.includes('whatsapp')) {
      setFormData(prev => ({ ...prev, [name]: formatWhatsApp(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validar números de WhatsApp
    const whatsappRegex = /^\(\d{2}\) \d \d{4}-\d{4}$/;
    if (!whatsappRegex.test(formData.whatsappIndicador) || !whatsappRegex.test(formData.whatsappIndicado)) {
      toast({
        title: 'Erro de Validação',
        description: 'Números de WhatsApp inválidos. Use o formato: (99) 9 9999-9999',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    // Validar auto-indicação
    const whatsappIndicadorLimpo = formData.whatsappIndicador.replace(/\D/g, '');
    const whatsappIndicadoLimpo = formData.whatsappIndicado.replace(/\D/g, '');
    
    if (whatsappIndicadorLimpo === whatsappIndicadoLimpo) {
      toast({
        title: 'Erro de Validação',
        description: 'Você não pode se auto-indicar. O número de WhatsApp do indicador e do indicado são iguais.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(
        `${API_URL}/api/indicacoes`,
        {
          ...formData,
          // Remove formatação antes de enviar
          whatsappIndicador: formData.whatsappIndicador.replace(/\D/g, ''),
          whatsappIndicado: formData.whatsappIndicado.replace(/\D/g, ''),
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      toast({
        title: 'Sucesso!',
        description: 'Indicação registrada com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setFormData({
        nomeIndicador: '',
        whatsappIndicador: '',
        nomeIndicado: '',
        whatsappIndicado: '',
      });
    } catch (error: any) {
      console.error('Erro ao enviar indicação:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      const errorMessage = error.response?.data?.error || 'Erro ao processar a indicação. Tente novamente.';
      
      toast({
        title: 'Não foi possível registrar a indicação',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card bg="white" borderRadius="lg" boxShadow="md" border="1px" borderColor="barber.accent">
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" color="barber.500">
              Faça sua Indicação
            </Heading>
          </Box>
          <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="barber.500">Seu Nome</FormLabel>
                <Input
                  name="nomeIndicador"
                  value={formData.nomeIndicador}
                  onChange={handleChange}
                  placeholder="Digite seu nome"
                  borderColor="barber.accent"
                  _hover={{ borderColor: 'barber.500' }}
                  _focus={{ borderColor: 'barber.500', boxShadow: '0 0 0 1px var(--chakra-colors-barber-500)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="barber.500">Seu WhatsApp</FormLabel>
                <InputGroup>
                  <Input
                    name="whatsappIndicador"
                    value={formData.whatsappIndicador}
                    onChange={handleChange}
                    placeholder="(99) 9 9999-9999"
                    borderColor="barber.accent"
                    _hover={{ borderColor: 'barber.500' }}
                    _focus={{ borderColor: 'barber.500', boxShadow: '0 0 0 1px var(--chakra-colors-barber-500)' }}
                  />
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="barber.500">Nome do Indicado</FormLabel>
                <Input
                  name="nomeIndicado"
                  value={formData.nomeIndicado}
                  onChange={handleChange}
                  placeholder="Digite o nome da pessoa que você quer indicar"
                  borderColor="barber.accent"
                  _hover={{ borderColor: 'barber.500' }}
                  _focus={{ borderColor: 'barber.500', boxShadow: '0 0 0 1px var(--chakra-colors-barber-500)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="barber.500">WhatsApp do Indicado</FormLabel>
                <InputGroup>
                  <Input
                    name="whatsappIndicado"
                    value={formData.whatsappIndicado}
                    onChange={handleChange}
                    placeholder="(99) 9 9999-9999"
                    borderColor="barber.accent"
                    _hover={{ borderColor: 'barber.500' }}
                    _focus={{ borderColor: 'barber.500', boxShadow: '0 0 0 1px var(--chakra-colors-barber-500)' }}
                  />
                </InputGroup>
              </FormControl>
              <Button
                type="submit"
                colorScheme="barber"
                size="lg"
                width="full"
                mt={4}
                bg="barber.500"
                color="white"
                _hover={{ bg: 'barber.accent' }}
                isLoading={loading}
                loadingText="Enviando..."
              >
                Enviar Indicação
              </Button>
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default IndicacaoForm; 