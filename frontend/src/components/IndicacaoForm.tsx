import React, { useState } from 'react';
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
  InputLeftElement,
  Spinner,
  useBreakpointValue,
  SimpleGrid,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { PhoneIcon, CheckIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const IndicacaoForm: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomeIndicado: '',
    whatsappIndicado: '',
    nomeIndicador: '',
    whatsappIndicador: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Ajustes responsivos
  const containerWidth = useBreakpointValue({ base: "100%", md: "80%", lg: "70%" });
  const headingSize = useBreakpointValue({ base: "xl", md: "2xl" });
  const textSize = useBreakpointValue({ base: "sm", md: "md" });
  const buttonSize = useBreakpointValue({ base: "md", md: "lg" });
  const spacing = useBreakpointValue({ base: 4, md: 6 });

  const validateWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    return cleanNumber.length >= 10 && cleanNumber.length <= 11;
  };

  const getWhatsAppErrorMessage = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      return 'Número de WhatsApp incompleto. Certifique-se de inserir o DDD e o número completo.';
    } else if (cleanNumber.length > 11) {
      return 'Número de WhatsApp muito longo. Verifique se não há dígitos extras.';
    } else if (!/^\d+$/.test(cleanNumber)) {
      return 'Número de WhatsApp inválido. Use apenas números.';
    }
    return 'Formato de WhatsApp inválido. Use: (99) 9 9999-9999';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpa o erro quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.nomeIndicado) {
      newErrors.nomeIndicado = 'Nome é obrigatório';
    }
    
    if (!formData.whatsappIndicado) {
      newErrors.whatsappIndicado = 'WhatsApp é obrigatório';
    } else if (!validateWhatsApp(formData.whatsappIndicado)) {
      newErrors.whatsappIndicado = getWhatsAppErrorMessage(formData.whatsappIndicado);
    }
    
    if (!formData.nomeIndicador) {
      newErrors.nomeIndicador = 'Nome é obrigatório';
    }
    
    if (!formData.whatsappIndicador) {
      newErrors.whatsappIndicador = 'WhatsApp é obrigatório';
    } else if (!validateWhatsApp(formData.whatsappIndicador)) {
      newErrors.whatsappIndicador = getWhatsAppErrorMessage(formData.whatsappIndicador);
    }
    
    // Verifica se é auto-indicação
    if (formData.whatsappIndicado === formData.whatsappIndicador) {
      newErrors.whatsappIndicado = 'Você não pode indicar seu próprio número';
      newErrors.whatsappIndicador = 'Você não pode indicar seu próprio número';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    
    try {
      const API_URL = 'http://84.247.133.199:3012';
      console.log('Enviando indicação para:', `${API_URL}/api/indicacoes`);
      
      const response = await axios.post(
        `${API_URL}/api/indicacoes`,
        formData
      );
      
      toast({
        title: 'Indicação enviada com sucesso!',
        description: 'Agradecemos sua indicação.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Limpa o formulário após sucesso
      setFormData({
        nomeIndicado: '',
        whatsappIndicado: '',
        nomeIndicador: '',
        whatsappIndicador: '',
      });
    } catch (error: any) {
      console.error('Erro ao enviar indicação:', error);
      
      // Tratamento específico para erros de validação do backend
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || error.response.data?.message;
        
        if (errorMessage?.includes('auto-indicar')) {
          toast({
            title: 'Auto-indicação não permitida',
            description: 'Você não pode indicar seu próprio número de WhatsApp.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else if (errorMessage?.includes('já foi indicada')) {
          toast({
            title: 'Indicação já realizada',
            description: 'Este número já foi indicado anteriormente.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else if (errorMessage?.includes('Formato de WhatsApp inválido')) {
          toast({
            title: 'Formato de WhatsApp inválido',
            description: 'Certifique-se de inserir o número no formato: (99) 9 9999-9999',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Erro ao enviar indicação',
            description: errorMessage || 'Ocorreu um erro ao processar sua indicação. Tente novamente.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: 'Erro ao enviar indicação',
          description: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
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
        p={{ base: 4, md: 8 }} 
        borderRadius="lg" 
        boxShadow="xl"
        w={containerWidth}
        mx="auto"
      >
        <VStack spacing={spacing} align="stretch">
          <Heading 
            as="h1" 
            size={headingSize} 
            textAlign="center" 
            color="barber.500"
            mb={2}
          >
            Indique um Amigo
          </Heading>
          
          <Text 
            textAlign="center" 
            fontSize={textSize} 
            color="gray.600"
            mb={6}
          >
            Indique um amigo e ganhe pontos para concorrer a prêmios!
          </Text>
          
          <form onSubmit={handleSubmit}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={spacing}>
              {/* Seção do Indicado */}
              <Box>
                <Heading as="h2" size="md" mb={4} color="barber.500">
                  Dados do Indicado
                </Heading>
                <VStack spacing={4} align="stretch">
                  <FormControl isInvalid={!!errors.nomeIndicado}>
                    <FormLabel>Nome do Indicado</FormLabel>
                    <Input
                      name="nomeIndicado"
                      value={formData.nomeIndicado}
                      onChange={handleChange}
                      placeholder="Nome completo"
                      size={buttonSize}
                    />
                    <FormErrorMessage>{errors.nomeIndicado}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.whatsappIndicado}>
                    <FormLabel>WhatsApp do Indicado</FormLabel>
                    <InputGroup size={buttonSize}>
                      <InputLeftElement pointerEvents="none">
                        <PhoneIcon color="gray.500" />
                      </InputLeftElement>
                      <Input
                        name="whatsappIndicado"
                        value={formData.whatsappIndicado}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        type="tel"
                      />
                    </InputGroup>
                    <FormErrorMessage>{errors.whatsappIndicado}</FormErrorMessage>
                  </FormControl>
                </VStack>
              </Box>
              
              {/* Seção do Indicador */}
              <Box>
                <Heading as="h2" size="md" mb={4} color="barber.500">
                  Seus Dados
                </Heading>
                <VStack spacing={4} align="stretch">
                  <FormControl isInvalid={!!errors.nomeIndicador}>
                    <FormLabel>Seu Nome</FormLabel>
                    <Input
                      name="nomeIndicador"
                      value={formData.nomeIndicador}
                      onChange={handleChange}
                      placeholder="Nome completo"
                      size={buttonSize}
                    />
                    <FormErrorMessage>{errors.nomeIndicador}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.whatsappIndicador}>
                    <FormLabel>Seu WhatsApp</FormLabel>
                    <InputGroup size={buttonSize}>
                      <InputLeftElement pointerEvents="none">
                        <PhoneIcon color="gray.500" />
                      </InputLeftElement>
                      <Input
                        name="whatsappIndicador"
                        value={formData.whatsappIndicador}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        type="tel"
                      />
                    </InputGroup>
                    <FormErrorMessage>{errors.whatsappIndicador}</FormErrorMessage>
                  </FormControl>
                </VStack>
              </Box>
            </SimpleGrid>
            
            <Flex justify="center" mt={8}>
              <Button
                type="submit"
                colorScheme="barber"
                size={buttonSize}
                width={{ base: "100%", md: "auto" }}
                isLoading={loading}
                loadingText="Enviando..."
                leftIcon={loading ? <Spinner size="sm" /> : <CheckIcon />}
                _hover={{
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: 'lg'
                }}
                _active={{
                  transform: 'scale(0.95)',
                }}
              >
                Enviar Indicação
              </Button>
            </Flex>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};

export default IndicacaoForm; 