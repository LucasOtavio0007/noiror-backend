// ═══════════════════════════════════════════════════════════
//  NOIR & OR — ROTAS DE AUTH + PEDIDOS
//  Express Router
// ═══════════════════════════════════════════════════════════
import express        from 'express'
import bcrypt         from 'bcryptjs'
import jwt            from 'jsonwebtoken'
import User           from '../models/User.js'           // seu model existente
import Token          from '../models/Token.js'
import Pedido         from '../models/Pedido.js'
import { autenticar } from '../middlewares/auth.js'       // seu middleware existente
import {
  enviarConfirmacaoCadastro,
  enviarConfirmacaoCompra,
  enviarPedidoACaminho,
  enviarRedefinicaoSenha,
} from '../services/emailService.js'

const router = express.Router()
const SITE   = process.env.SITE_URL || 'https://seudominio.com.br'

// ── helpers ──────────────────────────────────────────────
const gerarJWT = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// ═══════════════════════════════════════════════════════════
//  AUTH — CADASTRO
//  POST /api/auth/cadastro
// ═══════════════════════════════════════════════════════════
router.post('/auth/cadastro', async (req, res) => {
  try {
    const { nome, sobrenome, email, senha } = req.body

    // Validações básicas
    if (!nome?.trim())              return res.status(400).json({ erro: 'Nome obrigatório.' })
    if (!email?.includes('@'))      return res.status(400).json({ erro: 'E-mail inválido.' })
    if (!senha || senha.length < 8) return res.status(400).json({ erro: 'Senha com mínimo 8 caracteres.' })

    // Checar duplicata
    const existe = await User.findOne({ email: email.toLowerCase() })
    if (existe) return res.status(409).json({ erro: 'E-mail já cadastrado.' })

    // Criar usuário com email NÃO confirmado
    const hash    = await bcrypt.hash(senha, 12)
    const usuario = await User.create({
      nome:         nome.trim(),
      sobrenome:    sobrenome?.trim() || '',
      email:        email.toLowerCase(),
      senha:        hash,
      emailVerificado: false,
    })

    // Gerar token de confirmação (24h)
    const tokenStr = await Token.gerar(usuario._id, 'confirmacao-email', 24)
    const linkUrl  = `${SITE}/verificar-email?token=${tokenStr}`

    // Enviar email
    await enviarConfirmacaoCadastro({
      nome:     usuario.nome,
      email:    usuario.email,
      tokenUrl: linkUrl,
    })

    return res.status(201).json({
      mensagem: 'Conta criada. Verifique seu e-mail para confirmar o acesso.',
      // Retorna JWT provisório — frontend pode mostrar aviso de "confirme o email"
      token:    gerarJWT(usuario._id),
      usuario:  { id: usuario._id, nome: usuario.nome, email: usuario.email, emailVerificado: false },
    })
  } catch (err) {
    console.error('[CADASTRO]', err)
    return res.status(500).json({ erro: 'Erro interno. Tente novamente.' })
  }
})

// ═══════════════════════════════════════════════════════════
//  AUTH — CONFIRMAR EMAIL
//  GET /api/auth/confirmar-email?token=xxx
// ═══════════════════════════════════════════════════════════
router.get('/auth/confirmar-email', async (req, res) => {
  try {
    const { token } = req.query
    if (!token) return res.status(400).json({ erro: 'Token ausente.' })

    const userId = await Token.verificar(token, 'confirmacao-email')

    await User.findByIdAndUpdate(userId, { emailVerificado: true })

    // Redireciona para o site com sucesso
    return res.redirect(`${SITE}/login?verificado=1`)
  } catch (err) {
    console.error('[CONFIRMAR EMAIL]', err)
    return res.redirect(`${SITE}/login?erro=token-invalido`)
  }
})

