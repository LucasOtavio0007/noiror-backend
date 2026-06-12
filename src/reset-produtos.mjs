import 'dotenv/config'
import mongoose from 'mongoose'
import Produto from './src/models/Produto.js'

await mongoose.connect(process.env.MONGODB_URI)
console.log('✅ Conectado!')

const deletados = await Produto.deleteMany({})
console.log(`🗑️  ${deletados.deletedCount} produtos removidos!`)

await mongoose.disconnect()
process.exit()