# @mattrika/utils

TypeScript utilities for both backend Node.js and frontend ESM frameworks.

## Installation

```bash
npm install @mattrika/utils
# or
pnpm add @mattrika/utils
# or
yarn add @mattrika/utils
```

## Usage

```typescript
import {
    generateId,
    maskString,
    parseBool,
    Grid,
    UniqueKeyValuePairCollection,
} from '@mattrika/utils'
```

## API Reference

### Array — `array.util.ts`

#### `join(input, separator?)`

Joins an array of strings, dropping any falsy/empty entries before joining.

| Parameter   | Type       | Default | Description                         |
| ----------- | ---------- | ------- | ----------------------------------- |
| `input`     | `string[]` | —       | The array of strings to join.       |
| `separator` | `string`   | `' '`   | The separator placed between items. |

**Returns:** `string`

```typescript
join(['a', '', 'b', null as any]) // 'a b'
join(['a', 'b', 'c'], '-') // 'a-b-c'
```

#### `isSubsequence(firstArray, secondArray)`

Checks whether `secondArray` appears in `firstArray` in the same order (as a subsequence, not necessarily contiguous).

| Parameter     | Type       | Description                 |
| ------------- | ---------- | --------------------------- |
| `firstArray`  | `string[]` | The array to search within. |
| `secondArray` | `string[]` | The ordered subset to find. |

**Returns:** `boolean`

```typescript
isSubsequence(['a', 'b', 'c', 'd', 'e'], ['c', 'd']) // true
isSubsequence(['a', 'b', 'c', 'd', 'e'], ['d', 'c']) // false
```

---

### Boolean — `boolean.util.ts`

#### `parseBool(value)`

Parses a seemingly boolean value into a literal `boolean`.

Recognized truthy strings (case-insensitive, trimmed): `'true'`, `'t'`, `'yes'`, `'y'`, `'1'`.
Recognized falsy strings: `'false'`, `'f'`, `'no'`, `'n'`, `'0'`.
`undefined`, `null`, and any unrecognized value return `false`.

| Parameter | Type                                               |
| --------- | -------------------------------------------------- |
| `value`   | `boolean \| string \| null \| undefined \| 1 \| 0` |

**Returns:** `boolean`

```typescript
parseBool('True') // true
parseBool('n') // false
parseBool(1) // true
parseBool(undefined) // false
```

---

### File — `file.util.ts`

> Browser-only helpers that operate on the DOM `File` type.

#### `getRandomFileName(file)`

Returns a random file name (UUID + extension) for the given file.

| Parameter | Type   |
| --------- | ------ |
| `file`    | `File` |

**Returns:** `string`

#### `getFileExtension(file)`

Returns the extension derived from the file's MIME type (the part after `/`).

| Parameter | Type   |
| --------- | ------ |
| `file`    | `File` |

**Returns:** `string`

#### `getFileType(file)`

Classifies a file into a broad category based on its extension.

| Parameter | Type   |
| --------- | ------ |
| `file`    | `File` |

**Returns:** `'image' | 'document' | 'audio' | 'video'`

- **image:** `jpg`, `jpeg`, `png`, `gif`, `svg`, `bmp`, `webp`
- **document:** `txt`, `rtf`, `odt`, `pdf`, `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx`
- **audio:** `mp3`, `wav`, `ogg`, `flac`, `aac`, `wma`, `m4a`
- **video:** `mp4`, `mkv`, `avi`, `mov`, `wmv`, `flv`, `webm`

Unknown extensions fall back to `'document'`.

---

### Grid — `grid.util.ts`

A generic 2D grid structure for holding items of type `T`.

#### `GridCell<T>`

```typescript
type GridCell<T> = { row: number; col: number; item: T | null }
```

#### `class Grid<T>`

The grid auto-expands as items are set, filling any missing rows or columns with `null`.

