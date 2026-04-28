import 'dotenv/config'
import { validateEnv } from './config/env.js'
validateEnv()

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { globalLimiter } from './middlewares/rateLimiter.js'
import router from './routes/routes.js'

const app = express()
const PORT = process.env.PORT || 8686

app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }))
app.use(globalLimiter)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', router)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
