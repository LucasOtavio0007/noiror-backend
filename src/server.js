import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

import { conectar } from './config/db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import produtoRoutes from './routes/produtos.js'
import pedidoRoutes from './routes/pedidos.js'
import reembolsosRoutes from './routes/reembolsos.js'   // ✅ NOVO
import configRoutes from './routes/config.js'
import billingRoutes from './routes/billing.js'
import adminRoutes from './routes/admin-global-routes.js'
import cartRoutes from './routes/cart.js'
import tenantRoutes from './routes/tenant.js'
import ticketRoutes from './routes/ticket.js'
import pagamentoRoutes from './routes/pagamento.js'
import chatRoutes from './routes/chat.js'
import recomendacoesRoutes from './routes/recomendacoes.js'
import visualizacoesRoutes from './routes/visualizacoes.js'
import freteRoutes from './routes/frete.js'
import cupomRoutes from './routes/cupom.js'

const app = express()
await conectar()

// Segurança
app.use(helmet())
app.use(mongoSanitize())
app.use(xss())
app.use(hpp())
app.use(cookieParser())

// Rate limiting
const limiterGeral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { msg: 'Muitas requisições.' },
  skip: (req) => req.method === 'OPTIONS'
})

const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { msg: 'Muitas tentativas. Tente em 15 minutos.' },
  skip: (req) => req.method === 'OPTIONS'
})

app.use('/api/', limiterGeral)
app.use('/api/auth/login', limiterAuth)
app.use('/api/auth/register', limiterAuth)

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

// Body parser (raw para webhook Stripe e Mercado Pago)
app.use('/api/billing/webhook',      express.raw({ type: 'application/json' }))
app.use('/api/pagamento/mp/webhook', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// Rotas
app.use('/api/auth',          authRoutes)
app.use('/api/usuarios',      userRoutes)
app.use('/api/produtos',      produtoRoutes)
app.use('/api/pedidos',       pedidoRoutes)
app.use('/api/reembolsos',    reembolsosRoutes)   // ✅ NOVO
app.use('/api/config',        configRoutes)
app.use('/api/billing',       billingRoutes)
app.use('/api/admin',         adminRoutes)
app.use('/api/carrinho',      cartRoutes)
app.use('/api/tenant',        tenantRoutes)
app.use('/api/tickets',       ticketRoutes)
app.use('/api/pagamento',     pagamentoRoutes)
app.use('/api/chat',          chatRoutes)
app.use('/api/recomendacoes', recomendacoesRoutes)
app.use('/api/visualizacoes', visualizacoesRoutes)
app.use('/api/frete',         freteRoutes)
app.use('/api/cupons',        cupomRoutes)

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok',
  env: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
}))

// 404
app.use((req, res) => res.status(404).json({ msg: 'Rota não encontrada.' }))

// Error handler global
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack)
  res.status(err.statusCode || 500).json({ msg: err.message || 'Erro interno.' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () =>
  console.log(`🚀 Servidor rodando na porta ${PORT} [${process.env.NODE_ENV}]`)
)