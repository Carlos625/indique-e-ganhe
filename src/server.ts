import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Indicacao from './models/Indicacao';
import User from './models/User';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/indique-e-ganhe')
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Middleware de autenticação
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Indique e Ganhe está funcionando!' });
});

// Rotas de Autenticação
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Tentativa de login:', { username });

    const user = await User.findOne({ username });
    if (!user) {
      console.log('Usuário não encontrado:', username);
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Senha incorreta para o usuário:', username);
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '24h'
    });

    console.log('Login bem-sucedido:', username);
    res.json({ success: true, token });
  } catch (error: any) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para criar usuário
app.post('/api/users', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Tentando criar usuário:', username);

    const user = new User({ username, password });
    await user.save();
    
    console.log('Usuário criado com sucesso:', username);
    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rotas protegidas
app.post('/api/indicacoes', authenticateToken, async (req, res) => {
  try {
    console.log('Recebendo nova indicação:', req.body);

    // Função para limpar e padronizar números de WhatsApp
    const limparNumeroWhatsApp = (numero: string) => {
      const numeroLimpo = numero.replace(/\D/g, '');
      return numeroLimpo.startsWith('55') ? numeroLimpo.slice(2) : numeroLimpo;
    };

    const dadosIndicacao = {
      ...req.body,
      whatsappIndicador: limparNumeroWhatsApp(req.body.whatsappIndicador),
      whatsappIndicado: limparNumeroWhatsApp(req.body.whatsappIndicado),
      status: 'pendente',
      dataCriacao: new Date()
    };

    console.log('Números após limpeza:', {
      indicador: dadosIndicacao.whatsappIndicador,
      indicado: dadosIndicacao.whatsappIndicado
    });

    // Validação de auto-indicação
    if (dadosIndicacao.whatsappIndicador === dadosIndicacao.whatsappIndicado) {
      console.log('Tentativa de auto-indicação detectada');
      return res.status(400).json({
        error: 'Você não pode se auto-indicar. O número de WhatsApp do indicador e do indicado são iguais.'
      });
    }

    // Verifica se o número já foi indicado
    const indicacaoExistente = await Indicacao.findOne({
      whatsappIndicado: dadosIndicacao.whatsappIndicado,
      status: { $in: ['pendente', 'validado'] }
    });

    if (indicacaoExistente) {
      console.log('Número já indicado anteriormente:', dadosIndicacao.whatsappIndicado);
      return res.status(400).json({
        error: 'Esta pessoa já foi indicada anteriormente'
      });
    }

    const indicacao = new Indicacao(dadosIndicacao);
    await indicacao.save();
    
    console.log('Indicação criada com sucesso:', indicacao);
    res.status(201).json(indicacao);
  } catch (error: any) {
    console.error('Erro ao criar indicação:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar indicação' });
  }
});

