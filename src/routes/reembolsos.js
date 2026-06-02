import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import Pedido from '../models/Pedido.js'

const router = Router()

// GET /api/reembolsos/meus — pedidos cancelados do usuário logado
router.get('/meus', protect, async (req, res) => {
  try {
    const pedidos = await Pedido.find({
      cliente: req.user._id,
      $or: [
        { status: 'cancelado' },
        { 'solicitacaoCancelamento.solicitado': true }
      ]
    })
    .sort({ criadoEm: -1 })
    .populate('cliente', 'nome email')

    res.json({ reembolsos: pedidos })
  } catch (err) {
    console.error('Erro ao buscar reembolsos:', err)
    res.status(500).json({ msg: 'Erro interno.' })
  }
})

// GET /api/reembolsos — todos os reembolsos (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const pedidos = await Pedido.find({
      $or: [
        { status: 'cancelado' },
        { 'solicitacaoCancelamento.solicitado': true }
      ]
    })
    .sort({ criadoEm: -1 })
    .populate('cliente', 'nome email')

    res.json({ reembolsos: pedidos })
  } catch (err) {
    console.error('Erro ao listar reembolsos:', err)
    res.status(500).json({ msg: 'Erro interno.' })
  }
})

export default router