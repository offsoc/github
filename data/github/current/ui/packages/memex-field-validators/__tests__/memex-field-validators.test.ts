import {
  getNumberFieldValidationMessage,
  getDateFieldValidationMessage,
  getTextFieldValidationMessage,
} from '../memex-field-validators'

describe('CellValidation', () => {
  describe('getNumberFieldValidationMessage', () => {
    it('handles integer values', () => {
      expect(getNumberFieldValidationMessage('0')).toBeUndefined()
      expect(getNumberFieldValidationMessage('-1')).toBeUndefined()
      expect(getNumberFieldValidationMessage('1')).toBeUndefined()
      expect(getNumberFieldValidationMessage('999999999')).toBeUndefined()
    })

    it(`handles ""`, () => {
      expect(getNumberFieldValidationMessage('')).toBeUndefined()
    })

    it('handles float values', () => {
      expect(getNumberFieldValidationMessage('0.0')).toBeUndefined()
      expect(getNumberFieldValidationMessage('0.00000000001')).toBeUndefined()
      expect(getNumberFieldValidationMessage('-55555.1234')).toBeUndefined()
      expect(getNumberFieldValidationMessage('1.123456789')).toBeUndefined()
    })

    it('handles commas in numbers', () => {
      expect(getNumberFieldValidationMessage('1,000.0')).toBeUndefined()
      expect(getNumberFieldValidationMessage('1,234,567')).toBeUndefined()
    })

    it('handles scientific values', () => {
      expect(getNumberFieldValidationMessage('1E4')).toBeUndefined()
      expect(getNumberFieldValidationMessage('1e4')).toBeUndefined()
      expect(getNumberFieldValidationMessage('5.2E1')).toBeUndefined()
    })

    it('returns message for numbers outside of max/min range', () => {
      expect(getNumberFieldValidationMessage('2147483648')).toEqual(
        'This value must be between -2147483647 and 2147483647',
      )
      expect(getNumberFieldValidationMessage('-2147483648')).toEqual(
        'This value must be between -2147483647 and 2147483647',
      )
    })

    it('returns message for numbers with too high of a precision', () => {
      expect(getNumberFieldValidationMessage('4.99999999999999999')).toEqual('This floating point value is too precise')
      expect(getNumberFieldValidationMessage('4.111111111111111111111111111111111')).toEqual(
        'This floating point value is too precise',
      )
      expect(getNumberFieldValidationMessage('4.99999999999')).toBeUndefined()
    })

    it('returns message for invalid values', () => {
      expect(getNumberFieldValidationMessage('1.a')).toEqual('This field must be a number')
      expect(getNumberFieldValidationMessage('a')).toEqual('This field must be a number')
      expect(getNumberFieldValidationMessage('1#2')).toEqual('This field must be a number')
    })
  })

  describe('getDateFieldValidationMessage', () => {
    it('handles valid date values', () => {
      expect(getDateFieldValidationMessage('2021/01/01')).toBeUndefined()
      expect(getDateFieldValidationMessage('9999/12/31')).toBeUndefined()
      expect(getDateFieldValidationMessage('2001/01/01')).toBeUndefined()
      expect(getDateFieldValidationMessage('01-01-2021')).toBeUndefined()
      expect(getDateFieldValidationMessage('Thu Dec 31 2020')).toBeUndefined()
      expect(getDateFieldValidationMessage('2021-01-01T00:00:00.000Z')).toBeUndefined()
    })

    it('handles empty date values', () => {
      expect(getDateFieldValidationMessage('')).toBeUndefined()
    })

    it('returns validation message for invalid dates', () => {
      expect(getDateFieldValidationMessage('2021/00/00')).toEqual('This field must be a date')
      expect(getDateFieldValidationMessage('0000/00/00')).toEqual('This field must be a date')
      expect(getDateFieldValidationMessage('2021/13/01')).toEqual('This field must be a date')
      expect(getDateFieldValidationMessage('2021/01/35')).toEqual('This field must be a date')
    })

    it('returns validation message for bogus values', () => {
      expect(getDateFieldValidationMessage('bloop')).toEqual('This field must be a date')
      expect(getDateFieldValidationMessage('1')).toEqual('This field must be a date')
    })
  })

  describe('getTextFieldValidationMessage', () => {
    it('handles valid text values', () => {
      expect(getTextFieldValidationMessage('abc')).toBeUndefined()
    })
    it('handles ""', () => {
      expect(getTextFieldValidationMessage('')).toBeUndefined()
    })
    it('returns message for text values outside of byte limit', () => {
      expect(getTextFieldValidationMessage(new Array(1026).join('a'))).toEqual('This value is too long')
    })
  })
})
