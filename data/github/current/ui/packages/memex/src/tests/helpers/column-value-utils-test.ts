import {formatCodeBlocks} from '../../mocks/server/column-value-utils'

describe('ColumnValueUtils', () => {
  describe('formatCodeBlocks', () => {
    it('returns same string when no matches', () => {
      expect(formatCodeBlocks('some text')).toEqual('some text')
    })

    it('returns same string when one backtick used', () => {
      expect(formatCodeBlocks('some `text')).toEqual('some `text')
    })

    it('inserts code markup when two backticks used', () => {
      expect(formatCodeBlocks('some `text`')).toEqual('some <code>text</code>')
    })

    it('ignores loose backticks without other pair', () => {
      expect(formatCodeBlocks('some `text` and leaving a ` floating')).toEqual(
        'some <code>text</code> and leaving a ` floating',
      )
    })

    it('inserts code markup for each two backtick pair', () => {
      expect(formatCodeBlocks('some `text` is `added` here')).toEqual(
        'some <code>text</code> is <code>added</code> here',
      )
    })
  })
})
