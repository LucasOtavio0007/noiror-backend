import { Router } from 'express'
import { getRecomendacoes } from '../controllers/recomendacaoController.js'

const router = Router()

router.get('/:produtoId', getRecomendacoes)

export default router