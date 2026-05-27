import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assunto: { type: String, required: true },
  mensagem: { type: String, required: true },
  status: { type: String, enum: ['aberto', 'em_andamento', 'respondido', 'fechado'], default: 'aberto' },
  prioridade: { type: String, enum: ['baixa', 'media', 'alta'], default: 'media' },
  respostas: [{
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mensagem: String,
    anexo: String,
    criadoEm: { type: Date, default: Date.now }
  }],
  ultimaRespostaEm: { type: Date, default: Date.now }
}, { timestamps: true })

ticketSchema.index({ usuario: 1, status: 1 })
ticketSchema.index({ criadoEm: -1 })

export default mongoose.model('Ticket', ticketSchema)