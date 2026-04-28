import { Router } from 'express'
import HomeController from '../controllers/HomeController.js'
import UserController from '../controllers/UserController.js'
import authRoutes from './auth.js'
import auth from '../middlewares/auth.js'
import validate from '../middlewares/validate.js'
import { createUserSchema, updateUserSchema } from '../validators/user.js'

const router = Router()

router.get('/', HomeController.index)

router.use('/auth', authRoutes)

// Rotas protegidas — adicione o middleware `auth` nas que exigirem login
router.get('/users', auth, UserController.index)
router.get('/users/:id', auth, UserController.show)
router.post('/users', auth, validate(createUserSchema), UserController.store)
router.put('/users/:id', auth, validate(updateUserSchema), UserController.update)
router.delete('/users/:id', auth, UserController.destroy)

export default router
