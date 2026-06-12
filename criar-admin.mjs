// criar-admin.mjs  ← salve com extensão .mjs na raiz do noiror-backend
// Uso: node criar-admin.mjs

import mongoose from 'mongoose'
import bcrypt   from 'bcryptjs'
import { config } from 'dotenv'
config()

// ── AJUSTE AQUI ───────────────────────────────────────────
const ADMIN_EMAIL = 'admin@noirouor.com'   // ← email que vai usar no login
const ADMIN_SENHA = 'Admin@2025!'          // ← senha que vai usar no login
const ADMIN_NOME  = 'Admin'
// ─────────────────────────────────────────────────────────

const MONGO_URI = process.env.MONGO_URI
              || process.env.MONGODB_URI
              || process.env.DATABASE_URL

if (!MONGO_URI) {
  console.error('❌ MONGO_URI não encontrado no .env')
  process.exit(1)
}

await mongoose.connect(MONGO_URI)
console.log('✅ Conectado:', mongoose.connection.host)

const col = mongoose.connection.db.collection('users')

const hash = await bcrypt.hash(ADMIN_SENHA, 12)

const resultado = await col.findOneAndUpdate(
  { email: ADMIN_EMAIL.toLowerCase() },
  {
    $set: {
      nome:    ADMIN_NOME,
      email:   ADMIN_EMAIL.toLowerCase(),
      senha:   hash,
      role:    'admin',
      ativo:   true,
    },
    $setOnInsert: { createdAt: new Date(), refreshTokens: [] }
  },
  { upsert: true, returnDocument: 'after' }
)

const user = resultado?.value || await col.findOne({ email: ADMIN_EMAIL.toLowerCase() })

console.log('\n✅ Usuário salvo:')
console.log('   email:  ', user.email)
console.log('   role:   ', user.role)
console.log('   senha:  ', user.senha ? '[hash ok]' : '❌ VAZIO')

const ok = await bcrypt.compare(ADMIN_SENHA, user.senha)
console.log('   bcrypt: ', ok ? '✅ hash válido' : '❌ hash inválido')

console.log('\n🔑 Login:')
console.log('   Email:', ADMIN_EMAIL)
console.log('   Senha:', ADMIN_SENHA)
console.log('\n⚠️  Delete este arquivo após usar!\n')

await mongoose.disconnect()
