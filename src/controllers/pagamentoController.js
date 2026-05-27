import { criarPreferencia } from '../services/mercadopagoService.js'
import Pedido from '../models/Pedido.js'
import Produto from '../models/Produto.js'

export const criarPagamentoMercadoPago = async (req, res) => {
  try {
    const { itens, cliente, pagamento, entrega, localizacao } = req.body

    if (!itens?.length) return res.status(400).json({ ok: false, msg: 'Carrinho vazio' })
    if (!cliente?.nome || !cliente?.email || !cliente?.cpf) return res.status(400).json({ ok: false, msg: 'Dados do cliente incompletos' })
    if (!pagamento?.metodo) return res.status(400).json({ ok: false, msg: 'Método de pagamento não informado' })

    const ids = itens.map(i => i.produto)
    const prods = await Produto.find({ _id: { $in: ids } })
    const itensValidados = itens.map(item => {
      const prod = prods.find(p => p._id.toString() === item.produto)
      if (!prod) throw new Error(`Produto não encontrado: ${item.produto}`)
      return {
        produto: prod._id,
        nome: prod.nome,
        preco: prod.preco,
        qty: item.qty || 1,
        imagem: prod.imagem
      }
    })
    const total = itensValidados.reduce((s, i) => s + i.preco * i.qty, 0)

    const pedido = await Pedido.create({
      usuario: req.user?._id || null,
      itens: itensValidados,
      total,
      status: 'pendente',
      pagamento: { metodo: pagamento.metodo, status: 'pendente' },
      cliente,
      entrega,
      localizacao: localizacao || { lat: null, lng: null }
    })

    const preference = await criarPreferencia({
      itens: itensValidados.map(i => ({ nome: i.nome, qty: i.qty, preco: i.preco })),
      cliente,
      idExterno: pedido._id.toString(),
      pagamento
    })

    pedido.pagamento.id = preference.id
    await pedido.save()

    let responseData = { pedido, redirectUrl: null, qrCode: null, boletoUrl: null }
    if (pagamento.metodo === 'pix') {
      responseData.qrCode = preference.point_of_interaction?.transaction_data?.qr_code
    } else if (pagamento.metodo === 'cartao') {
      responseData.redirectUrl = preference.init_point
    } else if (pagamento.metodo === 'boleto') {
      responseData.boletoUrl = preference.init_point
    }
    res.json({ ok: true, ...responseData })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
}