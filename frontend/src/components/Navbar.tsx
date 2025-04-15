import React from 'react';
import { Box, Flex, Link, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <Box bg="barber.500" px={4} py={4} boxShadow="lg" borderBottom="3px solid" borderColor="barber.accent">
      <Flex maxW="container.xl" mx="auto" justify="space-between" align="center">
        <Link
          as={RouterLink}
          to="/"
          color="barber.accent"
          fontWeight="bold"
          fontSize="2xl"
          _hover={{ textDecoration: 'none', color: 'white' }}
          display="flex"
          alignItems="center"
        >
          Indique e Ganhe | Vip Barbeiro
        </Link>
        <Flex gap={4}>
          <Button
            as={RouterLink}
            to="/"
            variant="ghost"
            color="white"
            fontWeight="bold"
            fontSize="md"
            _hover={{ bg: 'barber.accent', color: 'barber.500' }}
            _active={{ bg: 'barber.accent', color: 'barber.500' }}
          >
            Nova Indicação
          </Button>
          <Button
            as={RouterLink}
            to="/ranking"
            variant="ghost"
            color="white"
            fontWeight="bold"
            fontSize="md"
            _hover={{ bg: 'barber.accent', color: 'barber.500' }}
            _active={{ bg: 'barber.accent', color: 'barber.500' }}
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
          >
            Administração
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 