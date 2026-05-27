import { Router } from 'express'
import { enviarMensagemIA } from '../controllers/chatController.js'

const router = Router()

router.post('/', enviarMensagemIA)

export default router