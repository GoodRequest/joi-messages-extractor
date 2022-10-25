import 'colors'
import { Request, Response, NextFunction } from 'express'
import i18next from 'i18next'
import config from 'config'
import ErrorBuilder from '../utils/ErrorBuilder'
import joiErrorMessages from '../../locales/joiErrorMessages'

// Update checks
if (!joiErrorMessages) {
	console.log('WARNING: joiErrorMessages not found.\nTry to check weather you are importing correct file and he was generated'.yellow)
} else {
	const i18NextConfig: any = config.get('i18next')
	Object.keys(joiErrorMessages).forEach((lang) => {
		if (!i18NextConfig.fallbackLng.includes(lang)) {
			console.log(
				`WARNING: Missing language key: ${lang} in joiErrorMessages.ts\nRunning script for Joi error messages generating may fix this problem`.yellow
			)
		}
	})
}

const options = {
	abortEarly: true,

	render: false,
	stripUnknown: true,
	cache: true,
	allowUnknown: false,
	stack: false,
	convert: true,
	externals: false,
	debug: false,
	errors: {
		escapeHtml: false
	},
	messages: joiErrorMessages
}
export default (schema: any) => (req: Request, res: Response, next: NextFunction) => {
	if (!schema) {
		throw new Error('Validation schema is not provided')
	}
	const { query, body, params } = req

	Object.keys(query || {}).forEach((key) => {
		if (query[key] === 'null') {
			// @ts-ignore
			query[key] = null
		}
	})

	const result = schema.validate({ query, body, params }, { ...options, errors: { language: i18next.resolvedLanguage } })
	if (result.error) {
		throw new ErrorBuilder(400, result.error.details)
	}

	req.body = result.value.body
	req.query = result.value.query
	req.params = result.value.params
	return next()
}
