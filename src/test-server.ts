import axios from 'axios';

const API_URL = 'http://84.247.133.199:3012';

const testServer = async () => {
  try {
    console.log('Testando conexão com o servidor...');
    const response = await axios.get(`${API_URL}/`);
    console.log('Servidor está respondendo:', response.data);
    
    console.log('Testando rota de login...');
    const loginResponse = await axios.post(`${API_URL}/api/users/login`, {
      username: 'admin',
      password: '123456'
    });
    console.log('Resposta do login:', loginResponse.data);
  } catch (error: any) {
    console.error('Erro ao testar servidor:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
};

testServer(); 