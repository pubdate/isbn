const REGEX = /97[89]-?(\d+-?){3}\d|(\d+-?){3}[\dX]/
const REGEX_SE = new RegExp(`^(${REGEX.source})$`)

interface Tree<T> { [k: string]: Tree<T> | T }
type Version = 'isbn10' | 'isbn13'
interface RegistrationGroup { _: Record<string, Array<[number, number]>>, a?: string, c?: string, l?: string }
type _HyphensOption = boolean | 'source'
type HyphensOption = _HyphensOption | _HyphensOption[]

class IsbnError extends Error {
  get package (): '@pubdate/isbn' { return '@pubdate/isbn' }
  constructor (
    public code: string,
    public solution?: string
  ) {
    let message = `[@pubdate/isbn] ${code}`
    if (solution != null) message = `${message} (${solution})`
    super(message)
  }
}

export default class IsbnWithoutRegistrationGroups {
  // CONST

  static REGISTRATION_GROUPS_TREE_BY_EAN_PREFIX: Record<string, Tree<RegistrationGroup>> = {}

  // CONSTRUCTOR

  public readonly version: Version
  public readonly eanPrefix: string
  public readonly code: string
  public readonly checksum: string

  constructor (public readonly source: string) {
    source = source.replace(/-/g, '')
    this.version = source.length === 10 ? 'isbn10' : 'isbn13'
    this.eanPrefix = this.version === 'isbn10' ? '978' : source.slice(0, 3)
    this.code = source.slice(this.version === 'isbn10' ? 0 : 3, -1)
    this.checksum = source.slice(-1)
  }

  // STATIC

  static parse<T extends IsbnWithoutRegistrationGroups>(this: (typeof IsbnWithoutRegistrationGroups) & (new (...args: any[]) => T), source: string): T {
    return new this(source)
  }

  /**
   * @example
   * ISBN.searchAll('Check these out: 9780385504202, 123456789X, 9781408855713, 9780385504201') // '123456789X'
   */
  static search<T extends IsbnWithoutRegistrationGroups>(this: (typeof IsbnWithoutRegistrationGroups) & (new (...args: any[]) => T), source: string): T | undefined {
    return this.searchAll(source, { limit: 1 })[0]
  }

  /**
   * @example
   * ISBN.searchAll('Check these out: 9780385504202, 123456789X, 9781408855713, 9780385504201') // ['123456789X', '9781408855713', '9780385504201']
   * ISBN.searchAll('Check these out: 9780385504202, 123456789X, 9781408855713, 9780385504201', { limit: 2 }) // ['123456789X', '9781408855713']
   */
  static searchAll<T extends IsbnWithoutRegistrationGroups>(this: (typeof IsbnWithoutRegistrationGroups) & (new (...args: any[]) => T), source: string, { limit = Infinity }: { limit?: number } = {}): T[] {
    const result = []
    let match
    const regex = new RegExp(`(?<![\\d-])${REGEX.source}(?![\\d-])`, REGEX.flags + 'g')
    while ((match = regex.exec(source)) !== null) {
      const isbn = this.parse(match[0])
      if (isbn.isValid) result.push(isbn)
      if (limit === result.length) break
    }
    return result
  }

  // GETTERS

  /**
   * WARNING: hyphens and code parts are not validated.
   *
   * @example
   * ISBN.parse('123-456-789-X').isValid // true
   * ISBN.parse('123-456-789-0').isValid // false
   */
  get isValid (): boolean {
    return this.error == null
  }

  #error?: IsbnWithoutRegistrationGroups['error']
  /**
   * WARNING: hyphens and code parts are not validated.
   *
   * @example
   * ISBN.parse('123-456-789-X').error // null
   * ISBN.parse('123-456-789-0').error // 'invalid_checksum'
   */
  get error (): 'invalid_ean_prefix' | 'invalid_format' | 'invalid_checksum' | null {
    if (this.#error === undefined) {
      if (!['978', '979'].includes(this.eanPrefix)) this.#error = 'invalid_ean_prefix'
      else if (!REGEX_SE.test(this.source.replace('?', '0'))) this.#error = 'invalid_format'
      else if (this.checksum !== '?' && this.checksum !== this.generateChecksum({ version: this.version })) this.#error = 'invalid_checksum'
      else this.#error = null
    }
    return this.#error
  }

  #_codePrefix?: string | null
  #_registrationGroup?: RegistrationGroup | null
  get #registrationGroup (): RegistrationGroup | null {
    if (this.#_registrationGroup === undefined) {
      let node: Tree<RegistrationGroup> | RegistrationGroup | undefined = ((this.constructor as typeof IsbnWithoutRegistrationGroups).REGISTRATION_GROUPS_TREE_BY_EAN_PREFIX[this.eanPrefix] ?? {})
      this.#_codePrefix = ''
      for (const char of this.code) {
        this.#_codePrefix += char
        node = (node as Tree<RegistrationGroup>)[char]
        if (node == null) break
        if (node._ != null) return (this.#_registrationGroup = node as RegistrationGroup)
      }
      this.#_codePrefix = null
      this.#_registrationGroup = null
    }
    return this.#_registrationGroup
  }

  get #codePrefix (): string | null {
    if (this.#registrationGroup == null) return null
    return this.#_codePrefix as string | null
  }

