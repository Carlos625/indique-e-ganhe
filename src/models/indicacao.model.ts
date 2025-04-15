import mongoose from 'mongoose';

const indicacaoSchema = new mongoose.Schema({
  nomeIndicador: {
    type: String,
    required: true
  },
  emailIndicador: {
    type: String,
    required: true,
    unique: true
  },
  nomeIndicado: {
    type: String,
    required: true
  },
  emailIndicado: {
    type: String,
    required: true,
    unique: true
  },
  dataIndicacao: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pendente', 'validado', 'invalido'],
    default: 'pendente'
  }
});

export default mongoose.model('Indicacao', indicacaoSchema); 