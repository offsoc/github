import {Resources} from '../../client/strings'
import {validateColumnTitle} from '../../client/validations/validate-column-title'
import {customTextColumn} from '../../mocks/data/columns'
import {DefaultColumns} from '../../mocks/mock-data'

describe('validateColumnTitle', () => {
  it('returns isValid true when title is unique and non-reserved', () => {
    const {isValid, message} = validateColumnTitle(
      {allColumns: DefaultColumns, reservedColumnNames: []},
      'totally unique',
    )
    expect(isValid).toBe(true)
    expect(message).toEqual('')
  })

  it('returns isValid false when title is blank', () => {
    const {isValid, message} = validateColumnTitle({allColumns: DefaultColumns, reservedColumnNames: []}, '')
    expect(isValid).toBe(false)
    expect(message).toEqual(Resources.titleCannotBeBlank)
  })

  it('returns isValid false when title is not unique', () => {
    const {isValid, message} = validateColumnTitle({allColumns: DefaultColumns, reservedColumnNames: []}, 'status')
    expect(isValid).toBe(false)
    expect(message).toEqual(Resources.titleHasAlreadyBeenTaken)
  })

  it('returns isValid false when title is reserved', () => {
    const {isValid, message} = validateColumnTitle(
      {allColumns: DefaultColumns, reservedColumnNames: ['reserved-title']},
      'reserved-title',
    )
    expect(isValid).toBe(false)
    expect(message).toEqual(Resources.titleIsReserved)
  })

  it('returns isValid false when title is reserved and not unique', () => {
    const {isValid, message} = validateColumnTitle(
      {allColumns: DefaultColumns, reservedColumnNames: ['status']},
      'status',
    )
    expect(isValid).toBe(false)
    expect(message).toEqual(Resources.titleHasAlreadyBeenTaken)
  })

  it('returns isValid false and message when using a title with a space or a dash as a connector', () => {
    const testData = ['Custom Text', 'custom text', 'custom-text', 'Custom-Text']
    for (const testName of testData) {
      const {isValid, message} = validateColumnTitle(
        {allColumns: [customTextColumn], reservedColumnNames: []},
        testName,
      )
      expect(isValid).toBe(false)
      expect(message).toEqual(Resources.titleHasAlreadyBeenTaken)
    }
  })

  it('returns isValid message when title uses colon', () => {
    const {isValid, message} = validateColumnTitle(
      {allColumns: DefaultColumns, reservedColumnNames: []},
      'Field name with: colon',
    )
    expect(isValid).toBe(false)
    expect(message).toEqual(Resources.titleContainsReservedColonCharacter)
  })
})
