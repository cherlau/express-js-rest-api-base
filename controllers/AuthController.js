import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import RefreshToken from '../models/RefreshToken.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens.js'

const SALT_ROUNDS = 12
const REFRESH_EXPIRY_DAYS = 7

const refreshExpiresAt = () => {
  const date = new Date()
  date.setDate(date.getDate() + REFRESH_EXPIRY_DAYS)
  return date
}

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.validatedBody

      const existing = await User.findByEmail(email)
      if (existing) {
        return res.status(409).json({ error: 'E-mail já cadastrado' })
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
      const [id] = await User.create({ name, email, password: hashedPassword })

      const payload = { id, email }
      const accessToken = generateAccessToken(payload)
      const refreshToken = generateRefreshToken(payload)

      await RefreshToken.create({ user_id: id, token: refreshToken, expires_at: refreshExpiresAt() })

      res.status(201).json({ accessToken, refreshToken })
    } catch (err) {
      next(err)
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.validatedBody

      const user = await User.findByEmail(email)
      const passwordMatch = user ? await bcrypt.compare(password, user.password) : false

      // Mesma resposta para e-mail e senha incorretos — evita user enumeration
      if (!user || !passwordMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas' })
      }

      const payload = { id: user.id, email: user.email }
      const accessToken = generateAccessToken(payload)
      const refreshToken = generateRefreshToken(payload)

      await RefreshToken.create({ user_id: user.id, token: refreshToken, expires_at: refreshExpiresAt() })

      res.json({ accessToken, refreshToken })
    } catch (err) {
      next(err)
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token não fornecido' })
      }

      let decoded
      try {
        decoded = verifyRefreshToken(refreshToken)
      } catch {
        return res.status(401).json({ error: 'Refresh token inválido ou expirado' })
      }

      const stored = await RefreshToken.findByToken(refreshToken)
      if (!stored || new Date(stored.expires_at) < new Date()) {
        if (stored) await RefreshToken.deleteByToken(refreshToken)
        return res.status(401).json({ error: 'Refresh token expirado ou não reconhecido' })
      }

      // Rotação: invalida o token usado e emite um novo par
      await RefreshToken.deleteByToken(refreshToken)

      const payload = { id: decoded.id, email: decoded.email }
      const newAccessToken = generateAccessToken(payload)
      const newRefreshToken = generateRefreshToken(payload)

      await RefreshToken.create({ user_id: decoded.id, token: newRefreshToken, expires_at: refreshExpiresAt() })

      res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
    } catch (err) {
      next(err)
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body

      if (refreshToken) {
        await RefreshToken.deleteByToken(refreshToken)
      }

      res.json({ message: 'Logout realizado com sucesso' })
    } catch (err) {
      next(err)
    }
  }

  async logoutAll(req, res, next) {
    try {
      await RefreshToken.deleteByUserId(req.user.id)
      res.json({ message: 'Todos os dispositivos desconectados' })
    } catch (err) {
      next(err)
    }
  }
}

export default new AuthController()
