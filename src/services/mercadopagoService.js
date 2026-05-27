import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import 'dotenv/config'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
})

export const criarPreferencia = async (pedidoData) => {
  const { itens, cliente, idExterno, pagamento } = pedidoData

  const items = itens.map(item => ({
    title: item.nome,
    quantity: item.qty,
    unit_price: item.preco,
    currency_id: 'BRL',
  }))

  const preferenceData = {
    items,
    payer: {
      name: cliente.nome,
      email: cliente.email,
      phone: { number: cliente.telefone },
      identification: { type: 'CPF', number: cliente.cpf }
    },
    external_reference: idExterno,
    back_urls: {
      success: `${process.env.FRONTEND_URL}/pedido/${idExterno}`,
      failure: `${process.env.FRONTEND_URL}/checkout`,
      pending: `${process.env.FRONTEND_URL}/pedido/${idExterno}`
    },
    auto_return: 'approved',
    notification_url: `${process.env.BACKEND_URL}/api/pagamento/mp/webhook`,
    payment_methods: {
      excluded_payment_methods: [],
      installments: pagamento?.parcelas || 12,
      default_installments: 1
    },
    statement_descriptor: 'NOIR & OR ATELIER',
    expires: false,
  }

  if (pagamento?.metodo === 'pix') {
    preferenceData.payment_methods = { excluded_payment_methods: [], installments: 1 }
    preferenceData.payment_method_id = 'pix'
  } else if (pagamento?.metodo === 'boleto') {
    preferenceData.payment_methods = { excluded_payment_methods: [], installments: 1 }
    preferenceData.payment_method_id = 'bolbradesco'
  } else if (pagamento?.metodo === 'cartao') {
    preferenceData.payment_methods = {
      excluded_payment_methods: [],
      installments: pagamento.parcelas || 1
    }
  }

  const preference = new Preference(client)
  const response = await preference.create({ body: preferenceData })
  return response
}

export const processarWebhook = async (req, res) => {
  const { type, data, id } = req.body
  if (type === 'payment') {
    try {
      const payment = new Payment(client)
      const paymentData = await payment.get({ id })
      const { status, external_reference } = paymentData
      const Pedido = (await import('../models/Pedido.js')).default
      const pedido = await Pedido.findById(external_reference)
      if (pedido) {
        pedido.status = (status === 'approved') ? 'aprovado' : (status === 'pending') ? 'pendente' : 'rejeitado'
        pedido.pagamento.status = pedido.status
        pedido.pagamento.id = id
        if (paymentData.point_of_interaction?.transaction_data?.qr_code) {
          pedido.pagamento.pixCopia = paymentData.point_of_interaction.transaction_data.qr_code
        }
        if (paymentData.boleto_url) {
          pedido.pagamento.boleto = paymentData.boleto_url
        }
        await pedido.save()
      }
    } catch (err) {
      console.error('Webhook error:', err)
    }
  }
  res.status(200).json({ received: true })
}