import mongoose from 'mongoose'
import { seedAdmin } from '../seed.js'

export const conectar = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`✅ MongoDB conectado: ${mongoose.connection.host}`)
    await seedAdmin()
  } catch (err) {
    console.error(`❌ Erro MongoDB: ${err.message}`)
    process.exit(1)
  }
}