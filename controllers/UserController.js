import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const SALT_ROUNDS = 12

class UserController {
  async index(req, res, next) {
    try {
      const users = await User.findAll()
      res.json(users)
    } catch (err) {
      next(err)
    }
  }

  async show(req, res, next) {
    try {
      const user = await User.findById(req.params.id)
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
      res.json(user)
    } catch (err) {
      next(err)
    }
  }

  async store(req, res, next) {
    try {
      const { name, email, password } = req.validatedBody
      const existing = await User.findByEmail(email)
      if (existing) return res.status(409).json({ error: 'E-mail já cadastrado' })
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
      const [id] = await User.create({ name, email, password: hashedPassword })
      res.status(201).json({ id })
    } catch (err) {
      next(err)
    }
  }

  async update(req, res, next) {
    try {
      const { email } = req.validatedBody
      if (email) {
        const existing = await User.findByEmail(email)
        if (existing && existing.id !== Number(req.params.id)) {
          return res.status(409).json({ error: 'E-mail já está em uso' })
        }
      }
      const affected = await User.update(req.params.id, req.validatedBody)
      if (!affected) return res.status(404).json({ error: 'Usuário não encontrado' })
      res.json({ updated: true })
    } catch (err) {
      next(err)
    }
  }

  async destroy(req, res, next) {
    try {
      const affected = await User.remove(req.params.id)
      if (!affected) return res.status(404).json({ error: 'Usuário não encontrado' })
      res.json({ deleted: true })
    } catch (err) {
      next(err)
    }
  }
}

export default new UserController()