// ═══════════════════════════════════════════════════════════
//  AUTH — REENVIAR CONFIRMAÇÃO
//  POST /api/auth/reenviar-confirmacao
// ═══════════════════════════════════════════════════════════
router.post('/auth/reenviar-confirmacao', autenticar, async (req, res) => {
  try {
    const usuario = await User.findById(req.userId)
    if (!usuario)               return res.status(404).json({ erro: 'Usuário não encontrado.' })
    if (usuario.emailVerificado) return res.status(400).json({ erro: 'E-mail já confirmado.' })

    const tokenStr = await Token.gerar(usuario._id, 'confirmacao-email', 24)
    await enviarConfirmacaoCadastro({
      nome:     usuario.nome,
      email:    usuario.email,
      tokenUrl: `${SITE}/verificar-email?token=${tokenStr}`,
    })

    return res.json({ mensagem: 'E-mail de confirmação reenviado.' })
  } catch (err) {
    console.error('[REENVIO CONFIRMACAO]', err)
    return res.status(500).json({ erro: 'Erro ao reenviar.' })
  }
})

// ═══════════════════════════════════════════════════════════
//  AUTH — SOLICITAR REDEFINIÇÃO DE SENHA
//  POST /api/auth/esqueci-senha
// ═══════════════════════════════════════════════════════════
router.post('/auth/esqueci-senha', async (req, res) => {
  try {
    const { email } = req.body
    if (!email?.includes('@')) return res.status(400).json({ erro: 'E-mail inválido.' })

    // Sempre responde 200 (não revela se o email existe)
    const usuario = await User.findOne({ email: email.toLowerCase() })
    if (usuario) {
      const tokenStr = await Token.gerar(usuario._id, 'redefinicao-senha', 1) // 1 hora
      await enviarRedefinicaoSenha({
        nome:      usuario.nome,
        email:     usuario.email,
        tokenUrl:  `${SITE}/redefinir-senha?token=${tokenStr}`,
        expiraEm:  '1 hora',
      })
    }

    return res.json({ mensagem: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.' })
  } catch (err) {
    console.error('[ESQUECI SENHA]', err)
    return res.status(500).json({ erro: 'Erro interno.' })
  }
})

// ═══════════════════════════════════════════════════════════
//  AUTH — REDEFINIR SENHA
//  POST /api/auth/redefinir-senha
// ═══════════════════════════════════════════════════════════
router.post('/auth/redefinir-senha', async (req, res) => {
  try {
    const { token, novaSenha } = req.body
    if (!token)                       return res.status(400).json({ erro: 'Token obrigatório.' })
    if (!novaSenha || novaSenha.length < 8)
      return res.status(400).json({ erro: 'Nova senha com mínimo 8 caracteres.' })

    const userId = await Token.verificar(token, 'redefinicao-senha')
    const hash   = await bcrypt.hash(novaSenha, 12)

    await User.findByIdAndUpdate(userId, { senha: hash })

    return res.json({ mensagem: 'Senha redefinida com sucesso. Faça login novamente.' })
  } catch (err) {
    console.error('[REDEFINIR SENHA]', err)
    const msg = err.message.includes('Token') ? err.message : 'Erro interno.'
    return res.status(400).json({ erro: msg })
  }
})

// ═══════════════════════════════════════════════════════════
//  PEDIDOS — CONFIRMAR COMPRA (chamado após pagamento aprovado)
//  POST /api/pedidos/:id/confirmar
// ═══════════════════════════════════════════════════════════
router.post('/pedidos/:id/confirmar', autenticar, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).populate('userId', 'nome email')
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' })

    // Evitar reenvio
    if (pedido.emailsEnviados?.confirmacao) {
      return res.json({ mensagem: 'Email de confirmação já enviado.' })
    }

    pedido.status = 'confirmado'
    pedido.emailsEnviados.confirmacao = true
    await pedido.save()

    const usuario = pedido.userId
    await enviarConfirmacaoCompra({
      nome:   usuario.nome,
      email:  usuario.email,
      pedido: {
        numero:         pedido.numero,
        data:           pedido.data,
        itens:          pedido.itens,
        subtotal:       pedido.subtotal,
        total:          pedido.total,
        endereco:       pedido.endereco,
        formaPagamento: pedido.formaPagamento,
      },
    })

    return res.json({ mensagem: 'Pedido confirmado e email enviado.' })
  } catch (err) {
    console.error('[CONFIRMAR PEDIDO]', err)
    return res.status(500).json({ erro: 'Erro ao confirmar pedido.' })
  }
})

