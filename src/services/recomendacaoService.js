import Visualizacao from '../models/Visualizacao.js'
import Recomendacao from '../models/Recomendacao.js'

export async function atualizarRecomendacoes() {
  console.log('🔄 Atualizando recomendações...')
  
  // 1. Busca todas as visualizações dos últimos 30 dias
  const visualizacoes = await Visualizacao.find({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  }).lean()

  // Agrupa por sessão (ou usuário) e coleta os produtos vistos por sessão
  const sessaoProdutos = new Map()
  for (const v of visualizacoes) {
    const key = v.usuario ? `user_${v.usuario}` : `session_${v.sessaoId}`
    if (!sessaoProdutos.has(key)) sessaoProdutos.set(key, new Set())
    sessaoProdutos.get(key).add(v.produto.toString())
  }

  // 2. Para cada produto, conta quantas vezes ele aparece junto com outros
  const coocorrencias = new Map()
  for (const produtosSet of sessaoProdutos.values()) {
    const produtos = Array.from(produtosSet)
    for (let i = 0; i < produtos.length; i++) {
      const p1 = produtos[i]
      if (!coocorrencias.has(p1)) coocorrencias.set(p1, new Map())
      const mapP1 = coocorrencias.get(p1)
      for (let j = i + 1; j < produtos.length; j++) {
        const p2 = produtos[j]
        mapP1.set(p2, (mapP1.get(p2) || 0) + 1)
        // também adiciona no sentido inverso (p2 → p1)
        if (!coocorrencias.has(p2)) coocorrencias.set(p2, new Map())
        const mapP2 = coocorrencias.get(p2)
        mapP2.set(p1, (mapP2.get(p1) || 0) + 1)
      }
    }
  }

  // 3. Para cada produto, seleciona os top 12 mais frequentes
  const recomendacoes = []
  for (const [produtoId, mapa] of coocorrencias.entries()) {
    const similares = Array.from(mapa.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(item => item[0])
    
    recomendacoes.push({
      produto: produtoId,
      similares,
    })
  }

  // 4. Atualiza a coleção com upsert em massa
  for (const rec of recomendacoes) {
    await Recomendacao.findOneAndUpdate(
      { produto: rec.produto },
      { produto: rec.produto, similares: rec.similares, atualizadoEm: new Date() },
      { upsert: true }
    )
  }

  console.log(`✅ Recomendações atualizadas para ${recomendacoes.length} produtos.`)
}