import Recomendacao from '../models/Recomendacao.js'
import Produto from '../models/Produto.js'

export const getRecomendacoes = async (req, res) => {
  try {
    const { produtoId } = req.params
    const { limit = 8 } = req.query

    const rec = await Recomendacao.findOne({ produto: produtoId }).lean()
    
    if (!rec || !rec.similares || rec.similares.length === 0) {
      // Fallback: produtos da mesma categoria
      const produto = await Produto.findById(produtoId).select('categoria').lean()
      if (produto?.categoria) {
        const alternativos = await Produto.find({
          categoria: produto.categoria,
          _id: { $ne: produtoId },
          ativo: true,
        }).limit(Number(limit)).lean()
        return res.json({ ok: true, recomendacoes: alternativos })
      }
      return res.json({ ok: true, recomendacoes: [] })
    }

    // Busca os produtos similares completos
    const produtos = await Produto.find({
      _id: { $in: rec.similares.slice(0, Number(limit)) },
      ativo: true,
    }).lean()

    res.json({ ok: true, recomendacoes: produtos })
  } catch (err) {
    console.error('Erro ao buscar recomendações:', err)
    res.status(500).json({ ok: false, msg: err.message })
  }
}