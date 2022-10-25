import express from 'express'
import router from './api'

const app = express()

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/api', router())


export default app