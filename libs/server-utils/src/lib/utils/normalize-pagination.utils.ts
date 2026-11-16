import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants/common.values'

export function normalizePagination(page?: number, size?: number) {
    const requestedSize =
        size && Number.isFinite(size) ? Math.trunc(size) : DEFAULT_PAGE_SIZE
    const safeSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedSize))
    const requestedPage = page && Number.isFinite(page) ? Math.trunc(page) : 1
    const safePage = Math.max(1, requestedPage)
    return {
        page: safePage,
        size: safeSize,
        offset: (safePage - 1) * safeSize,
    }
}
