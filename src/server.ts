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

// Rotas públicas
app.post('/api/indicacoes', async (req, res) => {
  try {
    console.log('Recebendo nova indicação:', req.body);

    // Validação dos campos obrigatórios
    if (!req.body.nomeIndicador || !req.body.nomeIndicado || !req.body.whatsappIndicador || !req.body.whatsappIndicado) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios. Preencha nome e WhatsApp do indicador e do indicado.'
      });
    }

    // Função para limpar e padronizar números de WhatsApp
    const limparNumeroWhatsApp = (numero: string) => {
      const numeroLimpo = numero.replace(/\D/g, '');
      return numeroLimpo.startsWith('55') ? numeroLimpo.slice(2) : numeroLimpo;
    };

    // Validação do formato do WhatsApp
    const whatsappIndicador = limparNumeroWhatsApp(req.body.whatsappIndicador);
    const whatsappIndicado = limparNumeroWhatsApp(req.body.whatsappIndicado);

    if (whatsappIndicador.length !== 11) {
      return res.status(400).json({
        error: 'Formato de WhatsApp do indicador inválido. Use: (99) 9 9999-9999'
      });
    }

    if (whatsappIndicado.length !== 11) {
      return res.status(400).json({
        error: 'Formato de WhatsApp do indicado inválido. Use: (99) 9 9999-9999'
      });
    }

    const dadosIndicacao = {
      ...req.body,
      whatsappIndicador,
      whatsappIndicado,
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
      status: { $in: ['pendente', 'aprovado'] }
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
    
    // Tratamento específico para erros de validação do Mongoose
    if (error.name === 'ValidationError') {
      const mensagensErro = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        error: mensagensErro.join('. ') 
      });
    }
    
    // Erro de duplicidade (código 11000)
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Esta pessoa já foi indicada. Cada pessoa só pode ser indicada uma vez.' 
      });
    }

    // Erro de limite de indicações
    if (error.message?.includes('limite máximo de 5 indicações')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Ocorreu um erro ao processar sua indicação. Tente novamente mais tarde.' });
  }
});

// Rotas protegidas (requerem autenticação)
app.get('/api/indicacoes', authenticateToken, async (req, res) => {
  try {
    const indicacoes = await Indicacao.find().sort({ dataCriacao: -1 });
    res.json(indicacoes);
  } catch (error: any) {
    console.error('Erro ao buscar indicações:', error);
    res.status(500).json({ error: error.message });
  }
});

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

