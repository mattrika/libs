# @mattrika/server-utils

TypeScript utilities, shared types, interfaces and various other helpers for
Node.js server backends.

## Installation

```bash
npm install @mattrika/server-utils
# or
pnpm add @mattrika/server-utils
# or
yarn add @mattrika/server-utils
```

## Peer dependencies

This package is built for [Hono](https://hono.dev) + [Zod](https://zod.dev)
based Node.js services. The libraries below are declared as **peer
dependencies** and must be installed by the consuming application:

```bash
npm install hono zod @hono/zod-openapi @node-rs/argon2 es-toolkit pino stoker
```

> This package is **Node.js only** — it uses `node:crypto`, `node:fs` and
> `node:path`, and the Pino logger writes to the local filesystem.

## Usage

```typescript
import {
    CryptoService,
    TokenUtil,
    buildPaginationResponse,
    isProductionAppEnvironment,
} from '@mattrika/server-utils'
```

## API Reference

### `constants/` — Common values

Shared numeric constants.

| Export              | Type     | Value | Description                            |
| ------------------- | -------- | ----- | -------------------------------------- |
| `DEFAULT_PAGE_SIZE` | `number` | `20`  | Default page size for paginated lists. |
| `MAX_PAGE_SIZE`     | `number` | `100` | Maximum page size for paginated lists. |

---

### `pino-logger/` — Logging

#### `pinoLogger()`

Creates and returns a configured [Pino](https://getpino.io) logger.

| Environment    | Transport                        |
| -------------- | -------------------------------- |
| production     | `pino/file` → `./logs/app.log`   |
| non-production | `pino-pretty` → colorized stdout |

- Ensures the `./logs` directory exists before writing (falls back to stdout if
  the file transport fails to initialize).
- Log level is read from `PINO_LOG_LEVEL` (default `info`).
- Uses ISO timestamps and custom `pid`/`host`/`node_version` bindings.
- Redacts common secret fields (`authorization`, `cookie`, `password`,
  `token`, `refreshToken`, `accessToken`, etc.) from request/response bodies,
  replacing them with `[REDACTED]`.

**Returns:** `pino.Logger`

#### `pinoLoggerMiddleware()`

A Hono `MiddlewareHandler` that logs every request lifecycle event and attaches
a request-scoped child logger to the context.

- Creates a child logger with `requestId` (from `c.var['requestId']`) plus
  method, path, query, headers and a safe copy of the body (non-`GET` only).
- Exposes the logger via `c.set('logger', childLogger)`.
- Logs `Incoming request` and `Request completed` (with status, duration and a
  safe response body).
- Logs `HTTP error` (warn) for `HTTPException`s and `Unhandled server error`
  (error) otherwise, re-throwing in both cases.

**Returns:** `MiddlewareHandler`

```typescript
import {
    pinoLoggerMiddleware,
    onErrorFn,
    notFoundFn,
} from '@mattrika/server-utils'
import { Hono } from 'hono'

const app = new Hono()
app.use('*', pinoLoggerMiddleware())
app.onError(onErrorFn())
app.notFound(notFoundFn)
```

#### `safeResponseBody(res)`

Reads a cloned response body for logging without consuming the original stream.
Skips downloads (`content-disposition: attachment`) and non-JSON responses, and
truncates bodies larger than **1 MB**.

| Parameter | Type       |
| --------- | ---------- |
| `res`     | `Response` |

**Returns:** `Promise<unknown>` — parsed JSON, `undefined` for empty/invalid, or a
placeholder string such as `[NON-JSON RESPONSE]`, `[FILE DOWNLOAD SKIPPED]`,
`[RESPONSE TOO LARGE: <n> KB]`, `[UNREADABLE RESPONSE]`.

#### `safeRequestBody(req)`

Reads a cloned request body for logging. Skips `multipart/form-data` uploads
and non-JSON payloads, and truncates bodies larger than **1 MB**.

| Parameter | Type          |
| --------- | ------------- |
| `req`     | `HonoRequest` |

**Returns:** `Promise<unknown>` — parsed JSON, `undefined` for empty/non-JSON, or a
placeholder string such as `[FILE UPLOAD SKIPPED]`, `[BODY TOO LARGE: <n> KB]`,
`[UNREADABLE REQUEST BODY]`.

#### `ensureDirExists(filePath)`

Recursively creates the parent directory of a file path if it does not exist.

| Parameter  | Type     |
| ---------- | -------- |
| `filePath` | `string` |

**Returns:** `void`

---

### `predicates/` — Predicates

#### `isProductionAppEnvironment()`

Checks whether the app is running in production. It returns `true` when
`APP_ENV` equals `'production'`, otherwise it falls back to `NODE_ENV` (checked
in that order).

**Returns:** `boolean`

```typescript
isProductionAppEnvironment() // true when APP_ENV or NODE_ENV === 'production'
```

---

### `schemas/` — Zod schemas

Reusable [Zod](https://zod.dev) schemas built with `@hono/zod-openapi`.

| Export         | Description                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `zPagination`  | `{ page?: number, size?: number }` — both coerced from strings.                                |
| `zCommonQuery` | `zPagination` plus `{ search?, orderBy?, sortOrder?: 'asc' \| 'desc' }`.                       |
| `zId`          | `{ id: string }`                                                                               |
| `zIds`         | `{ ids: string[] }` with a minimum length of `1`.                                              |
| `zPassword`    | Password string (8–128 chars) requiring an uppercase letter, a number and a special character. |
| `zEmpty`       | Empty object schema (`z.object({})`).                                                          |
| `zFile`        | `{ file?: File, files?: File[] }`, exposed as OpenAPI binary strings.                          |

**Types**

| Export              | Description                    |
| ------------------- | ------------------------------ |
| `CommonQueryParams` | `z.infer<typeof zCommonQuery>` |
| `PaginationParams`  | `z.infer<typeof zPagination>`  |

```typescript
import { zCommonQuery, zId, zPassword } from '@mattrika/server-utils'
```

---

### `services/` — Services

#### `CryptoService`

Static helpers for password hashing and secure random string generation.

##### `CryptoService.hash(plain)`

Hashes a plain-text value with **Argon2id** (64 MB memory, 3 iterations,
parallelism 1).

| Parameter | Type     |
| --------- | -------- |
| `plain`   | `string` |

**Returns:** `Promise<string>`

##### `CryptoService.verify(plain, hash)`

Verifies a plain-text value against an Argon2 hash.

| Parameter | Type     |
| --------- | -------- |
| `plain`   | `string` |
| `hash`    | `string` |

**Returns:** `Promise<boolean>`

##### `CryptoService.random64chars()`

Generates a cryptographically secure random string of **64 hex characters**
(32 random bytes).

**Returns:** `string`

```typescript
import { CryptoService } from '@mattrika/server-utils'

const hash = await CryptoService.hash('s3cret')
await CryptoService.verify('s3cret', hash) // true
const sessionId = CryptoService.random64chars() // 64-char hex string
```

---

### `utils/` — HTTP & general utilities

#### `TokenUtil`

JWT helper built on `hono/jwt`. `exp` claims are seconds since the epoch, per the
JWT spec.

```typescript
constructor(secret: string, alg: SignatureAlgorithm = 'HS256')
```

| Member                          | Description                                                                                    | Returns              |
| ------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------- |
| `create(payload, lifeSeconds?)` | Signs a payload. Sets `exp` (in seconds) only when absent; default lifetime is `900` (15 min). | `Promise<string>`    |
| `decode(token)`                 | Verifies and returns the payload. Throws on invalid/expired tokens.                            | `Promise<T \| null>` |
| `decodeUnexpired(token)`        | Verifies without Hono's built-in `exp` check and returns the payload, or `null` if expired.    | `Promise<T \| null>` |

All methods are generic over `T extends JWTPayload`.

```typescript
import { TokenUtil } from '@mattrika/server-utils'

const tokens = new TokenUtil(process.env['JWT_SECRET']!, 'HS256')

const token = await tokens.create({ sub: user.id }, 60 * 15)
const payload = await tokens.decodeUnexpired<{ sub: string }>(token)
if (!payload) {
    // token is expired or invalid
}
```

#### `throwHttpError(error, defaultMessage?)`

Throws a Hono `HTTPException`. The status code is taken from the error's
`cause` when it is a number, otherwise `500`. The message defaults to
`'Something went wrong'`.

| Parameter        | Type      | Default                  |
| ---------------- | --------- | ------------------------ |
| `error`          | `unknown` | —                        |
| `defaultMessage` | `string`  | `'Something went wrong'` |

**Returns:** `never`

#### `isUniqueViolationPg(error)`

Returns `true` when a PostgreSQL error is a unique-constraint violation
(SQLSTATE `23505`).

| Parameter | Type      |
| --------- | --------- |
| `error`   | `unknown` |

**Returns:** `boolean`

#### `onErrorFn(debugLog?)`

Creates a Hono `ErrorHandler` that logs via the context logger (set by
`pinoLoggerMiddleware`) and responds with a JSON error envelope
(`{ data: null, error, message, success: false }`). The status code is derived
from `err.status` or `err.cause`, falling back to `500`. When `debugLog` is
`true`, the error is also printed and included in the response body.

| Parameter  | Type      | Default |
| ---------- | --------- | ------- |
| `debugLog` | `boolean` | `true`  |

**Returns:** `ErrorHandler`

#### `notFoundFn`

A Hono `NotFoundHandler` that responds `404` with a JSON envelope including the
requested path.

```typescript
c.json(
    {
        success: false,
        error: 'Not Found',
        data: {},
        message: `Not Found - ${path}`,
    },
    404,
)
```

#### `validationHook(result, _c)`

A `@hono/zod-openapi` validation hook. When validation fails
(`result.success === false`), it throws an HTTP `422 Unprocessable Entity`
error via `throwHttpError`.

| Parameter | Type      |
| --------- | --------- |
| `result`  | `any`     |
| `_c`      | `Context` |

**Returns:** `void`

#### `buildPaginationResponse(page, size, total)`

Builds a normalized pagination envelope from raw query values.

- `page` is clamped to a minimum of `1`.
- `size` is clamped to a minimum of `DEFAULT_PAGE_SIZE` (`20`).
- `total` is clamped to a minimum of `0`.
- `totalPages` is computed as `ceil(total / size)`.

| Parameter | Type                  |
| --------- | --------------------- |
| `page`    | `number \| undefined` |
| `size`    | `number \| undefined` |
| `total`   | `number`              |

**Returns:** `ResponsePagination` — `{ page, size, totalItems, totalPages }`

```typescript
import { buildPaginationResponse } from '@mattrika/server-utils'

buildPaginationResponse(2, 50, 213)
// { page: 2, size: 50, totalItems: 213, totalPages: 5 }
```

#### API response helpers (`api-response.util`)

Helpers for describing OpenAPI responses with `@hono/zod-openapi`.

| Export                                     | Description                                                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `ZodSchema`                                | Type alias: `ZodObject<any> \| ZodArray<ZodObject<any>>`.                                    |
| `zResponsePagination`                      | Zod schema `{ page, size, totalItems, totalPages }`.                                         |
| `ResponsePagination`                       | `z.infer<typeof zResponsePagination>`.                                                       |
| `ApiResponse(dataSchema, description)`     | Builds an OpenAPI response object with `{ data, message, success, error?, meta? }`.          |
| `ApiListResponse(dataSchema, description)` | Same as `ApiResponse`, plus a required `pagination` field.                                   |
| `zStreamResponse`                          | Zod schema for a `ReadableStream` body with optional `Content-Type` / `Content-Disposition`. |
| `StreamResponse(description)`              | Builds an OpenAPI `application/octet-stream` (stream) response description.                  |
| `ApiPdfResponse(description)`              | Builds an OpenAPI `application/pdf` response description.                                    |

```typescript
import {
    ApiResponse,
    ApiListResponse,
    zId,
    zResponsePagination,
} from '@mattrika/server-utils'

const getUser = {
    responses: { 200: ApiResponse(zId, 'User') },
}

const listUsers = {
    responses: { 200: ApiListResponse(zId, 'Users') },
}
```

## License

MIT
