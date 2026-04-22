import { Router } from 'express'
import { getProfile, signIn, signOut, signUp, updateProfile } from './auth.controller'

const router = Router()



router.post('/register', signUp)
router.post('/login', signIn)
router.post('/logout', signOut)
router.get('/profile', getProfile)
router.put('/profile', updateProfile)

export default router


