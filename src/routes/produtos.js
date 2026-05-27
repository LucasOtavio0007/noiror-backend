import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import {
  listarProdutos, getProduto, criarProduto,
  atualizarProduto, deletarProduto, seedProdutos
} from '../controllers/produtosController.js'

const router = Router()

router.get('/', listarProdutos)
router.get('/:id', getProduto)
router.post('/seed', protect, adminOnly, seedProdutos)
router.post('/', protect, adminOnly, criarProduto)
router.patch('/:id', protect, adminOnly, atualizarProduto)
router.delete('/:id', protect, adminOnly, deletarProduto)

export default router