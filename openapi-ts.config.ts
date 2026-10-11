import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig([
    {
        input: 'https://auth-api.mattrika.com/openapi.json',
        output: {
            path: './libs/restauth-sdk/src/client',
            postProcess: [],
        },
        plugins: [
            '@hey-api/schemas',
            {
                dates: true,
                name: '@hey-api/transformers',
            },
            {
                enums: 'javascript',
                name: '@hey-api/typescript',
            },
            {
                name: '@hey-api/sdk',
                transformer: true,
            },
        ],
    },
    {
        input: 'https://auditlog-api.mattrika.com/openapi.json',
        output: {
            path: './libs/auditlog-sdk/src/client',
            postProcess: [],
        },
        plugins: [
            '@hey-api/schemas',
            {
                dates: true,
                name: '@hey-api/transformers',
            },
            {
                enums: 'javascript',
                name: '@hey-api/typescript',
            },
            {
                name: '@hey-api/sdk',
                transformer: true,
            },
        ],
    },
])
