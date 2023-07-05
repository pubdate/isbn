# isbn

A library to parse, validate and format ISBNs.

## Before you start

Do not use **hyphenated ISBNs** as identifiers.

- Missing or outdated registration groups may result in runtime errors.
- Different versions of this package may output different hyphenated ISBN (due to registration groups being time-sensitive).

Do not use **isbn10** as identifiers.

- Some ISBNs are not compatible with isbn10.

### Computer-friendly

By default, `toString()` uses `{ version: 'isbn13', hyphens: false }` which is future-proof and non-time-sensitive:

```js
ISBN.parse('2070408507').toString() // '9782070408504'
```

### Human-friendly

To display ISBNs on a web page or other documents meant to be read by humans, use `{ hyphens: [true, false] }` to fallback and avoid errors caused by missing registration groups.
And verify that the ISBN is compatible before using `{ version: 'isbn10' }`. Or use `{ version: ['isbn10', 'isbn13'] }` to fallback to isbn13 whenever needed.

```js
const isbn = ISBN.parse('2070408507')

`ISBN-10: ${isbn.isCompatible({ version: 'isbn10' }) ? isbn.toString({ version: 'isbn10', hyphens: [true, false] }) : 'N/A'}`
`ISBN-10 (with fallback): ${isbn.toString({ version: ['isbn10', 'isbn13'], hyphens: [true, false] })}`
`ISBN-13: ${isbn.toString({ hyphens: [true, false] })}`
```

## Getting Started

This library can be imported with or without registration groups.
Registration groups are needed to format ISBNs with hyphens and to get agency info (countryCode, langCode, ...).

Using ISBN with registration groups comes with drawbacks:

- Registration groups need to be updated frequently. This package is automatically updated daily but you may need to update your dependencies regularly.
- The version of this library with registration groups is heavier than without registration groups. 27.1k (gzipped: 7.4k) and 5.4k (gzipped: 2.2k) respectively.

### With registration groups

<details>

#### NPM (with registration groups)

```sh
npm i @pubdate/isbn
```

```js
import ISBN from '@pubdate/isbn'

ISBN.parse('2070408507').toString({ version: 'isbn13', hyphens: [true, false] }) // '978-2-07-040850-4'
```

#### CDN (with registration groups)

```html
<script src="https://unpkg.com/@pubdate/isbn"></script>

<script>
  ISBN.parse('2070408507').toString({ version: 'isbn13', hyphens: [true, false] }) // '978-2-07-040850-4'
</script>
```

</details>

### Without registration groups

<details>

#### NPM (without registration groups)

```sh
npm i @pubdate/isbn
```

```js
import ISBN from '@pubdate/isbn/dist/isbn-without-registration-groups'

ISBN.parse('2070408507').toString({ version: 'isbn13', hyphens: [true, false] }) // '9782070408504'
```

#### CDN (without registration groups)

```html
<script src="https://unpkg.com/@pubdate/isbn/dist/isbn-without-registration-groups"></script>

<script>
  ISBN.parse('2070408507').toString({ version: 'isbn13', hyphens: [true, false] }) // '9782070408504'
</script>
```

</details>

## API

### `ISBN.parse(str)`

Converts a string into an ISBN instance.
> **Note**:
> Use `?` as `checksum` if you don't know it yet.

```js
ISBN.parse('2070408507').toString() // '9782070408504'
ISBN.parse('207040850?').toString() // '9782070408504'
```

### `ISBN.search(str)`

Returns the first ISBN of a string as an ISBN instance. Or `undefined` when none could be found.

```js
ISBN.search('Check these out: 9782070408500, 9784102122044, 2070408507, 9789287191908') // '9784102122044'
ISBN.search('Hello World') // undefined
```

### `ISBN.searchAll(str, { limit = Infinity })`

Returns all the ISBNs of a string as ISBN instances. `limit` defines the maximum number of ISBNs to search for.

```js
ISBN.searchAll('Check these out: 9782070408500, 9784102122044, 2070408507, 9789287191908') // ['9784102122044', '2070408507', '9789287191908']
ISBN.searchAll('Check these out: 9782070408500, 9784102122044, 2070408507, 9789287191908', { limit: 2 }) // ['9784102122044', '2070408507']
```

### `source`

The unmodified string.

```js
ISBN.parse('2070408507').source // '2070408507'
ISBN.parse('2-07-040850-7').source // '2-07-040850-7'
ISBN.search('Check these out: 9782070408500, 9784102122044, 2070408507, 9789287191908')?.source // '9784102122044'
```

### `version`

The version (`isbn10`/`isbn13`) of the `source`.

```js
ISBN.parse('2070408507').version // 'isbn10'
ISBN.parse('9782070408504').version // 'isbn13'
```

