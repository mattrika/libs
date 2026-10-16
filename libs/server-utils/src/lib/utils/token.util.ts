import { isAfter } from 'date-fns'
import { sign, verify } from 'hono/jwt'
import type { SignatureAlgorithm } from 'hono/utils/jwt/jwa'
import type { JWTPayload } from 'hono/utils/jwt/types'

export class TokenUtil {
    private secret: string

    constructor(
        secret: string,
        private alg: SignatureAlgorithm = 'HS256',
    ) {
        this.secret = secret
    }

    async create<T extends JWTPayload>(
        payload: T,
        lifeSeconds = 15 * 60,
    ): Promise<string> {
        if (payload.exp === undefined) {
            // JWT NumericDate claims (`exp`) are seconds since the epoch.
            payload.exp = Math.floor(Date.now() / 1000) + lifeSeconds
        }
        return await sign(payload, this.secret, this.alg)
    }

    async decode<T extends JWTPayload>(token: string): Promise<T | null> {
        return (await verify(token, this.secret, this.alg)) as T
    }

    async decodeUnexpired<T extends JWTPayload>(
        token: string,
    ): Promise<T | null> {
        // Disable Hono's built-in `exp` check so an expired token resolves to
        // `null` instead of throwing, then validate it here.
        const { exp, ...rest } = await verify(token, this.secret, {
            alg: this.alg,
            exp: false,
        })
        const nowSeconds = Math.floor(Date.now() / 1000)
        if (exp !== undefined && exp <= nowSeconds) return null
        return {
            exp: exp as number,
            ...rest,
        } as T
    }

    expiresWithin(exp: number, seconds: number): boolean {
        return isAfter(new Date(), new Date(exp - seconds * 1000))
    }
}
