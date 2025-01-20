import {expectMockFetchCalledWith, mockFetch} from '@github-ui/mock-fetch'

import {
  validateAllowedValue,
  validatePropertyDefaultValue,
  validatePropertyDescription,
  validatePropertyNameAsync,
  validatePropertyNameSync,
  validateValue,
} from '../validate'

describe('validatePropertyName', () => {
  describe('sync validation', () => {
    it('valid value', () => {
      expect(validatePropertyNameSync('valid', [])).toBeUndefined()
      expect(validatePropertyNameSync('v'.repeat(75), [])).toBeUndefined()
    })

    it('invalid chars', () => {
      expect(validatePropertyNameSync('not valid', [])).toEqual('Name contains invalid characters: whitespace')
      expect(validatePropertyNameSync('not:valid', [])).toEqual('Name contains invalid characters: :')
      expect(validatePropertyNameSync('unicodeゴ', [])).toEqual('Name contains invalid characters: ゴ')
    })

    it('too many chars', () => {
      expect(validatePropertyNameSync('v'.repeat(76), [])).toEqual('Name cannot be longer than 75 characters')
    })

    it('empty', () => {
      expect(validatePropertyNameSync('', [])).toEqual('Name is required')
    })

    it('name exists', () => {
      expect(validatePropertyNameSync('valid', ['valid'])).toEqual('Name already exists')
    })

    it('name exists case insensitive', () => {
      expect(validatePropertyNameSync('valid', ['VaLid'])).toEqual('Name already exists')
    })
  })
  describe('async validation', () => {
    it('returns generic message if fetch throws', async () => {
      const asyncValidation = validatePropertyNameAsync('acme-inc', 'environment')

      mockFetch.rejectPendingRequest(
        '/enterprises/acme-inc/settings/property_definition_name_check/environment',
        'boom',
      )

      const result = await asyncValidation
      expect(result).toEqual({message: 'Could not check property name'})
    })
  })
})

describe('validatePropertyDescription', () => {
  it('valid value', () => {
    expect(validatePropertyDescription('Test')).toBeUndefined()
    expect(validatePropertyDescription('v'.repeat(255))).toBeUndefined()
  })

  it('too many chars', () => {
    expect(validatePropertyDescription('v'.repeat(256))).toEqual('Description cannot be longer than 255 characters')
  })
})

describe('validateAllowedValue', () => {
  it('valid value', () => {
    expect(validateAllowedValue('valid', new Set())).toBeUndefined()
    expect(validateAllowedValue('v'.repeat(75), new Set())).toBeUndefined()
    expect(validateAllowedValue('http://v.com?a=1', new Set())).toBeUndefined()
  })

  it('invalid chars', () => {
    expect(validateAllowedValue('no"quotes', new Set())).toEqual('Option contains invalid characters: "')
    expect(validateAllowedValue('nor unicode 🦦', new Set())).toEqual('Option contains invalid characters: 🦦')
  })

  it('too many chars', () => {
    expect(validateAllowedValue('v'.repeat(76), new Set())).toEqual('Option cannot be longer than 75 characters')
  })

  it('empty', () => {
    expect(validateAllowedValue('', new Set())).toEqual('Option cannot be empty')
  })

  it('option exists', () => {
    expect(validateAllowedValue('valid', new Set(['valid']))).toEqual('Option already exists')
  })
})

describe('validateValue', () => {
  it('valid value', async () => {
    expect(await validateValue('valid')).toBeUndefined()
    expect(await validateValue('v'.repeat(75))).toBeUndefined()
    expect(await validateValue('http://v.com?a=1')).toBeUndefined()
  })

  it('empty', async () => {
    expect(await validateValue('')).toBeUndefined()
  })

  it('invalid chars', async () => {
    expect(await validateValue('no"quotes')).toEqual('Contains invalid characters: "')
    expect(await validateValue('nor unicode 🦦')).toEqual('Contains invalid characters: 🦦')
  })

  it('too many chars', async () => {
    expect(await validateValue('v'.repeat(76))).toEqual('Cannot be longer than 75 characters')
  })

  it('requests server side regex validation', async () => {
    mockFetch.mockRoute('/repos/validate_regex/value', undefined, {
      ok: false,
      status: 400,
      json: async () => ({
        valid: false,
      }),
    })
    expect(await validateValue('abc', '[0-9]+')).toEqual('Value does not match pattern')

    expectMockFetchCalledWith('/repos/validate_regex/value', {
      pattern: '[0-9]+',
      value: 'abc',
    })
  })
})

