// ═══════════════════════════════════════════════════════════
//  NOIR & OR — EMAIL SERVICE
//  Powered by Nodemailer + Gmail
//  .env:  EMAIL_USER=seu@gmail.com  EMAIL_PASS=senha_de_app
// ═══════════════════════════════════════════════════════════
import nodemailer from 'nodemailer'

let transporter

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }
  return transporter
}

const FROM   = `Noir & Or <${process.env.EMAIL_USER}>`
const SITE   = process.env.SITE_URL || 'https://noiror.com.br'

// ── Design tokens ─────────────────────────────────────────
const GOLD    = '#C8A84B'
const GOLD_03 = 'rgba(200,168,75,0.05)'
const HAIR    = 'rgba(200,168,75,0.15)'
const SILK    = 'rgba(237,232,224,0.92)'
const SILK2   = 'rgba(237,232,224,0.60)'
const SILK3   = 'rgba(237,232,224,0.30)'
const VOID    = '#030303'
const DEEP    = '#0a0a0a'

const P    = `margin:0 0 14px;font-size:13px;font-weight:300;color:${SILK2};line-height:1.9;letter-spacing:.02em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif`
const P_SM = `margin:0 0 10px;font-size:11px;font-weight:300;color:${SILK3};line-height:1.8;letter-spacing:.02em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif`
const TD_IMG = `padding:12px 10px 12px 14px;vertical-align:middle;width:72px`
const TD_NFO = `padding:12px 10px;vertical-align:middle`
const TD_PRC = `padding:12px 14px;vertical-align:middle;text-align:right;font-family:monospace;font-size:12px;color:${GOLD};white-space:nowrap`

