import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  nome:       { type: String, required: true, trim: true },
  sobrenome:  { type: String, trim: true, default: '' },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  senha:      { type: String, select: false },
  avatar:     { type: String, default: '' },
  role:       { type: String, enum: ['user','admin','superadmin'], default: 'user' },
  nivel:      { type: String, enum: ['normal','vip','elite'], default: 'normal' },
  googleId:   { type: String, default: '' },
  provider:   { type: String, default: 'email' },
  emailVerificado: { type: Boolean, default: false },
  codigoIndicacao:  { type: String, unique: true, sparse: true },
  indicadoPor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  saldoIndicacao:   { type: Number, default: 0 },
  totalGasto:       { type: Number, default: 0 },
  ativo:      { type: Boolean, default: true },
  refreshTokens: [{
    token: { type: String },
    criadoEm: { type: Date, default: Date.now },
  }],
  resetToken:        { type: String },
  resetTokenExpires: { type: Date },
  twoFA:             { type: Boolean, default: false },
  notificacoes: {
    emailPromocoes: { type: Boolean, default: true },
    emailPedidos:   { type: Boolean, default: true },
    sms:            { type: Boolean, default: false },
  },
  telefone:   String,
  bio:        String,
  cep:        String,
  cidade:     String,
  endereco:   String,
  estado:     String,
}, { timestamps: true })

// ─── FIX: evita double hashing ──────────────────────────────
// O controller já pode passar senha plain text OU hash —
// o pre('save') detecta e só hasheia se ainda não for bcrypt.
userSchema.pre('save', async function (next) {
  if (!this.isModified('senha') || !this.senha) return next()
  if (this.senha.startsWith('$2b$') || this.senha.startsWith('$2a$')) return next()
  this.senha = await bcrypt.hash(this.senha, 12)
  next()
})

userSchema.methods.toPublic = function () {
  return {
    id:              this._id,
    nome:            this.nome,
    sobrenome:       this.sobrenome,
    email:           this.email,
    avatar:          this.avatar,
    role:            this.role,
    nivel:           this.nivel,
    codigoIndicacao: this.codigoIndicacao,
    saldoIndicacao:  this.saldoIndicacao,
    totalGasto:      this.totalGasto,
    emailVerificado: this.emailVerificado,
    twoFA:           this.twoFA,
    notificacoes:    this.notificacoes,
    telefone:        this.telefone,
    bio:             this.bio,
    cep:             this.cep,
    cidade:          this.cidade,
    endereco:        this.endereco,
    estado:          this.estado,
    criadoEm:        this.createdAt,
  }
}

userSchema.methods.verificarNivel = function () {
  if (this.totalGasto >= 5000 && this.nivel !== 'elite') {
    this.nivel = 'elite'
  } else if (this.totalGasto >= 1000 && this.nivel === 'normal') {
    this.nivel = 'vip'
  }
}

export default mongoose.model('User', userSchema)