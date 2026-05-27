// ═══════════════════════════════════════════════════════════
//  NOIR & OR — TOKEN MODEL
//  Gerencia tokens de confirmação e redefinição de senha
// ═══════════════════════════════════════════════════════════
import mongoose from 'mongoose'
import crypto   from 'crypto'

const TokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    required: true,
    index: true,
  },
  token: {
    type:     String,
    required: true,
    unique:   true,
    index:    true,
  },
  tipo: {
    type:     String,
    enum:     ['confirmacao-email', 'redefinicao-senha'],
    required: true,
  },
  usado: {
    type:    Boolean,
    default: false,
  },
  expiraEm: {
    type:     Date,
    required: true,
  },
  criadoEm: {
    type:    Date,
    default: Date.now,
  },
})

// TTL index — MongoDB remove automaticamente tokens expirados
TokenSchema.index({ expiraEm: 1 }, { expireAfterSeconds: 0 })

// Gerar token seguro
TokenSchema.statics.gerar = async function (userId, tipo, horasValidade = 24) {
  // Invalidar tokens anteriores do mesmo tipo para este usuário
  await this.deleteMany({ userId, tipo })

  const raw   = crypto.randomBytes(48).toString('hex') // 96 chars
  const expiraEm = new Date(Date.now() + horasValidade * 60 * 60 * 1000)

  const doc = await this.create({ userId, token: raw, tipo, expiraEm })
  return doc.token
}

// Verificar e consumir token
TokenSchema.statics.verificar = async function (token, tipo) {
  const doc = await this.findOne({ token, tipo, usado: false })
  if (!doc)                           throw new Error('Token inválido ou já utilizado.')
  if (doc.expiraEm < new Date())      throw new Error('Token expirado. Solicite um novo.')

  doc.usado = true
  await doc.save()
  return doc.userId
}

export default mongoose.model('Token', TokenSchema)