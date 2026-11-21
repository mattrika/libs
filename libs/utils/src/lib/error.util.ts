import { isString } from 'es-toolkit'

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
