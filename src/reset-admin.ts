import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const resetAdmin = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/indique-e-ganhe');
    console.log('Conectado ao MongoDB');

    // Deletar usuário admin existente
    await User.deleteMany({ username: 'admin' });
    console.log('Usuário admin anterior removido');

    // Criar novo usuário admin
    const adminUser = new User({
      username: 'admin',
      password: '123456'
    });

    await adminUser.save();
    console.log('Novo usuário admin criado com sucesso!');
    console.log('Username: admin');
    console.log('Senha: 123456');

    // Desconectar do MongoDB
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  } catch (error) {
    console.error('Erro ao resetar usuário admin:', error);
  }
};

resetAdmin(); 