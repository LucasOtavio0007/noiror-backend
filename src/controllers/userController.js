import bcrypt from 'bcryptjs'
import User from '../models/User.js'

export const getProfile = async (req, res) => {
  res.json({ ok: true, user: req.user.toPublic() })
}

export const updateProfile = async (req, res) => {
  try {
    const allowed = ['nome','sobrenome','telefone','bio','cep','cidade','endereco','avatar']
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
    res.json({ ok: true, user: user.toPublic() })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body
    if (!senhaAtual || !novaSenha)
      return res.status(400).json({ ok: false, msg: 'Informe a senha atual e a nova senha.' })
    if (novaSenha.length < 8)
      return res.status(400).json({ ok: false, msg: 'Nova senha deve ter no mínimo 8 caracteres.' })
    const user = await User.findById(req.user._id).select('+senha')
    if (!user.senha)
      return res.status(400).json({ ok: false, msg: 'Conta vinculada a provedor social — sem senha definida.' })
    const ok = await bcrypt.compare(senhaAtual, user.senha)
    if (!ok) return res.status(401).json({ ok: false, msg: 'Senha atual incorreta.' })
    user.senha = await bcrypt.hash(novaSenha, 12)
    await user.save({ validateBeforeSave: false })
    res.json({ ok: true, msg: 'Senha alterada com sucesso.' })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

export const updateNotifications = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificacoes: req.body.notificacoes },
      { new: true }
    )
    res.json({ ok: true, notificacoes: user.notificacoes })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

export const toggle2FA = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { twoFA: req.body.ativo },
      { new: true }
    )
    res.json({ ok: true, twoFA: user.twoFA })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

export const getSessions = async (req, res) => {
  try {
    const user = await (await import('../models/User.js')).default.findById(req.user._id)
    const tokens = user?.refreshTokens || []
    const sessoes = tokens.map((t, i) => ({
      id: t._id,
      criadoEm: t.criadoEm,
      atual: i === tokens.length - 1,
    }))
    res.json({ ok: true, sessoes })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}
export const revokeSession = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { refreshTokens: { _id: req.params.id } }
    })
    res.json({ ok: true, msg: 'Sessão encerrada.' })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

export const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const users = await User.find()
      .sort({ criadoEm: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    const total = await User.countDocuments()
    res.json({ ok: true, users: users.map(u => u.toPublic()), total })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

export const updateRole = async (req, res) => {
  try {
    const { role } = req.body
    if (!['user', 'admin', 'superadmin'].includes(role))
      return res.status(400).json({ ok: false, msg: 'Role inválido.' })
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
    if (!user) return res.status(404).json({ ok: false, msg: 'Usuário não encontrado.' })
    res.json({ ok: true, user: user.toPublic() })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ ok: false, msg: 'Você não pode deletar sua própria conta.' })
    await User.findByIdAndDelete(req.params.id)
    res.json({ ok: true, msg: 'Usuário removido.' })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

export const getLog = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('refreshTokens createdAt ultimoAcesso')
    
    const log = (user.refreshTokens || []).map((t, i) => ({
      id: t._id,
      acao: i === (user.refreshTokens.length - 1) ? 'Login atual' : 'Login anterior',
      data: t.criadoEm,
    }))

    res.json({ ok: true, log })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}