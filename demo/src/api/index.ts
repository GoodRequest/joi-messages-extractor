import { Router } from 'express'
import schemaMiddleware from "../middlewares/schemaMiddleware";

import * as getTest from './get.test'
import * as postTest from './post.test'

const router = Router()

export default () => {
    router.get('/test', schemaMiddleware(getTest.requestSchema), getTest.workflow)
    router.post('/test', schemaMiddleware(postTest.requestSchema), postTest.workflow)

    return router
}
