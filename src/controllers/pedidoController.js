// ═══════════════════════════════════════════════════════════
//  NOIR & OR — PEDIDO CONTROLLER
//  Todas as operações de pedido + disparo de emails
// ═══════════════════════════════════════════════════════════
import Pedido from '../models/Pedido.js'
import {
  enviarConfirmacaoCompra,
  enviarPedidoACaminho,
} from '../services/emailService.js'

// ── helpers ──────────────────────────────────────────────────
const extrairContato = (pedido) => ({
  email: pedido.usuario?.email || pedido.cliente?.email || null,
  nome:  pedido.usuario?.nome  || pedido.cliente?.nome  || 'Cliente',
})

// ═══════════════════════════════════════════════════════════
//  POST /api/pedidos  —  Criar pedido
// ═══════════════════════════════════════════════════════════
export const criarPedido = async (req, res) => {
  try {
    const { itens, total, pagamento, cliente, entrega } = req.body

    if (!itens?.length)  return res.status(400).json({ erro: 'Nenhum item no pedido.' })
    if (total === undefined) return res.status(400).json({ erro: 'Total obrigatório.' })

    const pedido = await Pedido.create({
      usuario: req.userId || null,
      itens,
      total,
      pagamento: pagamento || { metodo: 'cartao', status: 'pendente' },
      cliente:   cliente   || {},
      entrega:   entrega   || {},
    })

    return res.status(201).json(pedido)
  } catch (err) {
    console.error('[CRIAR PEDIDO]', err)
    return res.status(500).json({ erro: 'Erro ao criar pedido.' })
  }
}

// ═══════════════════════════════════════════════════════════
//  GET /api/pedidos/:id  —  Buscar pedido
// ═══════════════════════════════════════════════════════════
export const getPedido = async (req, res) => {
  try {
    const pedido = await Pedido
      .findById(req.params.id)
      .populate('usuario', 'nome email')

    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' })
    return res.json(pedido)
  } catch (err) {
    console.error('[GET PEDIDO]', err)
    return res.status(500).json({ erro: 'Erro ao buscar pedido.' })
  }
}

// ═══════════════════════════════════════════════════════════
//  GET /api/pedidos/meus  —  Pedidos do usuário logado
// ═══════════════════════════════════════════════════════════
export const meusPedidos = async (req, res) => {
  try {
    const { pagina = 1, limite = 20 } = req.query
    const skip = (Number(pagina) - 1) * Number(limite)

    const [pedidos, total] = await Promise.all([
      Pedido.find({ usuario: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limite))
        .select('-emailsEnviados'),
      Pedido.countDocuments({ usuario: req.userId }),
    ])

    return res.json({
      pedidos,
      total,
      pagina:      Number(pagina),
      totalPaginas: Math.ceil(total / Number(limite)),
    })
  } catch (err) {
    console.error('[MEUS PEDIDOS]', err)
    return res.status(500).json({ erro: 'Erro ao listar pedidos.' })
  }
}

