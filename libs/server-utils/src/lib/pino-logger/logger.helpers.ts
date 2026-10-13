import fs from 'fs'
import path from 'path'
import type { HonoRequest } from 'hono'

const MAX_SIZE = 1024 * 1024 // 1MB

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

        return JSON.parse(text)
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

        if (!contentType.includes('application/json')) {
            return undefined
        }

        const text = await req.raw.clone().text()
        if (!text) return undefined

        const size = Buffer.byteLength(text, 'utf8')
        if (size > MAX_SIZE)
            return `[BODY TOO LARGE: ${Math.round(size / 1024)} KB]`

        return JSON.parse(text)
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
