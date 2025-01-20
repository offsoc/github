import {expect, test} from '@jest/globals'
import {ResponseCleaner} from '../response-cleaner'

describe('ResponseCleaner', () => {
  const cleaner = new ResponseCleaner()

  describe('removeRepetition', () => {
    test.each([
      ['Hello, world!', 'Hello, world!'],
      ['Hello, @world @world', 'Hello, @world'],
      ['@world @world @world', '@world'],
      ['Hello, @world with another mention of @world', 'Hello, @world with another mention of @world'],
      ['foo\n- first thing\n- something else\n- first thing', 'foo\n- first thing\n- something else'],
      ['foo\n- add something\n- add something', 'foo\n- add something'],
    ])('removed repeated text', (text, expected) => {
      const corrected = cleaner.removeRepetition(text)
      expect(corrected).toEqual(expected)
    })
  })

  describe('removeExcessNewlines', () => {
    test.each([
      {text: 'Yo.\r\n', suffix: undefined, expected: 'Yo.'},
      {text: 'Yo.\n', suffix: undefined, expected: 'Yo.'},
      {text: 'Yo\r\n', suffix: undefined, expected: 'Yo'},
      {text: 'Yo\n', suffix: undefined, expected: 'Yo'},
      {text: 'Yo\r\n', suffix: '\nHo Ho', expected: 'Yo'},
      {text: 'Yo\n', suffix: '\nHo Ho', expected: 'Yo'},
      {text: 'Yo\r\n', suffix: 'Ho Ho', expected: 'Yo\n'},
      {text: 'Yo\n', suffix: 'Ho Ho', expected: 'Yo\n'},
    ])('removed excess newlines', ({text, suffix, expected}) => {
      const corrected = cleaner.removeExcessNewlines(text, suffix)
      expect(corrected).toEqual(expected)
    })
  })

  describe('truncateToEndOfSentence', () => {
    test.each([
      {text: "Here's a sentence.", suffix: undefined, expected: "Here's a sentence."},
      {text: "Here's a sentence!", suffix: undefined, expected: "Here's a sentence!"},
      {text: "Here's a sentence?", suffix: undefined, expected: "Here's a sentence?"},
      {text: "Here's a sentence. Here's another unfinished", suffix: '\n', expected: "Here's a sentence."},
      {text: "Here's a sentence? Here's another unfinished", suffix: '\n', expected: "Here's a sentence?"},
      {text: "Here's a sentence! Here's another unfinished", suffix: '\n', expected: "Here's a sentence!"},
      {
        text: "Here's a sentence. Here's another unfinished",
        suffix: 'sentence.',
        expected: "Here's a sentence. Here's another unfinished",
      },
      {
        text: "Here's a sentence? Here's another unfinished",
        suffix: 'sentence.',
        expected: "Here's a sentence? Here's another unfinished",
      },
      {
        text: "Here's a sentence! Here's another unfinished",
        suffix: 'sentence.',
        expected: "Here's a sentence! Here's another unfinished",
      },
    ])('truncates to end of sentence only with empty/whitespace suffix', ({text, suffix, expected}) => {
      const corrected = cleaner.truncateToEndOfSentence(text, suffix, false)
      expect(corrected).toEqual(expected)
    })

    test.each([
      {
        text: "Here's a sentence. Here's another unfinished",
        suffix: 'sentence.',
        expected: "Here's a sentence.",
      },
      {
        text: "Here's a sentence? Here's another unfinished",
        suffix: 'sentence.',
        expected: "Here's a sentence?",
      },
      {
        text: "Here's a sentence! Here's another unfinished",
        suffix: 'sentence.',
        expected: "Here's a sentence!",
      },
    ])('ignores suffix and truncates to end of sentence anyway', ({text, suffix, expected}) => {
      const corrected = cleaner.truncateToEndOfSentence(text, suffix, true)
      expect(corrected).toEqual(expected)
    })
  })
})
