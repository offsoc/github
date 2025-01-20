import {comparator, prepStringsForComparison} from '../copilot-summary-result-comparator'

describe('prepStringsForComparison', () => {
  test('it transforms a string into an array of strings, splitting on newline', () => {
    const string = 'this string\nhas three lines\nthey are pretty neat'
    const expected = ['this string', 'has three lines', 'they are pretty neat']
    expect(prepStringsForComparison(string)).toEqual(expected)
  })

  test('it removes completly empty strings', () => {
    const string = 'this string\nhas three real lines \n\nand one empty one'
    const expected = ['this string', 'has three real lines', 'and one empty one']
    expect(prepStringsForComparison(string)).toEqual(expected)
  })
})

describe('comparator', () => {
  // a return value of 100 means all of the summary is in the body
  test('it returns a number for the percentage difference between two strings when the body is longer than the summary', () => {
    const body = ['this is one line', 'this is another', 'I added some stuff to the body', 'its not in the summary']
    const summary = ['this is one line', 'this is another']
    expect(comparator(body, summary)).toEqual(100)
  })

  // a return value of 50 means half of the summary is in the body
  test('it returns a number for the percentage difference between two strings when the summary is longer than the body', () => {
    const body = ['this is one line', 'this is another']
    const summary = ['this is one line', 'this is another', 'it has a summary', 'someone deleted this summary']
    expect(comparator(body, summary)).toEqual(50)
  })

  // a return value of `0` is highly unlikely because the function attempts to calculate similarity
  // at the character level in order to represent lines that might have once been the same but were
  // edited later by the user
  test('it retuns the expected percentage difference when the body and summary are totally different', () => {
    const body = ['this is my PR description', 'I wrote it myself', 'with no robots for help']
    const summary = [
      'After reviewing this PR',
      'I have decided as a robot that it is decent',
      'though not what I would have written',
    ]
    expect(comparator(body, summary)).toEqual(25.0327678537992)
  })
})
