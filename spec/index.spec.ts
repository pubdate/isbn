import ISBN from '../src'

const validISBNs = ['0-330-28498-3', '1-58182-008-9', '2-226-05257-7', '3-7965-1900-8', '4-19-830127-1', '5-85270-001-0', '978-600-119-125-1', '978-601-7151-13-3', '978-602-8328-22-7', '978-603-500-045-1', '604-69-4510-0', '605-384-057-2', '978-606-8126-35-7', '978-607-455-035-1', '978-608-203-023-4', '609-01-1248-8', '611-543-009-7', '978-612-45165-9-7', '978-614-404-018-8', '978-615-5014-99-4', '978-616-90393-3-4', '978-617-581-116-0', '978-618-02-0789-7', '978-619-90568-4-4', '978-620-0004574', '978-621-9619-02-8', '978-622-601-101-3', '978-623-91631-0-5', '978-624-5375-00-4', '978-625-7677-79-0', '978-626-7002-46-9', '978-628-751006-7', '978-65-5525-005-3', '7-301-10299-2', '80-85983-44-3', '81-7215-399-6', '82-530-0983-6', '83-08-01587-5', '84-86546-08-7', '85-7531-015-1', '86-341-0846-5', '87-595-2277-1', '88-04-47328-2', '89-04-02003-4', '90-5691-187-2', '91-1-811692-2', '92-67-10370-9', '93-5025-214-7', '978-94-6265-011-4', '950-04-0442-7', '951-0-11369-7', '952-471-294-6', '953-157-105-8', '954-430-603-X', '955-20-3051-X', '956-7291-48-9', '957-01-7429-3', '958-04-6278-X', '959-10-0363-3', '978-960-99626-7-4', '961-6403-23-0', '962-04-0195-6', '963-7971-51-3', '964-6194-70-2', '965-359-002-2', '966-95440-5-X', '967-978-753-2', '968-6031-02-2', '969-35-2020-3', '970-20-0242-7', '971-8845-10-0', '972-37-0274-6', '973-43-0179-9', '974-85854-7-6', '975-293-381-5', '976-640-140-3', '977-734-520-8', '978-37186-2-2', '979-553-483-1', '980-01-0194-2', '981-3018-39-9', '982-301-001-3', '983-52-0157-9', '984-458-089-7', '978-985-6740-48-3', '986-417-191-7', '987-98184-2-3', '978-988-00-3827-3', '978-989-758-246-2', '978-9913-600-00-2', '978-9914-700-82-4', '978-9928400529', '978-9929801646', '978-9930943106', '978-9933101473', '978-9934015960', '978-9938-01-122-7', '978-9950-974-40-1', '9963-645-06-2', '978-9966-003-15-7', '9986-16-329-3', '978-99918-65-51-5', '978-99937-1-056-1', '978-99965-2-047-1', '979-10-90636-07-1', '979-11-86178-14-0', '979-12-200-0852-5', '979-8-6024-0545-3', '978-92-95055-12-4', '978-92-95055-02-5']
const searchString = 'too many numbers: 0-330-28498-31-58182-008-9; good: 2-226-05257-7; invalid checksum: 3-7965-1900-9; good: 4198301271; good: 978-600-119-125-1;'

