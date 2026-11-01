import { DEFAULT_PAGE_SIZE } from '../constants/common.values'
import { ResponsePagination } from './api-response.util'

export function buildPaginationResponse(
    page: number | undefined,
    size: number | undefined,
    total: number,
): ResponsePagination {
    const numPage = Number(page)
    const positivePage = Number.isFinite(numPage) ? Math.max(numPage, 1) : 1
    const numSize = Number(size)
    const positiveSize =
        Number.isFinite(numSize) && numSize > 0 ? numSize : DEFAULT_PAGE_SIZE
    const numTotal = Number(total)
    const positiveTotal = Number.isFinite(numTotal) ? Math.max(numTotal, 0) : 0
    const totalPages = Math.ceil(positiveTotal / positiveSize)
    return {
        page: positivePage,
        size: positiveSize,
        totalItems: positiveTotal,
        totalPages,
    }
}
