import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function autenticar(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, msg: 'Token não fornecido.' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('[AUTH] decoded:', decoded)
    const user = await User.findById(decoded.id).select('-senha')
    console.log('[AUTH] user:', user?._id, 'ativo:', user?.ativo)
    if (!user || !user.ativo) {
      return res.status(401).json({ ok: false, msg: 'Usuário inválido ou inativo.' })
    }
    req.user   = user
    req.userId = user._id
    next()
  } catch (err) {
    console.log('[AUTH] erro:', err.message)
    return res.status(401).json({ ok: false, msg: 'Token inválido ou expirado.' })
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ ok: false, msg: 'Acesso negado. Administrador necessário.' })
  }
  next()
}

export const protect = autenticar
export const soAdmin = adminOnly