import {parseListItem} from '../use-list-editing'

describe('parse list items', () => {
  test('should match a list item', () => {
    const line = '- [ ] item'
    const result = parseListItem(line)
    expect(result).toEqual({
      leadingWhitespace: '',
      text: 'item',
      delimeter: '-',
      middleWhitespace: ' ',
      taskBox: '[ ]',
    })
  })

  test('should match a list item with leading whitespaces', () => {
    const line = '    - [ ] item'
    const result = parseListItem(line)
    expect(result).toEqual({
      leadingWhitespace: '    ',
      text: 'item',
      delimeter: '-',
      middleWhitespace: ' ',
      taskBox: '[ ]',
    })
  })

  test('should match a list item inside a blockquote', () => {
    const line = '>- [ ] item'
    const result = parseListItem(line)
    expect(result).toEqual({
      leadingWhitespace: '>',
      text: 'item',
      delimeter: '-',
      middleWhitespace: ' ',
      taskBox: '[ ]',
    })
  })

  test('should match a nested list item', () => {
    const line = '- *   - [ ] item'
    const result = parseListItem(line)
    expect(result).toEqual({
      leadingWhitespace: '- *   ',
      text: 'item',
      delimeter: '-',
      middleWhitespace: ' ',
      taskBox: '[ ]',
    })
  })

  test('should match a nested list item inside a blockquote', () => {
    const line = '> - *   - [ ] item'
    const result = parseListItem(line)
    expect(result).toEqual({
      leadingWhitespace: '> - *   ',
      text: 'item',
      delimeter: '-',
      middleWhitespace: ' ',
      taskBox: '[ ]',
    })
  })

  test('should match a multi nested list item inside multiple blockquotes', () => {
    const line = '>> >  > - * *  *   -  - [ ] item'
    const result = parseListItem(line)
    expect(result).toEqual({
      leadingWhitespace: '>> >  > - * *  *   -  ',
      text: 'item',
      delimeter: '-',
      middleWhitespace: ' ',
      taskBox: '[ ]',
    })
  })
})
