import express from 'express'
import authRoutes from '../modules/auth/auth.routes'
const app = express()

app.use('/api/v1/auth', authRoutes)