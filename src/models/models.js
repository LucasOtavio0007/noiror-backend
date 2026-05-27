// models/Product.js
const mongoose = require('mongoose')

const produtoSchema = new mongoose.Schema({
  nome:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  descricao:   { type: String, default: '' },
  categoria:   { type: String, required: true },
  imagem:      { type: String, default: '' },
  imagens:     [{ type: String }],
  preco:       { type: Number, required: true, min: 0 },
  precoVip:    { type: Number, default: null },  // null = usa desconto % automático
  precoElite:  { type: Number, default: null },
  estoque:     { type: Number, default: 0 },
  exclusivoVip:  { type: Boolean, default: false },  // só VIP/ELITE pode ver
  exclusivoElite:{ type: Boolean, default: false },
  ativo:       { type: Boolean, default: true },
  destaque:    { type: Boolean, default: false },
  tags:        [{ type: String }],
}, { timestamps: true })

// ══════════════════════════════════════════════════════════════

// models/Order.js
const itemPedidoSchema = new mongoose.Schema({
  produto:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  nome:       String,
  imagem:     String,
  categoria:  String,
  preco:      Number,   // preço pago (já com desconto)
  precoBase:  Number,   // preço original
  qty:        Number,
})

const orderSchema = new mongoose.Schema({
  usuario:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  numero:    { type: String, unique: true },
  itens:     [itemPedidoSchema],
  total:     { type: Number, required: true },
  subtotal:  { type: Number },
  desconto:  { type: Number, default: 0 },
  status:    {
    type: String,
    enum: ['pendente','pago','enviado','entregue','cancelado'],
    default: 'pendente',
  },
  enderecoEntrega: {
    rua:      String,
    numero:   String,
    cidade:   String,
    estado:   String,
    cep:      String,
  },
  pagamento: {
    metodo:     String,
    referencia: String,
  },
  nivelUsuario: { type: String, default: 'normal' },  // nível no momento da compra
}, { timestamps: true })

// Gerar número de pedido
orderSchema.pre('save', async function (next) {
  if (!this.numero) {
    const ts   = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).substr(2, 4).toUpperCase()
    this.numero = `NO-${ts}-${rand}`
  }
  next()
})

// ══════════════════════════════════════════════════════════════

// models/Cart.js
const cartItemSchema = new mongoose.Schema({
  produto:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  id:         String,           // id do produto (para busca rápida)
  nome:       String,
  imagem:     String,
  categoria:  String,
  preco:      Number,
  precoVip:   Number,
  precoElite: Number,
  qty:        { type: Number, default: 1, min: 1 },
})

const cartSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  itens:   [cartItemSchema],
}, { timestamps: true })

// ══════════════════════════════════════════════════════════════

// models/Wishlist.js
const wishlistSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  itens: [{
    produto:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    id:        String,
    nome:      String,
    imagem:    String,
    categoria: String,
    preco:     Number,
  }],
}, { timestamps: true })

module.exports = {
  Product:  mongoose.model('Product',  produtoSchema),
  Order:    mongoose.model('Order',    orderSchema),
  Cart:     mongoose.model('Cart',     cartSchema),
  Wishlist: mongoose.model('Wishlist', wishlistSchema),
}