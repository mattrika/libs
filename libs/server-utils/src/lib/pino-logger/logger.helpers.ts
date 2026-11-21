import fs from 'fs'
import path from 'path'
import type { HonoRequest } from 'hono'

const MAX_SIZE = 1024 * 1024 // 1MB

const SENSITIVE_KEYS = new Set([
    'password',
    'confirmpassword',
    'oldpassword',
    'newpassword',
    'token',
    'refreshtoken',
    'accesstoken',
    'secret',
    'secretkey',
    'apikey',
    'xapikey',
    'authorization',
    'cookie',
    'setcookie',
    'pin',
    'otp',
    'code',
    'invitetoken',
    'ticket',
    'clientsecret',
    'privatekey',
    'codeverifier',
])

const normalizeKey = (key: string) => key.toLowerCase().replace(/[-_\s]/g, '')

export function maskSensitive<T>(value: T, depth = 0): T {
    if (value === null || typeof value !== 'object' || depth > 8) {
        return value
    }
    if (Array.isArray(value)) {
        return value.map((item) => maskSensitive(item, depth + 1)) as T
    }
    const masked: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(
        value as Record<string, unknown>,
    )) {
        masked[key] = SENSITIVE_KEYS.has(normalizeKey(key))
            ? '[REDACTED]'
            : maskSensitive(entry, depth + 1)
    }
    return masked as T
}

export async function safeResponseBody(res: Response) {
    try {
        const contentType = res.headers.get('content-type') || ''
        const disposition = res.headers.get('content-disposition') || ''

        // ❌ Skip downloads
        if (disposition.includes('attachment')) {
            return '[FILE DOWNLOAD SKIPPED]'
        }

        // ❌ Skip non-JSON responses
        if (!contentType.includes('application/json')) {
            return '[NON-JSON RESPONSE]'
        }

        const text = await res.clone().text()
        if (!text) return undefined

        const size = Buffer.byteLength(text, 'utf8')
        if (size > MAX_SIZE)
            return `[RESPONSE TOO LARGE: ${Math.round(size / 1024)} KB]`

        return maskSensitive(JSON.parse(text))
    } catch {
        return '[UNREADABLE RESPONSE]'
    }
}

export async function safeRequestBody(req: HonoRequest) {
    try {
        const contentType = req.header('content-type') || ''

        // ❌ Skip file uploads
        if (contentType.includes('multipart/form-data')) {
            return '[FILE UPLOAD SKIPPED]'
        }

        // ❌ Skip webhook payloads to prevent stream locking or raw signature tampering
        if (req.path.includes('webhook')) {
            return '[WEBHOOK PAYLOAD SKIPPED]'
        }

        if (!contentType.includes('application/json')) {
            return undefined
        }

        const text = await req.raw.clone().text()
        if (!text) return undefined

        const size = Buffer.byteLength(text, 'utf8')
        if (size > MAX_SIZE)
            return `[BODY TOO LARGE: ${Math.round(size / 1024)} KB]`

        return maskSensitive(JSON.parse(text))
    } catch {
        return '[UNREADABLE REQUEST BODY]'
    }
}
export function ensureDirExists(filePath: string) {
    const dir = path.dirname(filePath)

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}