// ═══════════════════════════════════════════════════════════
//  GET /api/pedidos  —  Listar todos (admin)
// ═══════════════════════════════════════════════════════════
export const listarPedidos = async (req, res) => {
  try {
    const { status, busca, pagina = 1, limite = 25 } = req.query
    const filtro = {}

    if (status) filtro.status = status
    if (busca) {
      const re = new RegExp(busca, 'i')
      filtro.$or = [
        { numero: re },
        { 'cliente.nome': re },
        { 'cliente.email': re },
      ]
    }

    const skip = (Number(pagina) - 1) * Number(limite)

    const [pedidos, total] = await Promise.all([
      Pedido.find(filtro)
        .populate('usuario', 'nome email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limite)),
      Pedido.countDocuments(filtro),
    ])

    return res.json({
      pedidos,
      total,
      pagina:       Number(pagina),
      totalPaginas: Math.ceil(total / Number(limite)),
    })
  } catch (err) {
    console.error('[LISTAR PEDIDOS]', err)
    return res.status(500).json({ erro: 'Erro ao listar pedidos.' })
  }
}

// ═══════════════════════════════════════════════════════════
//  PATCH /api/pedidos/:id/confirmar
//  Chamado pelo webhook do gateway (MP, Stripe, etc.)
//  Marca pagamento como aprovado + dispara email de compra
// ═══════════════════════════════════════════════════════════
export const confirmarPagamento = async (req, res) => {
  try {
    const pedido = await Pedido
      .findById(req.params.id)
      .populate('usuario', 'nome email')

    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' })

    // Idempotência — ignora se já confirmado
    if (pedido.emailsEnviados.confirmacao) {
      return res.json({ mensagem: 'Confirmação já processada.', pedido })
    }

    pedido.status           = 'aprovado'
    pedido.pagamento.status = 'aprovado'
    pedido.emailsEnviados.confirmacao = true
    await pedido.save()

    // Disparar email
    const { email, nome } = extrairContato(pedido)
    if (email) {
      enviarConfirmacaoCompra({
        nome, email,
        pedido: {
          numero:         pedido.numero,
          data:           pedido.createdAt,
          itens:          pedido.itens,
          subtotal:       pedido.total,
          total:          pedido.total,
          endereco:       pedido.entrega,
          formaPagamento: pedido.pagamento.metodo,
        },
      }).catch(e => console.error('[EMAIL CONFIRMACAO]', e.message))
    }

    return res.json({ mensagem: 'Pagamento confirmado.', pedido })
  } catch (err) {
    console.error('[CONFIRMAR PAGAMENTO]', err)
    return res.status(500).json({ erro: 'Erro ao confirmar pagamento.' })
  }
}

// ═══════════════════════════════════════════════════════════
//  PATCH /api/pedidos/:id/status  (admin)
//  Transições:
//    aprovado   → em-preparo
//    em-preparo → despachado  ← dispara email de envio
//    despachado → entregue
//    qualquer   → rejeitado / cancelado
// ═══════════════════════════════════════════════════════════
export const atualizarStatusPedido = async (req, res) => {
  try {
    const {
      status,
      codigoRastreamento,
      transportadora,
      urlRastreamento,
      prazoEntrega,
    } = req.body

    const permitidos = ['em-preparo', 'despachado', 'entregue', 'rejeitado', 'cancelado']
    if (!permitidos.includes(status)) {
      return res.status(400).json({
        erro: `Status inválido. Permitidos: ${permitidos.join(', ')}`,
      })
    }

    const pedido = await Pedido
      .findById(req.params.id)
      .populate('usuario', 'nome email')

    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' })

    pedido.status = status

    // ── Despachado: preencher rastreamento + enviar email ──
    if (status === 'despachado') {
      if (codigoRastreamento) {
        pedido.rastreamento = {
          codigo:         codigoRastreamento.trim().toUpperCase(),
          transportadora: transportadora || 'Correios',
          url:            urlRastreamento || '',
        }
      }
      if (prazoEntrega) {
        pedido.prazoEntrega = prazoEntrega
      }

      // Enviar email apenas uma vez
      if (!pedido.emailsEnviados.despachado) {
        pedido.emailsEnviados.despachado = true

        const { email, nome } = extrairContato(pedido)
        if (email) {
          enviarPedidoACaminho({
            nome, email,
            pedido: {
              numero:       pedido.numero,
              rastreamento: pedido.rastreamento,
              prazoEntrega: pedido.prazoEntrega || '2 a 5 dias úteis',
            },
          }).catch(e => console.error('[EMAIL DESPACHADO]', e.message))
        }
      }
    }

    await pedido.save()

    return res.json({
      mensagem: `Status atualizado para "${status}".`,
      pedido,
    })
  } catch (err) {
    console.error('[ATUALIZAR STATUS]', err)
    return res.status(500).json({ erro: 'Erro ao atualizar status.' })
  }
}

// ═══════════════════════════════════════════════════════════
//  POST /api/pedidos/:id/solicitar-cancelamento
// ═══════════════════════════════════════════════════════════
export const solicitarCancelamento = async (req, res) => {
  try {
    const { motivo } = req.body

    const pedido = await Pedido.findOne({
      _id:     req.params.id,
      usuario: req.userId,
    })

    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' })

    const cancelaveis = ['pendente', 'aprovado', 'em-preparo']
    if (!cancelaveis.includes(pedido.status)) {
      return res.status(400).json({
        erro: 'Este pedido não pode ser cancelado nesta etapa.',
      })
    }

    if (pedido.solicitacaoCancelamento?.solicitado) {
      return res.status(400).json({ erro: 'Cancelamento já solicitado. Aguarde análise.' })
    }

    pedido.solicitacaoCancelamento = {
      solicitado:      true,
      motivo:          (motivo || '').trim(),
      dataSolicitacao: new Date(),
      status:          'pendente',
      observacaoAdmin: '',
    }

    await pedido.save()

    return res.json({
      mensagem: 'Solicitação registrada. Nossa equipe entrará em contato em até 24h.',
    })
  } catch (err) {
    console.error('[SOLICITAR CANCELAMENTO]', err)
    return res.status(500).json({ erro: 'Erro ao solicitar cancelamento.' })
  }
}

// ═══════════════════════════════════════════════════════════
//  PATCH /api/pedidos/:id/processar-cancelamento  (admin)
//  decisao: 'aprovado' | 'recusado'
// ═══════════════════════════════════════════════════════════
export const processarCancelamento = async (req, res) => {
  try {
    const { decisao, observacao } = req.body

    if (!['aprovado', 'recusado'].includes(decisao)) {
      return res.status(400).json({ erro: 'Decisão inválida. Use: aprovado ou recusado.' })
    }

    const pedido = await Pedido.findById(req.params.id)
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' })

    if (!pedido.solicitacaoCancelamento?.solicitado) {
      return res.status(400).json({ erro: 'Nenhuma solicitação de cancelamento pendente.' })
    }

    pedido.solicitacaoCancelamento.status          = decisao
    pedido.solicitacaoCancelamento.observacaoAdmin = (observacao || '').trim()

    if (decisao === 'aprovado') {
      pedido.status = 'cancelado'
    }

    await pedido.save()

    return res.json({
      mensagem: `Cancelamento ${decisao === 'aprovado' ? 'aprovado' : 'recusado'} com sucesso.`,
      pedido,
    })
  } catch (err) {
    console.error('[PROCESSAR CANCELAMENTO]', err)
    return res.status(500).json({ erro: 'Erro ao processar cancelamento.' })
  }
}