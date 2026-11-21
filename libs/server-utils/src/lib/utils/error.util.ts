import { isString } from 'es-toolkit'
import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import { INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'

export function toErrorCode(
    err: unknown,
    fallback: ContentfulStatusCode = INTERNAL_SERVER_ERROR,
): ContentfulStatusCode {
    const value = (err as any).status ?? (err as any).cause

    if (value === undefined || value === null || Number.isNaN(value)) {
        return fallback
    }
    return typeof value === 'number'
        ? (Math.max(value, 0) as ContentfulStatusCode)
        : fallback
}

export function throwHttpError(
    error: unknown,
    message = 'Something went wrong',
    fallbackHttpStatus: ContentfulStatusCode = INTERNAL_SERVER_ERROR,
): never {
    if (error instanceof HTTPException) {
        throw error
    }

    const code = toErrorCode(error, fallbackHttpStatus)
    const preferCustomMessage =
        message.toLowerCase() !== 'something went wrong' && message !== ''

    throw new HTTPException(code, {
        message: preferCustomMessage
            ? message
            : extractErrorMessage(error, message),
        cause: error,
    })
}

export function isUniqueViolationPg(error: unknown): boolean {
    const e = error as { code?: string }
    return e?.code === '23505' // unique_violation
}

export function extractErrorMessage(
    error: any,
    defaultMessage = 'An unexpected error occurred',
): string {
    if (isString(error?.message)) {
        return error.message
    }
    if (isString(error?.error)) {
        return error.error
    }
    if (isString(error?.error?.message)) {
        return error.error.message
    }
    if (isString(error?.error?.error?.message)) {
        return error.error.error.message
    }

    return defaultMessage
}
