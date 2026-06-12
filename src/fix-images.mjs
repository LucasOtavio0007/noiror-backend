import 'dotenv/config'
import mongoose from 'mongoose'
import Produto from './src/models/Produto.js'

await mongoose.connect(process.env.MONGODB_URI)
console.log('✅ Conectado!')

const atualizacoes = [
  // COMPUTING
  { nome: 'MacBook Pro Noir Or M4', imagem: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80' },
  { nome: 'MacBook Air M3 Or Edition', imagem: 'https://images.unsplash.com/photo-1611186871525-12b5239ef3e8?w=800&q=80' },
  { nome: 'iPad Pro M4 Noir Edition', imagem: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80' },
  { nome: 'iPad Mini 7 Noir Gold', imagem: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80' },
  { nome: 'Dell XPS 15 Noir Or', imagem: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80' },
  { nome: 'ThinkPad X1 Carbon Noir', imagem: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80' },
  { nome: 'Surface Pro 10 Or Edition', imagem: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80' },
  { nome: 'Mac Mini Noir Or M4', imagem: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80' },
  { nome: 'Razer Blade 16 Noir', imagem: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80' },
  { nome: 'ASUS ROG Zephyrus Or', imagem: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80' },
  { nome: 'Mac Pro Noir Tower Or', imagem: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80' },
  { nome: 'HP Spectre x360 Or', imagem: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80' },
  { nome: 'Samsung Galaxy Tab S10 Or', imagem: 'https://images.unsplash.com/photo-1589739900266-43b2843f4c12?w=800&q=80' },
  { nome: 'Wacom Cintiq Pro 27 Or', imagem: 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800&q=80' },
  { nome: 'LG Gram 17 Noir Or', imagem: 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&q=80' },
  { nome: 'MSI Creator Z17 Or', imagem: 'https://images.unsplash.com/photo-1593640408182-31c228e4e7b8?w=800&q=80' },
  { nome: 'Alienware Area-51 Or', imagem: 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800&q=80' },
  { nome: 'Apple Studio Display Or', imagem: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80' },

  // MOBILE
  { nome: 'iPhone 16 Pro Noir Edition', imagem: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80' },
  { nome: 'iPhone 16 Plus Noir Gold', imagem: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80' },
  { nome: 'Samsung Galaxy S25 Ultra Or', imagem: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80' },
  { nome: 'Galaxy Z Fold 6 Or Edition', imagem: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80' },
  { nome: 'Apple Watch Ultra 2 Noir Or', imagem: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80' },
  { nome: 'Apple Watch Series 10 Or', imagem: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80' },
  { nome: 'Samsung Galaxy Watch 7 Or', imagem: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
  { nome: 'Google Pixel 9 Pro Or', imagem: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80' },
  { nome: 'OnePlus 13 Noir Gold', imagem: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80' },
  { nome: 'Xiaomi 15 Pro Or Edition', imagem: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80' },
  { nome: 'Sony Xperia 1 VI Or', imagem: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800&q=80' },
  { nome: 'Galaxy Z Flip 6 Or', imagem: 'https://images.unsplash.com/photo-1609252925516-b641b5e9b2b3?w=800&q=80' },
  { nome: 'Motorola Edge 50 Ultra Or', imagem: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80' },
  { nome: 'Nothing Phone 3 Or Edition', imagem: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80' },
  { nome: 'Garmin Fenix 8 Or', imagem: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80' },
  { nome: 'Apple Watch Hermès Or', imagem: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80' },
  { nome: 'Huawei Mate X5 Or', imagem: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80' },
  { nome: 'Vivo X200 Pro Or', imagem: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&q=80' },

  // AUDIO
  { nome: 'AirPods Pro 2 Noir Gold', imagem: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80' },
  { nome: 'Sony WH-1000XM6 Or Edition', imagem: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
  { nome: 'Bose QuietComfort 45 Or', imagem: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80' },
  { nome: 'Sennheiser HD 800 S Or', imagem: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80' },
  { nome: 'Audeze LCD-5 Noir Or', imagem: 'https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=800&q=80' },
  { nome: 'Apple AirPods Max Or', imagem: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&q=80' },
  { nome: 'Bang & Olufsen H95 Or', imagem: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&q=80' },
  { nome: 'Sony IEM IER-Z1R Or', imagem: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80' },
  { nome: 'Devialet Phantom Or', imagem: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80' },
  { nome: 'Focal Utopia Or Edition', imagem: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80' },
  { nome: 'Sonos Era 300 Or', imagem: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  { nome: 'KEF LS60 Wireless Or', imagem: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80' },
  { nome: 'Astell&Kern AK380 Or', imagem: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80' },
  { nome: 'JBL Partybox Or Edition', imagem: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80' },
  { nome: 'Marshall Woburn III Or', imagem: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80' },
  { nome: 'Technics SL-1210 Or', imagem: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80' },
  { nome: 'Bose SoundLink Max Or', imagem: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800&q=80' },

  // GAMING
  { nome: 'PlayStation 5 Noir Edition', imagem: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80' },
  { nome: 'Xbox Series X Noir Edition', imagem: 'https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?w=800&q=80' },
  { nome: 'Nintendo Switch OLED Or', imagem: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&q=80' },
  { nome: 'Steam Deck OLED Or', imagem: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&q=80' },
  { nome: 'Asus ROG Ally X Or', imagem: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80' },
  { nome: 'Razer DeathAdder Or', imagem: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80' },
  { nome: 'SteelSeries Apex Pro Or', imagem: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80' },
  { nome: 'Corsair HS80 Or Wireless', imagem: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=800&q=80' },
  { nome: 'Secretlab Titan Or', imagem: 'https://images.unsplash.com/photo-1598030343246-c4c8cc7c4e9c?w=800&q=80' },
  { nome: 'HyperX Cloud Alpha Or', imagem: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80' },
  { nome: 'Logitech G Pro X Or', imagem: 'https://images.unsplash.com/photo-1585814765990-5a98b4e69793?w=800&q=80' },
  { nome: '8BitDo Pro 2 Or', imagem: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80' },
  { nome: 'Elgato Stream Deck Or', imagem: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80' },
  { nome: 'Beyerdynamic MMX 300 Or', imagem: 'https://images.unsplash.com/photo-1604170791169-28e98d4cb1fb?w=800&q=80' },
  { nome: 'Thrustmaster T-GT II Or', imagem: 'https://images.unsplash.com/photo-1612196808214-b4c1a30cfe28?w=800&q=80' },
  { nome: 'Fanatec ClubSport Or', imagem: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80' },
  { nome: 'Xbox Elite Series 3 Or', imagem: 'https://images.unsplash.com/photo-1585620385456-4759f9b5c7d9?w=800&q=80' },

  // VISUAL
  { nome: 'Samsung QN900D 8K Noir Or', imagem: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80' },
  { nome: 'LG OLED Evo G4 Or', imagem: 'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=800&q=80' },
  { nome: 'Sony Bravia XR A95L Or', imagem: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80' },
  { nome: 'DJI Mavic 4 Pro Noir Edition', imagem: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80' },
  { nome: 'DJI Air 3S Or', imagem: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80' },
  { nome: 'Sony Alpha 1 Or Edition', imagem: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80' },
  { nome: 'Canon EOS R5 Mark II Or', imagem: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80' },
  { nome: 'Leica M11 Or Edition', imagem: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80' },
  { nome: 'Hasselblad X2D Or', imagem: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80' },
  { nome: 'LG UltraFine OLED Pro Or', imagem: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80' },
  { nome: 'Dell UltraSharp 32 Or', imagem: 'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&q=80' },
  { nome: 'Insta360 X5 Or Edition', imagem: 'https://images.unsplash.com/photo-1595776613215-fe04b78de7d0?w=800&q=80' },
  { nome: 'GoPro Hero 13 Or Edition', imagem: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=800&q=80' },
  { nome: 'Fujifilm X-T5 Or', imagem: 'https://images.unsplash.com/photo-1570158268183-d296b2892211?w=800&q=80' },
  { nome: 'Projector Xgimi Horizon Or', imagem: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80' },
  { nome: 'DJI RS 4 Pro Or', imagem: 'https://images.unsplash.com/photo-1490750967868-88df5691cc37?w=800&q=80' },

  // VIRTUAL
  { nome: 'Meta Quest 3 Noir Or', imagem: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80' },
  { nome: 'Apple Vision Pro Or Edition', imagem: 'https://images.unsplash.com/photo-1697345251355-c36d46e050a3?w=800&q=80' },
  { nome: 'PlayStation VR2 Noir Or', imagem: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80' },
  { nome: 'Valve Index Or Edition', imagem: 'https://images.unsplash.com/photo-1617802690658-1173a812650d?w=800&q=80' },
  { nome: 'HTC Vive Pro 2 Or', imagem: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&q=80' },
  { nome: 'Meta Quest Pro Or', imagem: 'https://images.unsplash.com/photo-1561144257-e32e8506e8f1?w=800&q=80' },
  { nome: 'Xreal Air 2 Ultra Or', imagem: 'https://images.unsplash.com/photo-1623282033815-40b05d96c903?w=800&q=80' },
  { nome: 'Bigscreen Beyond Or', imagem: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80' },
  { nome: 'Varjo XR-4 Or Edition', imagem: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80' },
  { nome: 'Pico 4 Ultra Or', imagem: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&q=80' },
  { nome: 'Samsung Galaxy XR Or', imagem: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80' },
  { nome: 'Magic Leap 2 Or', imagem: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&q=80' },
  { nome: 'Lenovo ThinkReality Or', imagem: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&q=80' },
  { nome: 'Nreal Light Or Edition', imagem: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80' },
]

let atualizados = 0
for (const { nome, imagem } of atualizacoes) {
  const result = await Produto.updateOne({ nome }, { imagem })
  if (result.modifiedCount > 0) {
    console.log(`✅ ${nome}`)
    atualizados++
  } else {
    console.log(`⚠️  Não encontrado: ${nome}`)
  }
}

console.log(`\n🎉 ${atualizados} produtos atualizados!`)
await mongoose.disconnect()
process.exit()
