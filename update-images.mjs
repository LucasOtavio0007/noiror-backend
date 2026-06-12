import 'dotenv/config'
import mongoose from 'mongoose'
import Produto from './src/models/Produto.js'

await mongoose.connect(process.env.MONGODB_URI)
console.log('✅ Conectado!')

const imagens = {
  'MacBook Pro Noir Or M4':        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
  'iPhone 16 Pro Noir Edition':    'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&q=80',
  'Sony WH-1000XM6 Or Edition':    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  'iPad Pro M4 Noir Edition':      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
  'Galaxy Z Fold 6 Or Edition':    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80',
  'AirPods Pro 2 Noir Gold':       'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80',
  'Apple Watch Ultra 2 Noir Or':   'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80',
  'PlayStation 5 Noir Edition':    'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80',
  'MacBook Air M3 Or Edition':     'https://images.unsplash.com/photo-1611186871525-12b5239ef3e8?w=800&q=80',
  'Samsung QN900D 8K Noir Or':     'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80',
  'Bose QuietComfort 45 Or':       'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
  'Xbox Series X Noir Edition':    'https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?w=800&q=80',
  'Meta Quest 3 Noir Or':          'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80',
  'DJI Mavic 4 Pro Noir Edition':  'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80',
}

for (const [nome, imagem] of Object.entries(imagens)) {
  await Produto.updateOne({ nome }, { imagem })
  console.log(`✅ ${nome}`)
}

console.log('\n🎉 Todas as imagens atualizadas!')
await mongoose.disconnect()
process.exit()
