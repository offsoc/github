import {diffLineFileWrap} from '../diff-line-file-wrap'

describe('when DiffLine has tab indentation', () => {
  describe('.getPaddingLeft', () => {
    test('it returns value of tabSize x tabCount x 7 (char pixel size) as a px value', () => {
      const tabSize = 4

      expect(diffLineFileWrap('+\t\tfunction gameOver() {', tabSize).getPaddingLeft()).toBe('56px')
    })
  })

  describe('.getTextIndent', () => {
    test('it returns value of tabSize x tabCount x 7 (char pixel size) + tabSize as a negative px value', () => {
      const tabSize = 4

      expect(diffLineFileWrap('+\t\tfunction gameOver() {', tabSize).getTextIndent()).toBe('-60px')
    })
  })
})

describe('when DiffLine has space indentation', () => {
  describe('.getPaddingLeft', () => {
    test('it returns value of 7 (char pixel size) x text identation length as a px value', () => {
      const tabSize = 4

      expect(diffLineFileWrap('+    function gameOver() {', tabSize).getPaddingLeft()).toBe('28px')
    })
  })

  describe('.getTextIndent', () => {
    test('it returns value of 7 (char pixel size) x text identation length + 0.5 as a negative px value', () => {
      const tabSize = 4

      expect(diffLineFileWrap('+    function gameOver() {', tabSize).getTextIndent()).toBe('-28.5px')
    })
  })
})
