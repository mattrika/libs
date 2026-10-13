import crypto from 'crypto'
import argon2, { type Options } from '@node-rs/argon2'

// `argon2.Algorithm` is an ambient `const enum`, so its members cannot be
// accessed when `isolatedModules` is enabled. Argon2id === 2; typing the
// literal against the library's own option type keeps it type-safe.
const ARGON2ID: NonNullable<Options['algorithm']> = 2

export class CryptoService {
    static async hash(plain: string): Promise<string> {
        return argon2.hash(plain, {
            algorithm: ARGON2ID,
            memoryCost: 1 << 16, // 64 MB
            timeCost: 3,
            parallelism: 1,
        })
    }

    static async verify(plain: string, hash: string): Promise<boolean> {
        return argon2.verify(hash, plain)
    }

    static random64chars(): string {
        // 32 bytes hex -> 64 hex chars
        return crypto.randomBytes(32).toString('hex')
    }
}