| Method                                       | Description                                                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `setTable(table: (T \| null)[][])`           | Replaces the underlying table.                                                           |
| `setItem(row, col, item)`                    | Sets an item at the given cell, expanding the grid as needed. Throws on invalid indices. |
| `setItemsHorizontally(row, startCol, items)` | Sets a list of items along a row starting at `startCol`.                                 |
| `getItem(row, col)`                          | Returns the item at a cell, or `null` when out of range.                                 |
| `isEmpty(row, col)`                          | Returns `true` if the cell is `null` or `undefined`.                                     |
| `findFirstEmptyRow(col)`                     | Returns the first row index whose cell in `col` is empty (or the row count).             |
| `findFirstEmptyCol()`                        | Returns the first entirely empty column index (or the column count).                     |
| `getGridCells(ignoreEmptyCells)`             | Returns all cells; when `true`, skips empty cells.                                       |
| `getColumn(col)`                             | Returns all values in a column as `(T \| null)[]`.                                       |
| `getRow(row)`                                | Returns all values in a row as `(T \| null)[]`.                                          |
| `getNonEmptyColumnCells(col)`                | Returns only the non-empty cells of a column.                                            |
| `getNonEmptyRowCells(row)`                   | Returns only the non-empty cells of a row.                                               |
| `findCellByItemId(id, idGetter)`             | Finds the first cell whose item matches `id` via `idGetter`.                             |
| `getRowsCount()`                             | Returns the number of rows.                                                              |
| `getColsCount()`                             | Returns the number of columns.                                                           |
| `fillColumn(col, value?)`                    | Fills an entire column with `value` (default `null`).                                    |
| `fillRow(row, value?)`                       | Fills an entire row with `value` (default `null`).                                       |

```typescript
const grid = new Grid<string>()
grid.setItem(0, 0, 'a')
grid.setItemsHorizontally(1, 0, ['b', 'c'])
grid.getItem(1, 1) // 'c'
grid.getRow(1) // ['b', 'c']
grid.getColsCount() // 2
```

---

### ID — `id.util.ts`

#### `generateId()`

Generates a random 10-character ID using the alphabet `1234567890abcdef`.

**Returns:** `string`

#### `prefixedId(prefix, separator?)`

Generates a random ID prefixed with the given prefix.

| Parameter   | Type     | Default | Description                     |
| ----------- | -------- | ------- | ------------------------------- |
| `prefix`    | `string` | —       | The prefix for the ID.          |
| `separator` | `string` | `'_'`   | The separator after the prefix. |

**Returns:** `string`

```typescript
generateId() // e.g. '3fa9c1b0d2'
prefixedId('user') // e.g. 'user_3fa9c1b0d2'
prefixedId('user', '-') // e.g. 'user-3fa9c1b0d2'
```

---

### Mask String — `mask-string.util.ts`

#### `maskString(input, visibleCharsHead, visibleCharsTail)`

Masks a string by keeping a number of characters visible at the start and end, replacing the middle with `*`.

If the input is shorter than the total visible characters, the entire string is replaced with `*` of the same length. An empty/blank input returns `''`.

| Parameter          | Type     | Description                                |
| ------------------ | -------- | ------------------------------------------ |
| `input`            | `string` | The string to mask.                        |
| `visibleCharsHead` | `number` | Number of visible characters at the start. |
| `visibleCharsTail` | `number` | Number of visible characters at the end.   |

**Returns:** `string`

```typescript
maskString('1234567890', 2, 2) // '12******90'
maskString('abc', 2, 2) // '***'
```

---

### Number — `number.util.ts`

#### `toNonNegative(value)`

Clamps a number to be non-negative. Returns `0` for `undefined`, `null`, or `NaN`.

| Parameter | Type     |
| --------- | -------- |
| `value`   | `number` |

**Returns:** `number`

```typescript
toNonNegative(-5) // 0
toNonNegative(3) // 3
toNonNegative(NaN) // 0
```

---

### Object — `object.util.ts`

#### `serializeObject(query, sortKeys?)`

Serializes an object to a deterministic string. `undefined` properties are omitted, and when `sortKeys` is `true` (default) keys are sorted for stable output. Functions are ignored during serialization.

| Parameter  | Type                            | Default | Description                          |
| ---------- | ------------------------------- | ------- | ------------------------------------ |
| `query`    | `Q extends Record<string, any>` | —       | The object to serialize.             |
| `sortKeys` | `boolean`                       | `true`  | Whether to sort keys alphabetically. |

**Returns:** `string`