### `eanPrefix`

The first 3 digits of the source for `isbn13`.

```js
ISBN.parse('2070408507').eanPrefix // undefined
ISBN.parse('9782070408504').eanPrefix // '978'
ISBN.parse('9798565336375').eanPrefix // '979'
```

### `code`

The part between the `eanPrefix` and the `checksum`. Without hyphens.

```js
ISBN.parse('2070408507').code // '207040850'
ISBN.parse('978-2-07-040850-4').code // '207040850'
```

### `checksum`

The last digit of the `source`.

```js
ISBN.parse('2070408507').checksum // '7'
ISBN.parse('978-2-07-040850-4').checksum // '4'
```

### `isValid`

Wether or not the `source` is valid.
> **Warning**:
> Hyphens and code parts are not validated.

```js
ISBN.parse('2070408507').isValid // true
ISBN.parse('2070408508').isValid // false
```

### `error`

The reason the `source` is invalid. Or `null` when it is valid.
> **Warning**:
> Hyphens and code parts are not validated.

```js
ISBN.parse('207040850?').error // null
ISBN.parse('2070408507').error // null
ISBN.parse('2070408508').error // 'invalid_checksum'
ISBN.parse('2-07-040-850-7').error // 'invalid_format'
ISBN.parse('977207040850?').error // 'invalid_ean_prefix'
```

### `codeParts` (registration groups required)

The `code` split in accordance with the registration group. Or `null` when no matching registration group could be found.

```js
ISBN.parse('2070408507').codeParts // ['2', '07', '040850']
ISBN.parse('6699999990').codeParts // null
```

### `sourceCodeParts`

The `code` split in accordance with the `source`. Or `null` when the `source` does not contain valid hyphens.

```js
ISBN.parse('207-040-850-7').sourceCodeParts // ['207', '040', '850']
ISBN.parse('2070408507').sourceCodeParts // null
ISBN.parse('207-040850-7').sourceCodeParts // null
```

### `agency` (registration groups required)

An object containing the `countryCode`, `langCode` or `name` of the agency. Or `null` when no matching registration group could be found.

```js
ISBN.parse('4102122044').agency // { countryCode: 'JP' }
ISBN.parse('2070408507').agency // { langCode: 'FR' }
ISBN.parse('9287191905').agency // { name: 'International NGO Publishers and EU Organizations' }
ISBN.parse('6699999990').agency // null
```

### `generateChecksum({ version })`

Returns the correct checksum for the specified version.

```js
ISBN.parse('2070408507').generateChecksum({ version: 'isbn10' }) // '7'
ISBN.parse('2070408507').generateChecksum({ version: 'isbn13' }) // '4'
```

### `toString({ version = 'isbn13', hyphens = false })` (registration groups required for `{ hyphens: true }`)

Returns the formatted ISBN.

```js
ISBN.parse('2070408507').toString() // '9782070408504'
ISBN.parse('2070408508').toString() // Error, invalid_source

// options.version
ISBN.parse('9782070408504').toString({ version: 'isbn10' }) // '2070408507'
ISBN.parse('9798565336375').toString({ version: 'isbn10' }) // Error, incompatible_version
// To avoid errors, use isbn13.
ISBN.parse('9782070408504').toString({ version: 'isbn13' }) // '9782070408504'
ISBN.parse('9798565336375').toString({ version: 'isbn13' }) // '9798565336375'
// To avoid errors, version can be chained (order by preferred method).
ISBN.parse('9782070408504').toString({ version: ['isbn10', 'isbn13'] }) // '2070408507'
ISBN.parse('9798565336375').toString({ version: ['isbn10', 'isbn13'] }) // '9798565336375'

// options.hyphens
// WARNING: this option is time-sensitive and may fail if _@pubdate/isbn_ is not up to date.
ISBN.parse('2070408507').toString({ hyphens: true }) // '978-2-07-040850-4'
ISBN.parse('6699999990').toString({ hyphens: true }) // Error, registration_group_not_found
// 'source' uses the position of hyphens in source.
ISBN.parse('207-040-850-7').toString({ hyphens: 'source' }) // '978-207-040-850-4'
ISBN.parse('2070408507').toString({ hyphens: 'source' }) // Error, missing_or_invalid_hyphens
// To avoid errors, hyphens can be chained (order by preferred method).
ISBN.parse('2070408507').toString({ hyphens: [true, 'source', false] }) // '978-2-07-040850-4'
ISBN.parse('669-999-999-0').toString({ hyphens: [true, 'source', false] }) // '978-669-999-999-3'
ISBN.parse('6699999990').toString({ hyphens: [true, 'source', false] }) // '9786699999993'
```
