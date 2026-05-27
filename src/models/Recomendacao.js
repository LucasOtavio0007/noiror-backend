import mongoose from 'mongoose'

const RecomendacaoSchema = new mongoose.Schema({
  produto:    { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true, unique: true },
  similares:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produto' }],
  atualizadoEm: { type: Date, default: Date.now, expires: '7d' },
})

export default mongoose.model('Recomendacao', RecomendacaoSchema)