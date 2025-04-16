import React, { useState } from 'react';
import { Box, Flex, Link, Button, useToast, IconButton, VStack, HStack, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem('token');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Atualiza o estado quando a janela é redimensionada
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast({
      title: 'Logout realizado com sucesso',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    navigate('/');
    onClose(); // Fecha o menu mobile após logout
  };

  // Componente para os links de navegação
  const NavLinks = () => (
    <>
      <Button
        as={RouterLink}
        to="/"
        variant="ghost"
        color="white"
        fontWeight="bold"
        fontSize="md"
        _hover={{ bg: 'barber.accent', color: 'barber.500' }}
        _active={{ bg: 'barber.accent', color: 'barber.500' }}
        onClick={onClose}
      >
        Nova Indicação
      </Button>

      {token && (
        <>
          <Button
            as={RouterLink}
            to="/ranking"
            variant="ghost"
            color="white"
            fontWeight="bold"
            fontSize="md"
            _hover={{ bg: 'barber.accent', color: 'barber.500' }}
            _active={{ bg: 'barber.accent', color: 'barber.500' }}
            onClick={onClose}
          >
            Ranking
          </Button>
          <Button
            as={RouterLink}
            to="/admin"
            variant="ghost"
            color="white"
            fontWeight="bold"
            fontSize="md"
            _hover={{ bg: 'barber.accent', color: 'barber.500' }}
            _active={{ bg: 'barber.accent', color: 'barber.500' }}
            onClick={onClose}
          >
            Administração
          </Button>
        </>
      )}

      {token ? (
        <Button
          variant="outline"
          color="white"
          fontWeight="bold"
          fontSize="md"
          _hover={{ bg: 'barber.accent', color: 'barber.500' }}
          _active={{ bg: 'barber.accent', color: 'barber.500' }}
          onClick={handleLogout}
        >
          Sair
        </Button>
      ) : (
        <Button
          as={RouterLink}
          to="/login"
          variant="outline"
          color="white"
          fontWeight="bold"
          fontSize="md"
          _hover={{ bg: 'barber.accent', color: 'barber.500' }}
          _active={{ bg: 'barber.accent', color: 'barber.500' }}
          onClick={onClose}
        >
          Login
        </Button>
      )}
    </>
  );

  return (
    <Box bg="barber.500" px={4} py={4} boxShadow="lg" borderBottom="3px solid" borderColor="barber.accent" position="sticky" top={0} zIndex={10}>
      <Flex maxW="container.xl" mx="auto" justify="space-between" align="center">
        <Link
          as={RouterLink}
          to="/"
          color="barber.accent"
          fontWeight="bold"
          fontSize={{ base: "xl", md: "2xl" }}
          _hover={{ textDecoration: 'none', color: 'white' }}
          display="flex"
          alignItems="center"
        >
          Indique e Ganhe | Vip Barbeiro
        </Link>

        {/* Menu para desktop */}
        {!isMobile && (
          <Flex gap={4}>
            <NavLinks />
          </Flex>
        )}

        {/* Botão do menu mobile */}
        {isMobile && (
          <IconButton
            aria-label="Menu"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            variant="ghost"
            color="white"
            onClick={onOpen}
            size="lg"
          />
        )}
      </Flex>

      {/* Menu mobile (drawer) */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent bg="barber.500">
          <DrawerCloseButton color="white" />
          <DrawerHeader color="barber.accent" borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={6} align="stretch" mt={6}>
              <NavLinks />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar; 