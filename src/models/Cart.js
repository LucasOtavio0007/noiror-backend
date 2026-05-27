import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  produto:    { type: mongoose.Schema.Types.ObjectId, ref: 'Produto' },
  id:         String,
  nome:       String,
  imagem:     String,
  categoria:  String,
  preco:      Number,
  qty:        { type: Number, default: 1, min: 1 },
})

const cartSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  itens:   [cartItemSchema],
}, { timestamps: true })

export default mongoose.model('Cart', cartSchema)