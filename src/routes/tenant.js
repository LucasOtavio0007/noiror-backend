import { Router } from 'express'
import { autenticar } from '../middleware/auth.js'

const router = Router()

// Rotas básicas de tenant (mock)
router.get('/me', autenticar, (req, res) => {
  res.json({ tenant: { id: 'default', nome: 'Noir & Or', slug: 'noiror' } })
})

export default router