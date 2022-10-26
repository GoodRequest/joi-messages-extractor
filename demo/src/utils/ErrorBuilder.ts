import Joi from 'joi'
import { map } from 'lodash'

interface IErrorBuilderItem {
	message: string
	type: string
	path?: string
}

const prepareErrorItems = (name: string | Joi.ValidationErrorItem[], duplicateKeys?: string[]) => {
	if (typeof name === 'string') {
		return [
			{
				type: 'ERROR',
				message: name,
				duplicateKeys: duplicateKeys?.length ? duplicateKeys : undefined
			}
		]
	}

	return map(name, (item: Joi.ValidationErrorItem) => ({
		type: 'ERROR',
		path: item.path.join('.'),
		message: item.message,
		duplicateKeys: duplicateKeys?.length ? duplicateKeys : undefined
	}))
}

export default class ErrorBuilder extends Error {
	status: number
	isJoi: boolean
	items: IErrorBuilderItem[]

	constructor(status: number, name: string | Joi.ValidationErrorItem[], duplicateKeys?: string[]) {
		super(JSON.stringify(name))
		this.status = status
		this.isJoi = typeof name !== 'string'
		this.items = prepareErrorItems(name, duplicateKeys)
	}

	JoiItems(req: any): IErrorBuilderItem[] {
		return this.items.map((item: any) => {
			return { ...item, message: req.t(`error:format.${item.path.split('.')[1]}`) }
		})
	}
}
