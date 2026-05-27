import mongoose from 'mongoose'

const VisualizacaoSchema = new mongoose.Schema({
  usuario:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  produto:   { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true, index: true },
  sessaoId:  { type: String, default: null, index: true },
  createdAt: { type: Date, default: Date.now, expires: '30d' }, // dados recentes apenas
})

export default mongoose.model('Visualizacao', VisualizacaoSchema)