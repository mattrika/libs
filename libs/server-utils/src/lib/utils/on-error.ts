import { ErrorHandler } from 'hono'
import { toErrorCode } from './error.util'

export function onErrorFn(debugLog = true): ErrorHandler {
    return async (err, c) => {
        const statusCode = toErrorCode(err)

        let originalError = err
        const seen = new Set<Error>([err])
        while (
            originalError.cause instanceof Error &&
            !seen.has(originalError.cause)
        ) {
            originalError = originalError.cause
            seen.add(originalError)
        }

        const logger = c.get('logger')

        logger.error(
            {
                err,
                path: c.req.path,
                method: c.req.method,
            },
            'Request failed',
        )
        if (debugLog) {
            console.error(err)
        }

        return c.json(
            {
                data: null,
                error: !debugLog ? undefined : err,
                message: originalError.message || err.message,
                success: false,
            },
            statusCode,
        )
    }
}
