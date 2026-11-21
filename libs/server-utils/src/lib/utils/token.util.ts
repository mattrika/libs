import { sign, verify } from 'hono/jwt'
import type { SignatureAlgorithm } from 'hono/utils/jwt/jwa'
import type { JWTPayload } from 'hono/utils/jwt/types'

export class TokenUtil {
    private secret: string

    /**
     * Creates a JWT helper bound to a signing secret and algorithm.
     *
     * @param secret Secret used to sign and verify tokens.
     * @param alg Signing algorithm. Defaults to `HS256`.
     */
    constructor(
        secret: string,
        private alg: SignatureAlgorithm = 'HS256',
    ) {
        this.secret = secret
    }

    /**
     * Signs a payload into a JWT.
     *
     * Sets `exp` (in seconds) when the payload does not already define one.
     *
     * @param payload Claims to sign.
     * @param lifeSeconds Token lifetime in seconds, applied only when `exp` is
     * absent. Defaults to `900` (15 minutes).
     * @returns The signed JWT.
     */
    async create<T extends JWTPayload>(
        payload: T,
        lifeSeconds = 15 * 60,
    ): Promise<string> {
        if (payload.exp === undefined) {
            payload.exp = Math.floor(Date.now() / 1000) + lifeSeconds
        }
        return await sign(payload, this.secret, this.alg)
    }

    /**
     * Verifies a JWT and returns its payload.
     *
     * @param token The JWT to verify.
     * @returns The decoded payload.
     * @throws When the token is invalid, tampered with, or expired.
     */
    async decode<T extends JWTPayload>(token: string): Promise<T | null> {
        return (await verify(token, this.secret, this.alg)) as T
    }

    /**
     * Verifies a JWT and returns its payload when it has not expired.
     *
     * Unlike {@link decode}, expiration is checked manually so an expired
     * token resolves to `null` instead of throwing.
     *
     * @param token The JWT to verify.
     * @returns The decoded payload, or `null` when the token has expired.
     * @throws When the token is invalid or tampered with.
     */
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

    /**
     * Checks whether a token's expiration time falls within the next
     * `seconds` seconds.
     *
     * @param exp Expiration time in seconds since the Unix epoch, i.e. a JWT
     * `exp` (NumericDate) value.
     * @param seconds Size of the window to check, in seconds.
     * @returns `true` if the token expires within `seconds` from now, or
     * has already expired; otherwise `false`.
     */
    expiresWithin(exp: number, seconds: number): boolean {
        return exp < Math.floor(Date.now() / 1000) + seconds
    }
}