app.get('/api/indicacoes/ranking', authenticateToken, async (req, res) => {
  try {
    console.log('Gerando ranking de indicações...');
    
    // Primeiro, vamos verificar se existem indicações válidas
    const totalIndicacoesValidas = await Indicacao.countDocuments({ status: 'aprovado' });
    console.log('Total de indicações válidas:', totalIndicacoesValidas);
    
    if (totalIndicacoesValidas === 0) {
      console.log('Nenhuma indicação válida encontrada');
      return res.json([]);
    }
    
    const ranking = await Indicacao.aggregate([
      {
        $match: { status: 'aprovado' }
      },
      {
        $group: {
          _id: '$whatsappIndicador',
          nomeIndicador: { $first: '$nomeIndicador' },
          whatsappIndicador: { $first: '$whatsappIndicador' },
          totalIndicacoes: { $sum: 1 }
        }
      },
      {
        $sort: { 
          totalIndicacoes: -1,
          nomeIndicador: 1
        }
      },
      {
        $project: {
          _id: 1,
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
    const dados = req.body;
    console.log('Dados recebidos:', dados);

    // Função para limpar número
    const limparNumero = (numero: string) => {
      if (!numero) return '';
      return numero.replace(/\D/g, '').replace(/^55/, '');
    };

    // Limpa os números
    const whatsappIndicador = limparNumero(dados.whatsappIndicador);
    const whatsappIndicado = limparNumero(dados.whatsappIndicado);

    console.log('Números após limpeza:', { whatsappIndicador, whatsappIndicado });

    // 1. Validação de auto-indicação
    if (whatsappIndicador === whatsappIndicado) {
      console.log('Tentativa de auto-indicação detectada');
      return res.status(400).json({
        success: false,
        message: 'Você não pode indicar seu próprio número de WhatsApp'
      });
    }

    // 2. Verifica se o número já foi indicado
    const indicacaoExistente = await Indicacao.findOne({
      whatsappIndicado: whatsappIndicado,
      status: { $in: ['pendente', 'aprovado'] }
    });

    if (indicacaoExistente) {
      console.log('Número já indicado:', whatsappIndicado);
      return res.status(400).json({
        success: false,
        message: 'Este número já foi indicado anteriormente'
      });
    }

    // 3. Cria a nova indicação
    const novaIndicacao = new Indicacao({
      nomeIndicador: dados.nomeIndicador.trim(),
      whatsappIndicador: whatsappIndicador,
      nomeIndicado: dados.nomeIndicado.trim(),
      whatsappIndicado: whatsappIndicado,
      status: 'pendente',
      dataCriacao: new Date()
    });

    await novaIndicacao.save();
    console.log('Indicação salva com sucesso');

    return res.status(201).json({
      success: true,
      message: 'Indicação recebida com sucesso! Em breve entraremos em contato.'
    });

  } catch (error) {
    console.error('Erro ao processar indicação:', error);
    return res.status(500).json({
      success: false,
      message: 'Não foi possível processar sua indicação. Por favor, tente novamente.'
    });
  }
});

// Rota para criar indicações de teste
app.post('/api/teste/indicacoes', authenticateToken, async (req, res) => {
  try {
    console.log('Criando indicações de teste...');
    
    // Limpar indicações existentes
    await Indicacao.deleteMany({});
    console.log('Indicações existentes removidas');
    
    // Criar indicações de teste
    const indicacoesTeste = [
      {
        nomeIndicador: 'João Silva',
        whatsappIndicador: '11999999999',
        nomeIndicado: 'Maria Oliveira',
        whatsappIndicado: '11988888888',
        status: 'aprovado',
        dataCriacao: new Date()
      },
      {
        nomeIndicador: 'João Silva',
        whatsappIndicador: '11999999999',
        nomeIndicado: 'Pedro Santos',
        whatsappIndicado: '11977777777',
        status: 'aprovado',
        dataCriacao: new Date()
      },
      {
        nomeIndicador: 'Ana Costa',
        whatsappIndicador: '11966666666',
        nomeIndicado: 'Carlos Ferreira',
        whatsappIndicado: '11955555555',
        status: 'aprovado',
        dataCriacao: new Date()
      },
      {
        nomeIndicador: 'Ana Costa',
        whatsappIndicador: '11966666666',
        nomeIndicado: 'Juliana Lima',
        whatsappIndicado: '11944444444',
        status: 'aprovado',
        dataCriacao: new Date()
      },
      {
        nomeIndicador: 'Ana Costa',
        whatsappIndicador: '11966666666',
        nomeIndicado: 'Roberto Alves',
        whatsappIndicado: '11933333333',
        status: 'aprovado',
        dataCriacao: new Date()
      },
      {
        nomeIndicador: 'Lucas Mendes',
        whatsappIndicador: '11922222222',
        nomeIndicado: 'Fernanda Souza',
        whatsappIndicado: '11911111111',
        status: 'aprovado',
        dataCriacao: new Date()
      }
    ];
    
    await Indicacao.insertMany(indicacoesTeste);
    console.log('Indicações de teste criadas com sucesso');
    
    res.json({ message: 'Indicações de teste criadas com sucesso', count: indicacoesTeste.length });
  } catch (error: any) {
    console.error('Erro ao criar indicações de teste:', error);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 