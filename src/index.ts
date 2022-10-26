#!/usr/bin/env node

import 'colors'
import fs from 'fs'
import Joi from 'joi'
import path from 'path'
import config from 'config'

// import Test from 'joi/lib/types'
/*
 * Older available versions were not found
 *
 * To run the script use tho following command: cross-env JOI_ERRORS_FILE_PATH=<path_name> ts-node 'joiErrorMessagesScript.ts'
 * JOI_LOCALES_FILE_PATH
 * 		- is optional
 * 		- default value is the same folder with script
 * 		- path to te directory where joiErrorMessages.ts file will be situated
 * joiErrorMessages.ts - is a default filename where all Joi error message keys with default translations are located and exported
 * Translating languages is trying to find in i18next.fallbackLng from config module otherwise will be used the default ones - english, ['en', 'sk']
 *
 * Tested versions
 * 17.6.3 +
 * 17.6.0 +
 * 17.5.0 +
 * 17.4.0 +
 * 17.3.0 +
 * 17.2.0 +
 * 17.1.1 - Error looks like: Could not find a declaration file for module 'joi'
 * */

// Joi version check
const testedVersions = ['17.6', '17.5', '17.4', '17.3', '17.2']
if (testedVersions.indexOf(Joi.version.substring(0, 4)) === -1) {
	console.log(`WARNING: This script was not tested on your joi version, errors may occur`.yellow)
}

// Creating all necessary global variables
const files = fs.readdirSync(path.resolve(process.cwd(), 'node_modules', 'joi', 'lib', 'types'), { withFileTypes: false })
const fileName = 'joiErrorMessages.ts'
const savePath = process.env.JOI_ERRORS_FILE_PATH ? path.resolve(process.cwd(), process.env.JOI_ERRORS_FILE_PATH, fileName) : path.resolve(__dirname, fileName)

// Generate template for languages, otherwise use default
let i18NextConfig: any = {}

try {
	i18NextConfig = config.get('i18next')
} catch {
	console.log(`WARNING: i18next is missing in config module`.yellow)
}
const languages: string[] = i18NextConfig?.fallbackLng || ['en', 'sk']

if (languages.length < 1) {
	console.log(`ERROR: 'i18next.fallbackLng' was not found in module 'config'.\nERROR: Please try to define some`.red)
	process.exit(1)
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

init()
