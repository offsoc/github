import {
  type FilterToken,
  type FilterTokenKind,
  getTokens,
  tokenizeFilter,
} from '../../../../client/components/filter-bar/helpers/tokenize-filter'

// Helpers for creating tokens
// NOTE: Start and end indices are inclusive, so that the length of the token is end - start + 1
// `start` = the index of the first character in the token
// `end` = the index of the last character in the token
const Token = (kind: FilterTokenKind, text: string, [start, end]: [number, number]): FilterToken => ({
  kind,
  text,
  location: {start, end},
})
type TokenParams = [Parameters<typeof Token>[1], Parameters<typeof Token>[2]]
const Whitespace = (...params: TokenParams) => Token('source.whitespace', ...params)
const Variable = (...params: TokenParams) => Token('variable', ...params)
const Comparison = (...params: TokenParams) => Token('keyword.operator.comparison', ...params)
const Minus = (...params: TokenParams) => Token('keyword.operator.minus', ...params)
const Plus = (...params: TokenParams) => Token('keyword.operator.plus', ...params)
const String = (...params: TokenParams) => Token('string', ...params)
const Unknown = (...params: TokenParams) => Token('unknown', ...params)
const Separator = (...params: TokenParams) => Token('punctuation.separator', ...params)
const SeparatorOp = (...params: TokenParams) => Token('keyword.operator.separator', ...params)
const Range = (...params: TokenParams) => Token('keyword.operator.range', ...params)
const BeginQuote = (...params: TokenParams) => Token('punctuation.definition.string.begin', ...params)
const EndQuote = (...params: TokenParams) => Token('punctuation.definition.string.end', ...params)

