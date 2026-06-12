import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config()

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String, senha: String }, { strict: false }))
const nova = await bcrypt.hash('Admin@123', 12)
await User.updateOne({ email: 'admin@noiror.com.br' }, { senha: nova })
console.log('Senha redefinida para: Admin@123')
await mongoose.disconnect()
