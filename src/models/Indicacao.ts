import mongoose from 'mongoose';
import { CallbackError } from 'mongoose';

const indicacaoSchema = new mongoose.Schema({
  nomeIndicador: {
    type: String,
    required: true,
    trim: true
  },
  whatsappIndicador: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        // Remove todos os caracteres não numéricos
        const numero = v.replace(/\D/g, '');
        // Verifica se tem 11 dígitos (DDD + 9 + número)
        return numero.length === 11;
      },
      message: 'Formato de WhatsApp inválido. Use: (99) 9 9999-9999'
    }
  },
  nomeIndicado: {
    type: String,
    required: true,
    trim: true
  },
  whatsappIndicado: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        // Remove todos os caracteres não numéricos
        const numero = v.replace(/\D/g, '');
        // Verifica se tem 11 dígitos (DDD + 9 + número)
        return numero.length === 11;
      },
      message: 'Formato de WhatsApp inválido. Use: (99) 9 9999-9999'
    }
  },
  status: {
    type: String,
    enum: ['pendente', 'validado', 'invalido'],
    default: 'pendente'
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  }
});

// Remove o índice composto antigo e adiciona validação pré-save
indicacaoSchema.pre('save', async function(next) {
  try {
    // Verifica se o indicador já tem 5 indicações válidas
    const indicacoesValidas = await mongoose.model('Indicacao').countDocuments({
      whatsappIndicador: this.whatsappIndicador,
      status: 'validado'
    });

    if (indicacoesValidas >= 5) {
      throw new Error('Você já atingiu o limite máximo de 5 indicações válidas.');
    }

    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error as CallbackError);
    } else {
      next(new Error('Erro desconhecido ao salvar indicação'));
    }
  }
});

// Método para formatar o número de WhatsApp
indicacaoSchema.methods.formatarWhatsApp = function(numero: string) {
  return numero.replace(/\D/g, '');
};

const Indicacao = mongoose.model('Indicacao', indicacaoSchema);

export default Indicacao; 