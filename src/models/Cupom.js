// models/Cupom.js
import mongoose from 'mongoose'

const cupomSchema = new mongoose.Schema({
  codigo:      { type: String, required: true, unique: true, uppercase: true },
  tipo:        { type: String, enum: ['pct', 'fixo', 'frete'], default: 'pct' },
  valor:       { type: Number, default: 0 },
  minPedido:   { type: Number, default: 0 },
  limiteTotal: { type: Number, default: 0 },
  usos:        { type: Number, default: 0 },
  ativo:       { type: Boolean, default: true },
  validoDe:    Date,
  validoAte:   Date,
}, { timestamps: { createdAt: 'criadoEm' } })

export default mongoose.model('Cupom', cupomSchema)