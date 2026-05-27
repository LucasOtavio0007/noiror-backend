import { Router } from 'express'

const router = Router()

router.post('/calcular', async (req, res) => {
  const { cep, itens } = req.body
  // TODO: integrar com Correios / Melhor Envio
  res.json({ opcoes: [] })
})

export default router