// ═══════════════════════════════════════════════════════════
//  PEDIDOS — MARCAR COMO DESPACHADO (painel admin)
//  POST /api/pedidos/:id/despachar
// ═══════════════════════════════════════════════════════════
router.post('/pedidos/:id/despachar', autenticar, async (req, res) => {
  try {
    // Verificar se é admin — adapte ao seu middleware
    if (!req.isAdmin) return res.status(403).json({ erro: 'Acesso negado.' })

    const { codigoRastreamento, transportadora, urlRastreamento, prazoEntrega } = req.body

    const pedido = await Pedido.findById(req.params.id).populate('userId', 'nome email')
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' })

    if (pedido.emailsEnviados?.despachado) {
      return res.json({ mensagem: 'Email de despacho já enviado.' })
    }

    // Atualizar pedido
    pedido.status = 'despachado'
    pedido.prazoEntrega = prazoEntrega || '2 a 5 dias úteis'
    if (codigoRastreamento) {
      pedido.rastreamento = {
        codigo:          codigoRastreamento,
        transportadora:  transportadora || 'Correios',
        url:             urlRastreamento || '',
      }
    }
    pedido.emailsEnviados.despachado = true
    await pedido.save()

    const usuario = pedido.userId
    await enviarPedidoACaminho({
      nome:  usuario.nome,
      email: usuario.email,
      pedido: {
        numero:       pedido.numero,
        rastreamento: pedido.rastreamento,
        prazoEntrega: pedido.prazoEntrega,
      },
    })

    return res.json({ mensagem: 'Pedido marcado como despachado e email enviado.' })
  } catch (err) {
    console.error('[DESPACHAR PEDIDO]', err)
    return res.status(500).json({ erro: 'Erro ao despachar pedido.' })
  }
})

// ═══════════════════════════════════════════════════════════
//  WEBHOOK MERCADO PAGO — Pagamento aprovado
//  POST /api/webhooks/mercadopago
// ═══════════════════════════════════════════════════════════
router.post('/webhooks/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body

    // Mercado Pago envia type = 'payment'
    if (type !== 'payment') return res.sendStatus(200)

    // Buscar detalhes do pagamento na API do MP
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${data.id}`,
      { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
    )
    const pagamento = await mpRes.json()

    if (pagamento.status !== 'approved') return res.sendStatus(200)

    // Encontrar pedido pelo external_reference (você define isso na criação do pagamento MP)
    const pedidoId = pagamento.external_reference
    const pedido   = await Pedido.findById(pedidoId).populate('userId', 'nome email')

    if (!pedido || pedido.emailsEnviados?.confirmacao) return res.sendStatus(200)

    pedido.status = 'confirmado'
    pedido.emailsEnviados.confirmacao = true
    await pedido.save()

    await enviarConfirmacaoCompra({
      nome:  pedido.userId.nome,
      email: pedido.userId.email,
      pedido: {
        numero:         pedido.numero,
        data:           pedido.data,
        itens:          pedido.itens,
        subtotal:       pedido.subtotal,
        total:          pedido.total,
        endereco:       pedido.endereco,
        formaPagamento: `${pagamento.payment_method_id} · ${pagamento.installments}x`,
      },
    })

    return res.sendStatus(200)
  } catch (err) {
    console.error('[WEBHOOK MP]', err)
    return res.sendStatus(500)
  }
})

export default router