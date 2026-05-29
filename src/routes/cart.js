import { Router } from 'express'
import { autenticar } from '../middleware/auth.js'
import Cart from '../models/Cart.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.json({ items: [] })
    
    const jwt = await import('jsonwebtoken')
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET)
    const cart = await Cart.findOne({ usuario: decoded.id }) || { itens: [] }
    res.json({ items: cart.itens })
  } catch {
    res.json({ items: [] })
  }
})

router.put('/', autenticar, async (req, res) => {
  const { items = [] } = req.body
  const cart = await Cart.findOneAndUpdate(
    { usuario: req.user._id },
    { usuario: req.user._id, itens: items.map(i => ({ ...i, produto: i._id || i.id })) },
    { upsert: true, new: true }
  )
  res.json({ items: cart.itens })
})

export default router