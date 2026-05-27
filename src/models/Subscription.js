const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
  tenant:     { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  plano:      { type: String, enum: ['free', 'pro', 'enterprise'], required: true },
  status:     { type: String, enum: ['active', 'trialing', 'past_due', 'canceled', 'incomplete'], default: 'trialing' },
  stripe: {
    subscriptionId: { type: String },
    customerId:     { type: String },
    priceId:        { type: String },
    invoiceId:      { type: String },
  },
  periodoAtual: {
    inicio: { type: Date },
    fim:    { type: Date },
  },
  canceladoEm:  { type: Date },
  criadoEm:     { type: Date, default: Date.now },
}, { timestamps: true })

subscriptionSchema.index({ tenant: 1 })
subscriptionSchema.index({ 'stripe.subscriptionId': 1 })

module.exports = mongoose.model('Subscription', subscriptionSchema)