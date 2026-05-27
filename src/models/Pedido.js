import mongoose from 'mongoose'

const PedidoSchema = new mongoose.Schema({
  usuario:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  itens: [{
    produto:  { type: mongoose.Schema.Types.ObjectId, ref: 'Produto' },
    nome:     String,
    preco:    Number,
    qty:      Number,
    imagem:   String,
  }],
  total:      { type: Number, required: true },
  status: {
    type:    String,
    enum:    ['pendente', 'aprovado', 'em-preparo', 'despachado', 'entregue', 'rejeitado', 'cancelado'],
    default: 'pendente',
  },
  pagamento: {
    metodo:   { type: String, enum: ['pix', 'cartao', 'boleto'] },
    status:   { type: String, default: 'pendente' },
    id:       { type: String, default: null },
    pixCopia: { type: String, default: null },
    boleto:   { type: String, default: null },
  },
  cliente: {
    nome:     String,
    email:    String,
    cpf:      String,
    telefone: String,
  },
  entrega: {
    cep:         String,
    endereco:    String,
    numero:      String,
    complemento: String,
    bairro:      String,
    cidade:      String,
    estado:      String,
  },
  localizacao: {
    lat:  { type: Number, default: null },
    lng:  { type: Number, default: null },
  },

  // ── Número de pedido legível (ex: NO-20250115-4821) ──────
  numero: {
    type:   String,
    unique: true,
    sparse: true,
  },

  // ── Rastreamento (preenchido quando admin despacha) ───────
  rastreamento: {
    codigo:         { type: String, default: null },
    transportadora: { type: String, default: null },
    url:            { type: String, default: null },
  },
  prazoEntrega: { type: String, default: null },

  // ── Controle de emails (evita reenvio acidental) ─────────
  emailsEnviados: {
    confirmacao: { type: Boolean, default: false },
    despachado:  { type: Boolean, default: false },
  },

  // ── Solicitação de cancelamento/reembolso ─────────────────
  solicitacaoCancelamento: {
    solicitado:      { type: Boolean, default: false },
    motivo:          { type: String,  default: '' },
    dataSolicitacao: { type: Date,    default: null },
    status:          { type: String,  enum: ['pendente', 'aprovado', 'recusado'], default: null },
    observacaoAdmin: { type: String,  default: '' },
  },
}, { timestamps: true })

// ── Gerar número legível antes de salvar ──────────────────
PedidoSchema.pre('save', async function (next) {
  if (!this.numero) {
    const dataStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const rand    = Math.floor(1000 + Math.random() * 9000)
    this.numero   = `NO-${dataStr}-${rand}`
  }
  next()
})

export default mongoose.model('Pedido', PedidoSchema)