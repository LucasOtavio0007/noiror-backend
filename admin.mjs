import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const EMAIL = 'SEU_EMAIL_AQUI'

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }, { strict: false }))
const user = await User.findOneAndUpdate({ email: EMAIL }, { role: 'admin' }, { new: true })
console.log(user ? 'OK: ' + user.email + ' -> ' + user.role : 'NAO ENCONTRADO')
await mongoose.disconnect()
