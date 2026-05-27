import Produto from '../models/Produto.js'

export const listarProdutos = async (req, res) => {
  try {
    const { categoria, busca, destaque, page = 1, limit = 50 } = req.query
    const filtro = {}
    if (categoria) filtro.categoria = categoria.toUpperCase()
    if (destaque === 'true') filtro.destaque = true
    if (busca) filtro.$text = { $search: busca }
    const [produtos, total] = await Promise.all([
      Produto.find(filtro)
        .sort({ destaque: -1, criadoEm: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Produto.countDocuments(filtro)
    ])
    res.json({ ok: true, produtos, total })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

export const getProduto = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id)
    if (!produto) return res.status(404).json({ ok: false, msg: 'Produto não encontrado.' })
    res.json({ ok: true, produto })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

export const criarProduto = async (req, res) => {
  try {
    const produto = await Produto.create(req.body)
    res.status(201).json({ ok: true, produto })
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message })
  }
}

export const atualizarProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
    if (!produto) return res.status(404).json({ ok: false, msg: 'Produto não encontrado.' })
    res.json({ ok: true, produto })
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message })
  }
}

export const deletarProduto = async (req, res) => {
  try {
    await Produto.findByIdAndDelete(req.params.id)
    res.json({ ok: true, msg: 'Produto removido.' })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}

export const seedProdutos = async (req, res) => {
  try {
    const total = await Produto.countDocuments()
    if (total > 0) return res.json({ ok: true, msg: `Já existem ${total} produtos no banco.` })
    const { produtosData } = await import('../config/produtosData.js')
    await Produto.insertMany(produtosData)
    res.json({ ok: true, msg: `${produtosData.length} produtos inseridos.` })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}