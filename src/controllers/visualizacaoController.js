import Visualizacao from '../models/Visualizacao.js'

export const registrarVisualizacao = async (req, res) => {
  try {
    const { produtoId } = req.body
    if (!produtoId) {
      return res.status(400).json({ ok: false, msg: 'Produto não informado.' })
    }

    // Gerar um ID de sessão se não existir (via cookie ou header)
    let sessaoId = req.cookies.sessionId || req.headers['x-session-id']
    if (!sessaoId && !req.user) {
      sessaoId = 'anon_' + Math.random().toString(36).substr(2, 16)
      res.cookie('sessionId', sessaoId, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
    }

    const usuario = req.user?._id || null
    const identificador = usuario || sessaoId

    // Evita duplicatas na mesma sessão/produto (últimos 10 minutos)
    const existe = await Visualizacao.findOne({
      produto: produtoId,
      $or: [
        { usuario: usuario },
        { sessaoId: identificador }
      ],
      createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) }
    })

    if (existe) {
      return res.json({ ok: true, msg: 'Visualização já registrada recentemente.' })
    }

    await Visualizacao.create({
      usuario: usuario,
      produto: produtoId,
      sessaoId: usuario ? null : identificador,
    })

    res.json({ ok: true, msg: 'Visualização registrada.' })
  } catch (error) {
    console.error('Erro ao registrar visualização:', error)
    res.status(500).json({ ok: false, msg: 'Erro interno.' })
  }
}