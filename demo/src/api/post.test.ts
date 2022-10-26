import Joi from 'joi'
import { Request, Response } from 'express'

export const requestSchema = Joi.object().keys({
    body: Joi.object().keys({
        transaction_id: Joi.number().required().valid(1, 2, 3), // string
        transaction_datetime: Joi.date().required(),
        user_id_type: Joi.string().allow(null, '').required(),
        user_id: Joi.number().greater(0).required(),
        venue_id_type: Joi.string().allow(null, '').required(),
        venue_id: Joi.number().allow(null, '').required().optional(), // string
        user: Joi.object()
            .keys({
                phone_number: Joi.string().allow(null, '').required(),
                email: Joi.string().allow(null, '').required(),
                points: Joi.string().allow(null, '').optional(), // number
                display_name: Joi.string().allow(null, '').required()
            })
            .required(),
        item: Joi.object()
            .keys({
                name: Joi.string().allow(null, '').optional(),
                qty: Joi.string().allow(null, '').required(), // number
                price: Joi.string().allow(null, '').required(), // number
                points: Joi.string().allow(null, '').required(), // number
                reward: Joi.number().allow(null).required() // boolean
            })
            .required()
    }),
    query: Joi.object(),
    params: Joi.object()
})

export const responseSchema = Joi.object({})

export const workflow = async (req: Request, res: Response) => {
    return res.json({
        type: 'SUCCESS'
    })
}
