import {textDiff} from '../text-diff'

test('additions to be correctly calculated on the diff', () => {
  const wordToAdd = 'addme'
  const basicAddition = textDiff({before: undefined, after: wordToAdd})
  expect(basicAddition.lines.length).toBe(1)
  expect(basicAddition.lines[0]!.modification).toBe('ADDED')
  expect(basicAddition.lines[0]!.words.length).toBe(1)
  expect(basicAddition.lines[0]!.words[0]!.modification).toBe('ADDED')
  expect(basicAddition.lines[0]!.words[0]!.word).toBe(wordToAdd)
})

test('deletions to be correctly calculated on the diff', () => {
  const wordToDelete = 'deleteme'
  const basicDeletion = textDiff({before: wordToDelete, after: undefined})
  expect(basicDeletion.lines.length).toBe(1)
  expect(basicDeletion.lines[0]!.modification).toBe('REMOVED')
  expect(basicDeletion.lines[0]!.words.length).toBe(1)
  expect(basicDeletion.lines[0]!.words[0]!.modification).toBe('REMOVED')
  expect(basicDeletion.lines[0]!.words[0]!.word).toBe(wordToDelete)
})

test('edits on the same line to be correctly calculated on the diff', () => {
  const wordToEdit = 'editme'
  const wordEdited = 'edited'
  const basicEdit = textDiff({before: wordToEdit, after: wordEdited})

  expect(basicEdit.lines.length).toBe(1)
  expect(basicEdit.lines[0]!.modification).toBe('EDITED')
  expect(basicEdit.lines[0]!.words.length).toBe(2)
  expect(basicEdit.lines[0]!.words[0]!.modification).toBe('REMOVED')
  expect(basicEdit.lines[0]!.words[0]!.word).toBe(wordToEdit)

  expect(basicEdit.lines[0]!.words[1]!.modification).toBe('ADDED')
  expect(basicEdit.lines[0]!.words[1]!.word).toBe(wordEdited)
})

test('all three operations in one edit', () => {
  const beforeParagraph = `This is a paragraph

  DELETE THIS`

  const afterParagraph = `This is a paragraph
  NEW`

  const complexEdit = textDiff({before: beforeParagraph, after: afterParagraph})

  expect(complexEdit.lines.length).toBe(3)
  expect(complexEdit.lines.map(line => line.modification)).toMatchObject(['UNCHANGED', 'ADDED', 'REMOVED'])
})
