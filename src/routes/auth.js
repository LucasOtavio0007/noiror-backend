// ═══════════════════════════════════════════════════════════
//  NOIR & OR — ROTAS DE AUTH
//  Segurança: Google ≠ senha (contas separadas por provider)
// ═══════════════════════════════════════════════════════════
import express   from 'express'
import bcrypt    from 'bcryptjs'
import jwt       from 'jsonwebtoken'
import User      from '../models/User.js'
import Token     from '../models/Token.js'
import { autenticar } from '../middleware/auth.js'
import {
  enviarConfirmacaoCadastro,
  enviarRedefinicaoSenha,
} from '../services/emailService.js'

const router = express.Router()
const SITE   = process.env.SITE_URL || 'https://noiror.com.br'

const gerarJWT = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

router.post('/cadastro', async (req, res) => {
  try {
    const { nome, sobrenome, email, senha } = req.body
    if (!nome?.trim())              return res.status(400).json({ erro: 'Nome obrigatório.' })
    if (!email?.includes('@'))      return res.status(400).json({ erro: 'E-mail inválido.' })
    if (!senha || senha.length < 8) return res.status(400).json({ erro: 'Senha com mínimo 8 caracteres.' })

    const existe = await User.findOne({ email: email.toLowerCase() })
    if (existe) {
      if (existe.provider === 'google') {
        return res.status(409).json({
          erro: 'Este e-mail já está vinculado a uma conta Google. Use o botão "Entrar com Google".',
          provider: 'google',
        })
      }
      return res.status(409).json({ erro: 'E-mail já cadastrado.' })
    }

    const hash    = await bcrypt.hash(senha, 12)
    const usuario = await User.create({
      nome:            nome.trim(),
      sobrenome:       sobrenome?.trim() || '',
      email:           email.toLowerCase(),
      senha:           hash,
      provider:        'email',
      emailVerificado: false,
    })

    const tokenStr = await Token.gerar(usuario._id, 'confirmacao-email', 24)
    enviarConfirmacaoCadastro({
      nome:     usuario.nome,
      email:    usuario.email,
      tokenUrl: `${SITE}/verificar-email?token=${tokenStr}`,
    }).catch(e => console.error('[EMAIL CADASTRO]', e.message))

    return res.status(201).json({
      mensagem: 'Conta criada! Verifique seu e-mail para confirmar o acesso.',
      token:    gerarJWT(usuario._id),
      usuario:  {
        id:              usuario._id,
        nome:            usuario.nome,
        email:           usuario.email,
        emailVerificado: false,
        provider:        'email',
      },
    })
  } catch (err) {
    console.error('[CADASTRO]', err)
    return res.status(500).json({ erro: 'Erro interno. Tente novamente.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body
    if (!email?.includes('@')) return res.status(400).json({ erro: 'E-mail inválido.' })
    if (!senha)                 return res.status(400).json({ erro: 'Senha obrigatória.' })

    const usuario = await User.findOne({ email: email.toLowerCase() }).select('+senha')
    if (!usuario) return res.status(401).json({ erro: 'E-mail ou senha incorretos.' })

    if (usuario.provider === 'google' || !usuario.senha) {
      return res.status(401).json({
        erro: 'Esta conta foi criada via Google. Use o botão "Entrar com Google".',
        provider: 'google',
      })
    }

    const senhaOk = await bcrypt.compare(senha, usuario.senha)
    if (!senhaOk) return res.status(401).json({ erro: 'E-mail ou senha incorretos.' })

    return res.json({
      token:   gerarJWT(usuario._id),
      usuario: {
        id:              usuario._id,
        nome:            usuario.nome,
        email:           usuario.email,
        emailVerificado: usuario.emailVerificado,
        vip:             usuario.vip,
       isAdmin: usuario.role === 'admin',
        provider:        usuario.provider,
      },
    })
  } catch (err) {
    console.error('[LOGIN]', err)
    return res.status(500).json({ erro: 'Erro interno. Tente novamente.' })
  }
})

router.post('/google', async (req, res) => {
  try {
    const { email, name, sub: googleId, picture } = req.body
    if (!email || !googleId) return res.status(400).json({ erro: 'Dados do Google inválidos.' })

    let usuario = await User.findOne({ email: email.toLowerCase() })

    if (usuario) {
      if (usuario.provider === 'email') {
        return res.status(409).json({
          erro: 'Este e-mail já tem uma conta com senha. Faça login com e-mail e senha, ou redefina a senha.',
          provider: 'email',
        })
      }
      usuario.avatar   = picture || usuario.avatar
      usuario.googleId = googleId
      await usuario.save()
    } else {
      const [nome, ...resto] = (name || 'Usuário').split(' ')
      usuario = await User.create({
        nome,
        sobrenome:       resto.join(' '),
        email:           email.toLowerCase(),
        googleId,
        avatar:          picture || '',
        provider:        'google',
        emailVerificado: true,
      })
    }

    return res.json({
      token:   gerarJWT(usuario._id),
      usuario: {
        id:              usuario._id,
        nome:            usuario.nome,
        email:           usuario.email,
        avatar:          usuario.avatar,
        emailVerificado: true,
        vip:             usuario.vip,
        isAdmin: usuario.role === 'admin',
        provider:        'google',
      },
    })
  } catch (err) {
    console.error('[LOGIN GOOGLE]', err)
    return res.status(500).json({ erro: 'Erro ao autenticar com Google.' })
  }
})

router.get('/confirmar-email', async (req, res) => {
  try {
    const { token } = req.query
    if (!token) return res.redirect(`${SITE}/login?erro=token-ausente`)
    const userId = await Token.verificar(token, 'confirmacao-email')
    await User.findByIdAndUpdate(userId, { emailVerificado: true })
    return res.redirect(`${SITE}/login?verificado=1`)
  } catch (err) {
    console.error('[CONFIRMAR EMAIL]', err)
    const msg = err.message.includes('expirado') ? 'token-expirado' : 'token-invalido'
    return res.redirect(`${SITE}/login?erro=${msg}`)
  }
})

router.post('/reenviar-confirmacao', autenticar, async (req, res) => {
  try {
    const usuario = await User.findById(req.userId)
    if (!usuario)                return res.status(404).json({ erro: 'Usuário não encontrado.' })
    if (usuario.emailVerificado) return res.status(400).json({ erro: 'E-mail já confirmado.' })

    const tokenStr = await Token.gerar(usuario._id, 'confirmacao-email', 24)
    enviarConfirmacaoCadastro({
      nome:     usuario.nome,
      email:    usuario.email,
      tokenUrl: `${SITE}/verificar-email?token=${tokenStr}`,
    }).catch(e => console.error('[EMAIL REENVIO]', e.message))

    return res.json({ mensagem: 'E-mail de confirmação reenviado.' })
  } catch (err) {
    console.error('[REENVIO CONFIRMACAO]', err)
    return res.status(500).json({ erro: 'Erro ao reenviar.' })
  }
})

router.post('/esqueci-senha', async (req, res) => {
  try {
    const { email } = req.body
    if (!email?.includes('@')) return res.status(400).json({ erro: 'E-mail inválido.' })

    const usuario = await User.findOne({ email: email.toLowerCase() })
    if (usuario && usuario.provider !== 'google') {
      const tokenStr = await Token.gerar(usuario._id, 'redefinicao-senha', 1)
      enviarRedefinicaoSenha({
        nome:     usuario.nome,
        email:    usuario.email,
        tokenUrl: `${SITE}/redefinir-senha?token=${tokenStr}`,
        expiraEm: '1 hora',
      }).catch(e => console.error('[EMAIL RESET SENHA]', e.message))
    }

    return res.json({ mensagem: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.' })
  } catch (err) {
    console.error('[ESQUECI SENHA]', err)
    return res.status(500).json({ erro: 'Erro interno.' })
  }
})

router.post('/redefinir-senha', async (req, res) => {
  try {
    const { token, novaSenha } = req.body
    if (!token)                         return res.status(400).json({ erro: 'Token obrigatório.' })
    if (!novaSenha || novaSenha.length < 8) return res.status(400).json({ erro: 'Nova senha com mínimo 8 caracteres.' })

    const userId = await Token.verificar(token, 'redefinicao-senha')
    const hash   = await bcrypt.hash(novaSenha, 12)
    await User.findByIdAndUpdate(userId, { senha: hash })

    return res.json({ mensagem: 'Senha redefinida com sucesso. Faça login novamente.' })
  } catch (err) {
    console.error('[REDEFINIR SENHA]', err)
    const msg = err.message.includes('Token') ? err.message : 'Erro interno.'
    return res.status(400).json({ erro: msg })
  }
})

router.get('/me', autenticar, async (req, res) => {
  try {
    const usuario = await User.findById(req.userId).select('-senha')
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' })
    return res.json(usuario)
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno.' })
  }
})

router.post('/logout', autenticar, (req, res) => {
  return res.json({ mensagem: 'Logout realizado com sucesso.' })
})

export default router