// Rota para listar indicações
app.get('/api/indicacoes', authenticateToken, async (req, res) => {
  try {
    const indicacoes = await Indicacao.find().sort({ dataCriacao: -1 });
    res.json(indicacoes);
  } catch (error: any) {
    console.error('Erro ao buscar indicações:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar status da indicação
app.patch('/api/indicacoes/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const indicacao = await Indicacao.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!indicacao) {
      return res.status(404).json({ error: 'Indicação não encontrada' });
    }

    res.json(indicacao);
  } catch (error: any) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para obter o ranking
app.get('/api/indicacoes/ranking', authenticateToken, async (req, res) => {
  try {
    const ranking = await Indicacao.aggregate([
      {
        // Filtra apenas indicações validadas
        $match: { status: 'validado' }
      },
      {
        // Agrupa por whatsappIndicador e soma as indicações
        $group: {
          _id: '$whatsappIndicador',
          nomeIndicador: { $first: '$nomeIndicador' },
          whatsappIndicador: { $first: '$whatsappIndicador' },
          totalIndicacoes: { $sum: 1 }
        }
      },
      {
        // Ordena por total de indicações (decrescente) e nome (crescente)
        $sort: { 
          totalIndicacoes: -1,
          nomeIndicador: 1
        }
      },
      {
        // Formata o documento final
        $project: {
          _id: 0,
          nomeIndicador: 1,
          whatsappIndicador: 1,
          totalIndicacoes: 1
        }
      }
    ]);

    console.log('Ranking gerado:', ranking);
    res.json(ranking);
  } catch (error: any) {
    console.error('Erro ao gerar ranking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota temporária para limpar o banco de dados
app.post('/api/limpar-banco', async (req, res) => {
  try {
    await Indicacao.deleteMany({});
    res.json({ message: 'Banco de dados limpo com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao limpar banco de dados:', error);
    res.status(500).json({ error: error.message || 'Erro ao limpar banco de dados' });
  }
});

// Novo endpoint para receber dados do formulário externo
app.post('/api/formulario/indicacao', async (req, res) => {
  try {
    console.log('Dados recebidos do formulário:', req.body);
    
    // Validação dos campos obrigatórios
    const camposObrigatorios = ['nomeIndicador', 'whatsappIndicador', 'nomeIndicado', 'whatsappIndicado'];
    const camposFaltando = camposObrigatorios.filter(campo => !req.body[campo]);
    
    if (camposFaltando.length > 0) {
      console.log('Campos obrigatórios faltando:', camposFaltando);
      return res.status(400).json({
        success: false,
        message: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}`
      });
    }

    // Função para limpar e padronizar números de WhatsApp
    const limparNumeroWhatsApp = (numero: string) => {
      const numeroLimpo = numero.replace(/\D/g, '');
      return numeroLimpo.startsWith('55') ? numeroLimpo.slice(2) : numeroLimpo;
    };

    const dadosIndicacao = {
      nomeIndicador: req.body.nomeIndicador.trim(),
      whatsappIndicador: limparNumeroWhatsApp(req.body.whatsappIndicador),
      nomeIndicado: req.body.nomeIndicado.trim(),
      whatsappIndicado: limparNumeroWhatsApp(req.body.whatsappIndicado),
      status: 'pendente',
      dataCriacao: new Date()
    };

    console.log('Números após limpeza:', {
      indicador: dadosIndicacao.whatsappIndicador,
      indicado: dadosIndicacao.whatsappIndicado
    });

    // Validação de auto-indicação
    if (dadosIndicacao.whatsappIndicador === dadosIndicacao.whatsappIndicado) {
      console.log('Tentativa de auto-indicação detectada no formulário');
      return res.status(400).json({
        success: false,
        message: 'Você não pode se auto-indicar. O número de WhatsApp do indicador e do indicado são iguais.'
      });
    }

    // Verifica se o número já foi indicado
    const indicacaoExistente = await Indicacao.findOne({
      whatsappIndicado: dadosIndicacao.whatsappIndicado,
      status: { $in: ['pendente', 'validado'] }
    });

    if (indicacaoExistente) {
      console.log('Número já indicado anteriormente no formulário:', dadosIndicacao.whatsappIndicado);
      return res.status(400).json({
        success: false,
        message: 'Esta pessoa já foi indicada anteriormente'
      });
    }

    const indicacao = new Indicacao(dadosIndicacao);
    await indicacao.save();
    
    console.log('Indicação criada com sucesso a partir do formulário:', indicacao);
    res.status(201).json({
      success: true,
      message: 'Indicação recebida com sucesso!',
      id: indicacao._id
    });
  } catch (error: any) {
    console.error('Erro ao processar indicação do formulário:', error);
    
    // Tratamento específico para erro de duplicação
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Você já indicou esta pessoa anteriormente'
      });
    }

    // Tratamento para erros de validação do Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((err: any) => err.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao processar indicação',
      error: error.message || 'Erro desconhecido'
    });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 