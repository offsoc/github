import {parseLineRangeHash} from '../document-hash-helpers'

test('Valid hash is parsed and data returned', () => {
  const validHash = 'diff-8814ae58da61ecd055d589e3dc7b3d51c9304bbf87e2a76bcc92d345c955e84aR1'
  const lineRange = parseLineRangeHash(validHash)
  expect(lineRange?.diffAnchor).toBe('diff-8814ae58da61ecd055d589e3dc7b3d51c9304bbf87e2a76bcc92d345c955e84a')
  expect(lineRange?.startOrientation).toBe('right')
  expect(lineRange?.startLineNumber).toBe(1)
})

test('Invalid hash is parsed and no data is returned', () => {
  const invalidHash = 'not-valid'
  const lineRange = parseLineRangeHash(invalidHash)
  expect(lineRange?.diffAnchor).toBe(undefined)
  expect(lineRange?.startOrientation).toBe(undefined)
  expect(lineRange?.startLineNumber).toBe(undefined)
})

test('Valid hash with range is parsed and data returned', () => {
  const validHash = 'diff-8814ae58da61ecd055d589e3dc7b3d51c9304bbf87e2a76bcc92d345c955e84aR1-L8'
  const lineRange = parseLineRangeHash(validHash)
  expect(lineRange?.diffAnchor).toBe('diff-8814ae58da61ecd055d589e3dc7b3d51c9304bbf87e2a76bcc92d345c955e84a')
  expect(lineRange?.startOrientation).toBe('right')
  expect(lineRange?.startLineNumber).toBe(1)
  expect(lineRange?.endOrientation).toBe('left')
  expect(lineRange?.endLineNumber).toBe(8)
})
