import express from 'express'
import i18next from 'i18next'
import i18nextMiddleware from 'i18next-http-middleware'
import i18nextBackend from 'i18next-fs-backend'
import router from './api'
import errorMiddleware from './middlewares/errorMiddleware'

const i18NextConfig = {
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
}

const languageDetector = new i18nextMiddleware.LanguageDetector()
languageDetector.addDetector({
    name: 'customDetector',
    lookup: (req: express.Request) => {
        const language = req.headers['accept-language'] || (req.headers.language as string)
        if (!language) {
            return null
        }
        if (language.indexOf('-') >= 0) {
            return language.split('-')[0]?.toLowerCase()
        }
        return language.toLowerCase()
    }
})

i18next
    .use(i18nextBackend)
    .use(languageDetector) // Express middleware
    .init(JSON.parse(JSON.stringify(i18NextConfig))) // it has to be copy otherwise is readonly
    .catch(console.error)


const app = express()

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/api', router())
app.use(errorMiddleware)

export { i18NextConfig }
export default app