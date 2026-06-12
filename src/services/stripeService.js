const Stripe = require('stripe')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const Tenant       = require('../models/Tenant')
const Subscription = require('../models/Subscription')

// ─── PLANOS STRIPE ───────────────────────────────────────────
const PLANOS = {
  pro: {
    priceId:  process.env.STRIPE_PRICE_PRO,   // ex: price_xxx
    nome:     'Pro',
    valor:    9900,   // R$ 99,00
    moeda:    'brl',
    limites:  { produtos: 100, usuarios: 10, pedidos: 1000, storage: 5000 },
  },
  enterprise: {
    priceId:  process.env.STRIPE_PRICE_ENTERPRISE,
    nome:     'Enterprise',
    valor:    29900,  // R$ 299,00
    moeda:    'brl',
    limites:  { produtos: 9999, usuarios: 9999, pedidos: 9999, storage: 50000 },
  },
}

// ─── Criar customer no Stripe ─────────────────────────────────
const criarCustomer = async (tenant) => {
  const customer = await stripe.customers.create({
    name:     tenant.nome,
    email:    tenant.email,
    metadata: { tenantId: tenant._id.toString(), slug: tenant.slug },
  })
  await Tenant.findByIdAndUpdate(tenant._id, { 'stripe.customerId': customer.id })
  return customer
}

// ─── Criar sessão de checkout ─────────────────────────────────
const criarCheckout = async (tenantId, plano, successUrl, cancelUrl) => {
  const tenant = await Tenant.findById(tenantId)
  if (!tenant) throw new Error('Tenant não encontrado.')

  let customerId = tenant.stripe?.customerId
  if (!customerId) {
    const customer = await criarCustomer(tenant)
    customerId = customer.id
  }

  const planoConfig = PLANOS[plano]
  if (!planoConfig) throw new Error('Plano inválido.')

  const session = await stripe.checkout.sessions.create({
    customer:    customerId,
    mode:        'subscription',
    line_items:  [{ price: planoConfig.priceId, quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  cancelUrl,
    metadata:    { tenantId: tenantId.toString(), plano },
    locale:      'pt-BR',
    payment_method_types: ['card'],
  })
  return session
}

// ─── Criar portal de billing ──────────────────────────────────
const criarPortal = async (tenantId, returnUrl) => {
  const tenant = await Tenant.findById(tenantId)
  if (!tenant?.stripe?.customerId) throw new Error('Customer não encontrado.')

  const session = await stripe.billingPortal.sessions.create({
    customer:   tenant.stripe.customerId,
    return_url: returnUrl,
  })
  return session
}

// ─── Processar webhook ────────────────────────────────────────
const processarWebhook = async (payload, sig) => {
  const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET)

  switch (event.type) {

    case 'checkout.session.completed': {
      const session  = event.data.object
      const tenantId = session.metadata.tenantId
      const plano    = session.metadata.plano
      const planoConfig = PLANOS[plano]

      await Tenant.findByIdAndUpdate(tenantId, {
        plano,
        'stripe.subscriptionId': session.subscription,
        'stripe.customerId':     session.customer,
        'trial.ativo':           false,
        limites:                 planoConfig.limites,
      })

      await Subscription.findOneAndUpdate(
        { tenant: tenantId },
        { tenant: tenantId, plano, status: 'active', 'stripe.subscriptionId': session.subscription, 'stripe.customerId': session.customer, 'stripe.priceId': planoConfig.priceId },
        { upsert: true }
      )
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const tenant = await Tenant.findOne({ 'stripe.subscriptionId': sub.id })
      if (tenant) {
        await Tenant.findByIdAndUpdate(tenant._id, {
          plano:   'free',
          limites: { produtos: 10, usuarios: 3, pedidos: 100, storage: 500 },
        })
        await Subscription.findOneAndUpdate({ tenant: tenant._id }, { status: 'canceled', canceladoEm: new Date() })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const tenant  = await Tenant.findOne({ 'stripe.customerId': invoice.customer })
      if (tenant) await Subscription.findOneAndUpdate({ tenant: tenant._id }, { status: 'past_due' })
      break
    }

    case 'customer.subscription.updated': {
      const sub    = event.data.object
      const tenant = await Tenant.findOne({ 'stripe.subscriptionId': sub.id })
      if (tenant) await Subscription.findOneAndUpdate({ tenant: tenant._id }, { status: sub.status })
      break
    }
  }

  return event
}

// ─── Cancelar assinatura ──────────────────────────────────────
const cancelarAssinatura = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId)
  if (!tenant?.stripe?.subscriptionId) throw new Error('Assinatura não encontrada.')

  await stripe.subscriptions.update(tenant.stripe.subscriptionId, { cancel_at_period_end: true })
  await Subscription.findOneAndUpdate({ tenant: tenantId }, { status: 'canceled' })
  return { msg: 'Assinatura será cancelada ao fim do período.' }
}

module.exports = { criarCustomer, criarCheckout, criarPortal, processarWebhook, cancelarAssinatura, PLANOS }