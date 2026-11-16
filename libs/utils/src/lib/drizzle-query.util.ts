import {
    and,
    arrayContains,
    asc,
    Column,
    desc,
    eq,
    ilike,
    inArray,
    or,
    SQL,
} from 'drizzle-orm'

export interface WhereClauseConfig<TParams extends object> {
    eq?: Partial<Record<keyof TParams & string, Column>>
    inArray?: Partial<Record<keyof TParams & string, Column>>
    arrayContains?: Partial<Record<keyof TParams & string, Column>>
    searchColumns?: Column[]
    searchParam?: keyof TParams & string
}

function isDefinedFilterValue(
    value: unknown,
): value is string | number | boolean {
    if (typeof value === 'string') return value !== ''
    if (typeof value === 'number') return Number.isFinite(value)
    return typeof value === 'boolean'
}

export function buildSearchCondition(
    search: string | undefined,
    fields: Column[],
): SQL<unknown> | undefined {
    const trimmed = search?.trim()
    if (!trimmed || fields.length === 0) return undefined
    const escaped = trimmed.replace(/[\\%_]/g, '\\$&')
    const searchPattern = `%${escaped}%`
    const searchConditions = fields.map((field) => ilike(field, searchPattern))
    return searchConditions.length === 1
        ? searchConditions[0]
        : or(...searchConditions)
}

export function buildOrderByClause<T extends Record<string, Column>>(
    columns: T,
    orderByField: string | undefined,
    sortOrder: 'asc' | 'desc' = 'desc',
    fallbackColumn: Column,
): SQL<unknown> {
    const orderBy =
        orderByField && Object.hasOwn(columns, orderByField)
            ? columns[orderByField]
            : fallbackColumn
    return sortOrder === 'asc' ? asc(orderBy) : desc(orderBy)
}

export function buildWhereClause<TParams extends object>(
    params: TParams,
    config: WhereClauseConfig<TParams>,
): SQL<unknown> | undefined {
    const conditions: SQL<unknown>[] = []
    const record = params as Record<string, unknown>

    if (config.searchColumns && config.searchColumns.length > 0) {
        const searchKey = config.searchParam ?? 'search'
        const searchValue = record[searchKey]
        if (typeof searchValue === 'string') {
            const searchCondition = buildSearchCondition(
                searchValue,
                config.searchColumns,
            )
            if (searchCondition) conditions.push(searchCondition)
        }
    }

    if (config.inArray) {
        for (const [key, column] of Object.entries(config.inArray) as [
            string,
            Column | undefined,
        ][]) {
            if (!column) continue
            const val = record[key]
            if (Array.isArray(val) && val.length > 0) {
                conditions.push(inArray(column, Array.from(new Set(val))))
            }
        }
    }

    if (config.eq) {
        for (const [key, column] of Object.entries(config.eq) as [
            string,
            Column | undefined,
        ][]) {
            if (!column) continue
            const val = record[key]
            if (isDefinedFilterValue(val)) {
                conditions.push(eq(column, val))
            }
        }
    }

    if (config.arrayContains) {
        for (const [key, column] of Object.entries(config.arrayContains) as [
            string,
            Column | undefined,
        ][]) {
            if (!column) continue
            const val = record[key]
            if (Array.isArray(val) && val.length > 0) {
                conditions.push(arrayContains(column, val))
            }
        }
    }

    if (conditions.length === 0) return undefined
    return conditions.length === 1 ? conditions[0] : and(...conditions)
}
