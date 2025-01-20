import {expect, test} from '@jest/globals'
import {TextWithReferences} from '../text-with-references'

describe('TextWithReferences', () => {
  describe('fixedIssues', () => {
    test.each([
      ['Hello, world!', []],
      ['Hello, #123 world! #456', []],
      ['this fixes #123', ['#123']],
      ['this works towards #123', ['#123']],
      ['this fixes #123, resolves #888', ['#123', '#888']],
      ['close #234', ['#234']],
      ['close gh#234', []],
      ['this fixes https://github.com/github/github/issues/123', ['https://github.com/github/github/issues/123']],
      ['Mention of gh/gh#234', []],
      ['close gh/gh#234', ['gh/gh#234']],
      ['close gh123/g-h#234', ['gh123/g-h#234']],
      ['Inline code `fixes #123`', []],
      ['Inline code `fixes #123` closes #1', ['#1']],
      ['Inline code `close gh/gh#234`', []],
      ['Mentions within block comments\n```\nclose gh/gh#234\n```', []],
    ])('finds references that are accompanied by a reference keyword', (text, expected) => {
      const obj = new TextWithReferences(text)
      expect(obj.fixedIssues()).toEqual(expected)
    })
  })
})
