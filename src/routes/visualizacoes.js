import { Router } from 'express'
import { registrarVisualizacao } from '../controllers/visualizacaoController.js'
import { autenticar } from '../middleware/auth.js'

const router = Router()

// Rota para registrar visualização (pode ser autenticada ou não)
router.post('/', autenticar, registrarVisualizacao)

export default router