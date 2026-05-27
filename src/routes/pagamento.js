import { Router } from 'express'
import express from 'express'  // ← necessário para express.raw
import { autenticar } from '../middleware/auth.js'
import { criarPagamentoMercadoPago } from '../controllers/pagamentoController.js'
import { processarWebhook } from '../services/mercadopagoService.js'

const router = Router()

router.post('/mp/criar-preferencia', autenticar, criarPagamentoMercadoPago)
router.post('/mp/webhook', express.raw({ type: 'application/json' }), processarWebhook)

export default router