describe('ISBN', () => {
  describe('search', () => {
    describe('search', () => {
      test('it returns the first isbn', () => {
        expect(ISBN.search(searchString)?.toString({ version: 'isbn10' })).toEqual('2226052577')
        expect(ISBN.search('too many numbers: 0-330-28498-31-58182-008-9;')).toEqual(undefined)
      })
    })

    describe('searchAll', () => {
      test('it returns every isbn', () => {
        expect(ISBN.searchAll(searchString).map(isbn => isbn.toString({ version: isbn.version }))).toEqual(['2226052577', '4198301271', '9786001191251'])
        expect(ISBN.searchAll(searchString, { limit: 2 }).map(isbn => isbn.toString({ version: isbn.version }))).toEqual(['2226052577', '4198301271'])
        expect(ISBN.searchAll('too many numbers: 0-330-28498-31-58182-008-9;')).toEqual([])
      })
    })
  })

  describe('isValid', () => {
    describe('isValid', () => {
      test('it returns true when source is invalid', () => {
        expect(ISBN.parse('123-456-789-X').isValid).toEqual(true)
        expect(ISBN.parse('123-456-789-0').isValid).toEqual(false)

        validISBNs.forEach(str => { expect(ISBN.parse(str).isValid).toEqual(true) })
      })
    })

    describe('error', () => {
      test('it returns null when source is valid', () => {
        expect(ISBN.parse('123-456-789-?').error).toEqual(null)
        expect(ISBN.parse('123-456-789-X').error).toEqual(null)
        expect(ISBN.parse('123456789?').error).toEqual(null)
        expect(ISBN.parse('123456789X').error).toEqual(null)
        expect(ISBN.parse('978-123-456-789-?').error).toEqual(null)
        expect(ISBN.parse('978-123-456-789-7').error).toEqual(null)
        expect(ISBN.parse('978123456789?').error).toEqual(null)
        expect(ISBN.parse('9781234567897').error).toEqual(null)

        validISBNs.forEach(str => { expect(ISBN.parse(str).error).toEqual(null) })
      })

      test("it returns 'invalid_checksum' when source is invalid", () => {
        expect(ISBN.parse('123-456-789-0').error).toEqual('invalid_checksum')
      })

      test("it returns 'invalid_format' when source is invalid", () => {
        expect(ISBN.parse('123-456-789-?-').error).toEqual('invalid_format')
        expect(ISBN.parse('-123-456-789-?').error).toEqual('invalid_format')
        expect(ISBN.parse('978-123-456-7890-?').error).toEqual('invalid_format')
        expect(ISBN.parse('abc-def-xyz-?').error).toEqual('invalid_format')
        // Some of the ISBNs at https://en.wikipedia.org/wiki/List_of_ISBN_registration_groups are missing one or more hyphens.
        // They should probably be considered invalid but throwing errors in ISBN#toString() when we inevitably stumble upon one of those in the wild would not be great.
        expect(ISBN.parse('123-456-789?').error).toEqual(null)
        // ISBNs with too many hyphens are definitely invalid though.
        expect(ISBN.parse('123-456-78-9?').error).toEqual('invalid_format') // 3+ hyphens in code
        expect(ISBN.parse('123--456789?').error).toEqual('invalid_format') // consecutive hyphens
        expect(ISBN.parse('97-8-123-456-789-?').error).toEqual('invalid_format') // hyphen(s) in eanPrefix
      })

      test("it returns 'invalid_ean_prefix' when source is invalid", () => {
        expect(ISBN.parse('977-123-456-789-?').error).toEqual('invalid_ean_prefix')
        expect(ISBN.parse('978-123-456-789-?').error).toEqual(null)
        expect(ISBN.parse('979-123-456-789-?').error).toEqual(null)
        expect(ISBN.parse('980-123-456-789-?').error).toEqual('invalid_ean_prefix')
      })
    })

    describe('generateChecksum', () => {
      test('it returns the correct checksum', () => {
        expect(ISBN.parse('123-456-789-?').generateChecksum({ version: 'isbn10' })).toEqual('X')
        expect(ISBN.parse('123-456-789-?').generateChecksum({ version: 'isbn13' })).toEqual('7')

        validISBNs.forEach(str => {
          const isbn = ISBN.parse(str)
          expect(isbn.generateChecksum({ version: isbn.version })).toEqual(str.slice(-1))
        })
      })
    })

    describe('isCompatible', () => {
      test('it returns true when source is compatible with the specified version', () => {
        expect(ISBN.parse('2070408507').isCompatible({ version: 'isbn10' })).toEqual(true)
        expect(ISBN.parse('9782070408504').isCompatible({ version: 'isbn10' })).toEqual(true)
        expect(ISBN.parse('9798565336375').isCompatible({ version: 'isbn10' })).toEqual(false)
        expect(ISBN.parse('2070408507').isCompatible({ version: 'isbn13' })).toEqual(true)
        expect(ISBN.parse('9782070408504').isCompatible({ version: 'isbn13' })).toEqual(true)
        expect(ISBN.parse('9798565336375').isCompatible({ version: 'isbn13' })).toEqual(true)

        expect(ISBN.parse('2070408507').isCompatible({ hyphens: true })).toEqual(true)
        expect(ISBN.parse('6699999990').isCompatible({ hyphens: true })).toEqual(false)
        expect(ISBN.parse('207-040-850-7').isCompatible({ hyphens: 'source' })).toEqual(true)
        expect(ISBN.parse('2070408507').isCompatible({ hyphens: 'source' })).toEqual(false)
        expect(ISBN.parse('2070408507').isCompatible({ hyphens: false })).toEqual(true)
        expect(ISBN.parse('6699999990').isCompatible({ hyphens: false })).toEqual(true)
        expect(ISBN.parse('207-040-850-7').isCompatible({ hyphens: false })).toEqual(true)
      })
    })
  })

  describe('agency', () => {
    test('it returns the correct agency info', () => {
      expect(ISBN.parse('920000000?').agency).toEqual({ name: 'International NGO Publishers and EU Organizations' })
      expect(ISBN.parse('000000000?').agency).toEqual({ langCode: 'EN' })
      expect(ISBN.parse('400000000?').agency).toEqual({ countryCode: 'JP' })
      expect(ISBN.parse('978400000000?').agency).toEqual({ countryCode: 'JP' })
      expect(ISBN.parse('979400000000?').agency).toEqual(null) // wrong eanPrefix
      expect(ISBN.parse('980400000000?').agency).toEqual(null) // invalid eanPrefix
      expect(ISBN.parse('978669999999?').agency).toEqual(null) // RegistrationGroup not found
      expect(ISBN.parse('9786119999992').agency).toEqual({ countryCode: 'TH' })
    })
  })

  describe('codeParts', () => {
    describe('codeParts', () => {
      test('it returns the correct codeParts', () => {
        expect(ISBN.parse('920000000?').codeParts).toEqual(['92', '0', '000000'])
        expect(ISBN.parse('000000000?').codeParts).toEqual(['0', '00', '000000'])
        expect(ISBN.parse('400000000?').codeParts).toEqual(['4', '00', '000000'])
        expect(ISBN.parse('978400000000?').codeParts).toEqual(['4', '00', '000000'])
        expect(ISBN.parse('979400000000?').codeParts).toEqual(null) // wrong eanPrefix
        expect(ISBN.parse('980400000000?').codeParts).toEqual(null) // invalid eanPrefix
        expect(ISBN.parse('978669999999?').codeParts).toEqual(null) // RegistrationGroup not found
        expect(ISBN.parse('9786119999992').codeParts).toEqual(null) // RegistrationGroup code infix not found
      })
    })

    describe('sourceCodeParts', () => {
      test('it returns the correct sourceCodeParts', () => {
        expect(ISBN.parse('6-219619-02-8').sourceCodeParts).toEqual(['6', '219619', '02'])
        expect(ISBN.parse('978-6-219619-02-8').sourceCodeParts).toEqual(['6', '219619', '02'])
        expect(ISBN.parse('979-6-219619-02-8').sourceCodeParts).toEqual(['6', '219619', '02']) // wrong eanPrefix
        expect(ISBN.parse('980-6-219619-02-8').sourceCodeParts).toEqual(['6', '219619', '02']) // invalid eanPrefix
        expect(ISBN.parse('978-6-699999-99-3').sourceCodeParts).toEqual(['6', '699999', '99']) // RegistrationGroup not found
        expect(ISBN.parse('978-6-119999-99-2').sourceCodeParts).toEqual(['6', '119999', '99']) // RegistrationGroup code infix not found
        expect(ISBN.parse('6219619028').sourceCodeParts).toEqual(null) // no hyphens
        expect(ISBN.parse('9786219619028').sourceCodeParts).toEqual(null) // no hyphens
        expect(ISBN.parse('6-219619-028').sourceCodeParts).toEqual(null) // invalid hyphens
      })
    })
  })

  describe('toString', () => {
    test('it returns the formatted source', () => {
      expect(ISBN.parse('123-456-789-?').toString({ version: 'isbn10' })).toEqual('123456789X')
      expect(ISBN.parse('123-456-789-?').toString({ version: 'isbn13' })).toEqual('9781234567897')

      validISBNs.forEach(str => {
        const isbn = ISBN.parse(str)
        expect(isbn.toString({ version: isbn.version })).toEqual(str.replace(/-/g, ''))
      })
    })

    test('it fails when source is invalid', () => {
      expect(ISBN.parse('9780385504201').toString()).toEqual('9780385504201')
      expect(() => ISBN.parse('9780385504202').toString()).toThrow('[@pubdate/isbn] invalid_source (check isValid before stringifying; error: invalid_checksum; source: "9780385504202")')
    })

    test('it fails when source cannot be converted to isbn10', () => {
      expect(ISBN.parse('9780385504201').toString({ version: 'isbn10' })).toEqual('0385504209')
      expect(() => ISBN.parse('9798565336375').toString({ version: 'isbn10' })).toThrow("[@pubdate/isbn] incompatible_version (use version 'isbn13'; or chain version flags)")
      expect(ISBN.parse('9798565336375').toString({ version: ['isbn10', 'isbn13'] })).toEqual('9798565336375')
    })

    describe('hyphens', () => {
      // removed: ['611-543-009-7']
      // updated: ['978-620-0004574', '978-621-9619-02-8', '978-622-601-101-3', '978-628-751006-7', '978-9928400529', '978-9929801646', '978-9930943106', '978-9933101473', '978-9934015960', '978-9950-974-40-1']
      const validISBNs = ['0-330-28498-3', '1-58182-008-9', '2-226-05257-7', '3-7965-1900-8', '4-19-830127-1', '5-85270-001-0', '978-600-119-125-1', '978-601-7151-13-3', '978-602-8328-22-7', '978-603-500-045-1', '604-69-4510-0', '605-384-057-2', '978-606-8126-35-7', '978-607-455-035-1', '978-608-203-023-4', '609-01-1248-8', '978-612-45165-9-7', '978-614-404-018-8', '978-615-5014-99-4', '978-616-90393-3-4', '978-617-581-116-0', '978-618-02-0789-7', '978-619-90568-4-4', '978-620-0-00457-4', '978-621-96190-2-8', '978-622-6011-01-3', '978-623-91631-0-5', '978-624-5375-00-4', '978-625-7677-79-0', '978-626-7002-46-9', '978-628-7510-06-7', '978-65-5525-005-3', '7-301-10299-2', '80-85983-44-3', '81-7215-399-6', '82-530-0983-6', '83-08-01587-5', '84-86546-08-7', '85-7531-015-1', '86-341-0846-5', '87-595-2277-1', '88-04-47328-2', '89-04-02003-4', '90-5691-187-2', '91-1-811692-2', '92-67-10370-9', '93-5025-214-7', '978-94-6265-011-4', '950-04-0442-7', '951-0-11369-7', '952-471-294-6', '953-157-105-8', '954-430-603-X', '955-20-3051-X', '956-7291-48-9', '957-01-7429-3', '958-04-6278-X', '959-10-0363-3', '978-960-99626-7-4', '961-6403-23-0', '962-04-0195-6', '963-7971-51-3', '964-6194-70-2', '965-359-002-2', '966-95440-5-X', '967-978-753-2', '968-6031-02-2', '969-35-2020-3', '970-20-0242-7', '971-8845-10-0', '972-37-0274-6', '973-43-0179-9', '974-85854-7-6', '975-293-381-5', '976-640-140-3', '977-734-520-8', '978-37186-2-2', '979-553-483-1', '980-01-0194-2', '981-3018-39-9', '982-301-001-3', '983-52-0157-9', '984-458-089-7', '978-985-6740-48-3', '986-417-191-7', '987-98184-2-3', '978-988-00-3827-3', '978-989-758-246-2', '978-9913-600-00-2', '978-9914-700-82-4', '978-9928-4005-2-9', '978-9929-8016-4-6', '978-9930-9431-0-6', '978-9933-10-147-3', '978-9934-0-1596-0', '978-9938-01-122-7', '978-9950-9744-0-1', '9963-645-06-2', '978-9966-003-15-7', '9986-16-329-3', '978-99918-65-51-5', '978-99937-1-056-1', '978-99965-2-047-1', '979-10-90636-07-1', '979-11-86178-14-0', '979-12-200-0852-5', '979-8-6024-0545-3', '978-92-95055-12-4', '978-92-95055-02-5']

      test('it returns the formatted source with hyphens', () => {
        expect(ISBN.parse('978-621-9619-02-8').toString({ hyphens: true })).toEqual('978-621-96190-2-8')
        expect(ISBN.parse('978-621-9619-02-8').toString({ hyphens: 'source' })).toEqual('978-621-9619-02-8')
        expect(ISBN.parse('978-621-9619-02-8').toString({ hyphens: [true, 'source'] })).toEqual('978-621-96190-2-8')
        expect(ISBN.parse('978-621-9619-02-8').toString({ hyphens: ['source', true] })).toEqual('978-621-9619-02-8')
        expect(ISBN.parse('978-621-961902-8').toString({ hyphens: ['source', true] })).toEqual('978-621-96190-2-8')
        // isbn10 -> isbn13
        expect(ISBN.parse('621-9619-02-?').toString({ hyphens: true })).toEqual('978-621-96190-2-8')
        expect(ISBN.parse('621-9619-02-?').toString({ hyphens: 'source' })).toEqual('978-621-9619-02-8')
        // isbn13 -> isbn10
        expect(ISBN.parse('978-621-9619-02-8').toString({ version: 'isbn10', hyphens: true })).toEqual('621-96190-2-1')
        expect(ISBN.parse('978-621-9619-02-8').toString({ version: 'isbn10', hyphens: 'source' })).toEqual('621-9619-02-1')

        validISBNs.forEach(str => {
          const isbn = ISBN.parse(str)
          expect(isbn.toString({ version: isbn.version, hyphens: true })).toEqual(str)
        })
      })

      test('it fails when RegistrationGroup could not be found', () => {
        expect(ISBN.parse('669999999?').codeParts).toEqual(null)

        expect(() => ISBN.parse('669999999?').toString({ hyphens: true })).toThrow('[@pubdate/isbn] registration_group_not_found (disable hyphens; or chain hyphens flags; or update @pubdate/isbn)')

        expect(ISBN.parse('669-999-999-?').toString({ hyphens: [true, 'source'] })).toEqual('978-669-999-999-3')
        expect(ISBN.parse('978-669-999-999-?').toString({ hyphens: [true, 'source'] })).toEqual('978-669-999-999-3')
        expect(() => ISBN.parse('669999999?').toString({ hyphens: [true, 'source'] })).toThrow('[@pubdate/isbn] missing_or_invalid_hyphens (disable hyphens; or chain hyphens flags)')

        expect(ISBN.parse('669999999?').toString({ hyphens: [true, 'source', false] })).toEqual('9786699999993')
      })

      test('it fails when RegistrationGroup code infix could not be found', () => {
        expect(ISBN.parse('611999999?').codeParts).toEqual(null)

        expect(() => ISBN.parse('611999999?').toString({ hyphens: true })).toThrow('[@pubdate/isbn] registration_group_not_found (disable hyphens; or chain hyphens flags; or update @pubdate/isbn)')

        expect(ISBN.parse('611-999-999-?').toString({ hyphens: [true, 'source'] })).toEqual('978-611-999-999-2')
        expect(ISBN.parse('978-611-999-999-?').toString({ hyphens: [true, 'source'] })).toEqual('978-611-999-999-2')
        expect(() => ISBN.parse('611999999?').toString({ hyphens: [true, 'source'] })).toThrow('[@pubdate/isbn] missing_or_invalid_hyphens (disable hyphens; or chain hyphens flags)')

        expect(ISBN.parse('611999999?').toString({ hyphens: [true, 'source', false] })).toEqual('9786119999992')
      })
    })
  })
})
