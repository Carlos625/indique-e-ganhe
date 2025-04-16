import axios from 'axios';

const testServer = async () => {
  try {
    console.log('Testando conexão com o servidor...');
    const response = await axios.get('http://localhost:3001/');
    console.log('Servidor está respondendo:', response.data);
    
    console.log('Testando rota de login...');
    const loginResponse = await axios.post('http://localhost:3001/api/users/login', {
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