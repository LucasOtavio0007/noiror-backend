import { Router } from 'express'
import { autenticar } from '../middleware/auth.js'
import Cart from '../models/Cart.js'

const router = Router()
router.use(autenticar)

router.get('/', async (req, res) => {
  const cart = await Cart.findOne({ usuario: req.user._id }) || { itens: [] }
  res.json({ items: cart.itens })
})

router.put('/', async (req, res) => {
  const { items = [] } = req.body
  const cart = await Cart.findOneAndUpdate(
    { usuario: req.user._id },
    { usuario: req.user._id, itens: items.map(i => ({ ...i, produto: i._id || i.id })) },
    { upsert: true, new: true }
  )
  res.json({ items: cart.itens })
})

export default router