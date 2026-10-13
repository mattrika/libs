import { Context } from 'hono'
import { UNPROCESSABLE_ENTITY } from 'stoker/http-status-codes'
import { throwHttpError } from './error.util'

export function validationHook(result: any, _c: Context) {
    if (!result.success) {
        throwHttpError(
            new Error('Validation error', {
                cause: UNPROCESSABLE_ENTITY,
            }),
        )
    }
}
