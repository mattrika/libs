import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { safeRequestBody, safeResponseBody } from './logger.helpers'
import { pinoLogger } from './pino-logger'

export const pinoLoggerMiddleware = (): MiddlewareHandler => {
    return async (c, next) => {
        const start = Date.now()
        const logger = pinoLogger()

        const childLogger = logger.child({
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

        childLogger.info('Incoming request')

        try {
            await next()

            const responseBody = await safeResponseBody(c.res)

            childLogger.info(
                {
                    res: {
                        status: c.res.status,
                        durationMs: Date.now() - start,
                        body: responseBody,
                    },
                },
                'Request completed',
            )
        } catch (err) {
            if (err instanceof HTTPException) {
                childLogger.warn(
                    {
                        res: { status: err.status },
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
