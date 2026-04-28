import { Router } from 'express'
import AuthController from '../controllers/AuthController.js'
import validate from '../middlewares/validate.js'
import auth from '../middlewares/auth.js'
import { authLimiter } from '../middlewares/rateLimiter.js'
import { registerSchema, loginSchema } from '../validators/auth.js'

const router = Router()

router.post('/register', authLimiter, validate(registerSchema), AuthController.register)
router.post('/login', authLimiter, validate(loginSchema), AuthController.login)
router.post('/refresh', authLimiter, AuthController.refresh)
router.post('/logout', AuthController.logout)
router.post('/logout-all', auth, AuthController.logoutAll)

export default router