  get agency (): { name: string } | { countryCode: string } | { langCode: string } | Record<string, never> | null {
    if (this.#registrationGroup == null) return null
    if (this.#registrationGroup.a != null) return { name: this.#registrationGroup.a }
    if (this.#registrationGroup.c != null) return { countryCode: this.#registrationGroup.c }
    if (this.#registrationGroup.l != null) return { langCode: this.#registrationGroup.l }
    return {}
  }

  #codeParts?: IsbnWithoutRegistrationGroups['codeParts']
  get codeParts (): [string, string, string] | null {
    if (this.#registrationGroup === null) this.#codeParts = null
    if (this.#codeParts === undefined) {
      for (const l in this.#registrationGroup!._) {
        const codeInfixEnd = this.#codePrefix!.length + parseInt(l)
        const codeInfix = this.code.substring(this.#codePrefix!.length, codeInfixEnd)
        const n = parseInt(codeInfix)
        for (const range of this.#registrationGroup!._[l]) {
          if (n >= range[0] && n <= range[1]) return (this.#codeParts = [this.#codePrefix, codeInfix, this.code.substring(codeInfixEnd)] as [string, string, string])
        }
      }
      this.#codeParts = null
    }
    return this.#codeParts
  }

  #sourceCodeParts?: IsbnWithoutRegistrationGroups['sourceCodeParts']
  get sourceCodeParts (): string[] | null {
    if (this.#sourceCodeParts === undefined) {
      const parts = this.source.split('-')
      if (this.version === 'isbn13') parts.shift() // remove eanPrefix
      parts.pop() // remove checksum
      this.#sourceCodeParts = parts.length === 3 ? parts : null
    }
    return this.#sourceCodeParts
  }

  // METHODS

  /**
   * @example
   * ISBN.parse('123-456-789-?').generateChecksum({ version: 'isbn10' }) // 'X'
   * ISBN.parse('123-456-789-?').generateChecksum({ version: 'isbn13' }) // '7'
   */
  generateChecksum ({ version }: { version: Version }): string {
    if (version === 'isbn13') {
      const n = (this.eanPrefix + this.code).split('').reduce((acc, curr, i) => acc + (parseInt(curr) * (i % 2 === 0 ? 1 : 3)), 0)
      return ((10 - (n % 10)) % 10).toString()
    } else {
      const n = this.code.split('').reduce((acc, curr, i) => acc + (parseInt(curr) * (10 - i)), 0)
      const x = (11 - (n % 11)) % 11
      return x === 10 ? 'X' : x.toString()
    }
  }

  /**
   * @throws invalid_source
   * @throws incompatible_version
   * @throws registration_group_not_found
   * @throws missing_or_invalid_hyphens
   *
   * @example
   * ISBN.parse('9780385504201').toString() // '9780385504201'
   * ISBN.parse('9780385504202').toString() // Error, invalid_source
   *
   * // options.version
   * ISBN.parse('9780385504201').toString({ version: 'isbn10' }) // '0385504209'
   * ISBN.parse('9798565336375').toString({ version: 'isbn10' }) // Error, incompatible_version
   * // To avoid errors, hyphens can be chained (order by preferred method).
   * ISBN.parse('9780385504201').toString({ version: ['isbn10', 'isbn13'] }) // '0385504209'
   * ISBN.parse('9798565336375').toString({ version: ['isbn10', 'isbn13'] }) // '9798565336375'
   *
   * // options.hyphens
   * // WARNING: this option is time-sensitive and may fail if _@pubdate/isbn_ is not up to date.
   * ISBN.parse('0385504201').toString({ hyphens: true }) // '978-0-385-50420-1'
   * ISBN.parse('669999999?').toString({ hyphens: true }) // Error, registration_group_not_found
   * // 'source' uses the position of hyphens in source.
   * ISBN.parse('038-550-420-1').toString({ hyphens: 'source' }) // '978-038-550-420-1'
   * ISBN.parse('0385504201').toString({ hyphens: 'source' }) // Error, missing_or_invalid_hyphens
   * // To avoid errors, hyphens can be chained (order by preferred method).
   * ISBN.parse('0385504201').toString({ hyphens: [true, 'source', false] }) // '978-0-385-50420-1'
   * ISBN.parse('669-999-999-?').toString({ hyphens: [true, 'source', false] }) // '978-669-999-999-3'
   * ISBN.parse('669999999?').toString({ hyphens: [true, 'source', false] }) // '9786699999993'
   */
  toString ({ version = 'isbn13', hyphens = false }: { version?: Version | ['isbn10', 'isbn13'], hyphens?: HyphensOption } = {}): string {
    if (!this.isValid) throw new IsbnError('invalid_source', 'check isValid before stringifying')
    const v = [version].flat().find(v => v === 'isbn13' || this.eanPrefix === '978')
    if (v == null) throw new IsbnError('incompatible_version', "use version 'isbn13'; or chain version flags")
    const codeParts = this.#getCodeParts({ hyphens })
    return [
      v === 'isbn13' ? this.eanPrefix : '',
      ...(codeParts ?? [this.code]),
      this.generateChecksum({ version: v })
    ].filter(x => x).join(codeParts == null ? '' : '-')
  }

  #getCodeParts ({ hyphens }: { hyphens: HyphensOption }): string[] | null {
    hyphens = [hyphens].flat()
    let result: string[] | null
    for (const h of hyphens) {
      switch (h) {
        case false: return null
        case true: result = this.codeParts; break
        case 'source': result = this.sourceCodeParts; break
      }
      if (result !== null) return result
    }
    switch (hyphens[hyphens.length - 1]) {
      case true: throw new IsbnError('registration_group_not_found', 'disable hyphens; or chain hyphens flags; or update @pubdate/isbn')
      case 'source': throw new IsbnError('missing_or_invalid_hyphens', 'disable hyphens; or chain hyphens flags')
      default: throw new Error()
    }
  }
}
