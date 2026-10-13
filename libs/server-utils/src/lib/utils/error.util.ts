import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import { INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'

export function throwHttpError(
    error: unknown,
    defaultMessage = 'Something went wrong',
): never {
    const code =
        error instanceof Error
            ? Number.isNaN(error.cause as ContentfulStatusCode)
                ? INTERNAL_SERVER_ERROR
                : (error.cause as ContentfulStatusCode)
            : INTERNAL_SERVER_ERROR
    throw new HTTPException(code, {
        message: (error as Error).message ?? defaultMessage,
    })
}

export function isUniqueViolationPg(error: unknown): boolean {
    const e = error as { code?: string }
    return e?.code === '23505' // unique_violation
}
