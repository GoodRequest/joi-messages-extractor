import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'
import config from 'config'

import { ILogsConfig } from '../types/interfaces'

const logs: ILogsConfig = config.get('logs')

const globalFilename = path.join(logs.directory, 'global/global-%DATE%.log')
const requestsFilename = path.join(logs.directory, 'requests/requests-%DATE%.log')
const emailsFilename = path.join(logs.directory, 'emails/emails-%DATE%.log')
const notificationsFilename = path.join(logs.directory, 'notifications/notifications-%DATE%.log')
const errorsFilename = path.join(logs.directory, 'errors/errors-%DATE%.log')
const deviceSyncJobInfoLogFileName = path.join(logs.directory, 'jobs/deviceSyncJob/info/info-%DATE%.log')
const deviceSyncJobErrorLogFileName = path.join(logs.directory, 'jobs/deviceSyncJob/error/error-%DATE%.log')

export const globalLogger = winston.createLogger({
	format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
	transports: [
		new DailyRotateFile({
			filename: globalFilename,
			datePattern: 'YYYY-MM-DD',
			level: 'info',
			maxSize: '500m',
			maxFiles: '180d'
		}),
		new DailyRotateFile({
			filename: errorsFilename,
			datePattern: 'YYYY-MM-DD',
			level: 'error',
			maxSize: '500m',
			maxFiles: '180d'
		})
	],
	exitOnError: false
})

export const requestLogger = winston.createLogger({
	format: winston.format.combine(winston.format.label({ label: 'request' }), winston.format.timestamp(), winston.format.json()),
	transports: [
		new DailyRotateFile({
			filename: requestsFilename,
			datePattern: 'YYYY-MM-DD',
			zippedArchive: false,
			level: 'info',
			maxSize: '500m',
			maxFiles: '60d',
			eol: '\n\n'
		})
	],
	exitOnError: false
})

export const emailLogger = winston.createLogger({
	format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
	transports: [
		new DailyRotateFile({
			filename: emailsFilename,
			datePattern: 'YYYY-MM-DD',
			level: 'info',
			maxSize: '500m',
			maxFiles: '180d'
		})
	],
	exitOnError: false
})

export const notificationsLogger = winston.createLogger({
	format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
	transports: [
		new DailyRotateFile({
			filename: notificationsFilename,
			datePattern: 'YYYY-MM-DD',
			level: 'info',
			maxSize: '500m',
			maxFiles: '180d'
		})
	],
	exitOnError: false
})

export const deviceSyncJobLogger = winston.createLogger({
	format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
	transports: [
		new DailyRotateFile({
			filename: deviceSyncJobInfoLogFileName,
			datePattern: 'YYYY-MM-DD',
			level: 'info',
			json: true,
			maxSize: '500m',
			maxFiles: '180d'
		}),
		new DailyRotateFile({
			filename: deviceSyncJobErrorLogFileName,
			datePattern: 'YYYY-MM-DD',
			level: 'error',
			json: true,
			maxSize: '500m',
			maxFiles: '180d'
		})
	],
	exitOnError: false
})
