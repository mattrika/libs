/**
 * Checks whether APP_ENV environment variable is set to 'production' or NODE_ENV environment variable is set to 'production', in that order.
 * @returns boolean
 */
export function isProductionAppEnvironment(): boolean {
    const appEnv = process?.env?.['APP_ENV']
    if (appEnv === 'production') return true
    const nodeEnv = process?.env?.['NODE_ENV']
    if (nodeEnv === 'production') return true
    return false
}
