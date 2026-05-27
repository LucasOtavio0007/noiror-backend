const mongoose = require('mongoose')

const tenantSchema = new mongoose.Schema({
  nome:       { type: String, required: true },
  slug:       { type: String, required: true, unique: true, lowercase: true },
  dominio:    { type: String },
  email:      { type: String, required: true },
  logo:       { type: String },
  ativo:      { type: Boolean, default: true },
  plano:      { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  limites: {
    produtos:  { type: Number, default: 10 },
    usuarios:  { type: Number, default: 3 },
    pedidos:   { type: Number, default: 100 },
    storage:   { type: Number, default: 500 }, // MB
  },
  config: {
    tema:         { type: String, default: 'escuro' },
    corPrimaria:  { type: String, default: '#D4AF37' },
    fonte:        { type: String, default: 'Syne' },
  },
  stripe: {
    customerId:      { type: String },
    subscriptionId:  { type: String },
    priceId:         { type: String },
  },
  trial: {
    ativo:   { type: Boolean, default: true },
    expira:  { type: Date,    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
  },
  criadoEm: { type: Date, default: Date.now },
}, { timestamps: true })

tenantSchema.index({ slug: 1 })
tenantSchema.index({ 'stripe.customerId': 1 })

module.exports = mongoose.model('Tenant', tenantSchema)