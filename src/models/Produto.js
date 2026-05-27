import mongoose from 'mongoose'

const ProdutoSchema = new mongoose.Schema({
  nome:      { type: String, required: true, trim: true },
  marca:     { type: String, required: true, trim: true },
  categoria: { type: String, required: true, enum: ['COMPUTING','MOBILE','AUDIO','GAMING','VISUAL','VIRTUAL'] },
  preco:     { type: Number, required: true, min: 0 },
  descricao: { type: String, default: '' },
  imagem:    { type: String, default: '' },
  imagens:   [{ type: String }],
  // ✅ CORRIGIDO: era Boolean, deve ser Number para suportar quantidade em estoque
  estoque:   { type: Number, default: 0, min: 0 },
  parcelas:  { type: Number, default: 12, min: 1, max: 24 },
  destaque:  { type: Boolean, default: false },
  novo:      { type: Boolean, default: false },
  limitada:  { type: Boolean, default: false },
  material:  { type: String, default: '' },
  cores:     [{ nome: String, hex: String }],
  armazenamentos: [{ capacidade: String, preco: Number }],
  specs:     [{ k: String, v: String }],
  criadoEm:  { type: Date, default: Date.now },
}, { timestamps: true })

ProdutoSchema.index({ categoria: 1 })
ProdutoSchema.index({ destaque: 1 })
ProdutoSchema.index({ nome: 'text', descricao: 'text', marca: 'text' })

export default mongoose.model('Produto', ProdutoSchema)