describe('tokenizeFilter', () => {
  it.each`
    filter                                                         | tokens
    ${''}                                                          | ${[]}
    ${' '}                                                         | ${[Whitespace(' ', [0, 0])]}
    ${'      '}                                                    | ${[Whitespace('      ', [0, 5])]}
    ${'assignee:user1'}                                            | ${[Variable('assignee', [0, 7]), SeparatorOp(':', [8, 8]), String('user1', [9, 13])]}
    ${'labels:"to do"'}                                            | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), BeginQuote('"', [7, 7]), String('to do', [8, 12]), EndQuote('"', [13, 13])]}
    ${"labels:'to do'"}                                            | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), BeginQuote("'", [7, 7]), String('to do', [8, 12]), EndQuote("'", [13, 13])]}
    ${'due-date:04-19-2021'}                                       | ${[Variable('due-date', [0, 7]), SeparatorOp(':', [8, 8]), String('04-19-2021', [9, 18])]}
    ${'labels:to do"'}                                             | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), String('to', [7, 8]), Whitespace(' ', [9, 9]), String('do', [10, 11]), BeginQuote('"', [12, 12])]}
    ${"labels:to do'"}                                             | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), String('to', [7, 8]), Whitespace(' ', [9, 9]), String('do', [10, 11]), BeginQuote("'", [12, 12])]}
    ${"labels:'to do"}                                             | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), BeginQuote("'", [7, 7]), String('to do', [8, 12])]}
    ${'labels:"to do'}                                             | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), BeginQuote('"', [7, 7]), String('to do', [8, 12])]}
    ${'labels:"to, do"'}                                           | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), BeginQuote('"', [7, 7]), String('to, do', [8, 13]), EndQuote('"', [14, 14])]}
    ${'label:"changelog:dependencies"'}                            | ${[Variable('label', [0, 4]), SeparatorOp(':', [5, 5]), BeginQuote('"', [6, 6]), String('changelog:dependencies', [7, 28]), EndQuote('"', [29, 29])]}
    ${'no:label'}                                                  | ${[Variable('no', [0, 1]), SeparatorOp(':', [2, 2]), String('label', [3, 7])]}
    ${'-no:label'}                                                 | ${[Minus('-', [0, 0]), Variable('no', [1, 2]), SeparatorOp(':', [3, 3]), String('label', [4, 8])]}
    ${'-label:"In progress"'}                                      | ${[Minus('-', [0, 0]), Variable('label', [1, 5]), SeparatorOp(':', [6, 6]), BeginQuote('"', [7, 7]), String('In progress', [8, 18]), EndQuote('"', [19, 19])]}
    ${'labels:bug this is a test'}                                 | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), String('bug', [7, 9]), Whitespace(' ', [10, 10]), String('this', [11, 14]), Whitespace(' ', [15, 15]), String('is', [16, 17]), Whitespace(' ', [18, 18]), String('a', [19, 19]), Whitespace(' ', [20, 20]), String('test', [21, 24])]}
    ${'this is a test labels:bug'}                                 | ${[String('this', [0, 3]), Whitespace(' ', [4, 4]), String('is', [5, 6]), Whitespace(' ', [7, 7]), String('a', [8, 8]), Whitespace(' ', [9, 9]), String('test', [10, 13]), Whitespace(' ', [14, 14]), Variable('labels', [15, 20]), SeparatorOp(':', [21, 21]), String('bug', [22, 24])]}
    ${'this is labels:bug a test'}                                 | ${[String('this', [0, 3]), Whitespace(' ', [4, 4]), String('is', [5, 6]), Whitespace(' ', [7, 7]), Variable('labels', [8, 13]), SeparatorOp(':', [14, 14]), String('bug', [15, 17]), Whitespace(' ', [18, 18]), String('a', [19, 19]), Whitespace(' ', [20, 20]), String('test', [21, 24])]}
    ${"this is a test labels:bug labels:'to do'"}                  | ${[String('this', [0, 3]), Whitespace(' ', [4, 4]), String('is', [5, 6]), Whitespace(' ', [7, 7]), String('a', [8, 8]), Whitespace(' ', [9, 9]), String('test', [10, 13]), Whitespace(' ', [14, 14]), Variable('labels', [15, 20]), SeparatorOp(':', [21, 21]), String('bug', [22, 24]), Whitespace(' ', [25, 25]), Variable('labels', [26, 31]), SeparatorOp(':', [32, 32]), BeginQuote("'", [33, 33]), String('to do', [34, 38]), EndQuote("'", [39, 39])]}
    ${"  this  is    a test     labels:bug     labels:'to do'   "} | ${[Whitespace('  ', [0, 1]), String('this', [2, 5]), Whitespace('  ', [6, 7]), String('is', [8, 9]), Whitespace('    ', [10, 13]), String('a', [14, 14]), Whitespace(' ', [15, 15]), String('test', [16, 19]), Whitespace('     ', [20, 24]), Variable('labels', [25, 30]), SeparatorOp(':', [31, 31]), String('bug', [32, 34]), Whitespace('     ', [35, 39]), Variable('labels', [40, 45]), SeparatorOp(':', [46, 46]), BeginQuote("'", [47, 47]), String('to do', [48, 52]), EndQuote("'", [53, 53]), Whitespace('   ', [54, 56])]}
    ${':"In progress" test'}                                       | ${[SeparatorOp(':', [0, 0]), BeginQuote('"', [1, 1]), String('In progress', [2, 12]), EndQuote('"', [13, 13]), Whitespace(' ', [14, 14]), String('test', [15, 18])]}
    ${'labels:bug,"enhancement ✨"'}                               | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), String('bug', [7, 9]), Separator(',', [10, 10]), BeginQuote('"', [11, 11]), String('enhancement ✨', [12, 24]), EndQuote('"', [25, 25])]}
    ${'labels:"enhancement ✨",bug'}                               | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), BeginQuote('"', [7, 7]), String('enhancement ✨', [8, 20]), EndQuote('"', [21, 21]), Separator(',', [22, 22]), String('bug', [23, 25])]}
    ${"labels:'enhancement ✨',bug"}                               | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), BeginQuote("'", [7, 7]), String('enhancement ✨', [8, 20]), EndQuote("'", [21, 21]), Separator(',', [22, 22]), String('bug', [23, 25])]}
    ${"labels:bug,'enhancement ✨'"}                               | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), String('bug', [7, 9]), Separator(',', [10, 10]), BeginQuote("'", [11, 11]), String('enhancement ✨', [12, 24]), EndQuote("'", [25, 25])]}
    ${'labels:bug,to-do'}                                          | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), String('bug', [7, 9]), Separator(',', [10, 10]), String('to-do', [11, 15])]}
    ${"labels:'enhancement ✨','user story',bug"}                  | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), BeginQuote("'", [7, 7]), String('enhancement ✨', [8, 20]), EndQuote("'", [21, 21]), Separator(',', [22, 22]), BeginQuote("'", [23, 23]), String('user story', [24, 33]), EndQuote("'", [34, 34]), Separator(',', [35, 35]), String('bug', [36, 38])]}
    ${'labels:"enhancement ✨","user story","to do"'}              | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), BeginQuote('"', [7, 7]), String('enhancement ✨', [8, 20]), EndQuote('"', [21, 21]), Separator(',', [22, 22]), BeginQuote('"', [23, 23]), String('user story', [24, 33]), EndQuote('"', [34, 34]), Separator(',', [35, 35]), BeginQuote('"', [36, 36]), String('to do', [37, 41]), EndQuote('"', [42, 42])]}
    ${"labels:'enhancement ✨','user story','to do'"}              | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), BeginQuote("'", [7, 7]), String('enhancement ✨', [8, 20]), EndQuote("'", [21, 21]), Separator(',', [22, 22]), BeginQuote("'", [23, 23]), String('user story', [24, 33]), EndQuote("'", [34, 34]), Separator(',', [35, 35]), BeginQuote("'", [36, 36]), String('to do', [37, 41]), EndQuote("'", [42, 42])]}
    ${'labels:"enhancement ✨","user story",bug'}                  | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), BeginQuote('"', [7, 7]), String('enhancement ✨', [8, 20]), EndQuote('"', [21, 21]), Separator(',', [22, 22]), BeginQuote('"', [23, 23]), String('user story', [24, 33]), EndQuote('"', [34, 34]), Separator(',', [35, 35]), String('bug', [36, 38])]}
    ${`labels:enhancement ✨",''`}                                 | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), String('enhancement', [7, 17]), Whitespace(' ', [18, 18]), Unknown("✨\",''", [19, 23])]}
    ${`labels:enhancement ✨",blah',"hey`}                         | ${[Variable('labels', [0, 5]), SeparatorOp(':', [6, 6]), String('enhancement', [7, 17]), Whitespace(' ', [18, 18]), Unknown('✨",blah\',"hey', [19, 31])]}
    ${`value:"\`quotes\` 'inside' ''should'' work"`}               | ${[Variable('value', [0, 4]), SeparatorOp(':', [5, 5]), BeginQuote('"', [6, 6]), String("`quotes` 'inside' ''should'' work", [7, 39]), EndQuote('"', [40, 40])]}
    ${`-is:CLOSED,"merged"`}                                       | ${[Minus('-', [0, 0]), Variable('is', [1, 2]), SeparatorOp(':', [3, 3]), String('CLOSED', [4, 9]), Separator(',', [10, 10]), BeginQuote('"', [11, 11]), String('merged', [12, 17]), EndQuote('"', [18, 18])]}
    ${'effort:>5'}                                                 | ${[Variable('effort', [0, 5]), SeparatorOp(':', [6, 6]), Comparison('>', [7, 7]), String('5', [8, 8])]}
    ${'effort:>=5'}                                                | ${[Variable('effort', [0, 5]), SeparatorOp(':', [6, 6]), Comparison('>=', [7, 8]), String('5', [9, 9])]}
    ${'effort:<5'}                                                 | ${[Variable('effort', [0, 5]), SeparatorOp(':', [6, 6]), Comparison('<', [7, 7]), String('5', [8, 8])]}
    ${'effort:<=5'}                                                | ${[Variable('effort', [0, 5]), SeparatorOp(':', [6, 6]), Comparison('<=', [7, 8]), String('5', [9, 9])]}
    ${'effort:..5'}                                                | ${[Variable('effort', [0, 5]), SeparatorOp(':', [6, 6]), Range('..', [7, 8]), String('5', [9, 9])]}
    ${'effort:1..*'}                                               | ${[Variable('effort', [0, 5]), SeparatorOp(':', [6, 6]), String('1', [7, 7]), Range('..', [8, 9]), String('*', [10, 10])]}
    ${'effort:*..5'}                                               | ${[Variable('effort', [0, 5]), SeparatorOp(':', [6, 6]), String('*', [7, 7]), Range('..', [8, 9]), String('5', [10, 10])]}
    ${'effort:"1..*"'}                                             | ${[Variable('effort', [0, 5]), SeparatorOp(':', [6, 6]), BeginQuote('"', [7, 7]), String('1..*', [8, 11]), EndQuote('"', [12, 12])]}
    ${'date:@today'}                                               | ${[Variable('date', [0, 3]), SeparatorOp(':', [4, 4]), String('@today', [5, 10])]}
    ${'date:@today..2022-01-01'}                                   | ${[Variable('date', [0, 3]), SeparatorOp(':', [4, 4]), String('@today', [5, 10]), Range('..', [11, 12]), String('2022-01-01', [13, 22])]}
    ${'date:>=@today'}                                             | ${[Variable('date', [0, 3]), SeparatorOp(':', [4, 4]), Comparison('>=', [5, 6]), String('@today', [7, 12])]}
    ${'date:..@today'}                                             | ${[Variable('date', [0, 3]), SeparatorOp(':', [4, 4]), Range('..', [5, 6]), String('@today', [7, 12])]}
    ${'iteration:@next'}                                           | ${[Variable('iteration', [0, 8]), SeparatorOp(':', [9, 9]), String('@next', [10, 14])]}
    ${'iteration:@current'}                                        | ${[Variable('iteration', [0, 8]), SeparatorOp(':', [9, 9]), String('@current', [10, 17])]}
    ${'iteration:@previous'}                                       | ${[Variable('iteration', [0, 8]), SeparatorOp(':', [9, 9]), String('@previous', [10, 18])]}
    ${'assignee:@me'}                                              | ${[Variable('assignee', [0, 7]), SeparatorOp(':', [8, 8]), String('@me', [9, 11])]}
    ${'status:done -assignee:'}                                    | ${[Variable('status', [0, 5]), SeparatorOp(':', [6, 6]), String('done', [7, 10]), Whitespace(' ', [11, 11]), Minus('-', [12, 12]), Variable('assignee', [13, 20]), SeparatorOp(':', [21, 21])]}
    ${'-no:xyz -assignee:'}                                        | ${[Minus('-', [0, 0]), Variable('no', [1, 2]), SeparatorOp(':', [3, 3]), String('xyz', [4, 6]), Whitespace(' ', [7, 7]), Minus('-', [8, 8]), Variable('assignee', [9, 16]), SeparatorOp(':', [17, 17])]}
    ${'date:"2021-01-08"..'}                                       | ${[Variable('date', [0, 3]), SeparatorOp(':', [4, 4]), BeginQuote('"', [5, 5]), String('2021-01-08', [6, 15]), EndQuote('"', [16, 16]), Range('..', [17, 18])]}
    ${'estimate:"5"..'}                                            | ${[Variable('estimate', [0, 7]), SeparatorOp(':', [8, 8]), BeginQuote('"', [9, 9]), String('5', [10, 10]), EndQuote('"', [11, 11]), Range('..', [12, 13])]}
    ${'iteration:@previous-12'}                                    | ${[Variable('iteration', [0, 8]), SeparatorOp(':', [9, 9]), String('@previous', [10, 18]), Minus('-', [19, 19]), String('12', [20, 21])]}
    ${'iteration:@next+1'}                                         | ${[Variable('iteration', [0, 8]), SeparatorOp(':', [9, 9]), String('@next', [10, 14]), Plus('+', [15, 15]), String('1', [16, 16])]}
    ${'iteration:@current+1'}                                      | ${[Variable('iteration', [0, 8]), SeparatorOp(':', [9, 9]), String('@current', [10, 17]), Plus('+', [18, 18]), String('1', [19, 19])]}
    ${'date:@today-0'}                                             | ${[Variable('date', [0, 3]), SeparatorOp(':', [4, 4]), String('@today', [5, 10]), Minus('-', [11, 11]), String('0', [12, 12])]}
    ${'assignee:@me+0'}                                            | ${[Variable('assignee', [0, 7]), SeparatorOp(':', [8, 8]), String('@me+0', [9, 13])]}
    ${'date:>=@today+2'}                                           | ${[Variable('date', [0, 3]), SeparatorOp(':', [4, 4]), Comparison('>=', [5, 6]), String('@today', [7, 12]), Plus('+', [13, 13]), String('2', [14, 14])]}
    ${'date:<@today - 1'}                                          | ${[Variable('date', [0, 3]), SeparatorOp(':', [4, 4]), Comparison('<', [5, 5]), String('@today', [6, 11]), Whitespace(' ', [12, 12]), Minus('-', [13, 13]), Whitespace(' ', [14, 14]), String('1', [15, 15])]}
    ${'date:@today..@today+7'}                                     | ${[Variable('date', [0, 3]), SeparatorOp(':', [4, 4]), String('@today', [5, 10]), Range('..', [11, 12]), String('@today', [13, 18]), Plus('+', [19, 19]), String('7', [20, 20])]}
    ${'date:2022-01-01..@today-2022'}                              | ${[Variable('date', [0, 3]), SeparatorOp(':', [4, 4]), String('2022-01-01', [5, 14]), Range('..', [15, 16]), String('@today', [17, 22]), Minus('-', [23, 23]), String('2022', [24, 27])]}
    ${'@today+1'}                                                  | ${[String('@today', [0, 5]), Plus('+', [6, 6]), String('1', [7, 7])]}
    ${'@todayyy'}                                                  | ${[String('@todayyy', [0, 7])]}
    ${'"@today+1"'}                                                | ${[BeginQuote('"', [0, 0]), String('@today+1', [1, 8]), EndQuote('"', [9, 9])]}
    ${'@today + 1'}                                                | ${[String('@today', [0, 5]), Whitespace(' ', [6, 6]), Plus('+', [7, 7]), Whitespace(' ', [8, 8]), String('1', [9, 9])]}
    ${'@next-1'}                                                   | ${[String('@next', [0, 4]), Minus('-', [5, 5]), String('1', [6, 6])]}
    ${'@current-1'}                                                | ${[String('@current', [0, 7]), Minus('-', [8, 8]), String('1', [9, 9])]}
    ${'@previous+5'}                                               | ${[String('@previous', [0, 8]), Plus('+', [9, 9]), String('5', [10, 10])]}
    ${'@me+9'}                                                     | ${[String('@me+9', [0, 4])]}
    ${'date:@todayyy+2'}                                           | ${[Variable('date', [0, 3]), SeparatorOp(':', [4, 4]), String('@todayyy+2', [5, 14])]}
    ${'date:@today + 000'}                                         | ${[Variable('date', [0, 3]), SeparatorOp(':', [4, 4]), String('@today', [5, 10]), Whitespace(' ', [11, 11]), Plus('+', [12, 12]), Whitespace(' ', [13, 13]), String('000', [14, 16])]}
    ${'date:@current++00'}                                         | ${[Variable('date', [0, 3]), SeparatorOp(':', [4, 4]), String('@current', [5, 12]), Plus('+', [13, 13]), Plus('+', [14, 14]), String('00', [15, 16])]}
    ${'iteration:@current-+2'}                                     | ${[Variable('iteration', [0, 8]), SeparatorOp(':', [9, 9]), String('@current', [10, 17]), Minus('-', [18, 18]), Plus('+', [19, 19]), String('2', [20, 20])]}
    ${'last-updated:1day'}                                         | ${[Variable('last-updated', [0, 11]), SeparatorOp(':', [12, 12]), String('1day', [13, 16])]}
    ${'-last-updated:2days'}                                       | ${[Minus('-', [0, 0]), Variable('last-updated', [1, 12]), SeparatorOp(':', [13, 13]), String('2days', [14, 18])]}
  `('tokenizes correctly for filter: `$filter`', ({filter, tokens}: {filter: string; tokens: Array<FilterToken>}) => {
    const tokenized = tokenizeFilter(filter)
    expect(tokenized).toEqual(tokens)
    const concatenated = tokenized.map(token => token.text).join('')
    expect(concatenated).toEqual(filter)
  })
})

describe('getTokens', () => {
  it.each`
    filter                               | kinds                                                             | expectedMatch
    ${''}                                | ${[]}                                                             | ${''}
    ${'assignee'}                        | ${['string']}                                                     | ${'assignee'}
    ${'assignee:'}                       | ${['variable', 'keyword.operator']}                               | ${'assignee:'}
    ${'assignee:monalisa'}               | ${['variable', 'keyword.operator', 'string']}                     | ${'assignee:monalisa'}
    ${'assignee:monalisa'}               | ${['variable', 'string', 'keyword.operator', 'string']}           | ${null}
    ${'status:done assignee:monalisa'}   | ${['variable', 'keyword.operator', 'string']}                     | ${'status:done'}
    ${'status:done ⤵️assignee:monalisa'} | ${['variable', 'keyword.operator', 'string']}                     | ${'assignee:monalisa'}
    ${'effort:>5'}                       | ${['variable', 'keyword.operator', 'keyword.operator', 'string']} | ${'effort:>5'}
    ${'@current+1'}                      | ${['string']}                                                     | ${'@current'}
    ${'@current+1'}                      | ${['string', 'keyword.operator']}                                 | ${'@current+'}
    ${'@current+1'}                      | ${['string', 'keyword.operator', 'string']}                       | ${'@current+1'}
    ${'@current⤵️+1'}                    | ${['keyword.operator', 'string']}                                 | ${'+1'}
  `(
    'searching for $kinds in `$filter` should result in `$expectedMatch`',
    ({filter, kinds, expectedMatch}: {filter: string; kinds: Array<FilterTokenKind>; expectedMatch: null | string}) => {
      // The ⤵️ emoji represents the position of the cursor inside the string
      const start = filter.includes('⤵️') ? filter.indexOf('⤵️') : 0
      const tokenized = tokenizeFilter(filter.replace('⤵️', ''))
      const foundTokens = getTokens(tokenized, {kinds, start})
      const actualMatch = foundTokens?.map(token => token.text).join('') ?? null
      expect(actualMatch).toEqual(expectedMatch)
    },
  )
})
