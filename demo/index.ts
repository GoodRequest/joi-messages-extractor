import http from 'http'
import 'colors'
import app from './app'

const httpServer = http.createServer(app)
const serverConfig = {
    port: 8000,
    domain: `http://localhost:8000`,
}

httpServer.listen(serverConfig.port).on('listening', () => {
    console.log(`Server started in ${process.env.NODE_ENV} mode at port ${serverConfig.port}`.green)
})

export default httpServer