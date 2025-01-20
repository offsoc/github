import {validateNoMarkdown} from '../validators'

const orderedList = `
1. First item
2. Second item
3. Third item
4. Fourth item
`

test('returns correct result if there is no markdown in the string', () => {
  const value = validateNoMarkdown('Github')
  const valueWithChars = validateNoMarkdown('Et et rerum? (Quibusdam facere sed)! Minima harum id;')

  expect(value).toBeTruthy()
  expect(valueWithChars).toBeTruthy()
})

test('returns correct result if markdown is in string', () => {
  const validateNewLine = validateNoMarkdown('Github\n')
  const validateHeading = validateNoMarkdown('# Github')
  const validateBoldText = validateNoMarkdown('**Github**')
  const validateOrderedList = validateNoMarkdown(orderedList)

  expect(validateNewLine).toBeFalsy()
  expect(validateHeading).toBeFalsy()
  expect(validateBoldText).toBeFalsy()
  expect(validateOrderedList).toBeFalsy()
})
