// nos imports (lá em cima com os outros imports)
import freteRoutes from './routes/frete.js'
import cupomRoutes from './routes/cupom.js'

// nas rotas (lá embaixo com os outros app.use)
app.use('/api/frete', freteRoutes)
app.use('/api/cupom', cupomRoutes)