import cron from 'node-cron'
import { atualizarRecomendacoes } from '../services/recomendacaoService.js'

// Executa a cada 6 horas
cron.schedule('0 */6 * * *', async () => {
  console.log('⚙️ Executando job de recomendações')
  await atualizarRecomendacoes()
})