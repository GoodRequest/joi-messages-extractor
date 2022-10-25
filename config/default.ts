import 'dotenv/config'
import * as i18next from 'i18next'

import { IConfig } from '../demo/src/types/interfaces'
import path from "path";

export default <IConfig>{
    logs: {
        directory: process.env.DIRECTORY_LOGS || path.resolve(process.cwd(), 'logs')
    },
    i18next: {
        preload: ['sk'],
        fallbackLng: ['en', 'sk'],
        ns: ['translation', 'error', 'success', 'email', 'joi'],
        defaultNS: 'translation',
        detection: {
            order: ['customDetector']
        },
        backend: {
            loadPath: 'locales/{{lng}}/{{ns}}.json',
            jsonIndent: 2
        },
        whitelist: ['sk']
    } as i18next.InitOptions,

}
