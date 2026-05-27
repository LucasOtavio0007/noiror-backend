import User from './models/User.js'
import bcrypt from 'bcryptjs'

export const seedAdmin = async () => {
  console.log('🔍 SeedAdmin executando...')
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL)
  console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? '*** definido ***' : 'NÃO DEFINIDO')

  const exists = await User.findOne({ email: process.env.ADMIN_EMAIL })
  if (exists) {
    console.log('✅ Admin já existe:', exists.email)
    return
  }

  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
  await User.create({
    nome: 'Admin',
    sobrenome: 'Noir & Or',
    email: process.env.ADMIN_EMAIL,
    senha: hashed,
    role: 'admin',
    emailVerificado: true,
    avatar: null,
  })
  console.log(`👑 Admin criado: ${process.env.ADMIN_EMAIL}`)
}