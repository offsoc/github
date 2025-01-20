import type {IndexedGroupBlock} from '../../Filter'
import {
  generateBlocksFromQueryString,
  getNextSpaceIndex,
  matchOpeningAndClosingParentheses,
} from '../../parser/string-breaker'

describe('String Breaker', () => {
  describe('getNextSpaceIndex', () => {
    it('handles a simple case', () => {
      const query = 'state:open'
      const index = getNextSpaceIndex(query, 0)
      expect(index).toBe(-1)
    })

    it('handles a simple case with spaces', () => {
      const query = 'state:open is:open'
      const index = getNextSpaceIndex(query, 0)
      expect(index).toBe(10)
    })

    it('handles IME space characters', () => {
      const query = '野良み　伊波こ'
      const index = getNextSpaceIndex(query, 0)
      expect(index).toBe(3)
    })

    it('handles a case where we start in the middle of a string', () => {
      const query = 'state:open is:open assignee:monalisa'
      const index = getNextSpaceIndex(query, 11)
      expect(index).toBe(18)
    })

    it('does not consider a quoted space to be a space', () => {
      const query = 'label:"to do"'
      const index = getNextSpaceIndex(query, 0)
      expect(index).toBe(-1)
    })

    it('does not consider a quoted space to be a space with multiple tokens', () => {
      const query = 'label:"to do" assignee:monalisa'
      const index = getNextSpaceIndex(query, 0)
      expect(index).toBe(13)
    })

    it('does not consider a quoted space to be a space with multiple complex tokens', () => {
      const query = 'label:"to do",done,"will not do" assignee:monalisa'
      const index = getNextSpaceIndex(query, 0)
      expect(index).toBe(32)
    })

    it('finds no whitespace when quotes are mismatched', () => {
      const query = 'label:"to do, not done yet",done,"oops assignee:monalisa'
      const index = getNextSpaceIndex(query, 0)
      expect(index).toBe(-1)
    })

    it('does nothing with quoted parens', () => {
      const query = 'label:"to do (not done yet)" assignee:monalisa'
      const index = getNextSpaceIndex(query, 0)
      expect(index).toBe(28)
    })

    it('understands an empty string', () => {
      const query = 'label:"" assignee:monalisa'
      const index = getNextSpaceIndex(query, 0)
      expect(index).toBe(8)
    })

    it('respects quoted values', () => {
      const query = '"some quoted text" "more quoted text"'
      const index = getNextSpaceIndex(query, 0)
      expect(index).toBe(18)
    })

    it('does not break after a matching quote when it is not immediately followed by a space', () => {
      const query = `"some "quoted" text" "more quoted text"`
      const index = getNextSpaceIndex(query, 0)
      expect(index).toBe(20)
    })

    it('does nothing special with escaped quotes', () => {
      const query = `"some \\"quoted\\" text" "more quoted text"`
      const index = getNextSpaceIndex(query, 0)
      expect(index).toBe(22)
    })
  })

  describe('generateBlocksFromQueryString', () => {
    it('processes a simple text block', () => {
      const query = 'state'

      const brokenString = generateBlocksFromQueryString(query)
      expect(brokenString.length).toBe(1)
    })

    it('breaks a string with a single block', () => {
      const query = 'a:b'

      const brokenString = generateBlocksFromQueryString(query)

      expect(brokenString.length).toBe(1)
    })

    it('breaks a string with multiple blocks', () => {
      const query = 'a:b c:d'

      const brokenString = generateBlocksFromQueryString(query)

      expect(brokenString.length).toBe(3)
      expect(brokenString[0]?.raw).toBe('a:b')
      expect(brokenString[1]?.raw).toBe(' ')
      expect(brokenString[2]?.raw).toBe('c:d')
    })

    it('processes blocks with spaces within quotes', () => {
      const query = 'label:"to do" OR label:"in progress"'

      const brokenString = generateBlocksFromQueryString(query)

      expect(brokenString.length).toBe(5)
      expect(brokenString[0]?.raw).toBe('label:"to do"')
      expect(brokenString[1]?.raw).toBe(' ')
      expect(brokenString[2]?.raw).toBe('OR')
      expect(brokenString[3]?.raw).toBe(' ')
      expect(brokenString[4]?.raw).toBe('label:"in progress"')
    })

    it('preserves whitespace', () => {
      const query = 'a:b   c:d'

      const brokenString = generateBlocksFromQueryString(query)

      expect(brokenString.length).toBe(3)
      expect(brokenString[0]?.raw).toBe('a:b')
      expect(brokenString[1]?.raw).toBe('   ')
      expect(brokenString[2]?.raw).toBe('c:d')

      expect(brokenString[0]?.startIndex).toBe(0)
      expect(brokenString[0]?.endIndex).toBe(3)
      expect(brokenString[1]?.startIndex).toBe(3)
      expect(brokenString[1]?.endIndex).toBe(6)
      expect(brokenString[2]?.startIndex).toBe(6)
      expect(brokenString[2]?.endIndex).toBe(9)
    })

    it('preserves extra whitespace', () => {
      const query = '   a:b    c:d   '

      const brokenString = generateBlocksFromQueryString(query)

      expect(brokenString.length).toBe(5)
      expect(brokenString[0]?.raw).toBe('   ')
      expect(brokenString[0]?.startIndex).toBe(0)
      expect(brokenString[0]?.endIndex).toBe(3)
      expect(brokenString[1]?.raw).toBe('a:b')
      expect(brokenString[2]?.raw).toBe('    ')
      expect(brokenString[3]?.raw).toBe('c:d')
      expect(brokenString[4]?.raw).toBe('   ')
      expect(brokenString[4]?.startIndex).toBe(query.length - 3)
      expect(brokenString[4]?.endIndex).toBe(query.length)
    })

    it('processes a simple group block', () => {
      const query = '(state:open) assignee:dusave'
      const brokenString = generateBlocksFromQueryString(query)

      const groupBlock = brokenString[0] as IndexedGroupBlock
      expect(groupBlock?.blocks.length).toBe(1)
      expect(groupBlock?.blocks[0]?.raw).toBe('state:open')

      expect(brokenString[1]?.raw).toBe(' ')
      expect(brokenString[2]?.raw).toBe('assignee:dusave')

      expect(brokenString.length).toBe(3)
    })

    it('processes nested group blocks', () => {
      const query = 'label:test ((state:open OR state:closed) AND (assignee:dusave OR assignee:octocat))'
      const brokenString = generateBlocksFromQueryString(query)

      expect(brokenString[0]?.raw).toBe('label:test')
      expect(brokenString[1]?.raw).toBe(' ')
      expect(brokenString[2]?.raw).toBe('((state:open OR state:closed) AND (assignee:dusave OR assignee:octocat))')
      expect(brokenString.length).toBe(3)

      const groupBlock = brokenString[2] as IndexedGroupBlock
      expect(groupBlock?.blocks[0]?.raw).toBe('(state:open OR state:closed)')

      const firstSubGroupBlock = groupBlock?.blocks[0] as IndexedGroupBlock
      expect(firstSubGroupBlock?.blocks.length).toBe(5)
      expect(firstSubGroupBlock?.blocks[0]?.raw).toBe('state:open')
      expect(firstSubGroupBlock?.blocks[1]?.raw).toBe(' ')
      expect(firstSubGroupBlock?.blocks[2]?.raw).toBe('OR')
      expect(firstSubGroupBlock?.blocks[3]?.raw).toBe(' ')
      expect(firstSubGroupBlock?.blocks[4]?.raw).toBe('state:closed')

      expect(groupBlock?.blocks[1]?.raw).toBe(' ')
      expect(groupBlock?.blocks[2]?.raw).toBe('AND')
      expect(groupBlock?.blocks[3]?.raw).toBe(' ')

      expect(groupBlock?.blocks[4]?.raw).toBe('(assignee:dusave OR assignee:octocat)')
      const secondSubGroupBlock = groupBlock?.blocks[4] as IndexedGroupBlock
      expect(secondSubGroupBlock?.blocks.length).toBe(5)
      expect(secondSubGroupBlock?.blocks[0]?.raw).toBe('assignee:dusave')
      expect(secondSubGroupBlock?.blocks[1]?.raw).toBe(' ')
      expect(secondSubGroupBlock?.blocks[2]?.raw).toBe('OR')
      expect(secondSubGroupBlock?.blocks[3]?.raw).toBe(' ')
      expect(secondSubGroupBlock?.blocks[4]?.raw).toBe('assignee:octocat')

      expect(groupBlock?.blocks.length).toBe(5)
    })

    it('processes group blocks while ignoring parentheses within quotes', () => {
      const query = 'test (label:"happy :)" OR label:"sad :(")'
      const brokenString = generateBlocksFromQueryString(query)

      expect(brokenString[0]?.raw).toBe('test')
      expect(brokenString[1]?.raw).toBe(' ')
      expect(brokenString[2]?.raw).toBe('(label:"happy :)" OR label:"sad :(")')
      expect(brokenString.length).toBe(3)

      const groupBlock = brokenString[2] as IndexedGroupBlock
      expect(groupBlock?.blocks[0]?.raw).toBe('label:"happy :)"')
      expect(groupBlock?.blocks[1]?.raw).toBe(' ')
      expect(groupBlock?.blocks[2]?.raw).toBe('OR')
      expect(groupBlock?.blocks[3]?.raw).toBe(' ')
      expect(groupBlock?.blocks[4]?.raw).toBe('label:"sad :("')
      expect(groupBlock?.blocks.length).toBe(5)
    })

    it('processes group blocks using IME space character', () => {
      const query = '野良み　伊波こ'
      const brokenString = generateBlocksFromQueryString(query)

      expect(brokenString[0]?.raw).toBe('野良み')
      expect(brokenString[1]?.raw).toBe('　')
      expect(brokenString[2]?.raw).toBe('伊波こ')
      expect(brokenString.length).toBe(3)
    })

    it("processes unmatched open parenthesis as it's own type", () => {
      const query = 'state:open ('
      const brokenString = generateBlocksFromQueryString(query)

      expect(brokenString[0]?.raw).toBe('state:open')
      expect(brokenString[1]?.raw).toBe(' ')
      expect(brokenString[2]?.raw).toBe('(')
      expect(brokenString[2]?.type).toBe('unmatched-open-paren')
      expect(brokenString.length).toBe(3)
    })

    it("processes unmatched close parenthesis as it's own type", () => {
      const query = 'state:open )'
      const brokenString = generateBlocksFromQueryString(query)

      expect(brokenString[0]?.raw).toBe('state:open')
      expect(brokenString[1]?.raw).toBe(' ')
      expect(brokenString[2]?.raw).toBe(')')
      expect(brokenString[2]?.type).toBe('unmatched-close-paren')
      expect(brokenString.length).toBe(3)
    })

    it("processes unmatched close parenthesis within a filter value as it's own type, while treating the rest of the value as text", () => {
      const query = 'state:open)'
      const brokenString = generateBlocksFromQueryString(query)

      expect(brokenString[0]?.raw).toBe('state:open')
      expect(brokenString[0]?.type).toBe('text')
      expect(brokenString[1]?.raw).toBe(')')
      expect(brokenString[1]?.type).toBe('unmatched-close-paren')
      expect(brokenString.length).toBe(2)
    })

    it('processes close parenthesis with additional text within a filter value as text', () => {
      const query = 'state:open)foo'
      const brokenString = generateBlocksFromQueryString(query)

      expect(brokenString[0]?.raw).toBe('state:open)foo')
      expect(brokenString[0]?.type).toBe('text')
      expect(brokenString.length).toBe(1)
    })
  })

  describe('matchOpeningAndClosingParentheses', () => {
    it('should find no matching parens if no parens', () => {
      const query = 'state:open is:open this is some text'
      const {matchedParens} = matchOpeningAndClosingParentheses(query)
      expect(matchedParens.size).toBe(0)
    })

    it('should find matching parens', () => {
      const query = 'state:open (is:open OR is:closed) is some text'
      const {matchedParens} = matchOpeningAndClosingParentheses(query)
      expect(matchedParens.size).toBe(1)
      expect(matchedParens.get(11)).toBe(32)
    })

    it('should find nested matching parens', () => {
      const query = 'state:open ((is:open OR is:closed) is some text)'
      const {matchedParens} = matchOpeningAndClosingParentheses(query)
      expect(matchedParens.size).toBe(2)
      expect(matchedParens.get(11)).toBe(47)
      expect(matchedParens.get(12)).toBe(33)
    })

    it('should find non-nested matching parens', () => {
      const query = 'state:open (is:open OR is:closed) (label:"foo bar" OR label:no)'
      const {matchedParens} = matchOpeningAndClosingParentheses(query)
      expect(matchedParens.size).toBe(2)
      expect(matchedParens.get(11)).toBe(32)
      expect(matchedParens.get(34)).toBe(62)
    })

    it('should ignore parens within quotes', () => {
      const query = 'state:open (is:open OR is:closed) (label:"foo bar (baz" OR label:"no )")'
      const {matchedParens} = matchOpeningAndClosingParentheses(query)
      expect(matchedParens.size).toBe(2)
      expect(matchedParens.get(11)).toBe(32)
      expect(matchedParens.get(34)).toBe(71)
    })

    it('should ignore unmatched opening parens', () => {
      const query = 'state:open (is:open OR is:closed (label:"foo bar" OR label:no)'
      const {matchedParens} = matchOpeningAndClosingParentheses(query)
      expect(matchedParens.size).toBe(1)
      expect(matchedParens.get(33)).toBe(61)
    })

    it('should ignore unmatched closing parens', () => {
      const query = 'state:open (is:open OR is:closed) label:"foo bar" OR label:no)'
      const {matchedParens} = matchOpeningAndClosingParentheses(query)
      expect(matchedParens.size).toBe(1)
      expect(matchedParens.get(11)).toBe(32)
    })
  })
})
