import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import 'dotenv/config'
import User from './src/models/User.js'

const criarUsuario = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('🔌 Conectado ao MongoDB')
    
    const email = 'teste2@teste.com'
    const senha = '12345678'
    
    // Verificar se já existe
    const exists = await User.findOne({ email })
    if (exists) {
      console.log('⚠️ Usuário já existe:', email)
      await mongoose.disconnect()
      return
    }
    
    const hashed = await bcrypt.hash(senha, 12)
    console.log('🔑 Hash gerado:', hashed)
    
    const user = await User.create({
      nome: 'Teste',
      sobrenome: 'Dois',
      email,
      senha: hashed,
      role: 'user',
      emailVerificado: true,
    })
    
    console.log('✅ Usuário criado com sucesso!')
    console.log('📧 Email:', user.email)
    console.log('🔒 Senha:', senha)
    
    // Testar a comparação
    const compareTest = await bcrypt.compare(senha, user.senha)
    console.log('🧪 Teste de comparação:', compareTest ? 'OK ✓' : 'FALHOU ✗')
    
    await mongoose.disconnect()
  } catch (err) {
    console.error('❌ Erro:', err)
    process.exit(1)
  }
}

criarUsuario()