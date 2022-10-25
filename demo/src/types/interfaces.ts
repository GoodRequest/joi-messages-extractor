import * as i18next from 'i18next'

export interface IBasicConfig {
	username: string
	password: string
}


export interface IServerConfig {
	port?: number
	domain?: string
	subdirs?: string[]
	filesPath?: string
	urlFilePath?: string
}

export interface ILogsConfig {
	directory: string
}

export interface IJwtPayload {
	id: number
	exp: number
	aud: string
}

export interface IEmailConfig {
	host: string
	port: number
	secure: boolean
	auth: {
		user: string
		pass: string
	}
	fromAddress: string
	tls: {
		rejectUnauthorized: boolean
	}
}

export interface INotificationConfig {
	apiUrl: string
	updaterApiKey: string
	applicationApiKey: string
}


export interface IJobsScheduleConfig {
	deviceSyncJob: string
}

export interface IJobsConfig {
	timezone: string
	schedule: IJobsScheduleConfig
}

export interface IConfig {
	server?: IServerConfig
	logs?: ILogsConfig
	basic?: IBasicConfig
	i18next?: i18next.InitOptions
	email?: IEmailConfig
	notifications?: INotificationConfig
	jobs?: IJobsConfig
}
