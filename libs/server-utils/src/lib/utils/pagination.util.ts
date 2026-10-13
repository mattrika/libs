import { clamp } from 'es-toolkit'
import { DEFAULT_PAGE_SIZE } from '../constants/common.values'
import { ResponsePagination } from './api-response.util'

export function buildPaginationResponse(
    page: number | undefined,
    size: number | undefined,
    total: number,
): ResponsePagination {
    const numPage = clamp(Number(page), 1) || 1
    const positivePage = numPage < 1 ? 1 : numPage
    const numSize = clamp(Number(size), DEFAULT_PAGE_SIZE)
    const numTotal = clamp(Number(total), 0)
    const totalPages = Math.ceil(numTotal / numSize)
    return {
        page: positivePage,
        size: numSize,
        totalItems: numTotal,
        totalPages,
    }
}