const fmt = (v) => (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

// ── Utilitário de envio ───────────────────────────────────
async function enviar({ to, subject, html, tag }) {
  try {
    const info = await getTransporter().sendMail({
      from:    FROM,
      to:      Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
    })
    console.log(`✉  [EMAIL] ${tag} → ${to} | id: ${info.messageId}`)
    return { ok: true, id: info.messageId }
  } catch (err) {
    console.error(`✖  [EMAIL ERROR] ${tag} → ${to}:`, err.message)
    return { ok: false, error: err.message }
  }
}

// ── Timeline step ─────────────────────────────────────────
function step({ feito, ativo, label, sub }) {
  const gem = feito ? '◆' : ativo ? '◈' : '◇'
  const cor  = feito ? GOLD : ativo ? SILK : SILK3
  return `
  <div style="display:flex;gap:14px;align-items:flex-start;padding:12px 0;border-bottom:0.5px solid ${HAIR}">
    <span style="font-size:8px;color:${cor};flex-shrink:0;margin-top:3px;width:12px;text-align:center;opacity:${feito||ativo?1:.5}">${gem}</span>
    <div>
      <p style="margin:0 0 2px;font-size:11px;letter-spacing:.08em;color:${cor};font-family:'Helvetica Neue',sans-serif;opacity:${feito||ativo?1:.55}">${label}</p>
      <p style="margin:0;font-size:10px;color:${SILK3};font-family:'Helvetica Neue',sans-serif">${sub}</p>
    </div>
  </div>`
}

// ═══════════════════════════════════════════════════════════
//  TEMPLATE BASE
// ═══════════════════════════════════════════════════════════
function templateBase({ kanji, titulo, subtitulo, corpo, cta, rodape, feats, alerta }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Noir &amp; Or</title>
</head>
<body style="margin:0;padding:0;background:${VOID};-webkit-font-smoothing:antialiased">
  <div style="display:none;max-height:0;overflow:hidden">${subtitulo} · Noir &amp; Or</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${VOID};min-height:100vh">
    <tr><td align="center" style="padding:40px 16px">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr><td height="1" style="background:linear-gradient(90deg,transparent,${GOLD},transparent);font-size:0;line-height:0">&nbsp;</td></tr>
        <tr>
          <td style="background:${DEEP};padding:32px 44px 26px;border-left:0.5px solid ${HAIR};border-right:0.5px solid ${HAIR}">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 12px;font-size:42px;color:${GOLD};opacity:.1;font-family:Georgia,serif;line-height:1;letter-spacing:.08em">${kanji}</p>
                  <p style="margin:0;font-size:13px;font-style:italic;letter-spacing:.55em;color:${GOLD};font-family:Georgia,'Times New Roman',serif">Noir<span style="opacity:.55">&amp;</span>Or</p>
                </td>
                <td align="right" valign="top">
                  <p style="margin:0;font-size:7px;letter-spacing:.45em;text-transform:uppercase;color:${SILK3};font-family:'Helvetica Neue',sans-serif">Maison Digitale</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:${DEEP};padding:0 44px;border-left:0.5px solid ${HAIR};border-right:0.5px solid ${HAIR}">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="height:0.5px;background:linear-gradient(90deg,transparent,${HAIR},transparent);font-size:0">&nbsp;</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:${DEEP};padding:36px 44px 32px;border-left:0.5px solid ${HAIR};border-right:0.5px solid ${HAIR}">
            <div style="width:36px;height:1.5px;background:linear-gradient(90deg,${GOLD},transparent);margin:0 0 22px;opacity:.7"></div>
            <h1 style="margin:0 0 8px;font-size:28px;font-weight:300;font-style:italic;color:${SILK};line-height:1.2;font-family:Georgia,'Times New Roman',serif;letter-spacing:-.01em">${titulo}</h1>
            <p style="margin:0 0 26px;font-size:8px;letter-spacing:.55em;text-transform:uppercase;color:${GOLD};opacity:.7;font-family:'Helvetica Neue',sans-serif">${subtitulo}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px">
              <tr>
                <td style="height:0.5px;background:${HAIR};width:45%"></td>
                <td align="center" width="20" style="font-size:5px;color:${GOLD};padding:0 6px;opacity:.5">◆</td>
                <td style="height:0.5px;background:${HAIR};width:45%"></td>
              </tr>
            </table>
            ${corpo}
            ${feats ? `
            <div style="border:0.5px solid ${HAIR};padding:20px 22px;margin:24px 0 0;background:${GOLD_03}">
              ${feats.map(f => `
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
                <span style="font-size:5px;color:${GOLD}">◆</span>
                <p style="margin:0;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:${SILK3};font-family:'Helvetica Neue',sans-serif">${f}</p>
              </div>`).join('')}
            </div>` : ''}
            ${cta ? `
            <div style="margin:30px 0 0;text-align:center">
              <a href="${cta.url}" style="display:inline-block;padding:15px 44px;background:transparent;border:0.5px solid ${GOLD};font-size:8px;font-weight:400;letter-spacing:.6em;text-transform:uppercase;color:${GOLD};text-decoration:none;font-family:'Helvetica Neue',sans-serif">
                ${cta.label} &nbsp;→
              </a>
              <p style="margin:12px 0 0;font-size:9px;color:${SILK3};word-break:break-all;font-family:'Helvetica Neue',sans-serif">
                ou cole no navegador: <span style="color:${SILK2}">${cta.url}</span>
              </p>
            </div>` : ''}
            ${alerta ? `
            <div style="margin:26px 0 0;padding:14px 18px;border:0.5px solid rgba(239,68,68,.25);border-left:2px solid rgba(239,68,68,.6);background:rgba(239,68,68,.04)">
              <p style="margin:0;font-size:10px;letter-spacing:.05em;color:rgba(239,68,68,.75);line-height:1.7;font-family:'Helvetica Neue',sans-serif">
                🔒 Nunca solicitamos sua senha por e-mail ou telefone.
              </p>
            </div>` : ''}
          </td>
        </tr>
        <tr>
          <td style="background:${VOID};padding:22px 44px 28px;border-left:0.5px solid rgba(200,168,75,.06);border-right:0.5px solid rgba(200,168,75,.06);border-bottom:0.5px solid rgba(200,168,75,.06)">
            <div style="text-align:center;margin-bottom:18px">
              <span style="font-size:7px;color:${GOLD};opacity:.25;letter-spacing:.9em">◆ &nbsp; ◇ &nbsp; ◆</span>
            </div>
            <p style="margin:0 0 8px;font-size:11px;color:${SILK3};line-height:1.7;text-align:center;font-family:'Helvetica Neue',sans-serif">${rodape}</p>
            <p style="margin:14px 0 0;font-size:8px;letter-spacing:.22em;text-transform:uppercase;color:rgba(237,232,224,.12);text-align:center;font-family:'Helvetica Neue',sans-serif">
              © ${new Date().getFullYear()} Noir &amp; Or · Todos os direitos reservados
            </p>
          </td>
        </tr>
        <tr><td height="1" style="background:linear-gradient(90deg,transparent,rgba(200,168,75,.3),transparent);font-size:0;line-height:0">&nbsp;</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ═══════════════════════════════════════════════════════════
//  1. CONFIRMAÇÃO DE CADASTRO
// ═══════════════════════════════════════════════════════════
export async function enviarConfirmacaoCadastro({ nome, email, tokenUrl }) {
  const primeiroNome = nome.split(' ')[0]
  return enviar({
    to: email, tag: 'confirmacao-cadastro',
    subject: 'Noir & Or · Confirme seu acesso ao atelier',
    html: templateBase({
      kanji: '入', titulo: `Bem-vindo ao atelier,<br/><em>${primeiroNome}</em>`,
      subtitulo: 'Confirme seu e-mail para ativar o acesso',
      corpo: `
        <p style="${P}">Você acaba de ingressar em um círculo seleto de apreciadores de tecnologia de alto padrão. Para ativar sua conta, confirme seu endereço de e-mail abaixo.</p>
        <p style="${P_SM}">Este link expira em <strong style="color:${GOLD}">24 horas</strong> e pode ser usado apenas uma vez.</p>
      `,
      cta: { label: 'Confirmar minha conta', url: tokenUrl },
      feats: ['Acesso a lançamentos exclusivos 48h antes', 'Frete VIP sempre gratuito', 'Programa de fidelidade Noir — pontos em cada compra'],
      rodape: 'Se você não criou esta conta, ignore este e-mail.',
    }),
  })
}

// ═══════════════════════════════════════════════════════════
//  2. CONFIRMAÇÃO DE COMPRA
// ═══════════════════════════════════════════════════════════
export async function enviarConfirmacaoCompra({ nome, email, pedido }) {
  const primeiroNome = (nome || 'Cliente').split(' ')[0]
  const itensHtml = (pedido.itens || []).map(item => `
    <tr style="border-bottom:0.5px solid ${HAIR}">
      <td style="${TD_IMG}">
        ${item.imagem
          ? `<img src="${item.imagem}" width="56" height="56" alt="${item.nome}" style="display:block;object-fit:cover;border:0.5px solid ${HAIR}"/>`
          : `<div style="width:56px;height:56px;background:${GOLD_03};border:0.5px solid ${HAIR};text-align:center;line-height:56px;color:${GOLD};font-size:18px;font-family:serif">◆</div>`
        }
      </td>
      <td style="${TD_NFO}">
        <p style="margin:0 0 3px;font-size:12px;letter-spacing:.04em;color:${SILK};font-family:'Helvetica Neue',sans-serif">${item.nome}</p>
        <p style="margin:0;font-size:10px;letter-spacing:.1em;color:${SILK3};font-family:'Helvetica Neue',sans-serif">${item.categoria || ''} · Qtd: ${item.qty || item.quantidade || 1}</p>
      </td>
      <td style="${TD_PRC}">R$ ${fmt((item.preco || 0) * (item.qty || item.quantidade || 1))}</td>
    </tr>
  `).join('')

  const dataFormatada = new Date(pedido.data || pedido.criadoEm || Date.now())
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return enviar({
    to: email, tag: 'confirmacao-compra',
    subject: `Noir & Or · Pedido #${pedido.numero || (pedido._id||'').toString().slice(-8).toUpperCase()} confirmado`,
    html: templateBase({
      kanji: '御',
      titulo: `Pedido confirmado,<br/><em>${primeiroNome}</em>`,
      subtitulo: `#${pedido.numero || (pedido._id||'').toString().slice(-8).toUpperCase()} · ${dataFormatada}`,
      corpo: `
        <p style="${P}">Seu pedido foi recebido e está sendo preparado com o cuidado que sua coleção merece.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:22px 0;border:0.5px solid ${HAIR}">
          <thead>
            <tr style="background:${GOLD_03};border-bottom:0.5px solid ${HAIR}">
              <th colspan="2" style="padding:10px 14px;text-align:left;font-size:7px;letter-spacing:.5em;font-weight:400;color:${GOLD};text-transform:uppercase;font-family:'Helvetica Neue',sans-serif">PEÇA</th>
              <th style="padding:10px 14px;text-align:right;font-size:7px;letter-spacing:.5em;font-weight:400;color:${GOLD};text-transform:uppercase;font-family:'Helvetica Neue',sans-serif">VALOR</th>
            </tr>
          </thead>
          <tbody>${itensHtml}</tbody>
          <tfoot>
            <tr style="background:${GOLD_03};border-top:0.5px solid ${HAIR}">
              <td colspan="2" style="padding:13px 14px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${SILK};font-weight:600;font-family:'Helvetica Neue',sans-serif">TOTAL</td>
              <td style="padding:13px 14px;text-align:right;font-size:17px;font-family:monospace;color:${GOLD};font-weight:700">R$ ${fmt(pedido.total)}</td>
            </tr>
          </tfoot>
        </table>
        ${pedido.entrega ? `
        <div style="border:0.5px solid ${HAIR};padding:16px 20px;margin:0 0 14px;background:${GOLD_03}">
          <p style="margin:0 0 8px;font-size:7px;letter-spacing:.5em;text-transform:uppercase;color:${GOLD};font-family:'Helvetica Neue',sans-serif">ENDEREÇO DE ENTREGA</p>
          <p style="margin:0;font-size:12px;color:${SILK2};line-height:1.75;font-family:'Helvetica Neue',sans-serif">
            ${pedido.entrega.endereco || ''}, ${pedido.entrega.numero || ''}<br/>
            ${pedido.entrega.bairro || ''} · ${pedido.entrega.cidade || ''}/${pedido.entrega.estado || ''}<br/>
            CEP ${pedido.entrega.cep || ''}
          </p>
        </div>` : ''}
        <div style="border:0.5px solid ${HAIR};padding:14px 20px;background:${GOLD_03}">
          <p style="margin:0;font-size:7px;letter-spacing:.5em;text-transform:uppercase;color:${GOLD};font-family:'Helvetica Neue',sans-serif;margin-bottom:6px">PAGAMENTO</p>
          <p style="margin:0;font-size:12px;color:${SILK2};font-family:'Helvetica Neue',sans-serif">${pedido.formaPagamento || pedido.pagamento?.metodo || 'Cartão de crédito'}</p>
        </div>
      `,
      cta: { label: 'Acompanhar meu pedido', url: `${SITE}/configuracoes?secao=pedidos` },
      rodape: 'Dúvidas? Responda este e-mail.',
    }),
  })
}

// ═══════════════════════════════════════════════════════════
//  3. PEDIDO A CAMINHO
// ═══════════════════════════════════════════════════════════
export async function enviarPedidoACaminho({ nome, email, pedido }) {
  const primeiroNome = (nome || 'Cliente').split(' ')[0]
  const rastreio = pedido.rastreamento

  return enviar({
    to: email, tag: 'pedido-a-caminho',
    subject: `Noir & Or · Seu pedido #${pedido.numero} está a caminho`,
    html: templateBase({
      kanji: '送',
      titulo: `Está a caminho,<br/><em>${primeiroNome}</em>`,
      subtitulo: `Pedido #${pedido.numero} · Despachado`,
      corpo: `
        <p style="${P}">Sua encomenda foi despachada e já está em trânsito.</p>
        ${rastreio?.codigo ? `
        <div style="background:${GOLD_03};border:0.5px solid ${GOLD};border-left:2px solid ${GOLD};padding:22px 26px;margin:22px 0;text-align:center">
          <p style="margin:0 0 8px;font-size:7px;letter-spacing:.6em;text-transform:uppercase;color:${GOLD};font-family:'Helvetica Neue',sans-serif">CÓDIGO DE RASTREAMENTO</p>
          <p style="margin:0;font-size:24px;font-family:monospace;letter-spacing:.2em;color:${SILK};font-weight:700">${rastreio.codigo}</p>
          <p style="margin:8px 0 0;font-size:10px;color:${SILK3};font-family:'Helvetica Neue',sans-serif">${rastreio.transportadora || 'Correios'}</p>
        </div>` : ''}
        <div style="margin:22px 0">
          ${step({ feito: true,  ativo: false, label: 'Pedido confirmado', sub: 'Pagamento aprovado' })}
          ${step({ feito: true,  ativo: false, label: 'Em preparação',     sub: 'Peças separadas e embaladas' })}
          ${step({ feito: false, ativo: true,  label: 'A caminho',         sub: 'Despachado — em trânsito' })}
          ${step({ feito: false, ativo: false, label: 'Entregue',          sub: 'Aguardando chegada' })}
        </div>
        <p style="${P}">Prazo estimado: <strong style="color:${GOLD}">${pedido.prazoEntrega || '5 a 10 dias úteis'}</strong>.</p>
      `,
      cta: { label: 'Acompanhar pedido', url: `${SITE}/configuracoes?secao=pedidos` },
      rodape: 'Problemas com a entrega? Responda este e-mail.',
    }),
  })
}

// ═══════════════════════════════════════════════════════════
//  4. REDEFINIÇÃO DE SENHA
// ═══════════════════════════════════════════════════════════
export async function enviarRedefinicaoSenha({ nome, email, tokenUrl, expiraEm = '1 hora' }) {
  return enviar({
    to: email, tag: 'redefinicao-senha',
    subject: 'Noir & Or · Redefinição de senha solicitada',
    html: templateBase({
      kanji: '鍵',
      titulo: `Redefinição<br/><em>de senha</em>`,
      subtitulo: `Solicitação recebida para ${email}`,
      corpo: `
        <p style="${P}">Recebemos uma solicitação para redefinir a senha da conta vinculada a <strong style="color:${GOLD}">${email}</strong>.</p>
        <div style="border:0.5px solid rgba(200,168,75,.3);border-left:2px solid ${GOLD};padding:16px 20px;margin:22px 0;background:${GOLD_03}">
          <p style="margin:0 0 6px;font-size:7px;letter-spacing:.55em;text-transform:uppercase;color:${GOLD};font-family:'Helvetica Neue',sans-serif">⚠ IMPORTANTE</p>
          <p style="margin:0;font-size:11px;color:${SILK2};line-height:1.75;font-family:'Helvetica Neue',sans-serif">
            Este link é válido por <strong style="color:${GOLD}">${expiraEm}</strong> e pode ser usado <strong style="color:${GOLD}">apenas uma vez</strong>.
          </p>
        </div>
        <p style="${P_SM}">Se você não solicitou a redefinição, ignore este e-mail.</p>
      `,
      cta: { label: 'Redefinir minha senha', url: tokenUrl },
      alerta: true,
      rodape: 'Por segurança, nunca compartilhe este link.',
    }),
  })
}

// ═══════════════════════════════════════════════════════════
//  5. SUPORTE
// ═══════════════════════════════════════════════════════════
export async function enviarEmailSuporte({ nome, email, ticketId, assunto, mensagem, tipo = 'novo' }) {
  const idCurto = ticketId.toString().slice(-6).toUpperCase()
  const isNovo  = tipo === 'novo'

  return enviar({
    to: email, tag: isNovo ? 'suporte-novo' : 'suporte-resposta',
    subject: isNovo
      ? `Noir & Or · Ticket #${idCurto} aberto com sucesso`
      : `Noir & Or · Nova resposta no ticket #${idCurto}`,
    html: templateBase({
      kanji: '助',
      titulo: isNovo ? `Ticket aberto,<br/><em>${(nome||'Cliente').split(' ')[0]}</em>` : `Nova resposta<br/><em>no seu ticket</em>`,
      subtitulo: `#${idCurto} · ${assunto}`,
      corpo: `
        <p style="${P}">${isNovo ? 'Recebemos sua solicitação. Nossa equipe responderá em até <strong style="color:'+GOLD+'">24 horas úteis</strong>.' : 'Nossa equipe adicionou uma resposta ao seu ticket.'}</p>
        <div style="border:0.5px solid ${HAIR};padding:20px 24px;margin:22px 0;background:${GOLD_03}">
          <p style="margin:0 0 10px;font-size:11px;color:${SILK3};font-family:'Helvetica Neue',sans-serif"><strong style="color:${SILK2}">Assunto:</strong> ${assunto}</p>
          <p style="margin:0;font-size:13px;color:${SILK2};line-height:1.75;font-family:'Helvetica Neue',sans-serif">${mensagem}</p>
        </div>
      `,
      cta: { label: isNovo ? 'Acompanhar ticket' : 'Responder ticket', url: `${SITE}/configuracoes?secao=suporte` },
      rodape: 'Dúvidas? Responda diretamente este e-mail.',
    }),
  })
}