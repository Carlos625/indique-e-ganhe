import express from 'express';
import Indicacao from '../models/Indicacao';

const router = express.Router();

// Criar nova indicação
router.post('/', async (req, res) => {
  try {
    const indicacao = new Indicacao(req.body);
    await indicacao.save();
    res.status(201).json(indicacao);
  } catch (error: any) {
    console.error('Erro ao criar indicação:', error);
    
    // Erro de validação do Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
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

    res.status(500).json({ error: 'Erro ao processar a indicação. Tente novamente.' });
  }
});

// Listar todas as indicações
router.get('/', async (req, res) => {
  try {
    const indicacoes = await Indicacao.find();
    res.json(indicacoes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar indicações' });
  }
});

// Obter ranking de indicadores
router.get('/ranking', async (req, res) => {
  try {
    const ranking = await Indicacao.aggregate([
      {
        $match: { status: 'validado' }
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
        $sort: { totalIndicacoes: -1 }
      }
    ]);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar ranking' });
  }
});

// Atualizar status de uma indicação
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const indicacao = await Indicacao.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(indicacao);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar status' });
  }
});

export default router; 