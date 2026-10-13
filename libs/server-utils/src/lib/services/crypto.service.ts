import crypto from 'crypto'
import argon2 from '@node-rs/argon2'

export class CryptoService {
    static async hash(plain: string): Promise<string> {
        return argon2.hash(plain, {
            algorithm: argon2.Algorithm.Argon2id,
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
