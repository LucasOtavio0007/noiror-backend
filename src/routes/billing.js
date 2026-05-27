import { Router } from 'express'
import { autenticar } from '../middleware/auth.js'

const router = Router()

// Planos disponíveis
router.get('/planos', (req, res) => {
  res.json({
    planos: [
      { id: 'free', nome: 'Free', valor: 0, desc: 'Para começar', features: ['10 produtos', '3 usuários'] },
      { id: 'pro', nome: 'Pro', valor: 9900, desc: 'Para lojas em crescimento', features: ['100 produtos', '10 usuários'], destaque: true },
      { id: 'enterprise', nome: 'Enterprise', valor: 29900, desc: 'Para grandes operações', features: ['Produtos ilimitados', 'Usuários ilimitados'] },
    ]
  })
})

// Status da assinatura (mock)
router.get('/status', autenticar, (req, res) => {
  res.json({ plano: 'free', status: 'active', limites: { produtos: 10, usuarios: 3 } })
})

export default router