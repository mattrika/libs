import { z } from '@hono/zod-openapi'

export const zPagination = z.object({
    page: z.coerce.number().optional(),
    size: z.coerce.number().optional(),
})

export const zCommonQuery = z
    .object({
        search: z.string().optional(),
        orderBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    })
    .extend(zPagination.shape)

export const zId = z.object({
    id: z.string(),
})

export const zIds = z.object({
    ids: z.array(z.string()).min(1),
})

export const zPassword = z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9\s]/, 'Must contain at least one special character')

export const zEmpty = z.object({})

export const zFile = z.object({
    file: z
        .instanceof(File)
        .openapi({ type: 'string', format: 'binary' })
        .optional(),
    files: z
        .array(z.instanceof(File).openapi({ type: 'string', format: 'binary' }))
        .optional(),
})

export type CommonQueryParams = z.infer<typeof zCommonQuery>
export type PaginationParams = z.infer<typeof zPagination>
