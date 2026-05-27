import mongoose from 'mongoose'

const SiteConfigSchema = new mongoose.Schema({
  nome: { type: String, default: 'Noir & Or' },
  slogan: { type: String, default: 'Tecnologia forjada em ouro.' },
  // ... outros campos
})

SiteConfigSchema.statics.getSingleton = async function () {
  let config = await this.findOne()
  if (!config) config = await this.create({})
  return config
}

export default mongoose.model('SiteConfig', SiteConfigSchema)