import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { isProductionAppEnvironment } from '../predicates/is-prod'
import {
    maskSensitive,
    safeRequestBody,
    safeResponseBody,
} from './logger.helpers'
import { pinoLogger } from './pino-logger'

export const pinoLoggerMiddleware = (): MiddlewareHandler => {
    const rootLogger = pinoLogger()

    return async (c, next) => {
        const start = Date.now()

        const childLogger = rootLogger.child({
            requestId: c.var['requestId'],
            req: {
                method: c.req.method,
                path: c.req.path,
                query: c.req.query(),
                headers: c.req.header(),
                body:
                    c.req.method !== 'GET'
                        ? await safeRequestBody(c.req)
                        : undefined,
            },
        })

        c.set('logger', childLogger)

        childLogger.debug(
            {
                query: maskSensitive(c.req.query()),
                headers: maskSensitive(c.req.header()),
                body:
                    c.req.method !== 'GET'
                        ? await safeRequestBody(c.req)
                        : undefined,
            },
            'Incoming request',
        )

        try {
            await next()

            const duration = Date.now() - start
            const responseBody =
                !isProductionAppEnvironment() && c.res.status < 400
                    ? await safeResponseBody(c.res)
                    : undefined

            childLogger.info(
                {
                    status: c.res.status,
                    durationMs: duration,
                    body: responseBody,
                },
                'Request completed',
            )
        } catch (err) {
            if (err instanceof HTTPException) {
                childLogger.warn(
                    {
                        status: err.status,
                        error: err.message,
                    },
                    'HTTP error',
                )
                throw err
            }

            childLogger.error({ err }, 'Unhandled server error')
            throw err
        }
    }
}
