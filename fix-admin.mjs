// fix-admin.mjs — rode com: node fix-admin.mjs
import mongoose from 'mongoose'
import { config } from 'dotenv'
config()

const URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL
await mongoose.connect(URI)
console.log('✅ Conectado')

const col = mongoose.connection.db.collection('users')

const r = await col.updateOne(
  { email: 'admin@noirouor.com' },
  { $set: { refreshTokens: [], role: 'admin', ativo: true } }
)

console.log('Documentos modificados:', r.modifiedCount)

const u = await col.findOne({ email: 'admin@noirouor.com' })
console.log('email:         ', u.email)
console.log('role:          ', u.role)
console.log('refreshTokens: ', JSON.stringify(u.refreshTokens))
console.log('senha:         ', u.senha ? '[ok]' : '❌ VAZIO')
console.log('ativo:         ', u.ativo)

await mongoose.disconnect()
console.log('\n✅ Pronto! Tenta logar agora.')
