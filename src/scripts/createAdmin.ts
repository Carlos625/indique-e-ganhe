import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminUser() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/indique-e-ganhe');
    console.log('Conectado ao MongoDB');

    // Criar usuário admin
    const adminUser = new User({
      username: 'admin',
      password: '123456' // Senha será hashed automaticamente pelo modelo
    });

    await adminUser.save();
    console.log('Usuário admin criado com sucesso!');
    console.log('Username: admin');
    console.log('Password: 123456');

  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
}

createAdminUser(); 