describe('validatePropertyDefaultValue', () => {
  it('non required definition', async () => {
    expect(await validatePropertyDefaultValue('boo', 'string', false, [])).toBeUndefined()
    expect(await validatePropertyDefaultValue('boo', 'single_select', false, ['test', 'prod'])).toBeUndefined()
    expect(await validatePropertyDefaultValue('boo', 'true_false', false, ['true', 'false'])).toBeUndefined()
    expect(await validatePropertyDefaultValue('boo', 'multi_select', false, ['ios', 'web'])).toBeUndefined()
  })

  it('empty value', async () => {
    expect(await validatePropertyDefaultValue('', 'string', true, [])).toEqual(
      'Cannot be empty for a required property',
    )
    expect(await validatePropertyDefaultValue('', 'single_select', true, ['test', 'prod'])).toEqual(
      'Cannot be empty for a required property',
    )
    expect(await validatePropertyDefaultValue('', 'true_false', true, ['true', 'false'])).toEqual(
      'Cannot be empty for a required property',
    )
    expect(await validatePropertyDefaultValue([], 'multi_select', true, ['ios', 'web'])).toEqual(
      'Cannot be empty for a required property',
    )
  })

  it('invalid value type', async () => {
    expect(await validatePropertyDefaultValue(['a'], 'string', true)).toEqual('Invalid value type')
    expect(await validatePropertyDefaultValue(['a'], 'single_select', true, [])).toEqual('Invalid value type')
    expect(await validatePropertyDefaultValue(['a'], 'true_false', true)).toEqual('Invalid value type')
    expect(await validatePropertyDefaultValue('a', 'multi_select', true, [])).toEqual('Invalid value type')
  })

  describe('string type', () => {
    it('valid value', async () => {
      expect(await validatePropertyDefaultValue('valid', 'string', true, [])).toBeUndefined()
      expect(await validatePropertyDefaultValue('v'.repeat(75), 'string', true, [])).toBeUndefined()
      expect(await validatePropertyDefaultValue('http://v.com?a=1', 'string', true, [])).toBeUndefined()
    })

    it('invalid chars', async () => {
      expect(await validatePropertyDefaultValue('no"quotes', 'string', true, [])).toEqual(
        'Contains invalid characters: "',
      )
      expect(await validatePropertyDefaultValue('nor unicode ゴ', 'string', true, [])).toEqual(
        'Contains invalid characters: ゴ',
      )
    })

    it('too many chars', async () => {
      expect(await validatePropertyDefaultValue('v'.repeat(76), 'string', true, [])).toEqual(
        'Cannot be longer than 75 characters',
      )
    })

    it('requests server side regex validation', async () => {
      mockFetch.mockRoute('/repos/validate_regex/value', undefined, {
        ok: false,
        status: 400,
        json: async () => ({
          valid: false,
        }),
      })
      expect(await validatePropertyDefaultValue('abc', 'string', true, [], '[0-9]+')).toEqual(
        'Value does not match pattern',
      )

      expectMockFetchCalledWith('/repos/validate_regex/value', {
        pattern: '[0-9]+',
        value: 'abc',
      })
    })
  })

  describe('single_select type', () => {
    it('valid value', async () => {
      expect(await validatePropertyDefaultValue('prod', 'single_select', true, ['prod', 'test'])).toBeUndefined()
    })

    it('not part of the allowed values', async () => {
      expect(await validatePropertyDefaultValue('staging', 'single_select', true, ['prod', 'test'])).toEqual(
        'Default value should be a valid option',
      )
    })
  })

  describe('true_false type', () => {
    it('valid value', async () => {
      expect(await validatePropertyDefaultValue('true', 'true_false', true)).toBeUndefined()
    })

    it('not part of the allowed values', async () => {
      expect(await validatePropertyDefaultValue('unknown', 'true_false', true)).toEqual(
        'Default value should be a valid option',
      )
    })
  })

  describe('multi_select type', () => {
    it('valid value', async () => {
      expect(
        await validatePropertyDefaultValue(['ios', 'web'], 'multi_select', true, ['ios', 'web', 'macOS']),
      ).toBeUndefined()
    })

    it('validation is case sensitive', async () => {
      expect(await validatePropertyDefaultValue(['macos'], 'multi_select', true, ['ios', 'web', 'macOS'])).toEqual(
        'Default value should be a valid option',
      )
    })

    it('not part of the allowed values', async () => {
      expect(
        await validatePropertyDefaultValue(['ios', 'web', 'unknown'], 'multi_select', true, ['ios', 'web', 'macOS']),
      ).toEqual('Default value should be a valid option')
    })
  })
})
