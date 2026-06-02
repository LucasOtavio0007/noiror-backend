import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import {
  getProfile, updateProfile, changePassword,
  updateNotifications, toggle2FA,
  getSessions, revokeSession, listUsers,
  updateRole, deleteUser, getLog   // ← adicionar getLog
} from '../controllers/userController.js'

const router = Router()
router.use(protect)
router.get('/log', getLog)
router.get('/profile', getProfile)
router.patch('/profile', updateProfile)
router.patch('/password', changePassword)
router.patch('/notifications', updateNotifications)
router.patch('/2fa', toggle2FA)
router.get('/sessions', getSessions)
router.delete('/sessions/:id', revokeSession)
router.get('/', adminOnly, listUsers)
router.patch('/:id/role', adminOnly, updateRole)
router.delete('/:id', adminOnly, deleteUser)


export default router