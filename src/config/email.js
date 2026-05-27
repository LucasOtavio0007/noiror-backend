import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// ── Template base ─────────────────────────────────────
const template = (titulo, corpo) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  body { margin:0; padding:0; background:#05040f; font-family:'Helvetica Neue',Arial,sans-serif; }
  .wrap { max-width:600px; margin:0 auto; background:#0d0c1e; border:1px solid rgba(108,99,255,0.2); border-radius:16px; overflow:hidden; }
  .header { background:linear-gradient(135deg,#3B82F6,#6C63FF,#9333EA); padding:32px 40px; text-align:center; }
  .header h1 { color:#fff; font-size:28px; font-style:italic; letter-spacing:4px; margin:0; }
  .body { padding:40px; }
  .body p { color:rgba(200,195,255,0.75); font-size:14px; line-height:1.8; margin:0 0 16px; }
  .btn { display:inline-block; background:linear-gradient(135deg,#3B82F6,#6C63FF,#9333EA); color:#fff !important; text-decoration:none; padding:14px 36px; border-radius:50px; font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin:20px 0; }
  .divider { height:1px; background:rgba(108,99,255,0.15); margin:28px 0; }
  .footer { padding:20px 40px; text-align:center; }
  .footer p { color:rgba(200,195,255,0.25); font-size:11px; margin:0; letter-spacing:1px; }
  .highlight { color:#A78BFA; font-weight:600; }
  .box { background:rgba(108,99,255,0.08); border:1px solid rgba(108,99,255,0.15); border-radius:10px; padding:20px; margin:20px 0; }
</style>
</head>
<body>
<div style="padding:24px">
  <div class="wrap">
    <div class="header"><h1>N O I R  &amp;  O R</h1></div>
    <div class="body">
      <p style="font-size:18px;color:#fff;font-weight:600;margin-bottom:24px">${titulo}</p>
      ${corpo}
    </div>
    <div class="footer"><p>© ${new Date().getFullYear()} Noir & Or Atelier · Sabará, MG · Brasil</p></div>
  </div>
</div>
</body>
</html>
`

// ── Recuperação de senha ───────────────────────────────
export const enviarEmailRecuperacao = async (email, nome, token) => {
  const link = `${BASE_URL}/redefinir-senha?token=${token}`
  await transporter.sendMail({
    from: `"Noir & Or" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Redefinição de Senha · Noir & Or',
    html: template(
      `Olá, ${nome}`,
      `
      <p>Recebemos uma solicitação para redefinir a senha da sua conta Noir & Or.</p>
      <p>Clique no botão abaixo para criar uma nova senha. Este link expira em <span class="highlight">1 hora</span>.</p>
      <div style="text-align:center">
        <a href="${link}" class="btn">REDEFINIR SENHA</a>
      </div>
      <div class="divider"></div>
      <p>Se você não solicitou a redefinição, ignore este e-mail. Sua senha permanece a mesma.</p>
      `
    )
  })
}

// ── Confirmação de pedido ──────────────────────────────
export const enviarEmailPedido = async (email, nome, pedido) => {
  const itensHtml = pedido.itens.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(108,99,255,0.1);color:rgba(200,195,255,0.7);font-size:13px">${item.nome}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(108,99,255,0.1);color:rgba(200,195,255,0.7);font-size:13px;text-align:center">${item.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(108,99,255,0.1);color:#A78BFA;font-size:13px;text-align:right">R$ ${(item.preco*item.qty).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
    </tr>
  `).join('')
  const metodoLabel = { pix:'PIX', cartao:'Cartão de Crédito', boleto:'Boleto Bancário' }

  await transporter.sendMail({
    from: `"Noir & Or" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Pedido Confirmado #${pedido._id.toString().slice(-8).toUpperCase()} · Noir & Or`,
    html: template(
      `Pedido Confirmado, ${nome}! 🎉`,
      `
      <p>Seu pedido foi recebido e está sendo processado pelo nosso Atelier.</p>
      <div class="box">
        <p><span class="highlight">Pedido:</span> #${pedido._id.toString().slice(-8).toUpperCase()}</p>
        <p><span class="highlight">Pagamento:</span> ${metodoLabel[pedido.pagamento?.metodo] || pedido.pagamento?.metodo}</p>
        <p><span class="highlight">Status:</span> ${pedido.status === 'aprovado' ? '✅ Aprovado' : '⏳ Aguardando pagamento'}</p>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <th style="text-align:left;font-size:9px;letter-spacing:3px;color:rgba(108,99,255,0.7);padding-bottom:8px;border-bottom:1px solid rgba(108,99,255,0.2)">PRODUTO</th>
          <th style="text-align:center;font-size:9px;letter-spacing:3px;color:rgba(108,99,255,0.7);padding-bottom:8px;border-bottom:1px solid rgba(108,99,255,0.2)">QTD</th>
          <th style="text-align:right;font-size:9px;letter-spacing:3px;color:rgba(108,99,255,0.7);padding-bottom:8px;border-bottom:1px solid rgba(108,99,255,0.2)">VALOR</th>
        </tr>
        ${itensHtml}
      </table>
      <div style="text-align:right;margin-top:16px">
        <p style="color:#fff;font-size:18px;font-weight:600">Total: R$ ${pedido.total.toLocaleString('pt-BR',{minimumFractionDigits:2})}</p>
        <p style="font-size:11px;color:rgba(255,255,255,0.3)">Frete VIP: GRATUITO</p>
      </div>
      <div class="divider"></div>
      <p>Prazo de entrega: <span class="highlight">5 a 10 dias úteis</span> após confirmação do pagamento.</p>
      <p>Dúvidas? Fale conosco pelo WhatsApp ou e-mail contato@noiror.com.br</p>
      `
    )
  })
}

// ── Boas-vindas após cadastro ──────────────────────────
export const enviarEmailBoasVindas = async (email, nome) => {
  await transporter.sendMail({
    from: `"Noir & Or" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Bem-vindo ao Atelier · Noir & Or',
    html: template(
      `Bem-vindo, ${nome}!`,
      `
      <p>É um prazer tê-lo como membro do seleto círculo Noir & Or.</p>
      <p>Sua conta foi criada com sucesso. Agora você tem acesso a:</p>
      <div class="box">
        <p>✨ <span class="highlight">Edições limitadas</span> antes do lançamento público</p>
        <p>🚚 <span class="highlight">Frete VIP gratuito</span> em todos os pedidos</p>
        <p>💎 <span class="highlight">Atendimento exclusivo</span> 24h para membros</p>
        <p>🎁 <span class="highlight">Programa de fidelidade</span> com benefícios crescentes</p>
      </div>
      <div style="text-align:center">
        <a href="${BASE_URL}/loja" class="btn">EXPLORAR COLEÇÃO</a>
      </div>
      `
    )
  })
}

// ── E-mail de suporte (novo ticket / resposta) ─────────
export const enviarEmailSuporte = async (email, nome, ticketId, assunto, mensagem, tipo = 'novo') => {
  const linkTicket = `${BASE_URL}/minha-conta/suporte/${ticketId}`
  const subject = tipo === 'novo' 
    ? `[Suporte] Seu ticket #${ticketId.slice(-6).toUpperCase()} foi aberto`
    : `[Suporte] Nova resposta no ticket #${ticketId.slice(-6).toUpperCase()}`

  const corpo = tipo === 'novo'
    ? `
      <p>Olá, <strong>${nome}</strong>!</p>
      <p>Recebemos sua solicitação de suporte.</p>
      <div class="box">
        <p><span class="highlight">Assunto:</span> ${assunto}</p>
        <p><span class="highlight">Mensagem:</span><br/>${mensagem}</p>
        <p><span class="highlight">Ticket:</span> #${ticketId.slice(-6).toUpperCase()}</p>
      </div>
      <p>Nossa equipe responderá em até 24 horas úteis.</p>
      <div style="text-align:center">
        <a href="${linkTicket}" class="btn">ACOMPANHAR TICKET</a>
      </div>
    `
    : `
      <p>Olá, <strong>${nome}</strong>!</p>
      <p>Há uma nova resposta no seu ticket de suporte.</p>
      <div class="box">
        <p><span class="highlight">Assunto:</span> ${assunto}</p>
        <p><span class="highlight">Nova mensagem:</span><br/>${mensagem}</p>
      </div>
      <div style="text-align:center">
        <a href="${linkTicket}" class="btn">RESPONDER TICKET</a>
      </div>
    `

  await transporter.sendMail({
    from: `"Noir & Or Suporte" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: template(`Ticket de Suporte`, corpo)
  })
}