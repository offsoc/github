import {createNestedItem, createTasklistDataMap} from '../../test-utils/helpers'
import type {TaskItem} from '../../constants/types'
import {getTasklistItemStartEndPositionInMarkdown, updateLocalState, updateMarkdown} from '../updaters'

describe('updateLocalState', () => {
  test('updates the local state correctly when item is moved down', () => {
    /*
      - [ ] item 1
        - [ ] child 1.1
          - [ ] child 1.1.1
      - [ ] item 2
        - [ ] child 2.1
    */
    const initialTasklist = [createNestedItem(0, 0, 2), createNestedItem(1, 3, 1)]

    expect(initialTasklist).toHaveLength(2)
    expect(initialTasklist[0]).toMatchObject({title: 'item 1', index: 0, markdownIndex: 0})
    expect(initialTasklist[0]?.children?.[0]).toMatchObject({index: 0, markdownIndex: 1})
    expect(initialTasklist[0]?.children?.[0]?.children[0]).toMatchObject({index: 0, markdownIndex: 2})
    expect(initialTasklist[1]).toMatchObject({title: 'item 2', index: 1, markdownIndex: 3})
    expect(initialTasklist[1]?.children?.[0]).toMatchObject({index: 0, markdownIndex: 4})

    const {ul, tasklistData} = createTasklistDataMap(initialTasklist)

    /*
      Move item 1 down
      - [ ] item 2
        - [ ] child 2.1
      - [ ] item 1
        - [ ] child 1.1
          - [ ] child 1.1.1
    */
    const newTaskListData = updateLocalState(initialTasklist, '1', '2', tasklistData, false, ul)
    const updatedItems = newTaskListData.get(ul) as TaskItem[]

    expect(updatedItems).toHaveLength(2)
    expect(updatedItems[0]).toMatchObject({title: 'item 2', index: 1, markdownIndex: 3})
    expect(updatedItems[0]?.children?.[0]).toMatchObject({index: 0, markdownIndex: 4})
    expect(updatedItems[1]).toMatchObject({title: 'item 1', index: 0, markdownIndex: 0})
    expect(updatedItems[1]?.children?.[0]).toMatchObject({index: 0, markdownIndex: 1})
    expect(updatedItems[1]?.children?.[0]?.children[0]).toMatchObject({index: 0, markdownIndex: 2})
  })

  test('updates the local state correctly when item is moved up', () => {
    /*
      - [ ] item 1
        - [ ] child 1.1
          - [ ] child 1.1.1
      - [ ] item 2
        - [ ] child 2.1
      - [ ] item 3
    */
    const initialTasklist = [createNestedItem(0, 0, 2), createNestedItem(1, 3, 1), createNestedItem(2, 5, 0)]

    expect(initialTasklist).toHaveLength(3)
    expect(initialTasklist[0]).toMatchObject({title: 'item 1', index: 0, markdownIndex: 0})
    expect(initialTasklist[0]?.children?.[0]).toMatchObject({index: 0, markdownIndex: 1})
    expect(initialTasklist[0]?.children?.[0]?.children[0]).toMatchObject({index: 0, markdownIndex: 2})
    expect(initialTasklist[1]).toMatchObject({title: 'item 2', index: 1, markdownIndex: 3})
    expect(initialTasklist[1]?.children?.[0]).toMatchObject({index: 0, markdownIndex: 4})
    expect(initialTasklist[2]).toMatchObject({title: 'item 3', index: 2, markdownIndex: 5})

    const {ul, tasklistData} = createTasklistDataMap(initialTasklist)

    /*
      Move item 3 up to before item 1
      - [ ] item 3
      - [ ] item 1
        - [ ] child 1.1
          - [ ] child 1.1.1
      - [ ] item 2
        - [ ] child 2.1
    */
    const newTaskListData = updateLocalState(initialTasklist, '3', '1', tasklistData, true, ul)
    const updatedItems = newTaskListData.get(ul) as TaskItem[]

    expect(updatedItems).toHaveLength(3)
    expect(updatedItems[0]).toMatchObject({title: 'item 3', index: 2, markdownIndex: 5})
    expect(updatedItems[1]).toMatchObject({title: 'item 1', index: 0, markdownIndex: 0})
    expect(updatedItems[1]?.children?.[0]).toMatchObject({index: 0, markdownIndex: 1})
    expect(updatedItems[1]?.children?.[0]?.children[0]).toMatchObject({index: 0, markdownIndex: 2})
    expect(updatedItems[2]).toMatchObject({title: 'item 2', index: 1, markdownIndex: 3})
    expect(updatedItems[2]?.children?.[0]).toMatchObject({index: 0, markdownIndex: 4})
  })
})

