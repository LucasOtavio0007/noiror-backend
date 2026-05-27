const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
  tenant:   { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tipo:     { type: String, enum: ['auth', 'produto', 'pedido', 'admin', 'billing', 'error', 'security'], required: true },
  acao:     { type: String, required: true },
  detalhe:  { type: mongoose.Schema.Types.Mixed },
  ip:       { type: String },
  userAgent:{ type: String },
  nivel:    { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
  criadoEm: { type: Date, default: Date.now, expires: '90d' }, // TTL 90 dias
})

logSchema.index({ tenant: 1, criadoEm: -1 })
logSchema.index({ tipo: 1 })

module.exports = mongoose.model('Log', logSchema)