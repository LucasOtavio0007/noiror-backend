// ═══════════════════════════════════════════════════════════
//  NOIR & OR — EMAIL SERVICE  (versão unificada)
//  Powered by Resend  ·  npm install resend
//  .env:  RESEND_API_KEY · EMAIL_DOMAIN · SITE_URL
// ═══════════════════════════════════════════════════════════
import { Resend } from 'resend'

let resend

function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

const FROM   = `Noir & Or <noreply@${process.env.EMAIL_DOMAIN || 'noiror.com.br'}>`
const REPLY  = `contato@${process.env.EMAIL_DOMAIN || 'noiror.com.br'}`
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

// ── Estilos inline reutilizáveis ──────────────────────────
const P    = `margin:0 0 14px;font-size:13px;font-weight:300;color:${SILK2};line-height:1.9;letter-spacing:.02em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif`
const P_SM = `margin:0 0 10px;font-size:11px;font-weight:300;color:${SILK3};line-height:1.8;letter-spacing:.02em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif`

// ── Utilitários ───────────────────────────────────────────
const fmt = (v) => (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

const dataFormatada = (d) =>
  new Date(d || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

const primeiroNome = (nome) => (nome || 'Cliente').split(' ')[0]

// ── Utilitário de envio ───────────────────────────────────
async function enviar({ to, subject, html, tag }) {
  try {
    const { data, error } = await getResend().emails.send({
      from:     FROM,
      reply_to: REPLY,
      to:       Array.isArray(to) ? to : [to],
      subject,
      html,
      tags: [{ name: 'tipo', value: tag }],
    })
    if (error) throw new Error(error.message)
    console.log(`✉  [EMAIL] ${tag} → ${to} | id: ${data.id}`)
    return { ok: true, id: data.id }
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
<meta name="color-scheme" content="dark"/>
<title>Noir &amp; Or</title>
</head>
<body style="margin:0;padding:0;background:${VOID};-webkit-font-smoothing:antialiased">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${subtitulo} · Noir &amp; Or ◆&zwnj;&nbsp;&zwnj;&nbsp;</div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:${VOID};min-height:100vh">
    <tr><td align="center" style="padding:40px 16px">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Linha dourada superior -->
        <tr><td height="1" style="background:linear-gradient(90deg,transparent,${GOLD},transparent);font-size:0;line-height:0">&nbsp;</td></tr>

        <!-- Header -->
        <tr>
          <td style="background:${DEEP};padding:32px 44px 26px;border-left:0.5px solid ${HAIR};border-right:0.5px solid ${HAIR}">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 12px;font-size:42px;color:${GOLD};opacity:.1;font-family:Georgia,serif;line-height:1;letter-spacing:.08em">${kanji}</p>
                  <p style="margin:0;font-size:13px;font-style:italic;letter-spacing:.55em;color:${GOLD};font-family:Georgia,'Times New Roman',serif">
                    Noir<span style="opacity:.55">&amp;</span>Or
                  </p>
                </td>
                <td align="right" valign="top">
                  <p style="margin:0;font-size:7px;letter-spacing:.45em;text-transform:uppercase;color:${SILK3};font-family:'Helvetica Neue',sans-serif">Maison Digitale</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Separador -->
        <tr>
          <td style="background:${DEEP};padding:0 44px;border-left:0.5px solid ${HAIR};border-right:0.5px solid ${HAIR}">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="height:0.5px;background:linear-gradient(90deg,transparent,${HAIR},transparent);font-size:0">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="background:${DEEP};padding:36px 44px 32px;border-left:0.5px solid ${HAIR};border-right:0.5px solid ${HAIR}">
            <div style="width:36px;height:1.5px;background:linear-gradient(90deg,${GOLD},transparent);margin:0 0 22px;opacity:.7"></div>
            <h1 style="margin:0 0 8px;font-size:28px;font-weight:300;font-style:italic;color:${SILK};line-height:1.2;font-family:Georgia,'Times New Roman',serif;letter-spacing:-.01em">${titulo}</h1>
            <p style="margin:0 0 26px;font-size:8px;letter-spacing:.55em;text-transform:uppercase;color:${GOLD};opacity:.7;font-family:'Helvetica Neue',sans-serif">${subtitulo}</p>

            <!-- Divisor ◆ -->
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
                Se não foi você, <a href="mailto:${REPLY}" style="color:rgba(239,68,68,.85)">nos avise imediatamente</a>.
              </p>
            </div>` : ''}
          </td>
        </tr>

        <!-- Rodapé -->
        <tr>
          <td style="background:${VOID};padding:22px 44px 28px;border-left:0.5px solid rgba(200,168,75,.06);border-right:0.5px solid rgba(200,168,75,.06);border-bottom:0.5px solid rgba(200,168,75,.06)">
            <div style="text-align:center;margin-bottom:18px">
              <span style="font-size:7px;color:${GOLD};opacity:.25;letter-spacing:.9em">◆ &nbsp; ◇ &nbsp; ◆</span>
            </div>
            <p style="margin:0 0 8px;font-size:11px;color:${SILK3};line-height:1.7;text-align:center;font-family:'Helvetica Neue',sans-serif">${rodape}</p>
            <p style="margin:4px 0 0;font-size:8px;color:rgba(237,232,224,.12);text-align:center;font-family:'Helvetica Neue',sans-serif">Sabará, MG · Brasil</p>
            <p style="margin:10px 0 0;font-size:8px;letter-spacing:.22em;text-transform:uppercase;color:rgba(237,232,224,.12);text-align:center;font-family:'Helvetica Neue',sans-serif">
              © ${new Date().getFullYear()} Noir &amp; Or · Todos os direitos reservados
            </p>
            <p style="margin:8px 0 0;font-size:8px;letter-spacing:.14em;color:rgba(237,232,224,.09);text-align:center;font-family:'Helvetica Neue',sans-serif">
              <a href="${SITE}/descadastrar" style="color:rgba(237,232,224,.18);text-decoration:none">Descadastrar</a>
              &nbsp;·&nbsp;
              <a href="${SITE}/politica-privacidade" style="color:rgba(237,232,224,.18);text-decoration:none">Privacidade</a>
            </p>
          </td>
        </tr>

        <!-- Linha dourada inferior -->
        <tr><td height="1" style="background:linear-gradient(90deg,transparent,rgba(200,168,75,.3),transparent);font-size:0;line-height:0">&nbsp;</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ═══════════════════════════════════════════════════════════
//  1. CONFIRMAÇÃO DE CADASTRO
//  { nome, email, tokenUrl }
// ═══════════════════════════════════════════════════════════
export async function enviarConfirmacaoCadastro({ nome, email, tokenUrl }) {
  return enviar({
    to:      email,
    subject: 'Noir & Or · Confirme seu acesso ao atelier',
    tag:     'confirmacao-cadastro',
    html: templateBase({
      kanji:    '入',
      titulo:   `Bem-vindo ao atelier,<br/><em>${primeiroNome(nome)}</em>`,
      subtitulo:'Confirme seu e-mail para ativar o acesso',
      corpo: `
        <p style="${P}">Você acaba de ingressar em um círculo seleto de apreciadores de tecnologia de alto padrão. Para ativar sua conta e acessar todos os benefícios VIP, confirme seu endereço de e-mail abaixo.</p>
        <p style="${P_SM}">Este link expira em <strong style="color:${GOLD}">24 horas</strong> e pode ser usado apenas uma vez.</p>
      `,
      cta:   { label: 'Confirmar minha conta', url: tokenUrl },
      feats: [
        'Acesso a lançamentos exclusivos 48h antes',
        'Frete VIP sempre gratuito',
        'Programa de fidelidade Noir — pontos em cada compra',
      ],
      rodape: 'Se você não criou esta conta, ignore este e-mail com segurança. Nenhuma ação será tomada.',
    }),
  })
}

// ═══════════════════════════════════════════════════════════
//  2. BOAS-VINDAS (após confirmar e-mail)
//  { nome, email }
// ═══════════════════════════════════════════════════════════
export async function enviarEmailBoasVindas({ nome, email }) {
  return enviar({
    to:      email,
    subject: 'Noir & Or · Bem-vindo ao Atelier',
    tag:     'boas-vindas',
    html: templateBase({
      kanji:    '歓',
      titulo:   `É um prazer,<br/><em>${primeiroNome(nome)}</em>`,
      subtitulo:'Sua conta está ativa',
      corpo: `
        <p style="${P}">Sua conta foi confirmada com sucesso. A partir de agora você faz parte de um círculo seleto de apreciadores.</p>
        <p style="${P}">Explore a coleção e descubra peças que definem um novo padrão de excelência.</p>
      `,
      cta:   { label: 'Explorar a coleção', url: `${SITE}/loja` },
      feats: [
        'Edições limitadas antes do lançamento público',
        'Frete VIP gratuito em todos os pedidos',
        'Atendimento exclusivo para membros',
        'Programa de fidelidade com benefícios crescentes',
      ],
      rodape: 'Dúvidas? Fale com nosso Concierge respondendo este e-mail.',
    }),
  })
}

// ═══════════════════════════════════════════════════════════
//  3. CONFIRMAÇÃO DE COMPRA
//  { nome, email, pedido: { numero, data, itens, subtotal,
//    total, endereco, formaPagamento } }
// ═══════════════════════════════════════════════════════════
export async function enviarConfirmacaoCompra({ nome, email, pedido }) {
  const itensHtml = (pedido.itens || []).map(item => `
    <tr style="border-bottom:0.5px solid ${HAIR}">
      <td style="padding:12px 10px 12px 14px;vertical-align:middle;width:72px">
        ${item.imagem
          ? `<img src="${item.imagem}" width="56" height="56" alt="${item.nome}" style="display:block;object-fit:cover;border:0.5px solid ${HAIR}"/>`
          : `<div style="width:56px;height:56px;background:${GOLD_03};border:0.5px solid ${HAIR};text-align:center;line-height:56px;color:${GOLD};font-size:18px;font-family:serif">◆</div>`
        }
      </td>
      <td style="padding:12px 10px;vertical-align:middle">
        <p style="margin:0 0 3px;font-size:12px;letter-spacing:.04em;color:${SILK};font-family:'Helvetica Neue',sans-serif">${item.nome}</p>
        <p style="margin:0;font-size:10px;letter-spacing:.1em;color:${SILK3};font-family:'Helvetica Neue',sans-serif">
          ${item.categoria || ''}${item.categoria && item.qty ? ' · ' : ''}${item.qty || item.quantidade ? `Qtd: ${item.qty || item.quantidade}` : ''}
        </p>
      </td>
      <td style="padding:12px 14px;vertical-align:middle;text-align:right;font-family:monospace;font-size:12px;color:${GOLD};white-space:nowrap">
        R$ ${fmt((item.preco || 0) * (item.qty || item.quantidade || 1))}
      </td>
    </tr>
  `).join('')

  const enderecoHtml = pedido.endereco ? `
    <div style="border:0.5px solid ${HAIR};padding:16px 20px;margin:0 0 14px;background:${GOLD_03}">
      <p style="margin:0 0 8px;font-size:7px;letter-spacing:.5em;text-transform:uppercase;color:${GOLD};font-family:'Helvetica Neue',sans-serif">ENDEREÇO DE ENTREGA</p>
      <p style="margin:0;font-size:12px;color:${SILK2};line-height:1.75;font-family:'Helvetica Neue',sans-serif">
        ${pedido.endereco.endereco || pedido.endereco.rua || ''}, ${pedido.endereco.numero || ''}
        ${pedido.endereco.complemento ? ', ' + pedido.endereco.complemento : ''}<br/>
        ${pedido.endereco.bairro || ''} · ${pedido.endereco.cidade || ''}/${pedido.endereco.estado || ''}<br/>
        CEP ${pedido.endereco.cep || ''}
      </p>
    </div>` : ''

  return enviar({
    to:      email,
    subject: `Noir & Or · Pedido #${pedido.numero} confirmado`,
    tag:     'confirmacao-compra',
    html: templateBase({
      kanji:    '御',
      titulo:   `Pedido confirmado,<br/><em>${primeiroNome(nome)}</em>`,
      subtitulo:`#${pedido.numero} · ${dataFormatada(pedido.data)}`,
      corpo: `
        <p style="${P}">Seu pedido foi recebido e está sendo preparado com o cuidado que sua coleção merece. Você receberá uma nova notificação assim que for despachado.</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:22px 0;border:0.5px solid ${HAIR}">
          <thead>
            <tr style="background:${GOLD_03};border-bottom:0.5px solid ${HAIR}">
              <th colspan="2" style="padding:10px 14px;text-align:left;font-size:7px;letter-spacing:.5em;font-weight:400;color:${GOLD};text-transform:uppercase;font-family:'Helvetica Neue',sans-serif">PEÇA</th>
              <th style="padding:10px 14px;text-align:right;font-size:7px;letter-spacing:.5em;font-weight:400;color:${GOLD};text-transform:uppercase;font-family:'Helvetica Neue',sans-serif">VALOR</th>
            </tr>
          </thead>
          <tbody>${itensHtml}</tbody>
          <tfoot>
            ${pedido.subtotal && pedido.subtotal !== pedido.total ? `
            <tr>
              <td colspan="2" style="padding:11px 14px;font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:${SILK3};font-family:'Helvetica Neue',sans-serif">SUBTOTAL</td>
              <td style="padding:11px 14px;text-align:right;font-size:12px;font-family:monospace;color:${SILK2}">R$ ${fmt(pedido.subtotal)}</td>
            </tr>` : ''}
            <tr>
              <td colspan="2" style="padding:4px 14px;font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:${GOLD};opacity:.75;font-family:'Helvetica Neue',sans-serif">ENVIO VIP</td>
              <td style="padding:4px 14px;text-align:right;font-size:11px;color:${GOLD};font-family:monospace">Grátis</td>
            </tr>
            <tr style="background:${GOLD_03};border-top:0.5px solid ${HAIR}">
              <td colspan="2" style="padding:13px 14px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${SILK};font-weight:600;font-family:'Helvetica Neue',sans-serif">TOTAL</td>
              <td style="padding:13px 14px;text-align:right;font-size:17px;font-family:monospace;color:${GOLD};font-weight:700">R$ ${fmt(pedido.total)}</td>
            </tr>
          </tfoot>
        </table>

        ${enderecoHtml}

        <div style="border:0.5px solid ${HAIR};padding:14px 20px;background:${GOLD_03}">
          <p style="margin:0;font-size:7px;letter-spacing:.5em;text-transform:uppercase;color:${GOLD};font-family:'Helvetica Neue',sans-serif;margin-bottom:6px">PAGAMENTO</p>
          <p style="margin:0;font-size:12px;color:${SILK2};font-family:'Helvetica Neue',sans-serif">${pedido.formaPagamento || 'Cartão de crédito'}</p>
        </div>
      `,
      cta:    { label: 'Acompanhar meu pedido', url: `${SITE}/configuracoes?secao=pedidos&id=${pedido.numero}` },
      rodape: 'Dúvidas? Responda este e-mail ou acesse nosso Concierge.',
    }),
  })
}

// ═══════════════════════════════════════════════════════════
//  4. PEDIDO A CAMINHO
//  { nome, email, pedido: { numero, rastreamento: { codigo,
//    transportadora, url }, prazoEntrega } }
// ═══════════════════════════════════════════════════════════
export async function enviarPedidoACaminho({ nome, email, pedido }) {
  const rastreio = pedido.rastreamento

  const blocoRastreio = rastreio?.codigo ? `
    <div style="background:${GOLD_03};border:0.5px solid ${GOLD};border-left:2px solid ${GOLD};padding:22px 26px;margin:22px 0;text-align:center">
      <p style="margin:0 0 8px;font-size:7px;letter-spacing:.6em;text-transform:uppercase;color:${GOLD};font-family:'Helvetica Neue',sans-serif">CÓDIGO DE RASTREAMENTO</p>
      <p style="margin:0;font-size:24px;font-family:monospace;letter-spacing:.2em;color:${SILK};font-weight:700">${rastreio.codigo}</p>
      <p style="margin:8px 0 0;font-size:10px;color:${SILK3};font-family:'Helvetica Neue',sans-serif">${rastreio.transportadora || 'Correios'}</p>
    </div>
    ${rastreio.url ? `
    <div style="text-align:center;margin:0 0 24px">
      <a href="${rastreio.url}" style="display:inline-block;padding:10px 28px;border:0.5px solid ${HAIR};font-size:9px;letter-spacing:.38em;text-transform:uppercase;color:${SILK3};text-decoration:none;font-family:'Helvetica Neue',sans-serif">
        Rastrear na transportadora →
      </a>
    </div>` : ''}
  ` : `
    <div style="border:0.5px solid ${HAIR};padding:16px 20px;margin:22px 0;background:${GOLD_03}">
      <p style="margin:0;font-size:12px;color:${SILK2};font-family:'Helvetica Neue',sans-serif">Seu pedido foi despachado. O código de rastreamento será disponibilizado em breve.</p>
    </div>
  `

  return enviar({
    to:      email,
    subject: `Noir & Or · Seu pedido #${pedido.numero} está a caminho`,
    tag:     'pedido-a-caminho',
    html: templateBase({
      kanji:    '送',
      titulo:   `Está a caminho,<br/><em>${primeiroNome(nome)}</em>`,
      subtitulo:`Pedido #${pedido.numero} · Despachado`,
      corpo: `
        <p style="${P}">Sua encomenda foi despachada e já está em trânsito. Acompanhe em tempo real com o código abaixo.</p>
        ${blocoRastreio}
        <div style="margin:22px 0">
          ${step({ feito: true,  ativo: false, label: 'Pedido confirmado', sub: 'Pagamento aprovado' })}
          ${step({ feito: true,  ativo: false, label: 'Em preparação',     sub: 'Peças separadas e embaladas' })}
          ${step({ feito: false, ativo: true,  label: 'A caminho',         sub: 'Despachado — em trânsito' })}
          ${step({ feito: false, ativo: false, label: 'Entregue',          sub: 'Aguardando chegada' })}
        </div>
        <p style="${P}">Prazo estimado: <strong style="color:${GOLD}">${pedido.prazoEntrega || '5 a 10 dias úteis'}</strong>.</p>
      `,
      cta:    { label: 'Acompanhar pedido', url: `${SITE}/configuracoes?secao=pedidos&id=${pedido.numero}` },
      rodape: 'Problemas com a entrega? Entre em contato pelo nosso Concierge.',
    }),
  })
}

// ═══════════════════════════════════════════════════════════
//  5. REDEFINIÇÃO DE SENHA
//  { nome, email, tokenUrl, expiraEm? }
// ═══════════════════════════════════════════════════════════
export async function enviarRedefinicaoSenha({ nome, email, tokenUrl, expiraEm = '1 hora' }) {
  return enviar({
    to:      email,
    subject: 'Noir & Or · Redefinição de senha solicitada',
    tag:     'redefinicao-senha',
    html: templateBase({
      kanji:    '鍵',
      titulo:   `Redefinição<br/><em>de senha</em>`,
      subtitulo:`Solicitação recebida para ${email}`,
      corpo: `
        <p style="${P}">Recebemos uma solicitação para redefinir a senha da conta vinculada a <strong style="color:${GOLD}">${email}</strong>. Se foi você, clique no botão abaixo para criar uma nova senha.</p>
        <div style="border:0.5px solid rgba(200,168,75,.3);border-left:2px solid ${GOLD};padding:16px 20px;margin:22px 0;background:${GOLD_03}">
          <p style="margin:0 0 6px;font-size:7px;letter-spacing:.55em;text-transform:uppercase;color:${GOLD};font-family:'Helvetica Neue',sans-serif">⚠ IMPORTANTE</p>
          <p style="margin:0;font-size:11px;color:${SILK2};line-height:1.75;font-family:'Helvetica Neue',sans-serif">
            Este link é válido por <strong style="color:${GOLD}">${expiraEm}</strong> e pode ser usado <strong style="color:${GOLD}">apenas uma vez</strong>.<br/>
            Após redefinir, todos os outros acessos serão encerrados automaticamente.
          </p>
        </div>
        <p style="${P_SM}">Se você <strong>não</strong> solicitou a redefinição, ignore este e-mail. Sua senha permanece inalterada.</p>
      `,
      cta:    { label: 'Redefinir minha senha', url: tokenUrl },
      alerta: true,
      rodape: 'Por segurança, nunca compartilhe este link. Nossa equipe jamais solicitará sua senha.',
    }),
  })
}

// ═══════════════════════════════════════════════════════════
//  6. SUPORTE (novo ticket ou resposta)
//  { nome, email, ticketId, assunto, mensagem, tipo? }
//  tipo: 'novo' (padrão) | 'resposta'
// ═══════════════════════════════════════════════════════════
export async function enviarEmailSuporte({ nome, email, ticketId, assunto, mensagem, tipo = 'novo' }) {
  const idCurto   = ticketId.toString().slice(-6).toUpperCase()
  const linkTicket = `${SITE}/configuracoes?secao=suporte&ticket=${ticketId}`
  const isNovo    = tipo === 'novo'

  return enviar({
    to:      email,
    subject: isNovo
      ? `Noir & Or · Ticket #${idCurto} aberto com sucesso`
      : `Noir & Or · Nova resposta no ticket #${idCurto}`,
    tag:     isNovo ? 'suporte-novo' : 'suporte-resposta',
    html: templateBase({
      kanji:    '助',
      titulo:   isNovo
        ? `Ticket aberto,<br/><em>${primeiroNome(nome)}</em>`
        : `Nova resposta<br/><em>no seu ticket</em>`,
      subtitulo: `#${idCurto} · ${assunto}`,
      corpo: `
        ${isNovo
          ? `<p style="${P}">Recebemos sua solicitação de suporte. Nossa equipe responderá em até <strong style="color:${GOLD}">24 horas úteis</strong>.</p>`
          : `<p style="${P}">Olá, <strong>${primeiroNome(nome)}</strong>. Nossa equipe adicionou uma resposta ao seu ticket.</p>`
        }
        <div style="border:0.5px solid ${HAIR};padding:20px 24px;margin:22px 0;background:${GOLD_03}">
          <p style="margin:0 0 8px;font-size:7px;letter-spacing:.5em;text-transform:uppercase;color:${GOLD};font-family:'Helvetica Neue',sans-serif">
            ${isNovo ? 'SUA MENSAGEM' : 'RESPOSTA DA EQUIPE'}
          </p>
          <p style="margin:0 0 10px;font-size:11px;color:${SILK3};font-family:'Helvetica Neue',sans-serif">
            <strong style="color:${SILK2}">Assunto:</strong> ${assunto}
          </p>
          <p style="margin:0;font-size:13px;color:${SILK2};line-height:1.75;font-family:'Helvetica Neue',sans-serif">${mensagem}</p>
        </div>
        <p style="${P_SM}">Ticket: <strong style="color:${GOLD}">#${idCurto}</strong></p>
      `,
      cta:    { label: isNovo ? 'Acompanhar ticket' : 'Responder ticket', url: linkTicket },
      rodape: 'Dúvidas urgentes? Responda diretamente este e-mail.',
    }),
  })
}