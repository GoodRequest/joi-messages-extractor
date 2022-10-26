import { Request, NextFunction, Response } from 'express'
import { isEmpty } from 'lodash'
import Debug from 'debug'
import multer from 'multer'

// utils
import ErrorBuilder from '../utils/ErrorBuilder'

const debug = Debug('benzinol:middlewares:error')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (err: ErrorBuilder, req: Request, res: Response, _next: NextFunction) => {
	// if status does not exist, assign 500
	const errStatus = err.status || 500
	let messages

	if (errStatus < 500) {
		if (err.isJoi) {
			messages = err.items
		} else if (!isEmpty(err.items)) {
			messages = err.items
		} else {
			messages = [err.message]
		}
	} else if (err instanceof multer.MulterError) {
		// A Multer error occurred when uploading.
		messages = [
			{
				message: 'uploadFailed',
				type: 'ERROR'
			}
		]
	} else {
		// DEBUG=boilerplate:middlewares:error alebo DEBUG = boilerplate:middlewares:*
		debug(err)
		messages = [
			{
				message: 'somethingWentWrong',
				type: 'ERROR'
			}
		]
	}
	// render the error page
	return res.status(errStatus).json({ messages })
}
