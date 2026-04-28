import { Router } from 'express'
import HomeController from '../controllers/HomeController.js'
import UserController from '../controllers/UserController.js'
import validate from '../middlewares/validate.js'
import { createUserSchema, updateUserSchema } from '../validators/user.js'

const router = Router()

router.get('/', HomeController.index)

router.get('/users', UserController.index)
router.get('/users/:id', UserController.show)
router.post('/users', validate(createUserSchema), UserController.store)
router.put('/users/:id', validate(updateUserSchema), UserController.update)
router.delete('/users/:id', UserController.destroy)

export default router
