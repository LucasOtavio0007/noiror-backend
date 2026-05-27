import Ticket from '../models/Ticket.js'
import User from '../models/User.js'
import { enviarEmailSuporte } from '../config/email.js'

// ─── POST /api/suporte/tickets ───────────────────────────────
export const criarTicket = async (req, res) => {
  try {
    const { assunto, mensagem, prioridade } = req.body
    if (!assunto || !mensagem) {
      return res.status(400).json({ ok: false, msg: 'Assunto e mensagem são obrigatórios.' })
    }

    const ticket = await Ticket.create({
      usuario: req.user._id,
      assunto,
      mensagem,
      prioridade: prioridade || 'media',
      respostas: [{
        usuario: req.user._id,
        mensagem
      }]
    })

    // Enviar e-mail de confirmação para o usuário
    await enviarEmailSuporte(req.user.email, req.user.nome, ticket._id, assunto, mensagem, 'novo')

    res.status(201).json({ ok: true, ticket })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

// ─── GET /api/suporte/tickets/meus ────────────────────────────
export const meusTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ usuario: req.user._id })
      .sort({ ultimaRespostaEm: -1 })
      .limit(50)
    res.json({ ok: true, tickets })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

// ─── GET /api/suporte/tickets/:id ─────────────────────────────
export const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, usuario: req.user._id })
    if (!ticket) return res.status(404).json({ ok: false, msg: 'Ticket não encontrado.' })
    res.json({ ok: true, ticket })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

// ─── POST /api/suporte/tickets/:id/resposta ───────────────────
export const adicionarResposta = async (req, res) => {
  try {
    const { mensagem } = req.body
    if (!mensagem) return res.status(400).json({ ok: false, msg: 'Mensagem obrigatória.' })

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) return res.status(404).json({ ok: false, msg: 'Ticket não encontrado.' })
    if (ticket.status === 'fechado') return res.status(400).json({ ok: false, msg: 'Ticket já foi fechado.' })

    ticket.respostas.push({
      usuario: req.user._id,
      mensagem
    })
    ticket.ultimaRespostaEm = Date.now()
    if (req.user.role !== 'admin') ticket.status = 'aberto' // reabre se cliente responder
    await ticket.save()

    // Notificar por e-mail se não for o próprio autor (ou se for admin respondendo)
    const usuarioTicket = await User.findById(ticket.usuario)
    if (req.user._id.toString() !== ticket.usuario.toString()) {
      await enviarEmailSuporte(usuarioTicket.email, usuarioTicket.nome, ticket._id, ticket.assunto, mensagem, 'resposta')
    }

    res.json({ ok: true, ticket })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

// ─── PATCH /api/suporte/tickets/:id/status (admin) ────────────
export const atualizarStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['aberto','em_andamento','respondido','fechado'].includes(status)) {
      return res.status(400).json({ ok: false, msg: 'Status inválido.' })
    }
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!ticket) return res.status(404).json({ ok: false, msg: 'Ticket não encontrado.' })
    res.json({ ok: true, ticket })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

// ─── GET /api/suporte/tickets (admin) ─────────────────────────
export const listarTickets = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const filtro = status ? { status } : {}
    const tickets = await Ticket.find(filtro)
      .sort({ ultimaRespostaEm: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('usuario', 'nome email')
      .populate('respostas.usuario', 'nome role')
    const total = await Ticket.countDocuments(filtro)
    res.json({ ok: true, tickets, total })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}