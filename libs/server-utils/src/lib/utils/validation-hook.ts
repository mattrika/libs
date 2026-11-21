import { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { UNPROCESSABLE_ENTITY } from 'stoker/http-status-codes'

export function validationHook(result: any, _c: Context) {
    if (!result.success) {
        const issues = result.error.issues
            .map((issue: any) => issue.message)
            .join(', ')

        throw new HTTPException(UNPROCESSABLE_ENTITY, {
            message: 'Data validation error',
            cause: {
                issues,
            },
        })
    }
}