```typescript
serializeObject({ b: 2, a: 1 }) // '{"a":1,"b":2}'
serializeObject({ b: 2, a: undefined }) // '{"b":2}'
```

---

### Regex — `regex.util.ts`

#### `hasImageExtension(url)`

Returns `true` if the URL ends with an image extension (`jpg`, `jpeg`, `png`, `gif`, `bmp`, `svg`). Case-insensitive.

| Parameter | Type     |
| --------- | -------- |
| `url`     | `string` |

**Returns:** `boolean`

#### `hasVideoExtension(url)`

Returns `true` if the URL ends with a video extension (`mp4`, `avi`, `mov`, `wmv`, `flv`, `mkv`, `webm`). Case-insensitive.

**Returns:** `boolean`

#### `hasDocumentExtension(url)`

Returns `true` if the URL ends with a document extension (`pdf`, `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx`, `txt`). Case-insensitive.

**Returns:** `boolean`

#### `EmailRegex`

A string containing a regular expression pattern that matches a valid email address.

```typescript
new RegExp(EmailRegex).test('user@example.com') // true
```

---

### Serialized Type — `serialized-type.ts`

#### `SerializedOptional<T>`

A type utility that maps a type to its JSON/wire-compatible shape for frontend use:

- `Date` becomes `string`.
- Arrays map their element type recursively.
- Object keys whose value includes `null` become optional and have `null` removed.
- All other types pass through unchanged.

```typescript
type User = { id: string; createdAt: Date; nickname: string | null }

type WireUser = SerializedOptional<User>
// { id: string; createdAt: string; nickname?: string }
```

---

### String — `string.util.ts`

#### `transformCsvStringToArray(text)`

Converts a comma-separated string into a trimmed array of non-empty strings. If an array is passed, it is returned with blank entries filtered out.

| Parameter | Type                 |
| --------- | -------------------- |
| `text`    | `string \| string[]` |

**Returns:** `string[]`

```typescript
transformCsvStringToArray('a, b , ,c') // ['a', 'b', 'c']
transformCsvStringToArray(['a', '', 'b']) // ['a', 'b']
```

#### `trimLowercase(str?)`

Trims and lowercases a string, safely handling `undefined`/`null` by treating them as `''`.

| Parameter | Type                  |
| --------- | --------------------- |
| `str`     | `string` _(optional)_ |

**Returns:** `string`

```typescript
trimLowercase('  Hello World  ') // 'hello world'
trimLowercase() // ''
```

---

### Unique Key-Value Pair Collection — `unique-key-value-pair-collection.ts`

A collection that stores unique key-value pair combinations, allowing the same key or the same value to repeat as long as the `(key, value)` combination is unique. Implements `Iterable`.

#### `KeyValueTuple<K, V>`

```typescript
type KeyValueTuple<K, V> = [K, V]
```

#### `class UniqueKeyValuePairCollection<K, V>`

| Member                | Description                                                                          |
| --------------------- | ------------------------------------------------------------------------------------ |
| `add(key, value)`     | Adds a pair. Returns `true` if added, `false` if the combination already exists.     |
| `has(key, value)`     | Returns whether the combination exists.                                              |
| `getValues(key)`      | Returns the `Set<V>` for a key, or `undefined` if absent.                            |
| `delete(key, value)`  | Deletes a combination. Returns `true` if it existed.                                 |
| `toggle(key, value)`  | Adds if absent, deletes if present. Returns `true` when added, `false` when deleted. |
| `size` _(getter)_     | Total number of unique pairs.                                                        |
| `clear()`             | Removes all pairs.                                                                   |
| `deleteValues(key)`   | Removes all values associated with a key.                                            |
| `[Symbol.iterator]()` | Iterates over all `[key, value]` pairs.                                              |
| `toArray()`           | Returns all pairs as an array.                                                       |

```typescript
const kv = new UniqueKeyValuePairCollection<string, number>()

kv.add('a', 1) // true
kv.add('b', 1) // true — value repeats, combination is unique
kv.add('a', 1) // false — duplicate combination
kv.getValues('a') // Set { 1 }
kv.toggle('a', 1) // false — now removed
kv.toArray() // [['b', 1]]
```

## License

MIT
