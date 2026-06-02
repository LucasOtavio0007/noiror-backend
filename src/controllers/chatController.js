import Groq from 'groq-sdk'
import Produto from '../models/Produto.js'

let groq

function getGroq() {
  if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return groq
}

export const enviarMensagemIA = async (req, res) => {
  try {
    const { mensagem, historico } = req.body

    if (!mensagem || typeof mensagem !== 'string' || mensagem.trim() === '') {
      return res.status(400).json({ ok: false, msg: 'Mensagem vazia.' })
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY não definida.')
      return res.status(500).json({ ok: false, msg: 'Serviço de IA não configurado.' })
    }

    // Busca produtos ativos para contexto
    const produtos = await Produto.find({ ativo: true })
      .select('nome preco categoria descricao')
      .limit(30)
      .lean()

    const contextoProdutos = produtos.length
      ? produtos.map(p => `- ${p.nome} | R$${Number(p.preco).toLocaleString('pt-BR')} | ${p.categoria}`).join('\n')
      : 'Nenhum produto disponível no momento.'

    const systemPrompt = `Você é Noir, a consultora virtual exclusiva da Noir & Or — atelier de tecnologia de luxo em Sabará, MG.

PERSONALIDADE:
- Elegante, sofisticada e calorosa
- Linguagem refinada em português brasileiro
- Respostas objetivas (máximo 3 parágrafos curtos)
- Use emojis com muita moderação

SOBRE A NOIR & OR:
- Fundada em 2021 em Sabará, Minas Gerais
- Especializada em dispositivos de tecnologia revestidos com ouro 24k, titânio aeroespacial e outros metais nobres
- Produção artesanal com técnicas de joalheria tradicional
- Edições limitadas e numeradas

POLÍTICAS:
- Frete VIP gratuito para todo o Brasil
- Garantia vitalícia no revestimento
- Entrega em 5 a 10 dias úteis
- Produção sob encomenda em até 30 dias úteis
- Suporte VIP 24h para clientes cadastrados
- Parcelamento em até 12x sem juros

PRODUTOS DISPONÍVEIS:
${contextoProdutos}

INSTRUÇÕES:
- Se perguntarem sobre produto específico, forneça detalhes e sugira contato para personalização
- Se não souber responder, sugira contato pelo WhatsApp ou e-mail (contato@noiror.com.br)
- Nunca invente preços ou produtos que não estão na lista acima
- Sempre termine oferecendo mais ajuda`

    // Monta histórico filtrando apenas mensagens válidas
    const mensagensAnteriores = Array.isArray(historico)
      ? historico
          .filter(m => m.role && m.content && typeof m.content === 'string')
          .filter(m => ['user', 'assistant'].includes(m.role))
          .slice(-10)
      : []

    // Garante alternância de roles (Groq também exige)
    const mensagensLimpas = []
    for (const m of mensagensAnteriores) {
      const ultimo = mensagensLimpas[mensagensLimpas.length - 1]
      if (ultimo && ultimo.role === m.role) continue
      mensagensLimpas.push({ role: m.role, content: m.content })
    }

    // Remove última se for user (vamos adicionar a mensagem atual)
    if (mensagensLimpas.length && mensagensLimpas[mensagensLimpas.length - 1].role === 'user') {
      mensagensLimpas.pop()
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...mensagensLimpas,
      { role: 'user', content: mensagem.trim() },
    ]

   const resposta = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 600,
      messages,
    })

    const textoResposta = resposta.choices?.[0]?.message?.content?.trim()
      || 'Desculpe, não consegui processar sua pergunta. Tente novamente ou entre em contato pelo WhatsApp.'

    return res.json({ ok: true, resposta: textoResposta })

  } catch (error) {
    console.error('Erro na IA:', error?.status, error?.message || error)

    if (error?.status === 401) {
      return res.status(500).json({ ok: false, msg: 'Chave de API inválida.' })
    }
    if (error?.status === 429) {
      return res.status(429).json({ ok: false, msg: 'Limite de requisições atingido. Tente em instantes.' })
    }
    if (error?.status === 400) {
      return res.status(400).json({ ok: false, msg: 'Mensagem inválida. Tente reformular.' })
    }

    return res.status(500).json({ ok: false, msg: 'Erro ao consultar assistente virtual.' })
  }
}