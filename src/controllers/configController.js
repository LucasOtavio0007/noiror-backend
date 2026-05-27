import SiteConfig from '../models/SiteConfig.js'

export const getConfig = async (req, res) => {
  const config = await SiteConfig.getSingleton()
  res.json({ config })
}

export const updateConfig = async (req, res) => {
  const config = await SiteConfig.getSingleton()
  Object.assign(config, req.body)
  await config.save()
  res.json({ config })
}