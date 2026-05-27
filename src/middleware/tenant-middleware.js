const Tenant = require('../models/Tenant')
const Log    = require('../models/Log')

// ─── Identifica o tenant via header, subdomínio ou token ───
const resolveTenant = async (req, res, next) => {
  try {
    let slug =
      req.headers['x-tenant-slug'] ||
      req.query.tenant ||
      (req.hostname !== 'localhost' ? req.hostname.split('.')[0] : null)

    // Fallback: pega do JWT se já autenticado
    if (!slug && req.user?.tenantId) {
      req.tenantId = req.user.tenantId
      return next()
    }

    if (!slug) return res.status(400).json({ msg: 'Tenant não identificado.' })

    const tenant = await Tenant.findOne({ slug, ativo: true }).lean()
    if (!tenant) return res.status(404).json({ msg: 'Tenant não encontrado.' })

    req.tenantId = tenant._id
    req.tenant   = tenant
    next()
  } catch (err) {
    console.error('Tenant middleware:', err)
    res.status(500).json({ msg: 'Erro interno.' })
  }
}

// ─── Garante isolamento: injeta tenantId em todas as queries ──
const enforceIsolation = (req, res, next) => {
  if (!req.tenantId) return res.status(403).json({ msg: 'Acesso negado: tenant não identificado.' })
  next()
}

// ─── Verifica se o plano permite a feature ────────────────────
const checkPlan = (planoMinimo) => async (req, res, next) => {
  const hierarquia = { free: 0, pro: 1, enterprise: 2 }
  const tenant = req.tenant || await Tenant.findById(req.tenantId).lean()

  if (!tenant) return res.status(403).json({ msg: 'Tenant inválido.' })

  // Verifica trial
  if (tenant.trial?.ativo && new Date() < new Date(tenant.trial.expira)) return next()

  if (hierarquia[tenant.plano] < hierarquia[planoMinimo]) {
    return res.status(403).json({
      msg: `Esta funcionalidade requer plano ${planoMinimo.toUpperCase()} ou superior.`,
      upgrade: true,
      planoAtual: tenant.plano,
      planoNecessario: planoMinimo,
    })
  }
  next()
}

// ─── Verifica limites do plano ────────────────────────────────
const checkLimite = (recurso) => async (req, res, next) => {
  const tenant = req.tenant || await Tenant.findById(req.tenantId).lean()
  if (!tenant) return res.status(403).json({ msg: 'Tenant inválido.' })

  const Model = require(`../models/${recurso.charAt(0).toUpperCase() + recurso.slice(1)}`)
  const count = await Model.countDocuments({ tenant: req.tenantId })
  const limite = tenant.limites?.[recurso] ?? Infinity

  if (count >= limite) {
    return res.status(403).json({
      msg: `Limite de ${recurso} atingido para o seu plano.`,
      limite,
      atual: count,
      upgrade: true,
    })
  }
  next()
}

// ─── Audit log ────────────────────────────────────────────────
const auditLog = (tipo, acao) => async (req, res, next) => {
  res.on('finish', async () => {
    try {
      await Log.create({
        tenant:    req.tenantId,
        user:      req.user?._id,
        tipo,
        acao,
        detalhe:   { method: req.method, path: req.path, status: res.statusCode, body: req.method !== 'GET' ? req.body : undefined },
        ip:        req.ip,
        userAgent: req.headers['user-agent'],
        nivel:     res.statusCode >= 400 ? 'error' : 'info',
      })
    } catch {}
  })
  next()
}

module.exports = { resolveTenant, enforceIsolation, checkPlan, checkLimite, auditLog }