describe('updateMarkdown', () => {
  test('updates markdown value on drag and drop downwards', () => {
    const markdownValue = `
- [ ] 0.0 Task item
- [ ] 1.0 Task item
- [ ] 2.0 Task item`

    const isBefore = false
    const dragMarkdownIndex = 0
    const dropMarkdownIndex = 2

    const updatedMarkdownValue = `
- [ ] 1.0 Task item
- [ ] 2.0 Task item
- [ ] 0.0 Task item`

    const result = updateMarkdown(markdownValue, isBefore, dragMarkdownIndex, dropMarkdownIndex)

    expect(result).toEqual(updatedMarkdownValue)
  })

  test('updates markdown value on drag and drop upwards', () => {
    const markdownValue = `
- [ ] 0.0 Task item
- [ ] 1.0 Task item
- [ ] 2.0 Task item`

    const isBefore = true
    const dragMarkdownIndex = 2
    const dropMarkdownIndex = 0

    const updatedMarkdownValue = `
- [ ] 2.0 Task item
- [ ] 0.0 Task item
- [ ] 1.0 Task item`

    const result = updateMarkdown(markdownValue, isBefore, dragMarkdownIndex, dropMarkdownIndex)

    expect(result).toEqual(updatedMarkdownValue)
  })

  test('updates a nested markdown value on drag and drop downwards', () => {
    const markdownValue = `
- [ ] 0 Task item
  - [ ] 1 Task item
  - [ ] 2 Task item
- [ ] 3 Task item
- [ ] 4 Task item`

    const isBefore = false
    const dragMarkdownIndex = 0
    const dropMarkdownIndex = 4

    const updatedMarkdownValue = `
- [ ] 3 Task item
- [ ] 4 Task item
- [ ] 0 Task item
  - [ ] 1 Task item
  - [ ] 2 Task item`

    const result = updateMarkdown(markdownValue, isBefore, dragMarkdownIndex, dropMarkdownIndex)

    expect(result).toEqual(updatedMarkdownValue)
  })

  test('updates a nested markdown value on drag and drop upwards', () => {
    const markdownValue = `
- [ ] 0 Task item
- [ ] 1 Task item
- [ ] 2 Task item
  - [ ] 3 Task item
  - [ ] 4 Task item`

    const isBefore = true
    const dragMarkdownIndex = 2
    const dropMarkdownIndex = 1

    const updatedMarkdownValue = `
- [ ] 0 Task item
- [ ] 2 Task item
  - [ ] 3 Task item
  - [ ] 4 Task item
- [ ] 1 Task item`

    const result = updateMarkdown(markdownValue, isBefore, dragMarkdownIndex, dropMarkdownIndex)

    expect(result).toEqual(updatedMarkdownValue)
  })

  test('updates a nested list that contains other markdown values on drag and drop upwards', () => {
    const markdownValue = `
- [ ] 0 Task item
  - [ ] 1 Task item
  - [ ] 2 Task item
- [ ] 3 Task item
- [ ]
- [ ] 4 Task item
- [ ]

Some text here

- [ ] 5 Task item
  - [ ] 6 Task item
  - [ ] 7 Task item
- [ ] 8 Task item to drag

Some more text here`

    const isBefore = true
    const dragMarkdownIndex = 8
    const dropMarkdownIndex = 5

    const updatedMarkdownValue = `
- [ ] 0 Task item
  - [ ] 1 Task item
  - [ ] 2 Task item
- [ ] 3 Task item
- [ ]
- [ ] 4 Task item
- [ ]

Some text here

- [ ] 8 Task item to drag
- [ ] 5 Task item
  - [ ] 6 Task item
  - [ ] 7 Task item

Some more text here`

    const result = updateMarkdown(markdownValue, isBefore, dragMarkdownIndex, dropMarkdownIndex)

    expect(result).toEqual(updatedMarkdownValue)
  })

  test('updates a nested list that contains titles and paragraphs on drag and drop upwards', () => {
    const markdownValue = `
- [ ] ** 0 Automated Testing**
Automated testing plays a critical role in ensuring software quality and reliability.
- [ ] ** 1 Continuous Integration and Continuous Deployment (CI/CD)**
Using version control systems like Git is essential for modern software development.
- [ ] ** 2 Version Control Best Practices**
CI/CD pipelines streamline the process of integrating code changes and deploying applications.`

    const isBefore = true
    const dragMarkdownIndex = 1
    const dropMarkdownIndex = 0

    const updatedMarkdownValue = `
- [ ] ** 1 Continuous Integration and Continuous Deployment (CI/CD)**
Using version control systems like Git is essential for modern software development.
- [ ] ** 0 Automated Testing**
Automated testing plays a critical role in ensuring software quality and reliability.
- [ ] ** 2 Version Control Best Practices**
CI/CD pipelines streamline the process of integrating code changes and deploying applications.`

    const result = updateMarkdown(markdownValue, isBefore, dragMarkdownIndex, dropMarkdownIndex)

    expect(result).toEqual(updatedMarkdownValue)
  })

  test('updates a nested list that contains titles and paragraphs on drag and drop downwards', () => {
    const markdownValue = `
- [ ] ** 0 Automated Testing**
Automated testing plays a critical role in ensuring software quality and reliability.
- [ ] ** 1 Continuous Integration and Continuous Deployment (CI/CD)**
Using version control systems like Git is essential for modern software development.
- [ ] ** 2 Version Control Best Practices**
CI/CD pipelines streamline the process of integrating code changes and deploying applications.`

    const isBefore = false
    const dragMarkdownIndex = 0
    const dropMarkdownIndex = 2

    const updatedMarkdownValue = `
- [ ] ** 1 Continuous Integration and Continuous Deployment (CI/CD)**
Using version control systems like Git is essential for modern software development.
- [ ] ** 2 Version Control Best Practices**
CI/CD pipelines streamline the process of integrating code changes and deploying applications.
- [ ] ** 0 Automated Testing**
Automated testing plays a critical role in ensuring software quality and reliability.`

    const result = updateMarkdown(markdownValue, isBefore, dragMarkdownIndex, dropMarkdownIndex)

    expect(result).toEqual(updatedMarkdownValue)
  })

  test('updates a nested list that contains sections on drag and drop upwards', () => {
    const markdownValue = `
- [x] 0
- [ ] 1
- [ ] 2
  - [ ] 3
  paragraph here
  - [x] 4
  - [ ] 5
  - [ ] 6

#### second section

- [x] 7
- [ ] 8
- [ ] 9`

    const isBefore = true
    const dragMarkdownIndex = 2
    const dropMarkdownIndex = 0

    const updatedMarkdownValue = `
- [ ] 2
  - [ ] 3
  paragraph here
  - [x] 4
  - [ ] 5
  - [ ] 6
- [x] 0
- [ ] 1

#### second section

- [x] 7
- [ ] 8
- [ ] 9`

    const result = updateMarkdown(markdownValue, isBefore, dragMarkdownIndex, dropMarkdownIndex)

    expect(result).toEqual(updatedMarkdownValue)
  })

  test('updates a nested list that contains sections on drag and drop downwards', () => {
    const markdownValue = `
- [x] 0
- [ ] 1
- [ ] 2
  - [ ] 3
  paragraph here
  - [x] 4
  - [ ] 5
  - [ ] 6

#### second section

- [x] 7
- [ ] 8
- [ ] 9`

    const isBefore = false
    const dragMarkdownIndex = 7
    const dropMarkdownIndex = 8

    const updatedMarkdownValue = `
- [x] 0
- [ ] 1
- [ ] 2
  - [ ] 3
  paragraph here
  - [x] 4
  - [ ] 5
  - [ ] 6

#### second section

- [ ] 8
- [x] 7
- [ ] 9`

    const result = updateMarkdown(markdownValue, isBefore, dragMarkdownIndex, dropMarkdownIndex)

    expect(result).toEqual(updatedMarkdownValue)
  })

  test('updates a tasklist nested in a normal list on drag and drop downwards', () => {
    const markdownValue = `
### More Nesting

1. One
2. Two
    - [x] 0
    - [x] 1
       - [x] 2
       - [x] 3
       - [ ] 4
    - [ ] 5
    - [ ] 6
4. Three
5. Four`
    const isBefore = false
    const dragMarkdownIndex = 1
    const dropMarkdownIndex = 5

    const updatedMarkdownValue = `
### More Nesting

1. One
2. Two
    - [x] 0
    - [ ] 5
    - [x] 1
       - [x] 2
       - [x] 3
       - [ ] 4
    - [ ] 6
4. Three
5. Four`

    const result = updateMarkdown(markdownValue, isBefore, dragMarkdownIndex, dropMarkdownIndex)

    expect(result).toEqual(updatedMarkdownValue)
  })
})

