import { Router } from 'express'
import Cupom from '../models/Cupom.js' // ajusta o caminho do seu model

const router = Router()

// ── Listar todos ──
router.get('/', async (req, res) => {
  try {
    const cupons = await Cupom.find().sort({ criadoEm: -1 })
    res.json({ cupons })
  } catch (e) {
    res.status(500).json({ msg: 'Erro ao buscar cupons' })
  }
})

// ── Criar ──
router.post('/', async (req, res) => {
  try {
    const cupom = await Cupom.create(req.body)
    res.status(201).json({ cupom })
  } catch (e) {
    res.status(400).json({ msg: e.message })
  }
})

// ── Editar ──
router.patch('/:id', async (req, res) => {
  try {
    const cupom = await Cupom.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!cupom) return res.status(404).json({ msg: 'Cupom não encontrado' })
    res.json({ cupom })
  } catch (e) {
    res.status(400).json({ msg: e.message })
  }
})

// ── Deletar ──
router.delete('/:id', async (req, res) => {
  try {
    await Cupom.findByIdAndDelete(req.params.id)
    res.json({ msg: 'Cupom removido' })
  } catch (e) {
    res.status(500).json({ msg: 'Erro ao deletar' })
  }
})

// ── Validar (já existia) ──
router.post('/validar', async (req, res) => {
  try {
    const { codigo, total } = req.body
    const cupom = await Cupom.findOne({ codigo: codigo.toUpperCase(), ativo: true })

    if (!cupom) return res.status(404).json({ msg: 'Cupom inválido' })

    const agora = new Date()
    if (cupom.validoAte && new Date(cupom.validoAte) < agora)
      return res.status(400).json({ msg: 'Cupom expirado' })

    if (cupom.limiteTotal && cupom.usos >= cupom.limiteTotal)
      return res.status(400).json({ msg: 'Cupom esgotado' })

    if (cupom.minPedido && total < cupom.minPedido)
      return res.status(400).json({ msg: `Pedido mínimo de R$ ${cupom.minPedido}` })

    let desconto = 0
    if (cupom.tipo === 'pct')   desconto = (total * cupom.valor) / 100
    if (cupom.tipo === 'fixo')  desconto = cupom.valor
    if (cupom.tipo === 'frete') desconto = 0 // trata no frontend

    res.json({ desconto, cupom })
  } catch (e) {
    res.status(500).json({ msg: 'Erro ao validar cupom' })
  }
})

export default router