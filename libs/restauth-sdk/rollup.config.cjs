const { withNx } = require('@nx/rollup/with-nx')

// These options were migrated by @nx/rollup:convert-to-inferred from project.json
const options = {
    outputPath: '../../dist/libs/restauth-sdk',
    tsConfig: './tsconfig.lib.json',
    main: './src/index.ts',
    format: ['cjs', 'esm'],
    generatePackageJson: true,
    generateExportsField: true,
    assets: [
        {
            glob: 'README.md',
            input: 'libs/restauth-sdk',
            output: '.',
        },
    ],
}

const config = withNx(options, {
    // Provide additional rollup configuration here. See: https://rollupjs.org/configuration-options
    // e.g.
    // output: { sourcemap: true },
})

module.exports = config
