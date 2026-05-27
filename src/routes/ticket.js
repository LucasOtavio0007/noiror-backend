import { Router } from 'express'
import { autenticar, adminOnly } from '../middleware/auth.js'
import {
  criarTicket,
  meusTickets,
  getTicket,
  adicionarResposta,
  atualizarStatus,
  listarTickets
} from '../controllers/ticketController.js'

const router = Router()

// Usuário comum
router.post('/', autenticar, criarTicket)
router.get('/meus', autenticar, meusTickets)
router.get('/:id', autenticar, getTicket)
router.post('/:id/resposta', autenticar, adicionarResposta)

// Admin
router.patch('/:id/status', autenticar, adminOnly, atualizarStatus)
router.get('/', autenticar, adminOnly, listarTickets)

export default router