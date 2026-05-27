import { Router } from 'express'
import { getConfig, updateConfig } from '../controllers/configController.js'
import { autenticar } from '../middleware/auth.js'

const router = Router()

router.get('/', getConfig)
router.put('/', autenticar, updateConfig)

export default router