import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import { signAccess, signRefresh, verifyRefresh, setRefreshCookie, clearRefreshCookie } from '../config/jwt.js'
import { enviarEmailRecuperacao, enviarEmailBoasVindas } from '../config/email.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const issueTokens = async (user, res) => {
  const access  = signAccess(user._id, user.role)
  const refresh = signRefresh(user._id)
  user.refreshTokens.push({ token: refresh })
  if (user.refreshTokens.length > 5) user.refreshTokens.shift()
  await user.save({ validateBeforeSave: false })
  setRefreshCookie(res, refresh)
  return access
}

// ─── REGISTER ───────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { nome, sobrenome, email, senha, password } = req.body
    const senhaFinal = senha || password

    if (!nome || !email || !senhaFinal)
      return res.status(400).json({ ok: false, msg: 'Preencha todos os campos obrigatórios.' })
    if (senhaFinal.length < 8)
      return res.status(400).json({ ok: false, msg: 'Senha deve ter no mínimo 8 caracteres.' })

    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists)
      return res.status(409).json({ ok: false, msg: 'E-mail já cadastrado.' })

    const hashed = await bcrypt.hash(senhaFinal, 12)
    const user = await User.create({ nome, sobrenome: sobrenome || '', email, senha: hashed })

    const access = await issueTokens(user, res)
    try { await enviarEmailBoasVindas(user.email, user.nome) } catch (e) { console.log('Email boas-vindas falhou:', e.message) }

    // FIX: retorna 'token' em vez de 'accessToken' para o frontend consumir corretamente
    res.status(201).json({ ok: true, token: access, user: user.toPublic() })
  } catch (err) {
    console.error('Erro no register:', err)
    res.status(500).json({ ok: false, msg: 'Erro interno.', detail: err.message })
  }
}

// ─── LOGIN ──────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, senha, password } = req.body
    const senhaFinal = senha || password

    if (!email || !senhaFinal)
      return res.status(400).json({ ok: false, msg: 'E-mail e senha são obrigatórios.' })

    const user = await User.findOne({ email: email.toLowerCase() }).select('+senha')
    if (!user || !(await bcrypt.compare(senhaFinal, user.senha || '')))
      return res.status(401).json({ ok: false, msg: 'Credenciais inválidas.' })

    const access = await issueTokens(user, res)

    // FIX: retorna 'token' em vez de 'accessToken'
    res.json({ ok: true, token: access, user: user.toPublic() })
  } catch (err) {
    console.error('Erro no login:', err)
    res.status(500).json({ ok: false, msg: 'Erro interno.', detail: err.message })
  }
}

// ─── GOOGLE AUTH ────────────────────────────────────────────
export const googleAuth = async (req, res) => {
  try {
    let { sub, email, given_name, family_name, picture, googleUser, idToken } = req.body

    if (googleUser) {
      sub = googleUser.sub; email = googleUser.email
      given_name = googleUser.given_name; family_name = googleUser.family_name
      picture = googleUser.picture
    }

    if (!sub && idToken && typeof idToken === 'string') {
      const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
      const payload = ticket.getPayload()
      sub = payload.sub; email = payload.email
      given_name = payload.given_name; family_name = payload.family_name
      picture = payload.picture
    }

    if (!sub || !email)
      return res.status(400).json({ ok: false, msg: 'Dados incompletos do Google.' })

    let user = await User.findOne({ $or: [{ googleId: sub }, { email }] })
    if (!user) {
      user = await User.create({
        nome: given_name || 'Usuário', sobrenome: family_name || '',
        email, googleId: sub, provider: 'google',
        avatar: picture || null, emailVerificado: true,
      })
    } else {
      if (!user.googleId) { user.googleId = sub; user.provider = 'google' }
      if (picture && !user.avatar) user.avatar = picture
      await user.save({ validateBeforeSave: false })
    }

    const access = await issueTokens(user, res)

    // FIX: retorna 'token' em vez de 'accessToken'
    res.json({ ok: true, token: access, user: user.toPublic() })
  } catch (err) {
    console.error('Google auth error:', err.message)
    res.status(500).json({ ok: false, msg: 'Erro Google OAuth.', detail: err.message })
  }
}

// ─── REFRESH TOKEN ──────────────────────────────────────────
export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken
    if (!token) return res.status(401).json({ ok: false, msg: 'Sem refresh token.' })

    const decoded = verifyRefresh(token)
    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ ok: false, msg: 'Usuário não encontrado.' })

    const valid = user.refreshTokens.find(t => t.token === token)
    if (!valid) return res.status(401).json({ ok: false, msg: 'Sessão inválida.' })

    user.refreshTokens = user.refreshTokens.filter(t => t.token !== token)
    const access = await issueTokens(user, res)

    // FIX: retorna 'token' em vez de 'accessToken'
    res.json({ ok: true, token: access })
  } catch {
    res.status(401).json({ ok: false, msg: 'Refresh token inválido.' })
  }
}

// ─── LOGOUT ─────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken
    if (token && req.user) {
      req.user.refreshTokens = req.user.refreshTokens.filter(t => t.token !== token)
      await req.user.save({ validateBeforeSave: false })
    }
    clearRefreshCookie(res)
    res.json({ ok: true, msg: 'Logout realizado.' })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

// ─── ME ─────────────────────────────────────────────────────
export const me = async (req, res) => {
  res.json({ ok: true, user: req.user.toPublic() })
}

// ─── LOGOUT ALL ─────────────────────────────────────────────
export const logoutAll = async (req, res) => {
  try {
    req.user.refreshTokens = []
    await req.user.save({ validateBeforeSave: false })
    clearRefreshCookie(res)
    res.json({ ok: true, msg: 'Todas as sessões encerradas.' })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

// ─── FORGOT PASSWORD ────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ ok: false, msg: 'Informe o e-mail.' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.json({ ok: true, msg: 'Se o e-mail existir, você receberá as instruções.' })

    const token = crypto.randomBytes(32).toString('hex')
    user.resetToken = crypto.createHash('sha256').update(token).digest('hex')
    user.resetTokenExpires = Date.now() + 60 * 60 * 1000
    await user.save({ validateBeforeSave: false })

    await enviarEmailRecuperacao(user.email, user.nome, token)
    res.json({ ok: true, msg: 'Se o e-mail existir, você receberá as instruções.' })
  } catch (err) {
    console.error('forgotPassword error:', err.message)
    res.status(500).json({ ok: false, msg: 'Erro ao processar solicitação.' })
  }
}

// ─── RESET PASSWORD ─────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token, novaSenha } = req.body
    if (!token || !novaSenha)
      return res.status(400).json({ ok: false, msg: 'Token e nova senha são obrigatórios.' })
    if (novaSenha.length < 8)
      return res.status(400).json({ ok: false, msg: 'Senha deve ter mínimo 8 caracteres.' })

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ resetToken: hashedToken, resetTokenExpires: { $gt: Date.now() } })
    if (!user) return res.status(400).json({ ok: false, msg: 'Token inválido ou expirado.' })

    user.senha = await bcrypt.hash(novaSenha, 12)
    user.resetToken = undefined
    user.resetTokenExpires = undefined
    user.refreshTokens = []
    await user.save({ validateBeforeSave: false })

    res.json({ ok: true, msg: 'Senha redefinida com sucesso!' })
  } catch (err) {
    console.error('resetPassword error:', err)
    res.status(500).json({ ok: false, msg: 'Erro ao redefinir senha.' })
  }
}