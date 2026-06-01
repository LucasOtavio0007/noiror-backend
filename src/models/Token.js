// ═══════════════════════════════════════════════════════════
//  NOIR & OR — TOKEN MODEL  (versão final)
//  Mongoose · ES Modules
// ═══════════════════════════════════════════════════════════
import mongoose from 'mongoose'
import crypto   from 'crypto'

const TokenSchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    index:    true,
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
}, { timestamps: true })

// TTL — MongoDB remove documentos expirados automaticamente
TokenSchema.index({ expiraEm: 1 }, { expireAfterSeconds: 0 })

// ── Gerar token seguro ────────────────────────────────────
// Apaga tokens anteriores do mesmo userId+tipo antes de criar
TokenSchema.statics.gerar = async function (userId, tipo, horasValidade = 24) {
  await this.deleteMany({ userId, tipo })

  const token    = crypto.randomBytes(48).toString('hex') // 96 chars
  const expiraEm = new Date(Date.now() + horasValidade * 60 * 60 * 1000)

  const doc = await this.create({ userId, token, tipo, expiraEm })
  return doc.token
}

// ── Verificar e consumir token (uso único) ────────────────
TokenSchema.statics.verificar = async function (token, tipo) {
  const doc = await this.findOne({ token, tipo, usado: false })

  if (!doc)                      throw new Error('Token inválido ou já utilizado.')
  if (doc.expiraEm < new Date()) throw new Error('Token expirado. Solicite um novo.')

  // Marca como usado em vez de deletar — mantém histórico auditável
  doc.usado = true
  await doc.save()

  return doc.userId
}

export default mongoose.model('Token', TokenSchema)