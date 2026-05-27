import { Router } from 'express'
import { autenticar } from '../middleware/auth.js'

const router = Router()

// Middleware de superadmin (mock – só admin mesmo)
const superAdmin = [autenticar, (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ msg: 'Acesso negado.' })
  next()
}]

router.get('/metricas', ...superAdmin, (req, res) => {
  res.json({ totalTenants: 1, totalUsers: 1, totalPedidos: 0 })
})

export default router