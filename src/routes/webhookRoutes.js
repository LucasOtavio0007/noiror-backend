// ═══════════════════════════════════════════════════════════
//  NOIR & OR — WEBHOOK MERCADO PAGO
//  POST /api/webhooks/mercadopago
//  Configure no painel MP: https://www.mercadopago.com.br/developers/panel/app
// ═══════════════════════════════════════════════════════════
import express from 'express'
import Pedido  from '../models/Pedido.js'
import { enviarConfirmacaoCompra } from '../services/emailService.js'

const router = express.Router()

router.post('/mercadopago', async (req, res) => {
  // Responder 200 imediatamente — MP espera resposta rápida
  res.sendStatus(200)

  try {
    const { type, data } = req.body

    // MP envia type = 'payment' para notificações de pagamento
    if (type !== 'payment' || !data?.id) return

    // Buscar detalhes do pagamento na API do MP
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${data.id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    )

    if (!mpRes.ok) {
      console.error('[WEBHOOK MP] Falha ao buscar pagamento:', mpRes.status)
      return
    }

    const pagamento = await mpRes.json()

    // Processar apenas pagamentos aprovados
    if (pagamento.status !== 'approved') return

    // Buscar pedido pelo external_reference (definido na criação do pagamento)
    const pedidoId = pagamento.external_reference
    if (!pedidoId) {
      console.warn('[WEBHOOK MP] external_reference ausente no pagamento', data.id)
      return
    }

    const pedido = await Pedido
      .findById(pedidoId)
      .populate('usuario', 'nome email')

    if (!pedido) {
      console.warn('[WEBHOOK MP] Pedido não encontrado:', pedidoId)
      return
    }

    // Idempotência
    if (pedido.emailsEnviados?.confirmacao) return

    const formaPagamento = [
      pagamento.payment_method_id,
      pagamento.installments > 1 ? `${pagamento.installments}x` : null,
    ].filter(Boolean).join(' · ')

    pedido.status                     = 'aprovado'
    pedido.pagamento.status           = 'aprovado'
    pedido.pagamento.id               = String(data.id)
    pedido.emailsEnviados.confirmacao = true
    await pedido.save()

    const email = pedido.usuario?.email || pedido.cliente?.email
    const nome  = pedido.usuario?.nome  || pedido.cliente?.nome || 'Cliente'

    if (email) {
      await enviarConfirmacaoCompra({
        nome, email,
        pedido: {
          numero:         pedido.numero,
          data:           pedido.createdAt,
          itens:          pedido.itens,
          subtotal:       pedido.total,
          total:          pedido.total,
          endereco:       pedido.entrega,
          formaPagamento,
        },
      })
    }

    console.log(`✓ [WEBHOOK MP] Pedido ${pedido.numero} confirmado`)
  } catch (err) {
    console.error('[WEBHOOK MP ERROR]', err.message)
  }
})

export default router