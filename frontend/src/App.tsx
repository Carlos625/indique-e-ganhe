import React from 'react';
import { ChakraProvider, Box, Container, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import IndicacaoForm from './components/IndicacaoForm';
import Ranking from './components/Ranking';
import AdminIndicacoes from './components/AdminIndicacoes';
import Login from './components/Login';

// Tema personalizado para barbearia
const theme = extendTheme({
  colors: {
    barber: {
      500: '#1a1a1a', // Preto elegante
      600: '#141414', // Preto mais escuro
      accent: '#c59d5f', // Dourado
      red: '#8B0000', // Vermelho escuro
      light: '#f5f5f5', // Cinza claro
    }
  },
  styles: {
    global: {
      body: {
        bg: 'barber.500',
        color: 'barber.500'
      }
    }
  }
});

// Componente de rota protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh" position="relative">
          {/* Imagem de fundo com overlay */}
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgImage="linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3')"
            bgPosition="center"
            bgSize="cover"
            bgRepeat="no-repeat"
            zIndex="0"
          />

          {/* Conteúdo */}
          <Box position="relative" zIndex="2">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <Container 
                        maxW="container.xl" 
                        py={8}
                        sx={{
                          '& > *': {
                            backdropFilter: 'blur(5px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: 'lg',
                            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
                            padding: '6',
                          }
                        }}
                      >
                        <Routes>
                          <Route path="/" element={<IndicacaoForm />} />
                          <Route path="/ranking" element={<Ranking />} />
                          <Route path="/admin" element={<AdminIndicacoes />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Container>
                    </>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App; 