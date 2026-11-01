import { ErrorHandler } from 'hono'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import { INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'

function toErrorCode(value: unknown): ContentfulStatusCode {
    if (value === undefined || value === null || Number.isNaN(value)) {
        return 500
    }
    return typeof value === 'number'
        ? (Math.max(value, 0) as ContentfulStatusCode)
        : 500
}

export function onErrorFn(debugLog = true): ErrorHandler {
    return async (err, c) => {
        const statusCode =
            'status' in err
                ? toErrorCode(err.status)
                : 'cause' in err
                  ? toErrorCode(err.cause)
                  : INTERNAL_SERVER_ERROR

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
