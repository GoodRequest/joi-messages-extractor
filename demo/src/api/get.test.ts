import Joi from 'joi'
import { Request, Response } from 'express'

export const requestSchema = Joi.object().keys({
	body: Joi.object()
		.keys({
			id: Joi.number().greater(1).required(),
			string: Joi.string().alphanum().required()
		})
		.required(),
	query: Joi.object(),
	params: Joi.object()
})

export const responseSchema = Joi.object({})

export const workflow = async (req: Request, res: Response) => {
	return res.json({
		type: 'SUCCESS'
	})
}
