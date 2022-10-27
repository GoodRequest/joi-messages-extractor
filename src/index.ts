#!/usr/bin/env node

import 'colors'
import fs from 'fs'
import Joi from 'joi'
import path from 'path'
import config from 'config'

// Joi version check
const testedVersions = ['17.6.4', '17.6.3', '17.6.0', '17.5.0', '17.4.0', '17.3.0', '17.2.0']
if (testedVersions.indexOf(Joi.version) === -1) {
	console.log(`WARNING: This script was not tested on your joi version, errors may occur`.yellow)
}

// Creating all necessary global variables
const files: Buffer[] | string[] = fs.readdirSync(path.resolve(process.cwd(), 'node_modules', 'joi', 'lib', 'types'), { withFileTypes: false })
const fileName: string = 'joiErrorMessages.ts'
const savePath: string = process.env.JOI_MESSAGES_FILE_PATH ? path.resolve(process.cwd(), process.env.JOI_MESSAGES_FILE_PATH, fileName) : path.resolve(__dirname, fileName)
const checkOnly: boolean = process.env.JOI_CHECK_ONLY ? process.env.JOI_CHECK_ONLY === 'true' : false

// Generate template for languages, otherwise use default
let i18NextConfig: any = {}

try {
	i18NextConfig = config.get('i18next')
} catch {
	console.log(`WARNING: i18next is missing in config module`.yellow)
}
const languages: string[] = i18NextConfig?.fallbackLng || ['en', 'sk']

if (languages.length < 1) {
	console.log(`WARNING: 'i18next.fallbackLng' was not found in module 'config'.\nWARNING: Please try to define some, otherwise will be used default: en, sk`.yellow)
}

const init = async () => {
	const messagePromises = files.map(async (typeName) => {
		// Import dynamically one by one all type files from joi/lib/types
		const type = await import(`joi/lib/types/${typeName}`)

		// Check if Joi type has error messages of this type and save them
		// By default each type should have error messages
		const prototype = Object.getPrototypeOf(type?.default)
		// eslint-disable-next-line no-underscore-dangle
		const message = prototype?._definition?.messages
		if (!message) {
			console.log(`WARNING: messages were not found by the root node_modules/joi/lib/types/${typeName}`.yellow)
		}
		return message
	})
	const messages = await Promise.all(messagePromises)
	const result: any = {}

	// Importing actual data otherwise use an empty object
	const actualData = fs.existsSync(savePath) ? (await import(savePath)).default : {}
	let newErrorMessagesCount: number = 0
	// Get all possible messages. If some are generated, replace them with existing ones
	languages.forEach((lang) => {
		const tempLang: any = {}
		const actualLang: any = actualData[lang]
		messages
			.filter((v) => !!v)
			.forEach((msg: any) => {
				Object.keys(msg).forEach((key) => {
					if (actualLang && actualLang[key]) {
						tempLang[key] = `\t\t'${key}': '${actualLang[key]}'`
					} else if (!tempLang[key]){
						tempLang[key] = `\t\t'${key}': '${msg?.[key].source.replace(/:/gi, '')}'`
						newErrorMessagesCount += 1
					}
				})
			})
		result[lang] = tempLang
	})

	// If true then send error if some messages are not generated
	if (checkOnly) {
		if (newErrorMessagesCount > 0) {
			console.log(`ERROR: ${newErrorMessagesCount} Joi error messages are missing in: ${savePath}\nRun this script to generate them: cross-env JOI_MESSAGES_FILE_PATH=${savePath} npx GoodRequest/joi-messages-extractor`.red)
			process.exit(1)
		} else {
			console.log(`SUCCESS: All Joi error messages are generated for the next languages: ${languages}\nMessages file path: ${savePath}: `.green)
		}
	} else {
		// Write all joi messages into a file
		let template = ''
		languages.forEach((lang) => {
			template += `\n\t${lang}: {\n${Object.values(result[lang]).join(',\n')}\n\t},`
		})
		// Remove last coma
		template = template.substring(0, template.length - 1)
		fs.writeFileSync(savePath, `const joiErrorMessages: any = {${template}\n}\n\nexport default joiErrorMessages\n`)
		console.log(
			`SUCCESS: ${newErrorMessagesCount} new Joi error messages were generated for the next languages: ${languages}\nMessages file path: ${savePath}: `.green
		)
	}
}

init()
