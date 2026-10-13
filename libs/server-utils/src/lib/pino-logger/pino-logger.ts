import pino from 'pino'
import { isProductionAppEnvironment } from '../predicates/is-prod'
import { ensureDirExists } from './logger.helpers'

const logFilePath = './logs/app.log'

let transport: ReturnType<typeof pino.transport> | undefined

export function pinoLogger() {
    const isProd = isProductionAppEnvironment()

    try {
        // ensure logs folder exists
        ensureDirExists(logFilePath)

        transport = isProd
            ? pino.transport({
                  target: 'pino/file',
                  options: { destination: logFilePath },
              })
            : pino.transport({
                  targets: [
                      {
                          target: 'pino-pretty',
                          options: {
                              colorize: true,
                              levelFirst: true,
                              translateTime: 'SYS:standard',
                          },
                      },
                  ],
              })
    } catch (err) {
        console.error(
            '⚠️ Logger file transport failed, falling back to stdout',
            err,
        )
        transport = undefined
    }

    return pino(
        {
            level: process.env?.['PINO_LOG_LEVEL'] || 'info',
            timestamp: pino.stdTimeFunctions.isoTime,
            formatters: {
                bindings: (bindings) => ({
                    pid: bindings?.['pid'],
                    host: bindings?.['hostname'],
                    node_version: process.version,
                }),
            },
            redact: {
                paths: [
                    'req.headers.authorization',
                    'req.headers.cookie',
                    'req.body.password',
                    'req.body.confirmPassword',
                    'req.body.oldPassword',
                    'req.body.newPassword',
                    'req.body.token',
                    'req.body.refreshToken',
                    'req.body.accessToken',
                    'req.body.*.password',
                    'req.body.*.token',
                    'req.body.*.refreshToken',
                    'req.body.*.accessToken',
                    'res.body.token',
                    'res.body.refreshToken',
                    'res.body.accessToken',
                    'res.body.data.token',
                    'res.body.data.refreshToken',
                    'res.body.data.accessToken',
                    'res.body.*.token',
                    'res.body.*.refreshToken',
                    'res.body.*.accessToken',
                ],
                censor: '[REDACTED]',
            },
        },
        transport,
    )
}
