import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }, { strict: false }))
const users = await User.find({}, { email: 1, role: 1 }).limit(20)
users.forEach(u => console.log(u.email + ' [' + u.role + ']'))
await mongoose.disconnect()
