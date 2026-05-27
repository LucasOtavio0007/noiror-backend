import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import {
  criarPedido,
  getPedido,
  confirmarPagamento,
  meusPedidos,
  listarPedidos,
  atualizarStatusPedido,   // ✅ NOVO
  solicitarCancelamento,
  processarCancelamento
} from '../controllers/pedidoController.js'

const router = Router()

router.post('/',     protect, criarPedido)
router.get('/meus',  protect, meusPedidos)
router.get('/',      protect, adminOnly, listarPedidos)
router.get('/:id',   getPedido)

router.patch('/:id/confirmar',             confirmarPagamento)
router.patch('/:id/status',                protect, adminOnly, atualizarStatusPedido)        // ✅ NOVO
router.post('/:id/solicitar-cancelamento', protect, solicitarCancelamento)
router.patch('/:id/processar-cancelamento',protect, adminOnly, processarCancelamento)

export default router