describe('getTasklistItemStartEndPositionInMarkdown', () => {
  test('returns the correct start and end position for the first tasklist item', () => {
    const markdown = `- [ ] Task 0\n- [ ] Task 1\n- [ ] Task 2`
    const {startLineNumber, endLineNumber} = getTasklistItemStartEndPositionInMarkdown(0, markdown)

    expect(startLineNumber).toBe(0)
    expect(endLineNumber).toBe(0)
  })

  test('returns the correct start and end position for the first tasklist item with nested children', () => {
    const markdown = `- [ ] Task 0\n  - [ ] Task 1\n    - [ ] Task 2`
    const {startLineNumber, endLineNumber} = getTasklistItemStartEndPositionInMarkdown(0, markdown)

    expect(startLineNumber).toBe(0)
    expect(endLineNumber).toBe(2)
  })

  test('returns the correct start and end position for a tasklist item', () => {
    const markdown = `- [ ] Task 0\n  - [ ] Task 1\n    - [ ] Task 2\n    - [ ] Task 3\n  - [ ] Task 4\nNew section\n- Item 5`
    const {startLineNumber, endLineNumber} = getTasklistItemStartEndPositionInMarkdown(2, markdown)

    expect(startLineNumber).toBe(2)
    expect(endLineNumber).toBe(2)
  })

  test('returns the correct start and end position for a nested tasklist item', () => {
    const markdown = `- [ ] Task 0
    - [ ] Task 1
      - [ ] Task 2
      - [ ] Task 3
        - [ ] Task 4
        - [ ] Task 5

    New section
    - Item 6
    `
    const {startLineNumber, endLineNumber} = getTasklistItemStartEndPositionInMarkdown(3, markdown)

    expect(startLineNumber).toBe(3)
    expect(endLineNumber).toBe(5)
  })

  test('returns the correct start and end position for mixed lists', () => {
    const markdown = `- Item
    - Item
      - [ ] Task 0
      - [ ] Task 1
        - [ ] Task 2
        - [ ] Task 3
      - Item

    New section
    - Item
    `
    const {startLineNumber, endLineNumber} = getTasklistItemStartEndPositionInMarkdown(1, markdown)

    expect(startLineNumber).toBe(3)
    expect(endLineNumber).toBe(5)
  })

  test('returns the correct start and end position for lists containing paragraphs', () => {
    const markdown = `- Item
    - Item
      - [ ] Task 0
        I have some paragraphs here
      - [ ] Task 1
      ** Me too **
      - Item

    New section
    - Item
    `
    const {startLineNumber, endLineNumber} = getTasklistItemStartEndPositionInMarkdown(1, markdown)

    expect(startLineNumber).toBe(4)
    expect(endLineNumber).toBe(5)
  })

  test('returns the correct start and end position for last list in the markdown', () => {
    const markdown = `- Item
    - Item
      - [ ] Task 0
        I have some paragraphs here
      - [ ] Task 1
      ** Me too **
      - Item

    New section
    - [ ] Task 2
    - [ ] Task 3 <-
      - [ ] Task 4
        I have some paragraphs here
      - [ ] Task 5
        1. Item
        paragraph
        2. Item`
    const {startLineNumber, endLineNumber} = getTasklistItemStartEndPositionInMarkdown(3, markdown)

    expect(startLineNumber).toBe(10)
    expect(endLineNumber).toBe(16)
  })
})
