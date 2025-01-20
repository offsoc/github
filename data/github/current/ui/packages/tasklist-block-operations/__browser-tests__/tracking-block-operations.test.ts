import {assert} from '@github-ui/browser-tests'
import {
  appendItem,
  removeItem,
  removeTasklistBlock,
  updateItemPosition,
  updateItemState,
  updateItemTitle,
  updateTasklistTitle,
} from '../operations'

describe('tasklist block operations', () => {
  describe('append item', () => {
    it('appends an item without a title in the tasklist', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          - [ ] item 1
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          - [ ] item 1
          - [ ] item 2
        \`\`\`
      `
      const result = appendItem(originalMD, 0, 'item 2')
      assert.equal(result, expectedMD)
    })

    it('appends an item with a title in the tasklist', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
        \`\`\`
      `
      const result = appendItem(originalMD, 0, 'item 2')
      assert.equal(result, expectedMD)
    })

    it('appends an item to the correct tasklist when multiple are present', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
        \`\`\`
      `

      const result = appendItem(originalMD, 1, 'item 2')
      assert.equal(result, expectedMD)
    })
  })

  describe('remove item', () => {
    it('removes an item without a title in the tasklist', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          - [ ] item 1
          - [ ] item 2
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          - [ ] item 2
        \`\`\`
      `
      const result = removeItem(originalMD, [0, 0])
      assert.equal(result, expectedMD)
    })

    it('removes an item with a title present in the tasklist', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 2
        \`\`\`
      `
      const result = removeItem(originalMD, [0, 0])
      assert.equal(result, expectedMD)
    })

    it('removes an item from the correct tasklist when multiple are present', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 2
        \`\`\`
      `
      const result = removeItem(originalMD, [1, 0])
      assert.equal(result, expectedMD)
    })
  })

  describe('remove tasklist block', () => {
    it('should correctly removes one tasklist block', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
        \`\`\`
      `

      const expectedMD = ''

      const result = removeTasklistBlock(originalMD, 0)
      assert.equal(result, expectedMD)
    })

    it('should remove the correct tasklist when multiple are present', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] a
          - [ ] b
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] a
          - [ ] b
        \`\`\`
      `

      const result = removeTasklistBlock(originalMD, 0)
      assert.equal(result, expectedMD)
    })
  })

  describe('update item position', () => {
    it('should correctly update the item position in the same tasklist block', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 2
          - [ ] item 1
        \`\`\`
      `
      const result = updateItemPosition(originalMD, [0, 0], [0, 1])
      assert.equal(result, expectedMD)
    })

    it('should update the item position in the correct tasklist block when multiple are present', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 3
          - [ ] item 4
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 3
          - [ ] item 2
        \`\`\`

        \`\`\`[tasklist]
        ### Tasks
          - [ ] item 4
        \`\`\`
      `
      const result = updateItemPosition(originalMD, [1, 0], [0, 1])
      assert.equal(result, expectedMD)
    })
  })

  describe('update item state', () => {
    it('should correctly update a state from open to close', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [x] item 1
        \`\`\`
      `
      const result = updateItemState(originalMD, [0, 0], true)
      assert.equal(result, expectedMD)
    })

    it('should correctly update a state from close to open', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [x] item 1
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`
      `
      const result = updateItemState(originalMD, [0, 0], false)
      assert.equal(result, expectedMD)
    })

    it('should correctly update a state from open to close when multiple tasklist are present', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
          - [ ] item 3
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 4
          - [ ] item 5
          - [ ] item 6
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
          - [ ] item 3
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 4
          - [x] item 5
          - [ ] item 6
        \`\`\`
      `
      const result = updateItemState(originalMD, [1, 1], true)
      assert.equal(result, expectedMD)
    })

    it('should correctly update a state from close to open when multiple tasklist are present', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
          - [ ] item 3
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 4
          - [x] item 5
          - [ ] item 6
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
          - [ ] item 2
          - [ ] item 3
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 4
          - [ ] item 5
          - [ ] item 6
        \`\`\`
      `

      const result = updateItemState(originalMD, [1, 1], false)
      assert.equal(result, expectedMD)
    })
  })

  describe('update item title', () => {
    it('update title when one tasklist is present', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] foo
        \`\`\`
      `
      const result = updateItemTitle(originalMD, [0, 0], 'foo')
      assert.equal(result, expectedMD)
    })

    it('update title when multiple tasklists are present', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 2
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] foo
        \`\`\`
      `
      const result = updateItemTitle(originalMD, [1, 0], 'foo')
      assert.equal(result, expectedMD)
    })

    it('does not escape special characters and keeps specific markdown in draft titles', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] I have special_characters [here]: yes I do
          - [ ] But they don't get escaped and links work https://google.com
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] My specific __bold__ formatting doesn't change
          - [ ] Here to change
        \`\`\`
      `

      const expectedMD = removeFileIndents`
      \`\`\`[tasklist]
        ### Tasks
        - [ ] I have special_characters [here]: yes I do
        - [ ] But they don't get escaped and links work https://google.com
      \`\`\`

      \`\`\`[tasklist]
        ### Tasks
        - [ ] My specific __bold__ formatting doesn't change
        - [ ] foo
        - [ ] item 2
      \`\`\`
    `
      let result = updateItemTitle(originalMD, [1, 1], 'foo')
      result = appendItem(result, 1, 'item 2')
      assert.equal(result, expectedMD)
    })

    it('target only the tasklist blocks for manipulation and leave the surrounding markdown unchanged', () => {
      const originalMD = removeFileIndents`
        This __bold__ should remain underscored

        \`\`\`[tasklist]
          ### Block A
          - [ ] item 1
          - [ ] bar
        \`\`\`

        This _italic text_ should remain underscored

        \`\`\`[tasklist]
          ### Block B
          - [ ] item 1
        \`\`\`

        \`\`\`[tasklist]
          ### Block C
          - [ ] delete me
        \`\`\`

        This markdown should not change

        --------
      `

      const expectedMD = removeFileIndents`
      This __bold__ should remain underscored

      \`\`\`[tasklist]
        ### Block A
        - [x] bar
      \`\`\`

      This _italic text_ should remain underscored

      \`\`\`[tasklist]
        ### Block B
        - [ ] foo
        - [ ] item 1
        - [ ] item 2
      \`\`\`

      This markdown should not change

      --------
    `
      let result = updateItemTitle(originalMD, [0, 0], 'foo')
      result = appendItem(result, 1, 'item 2')
      result = updateItemPosition(result, [0, 0], [1, 0])
      result = removeItem(result, [2, 0])
      result = updateItemState(result, [0, 0], true)
      result = removeTasklistBlock(result, 2)
      assert.equal(result, expectedMD)
    })
  })

  describe('update tasklist title', () => {
    it('update title when one tasklist is present', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Title
          - [ ] item 1
        \`\`\`
      `
      const result = updateTasklistTitle(originalMD, 0, 'Title')
      assert.equal(result, expectedMD)
    })

    it('update title when tasklist is empty', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Title
        \`\`\`
      `
      const result = updateTasklistTitle(originalMD, 0, 'Title')
      assert.equal(result, expectedMD)
    })

    it('update title when multiple tasklists are present', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`

        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 2
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`

        \`\`\`[tasklist]
          ### Title
          - [ ] item 2
        \`\`\`
      `
      const result = updateTasklistTitle(originalMD, 1, 'Title')
      assert.equal(result, expectedMD)
    })

    it('removes title when no value passed through', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          - [ ] item 1
        \`\`\`
      `
      const result = updateTasklistTitle(originalMD, 0, '')
      assert.equal(result, expectedMD)
    })

    it('adds title when there was no title markdown', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          - [ ] item 1
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Title
          - [ ] item 1
        \`\`\`
      `
      const result = updateTasklistTitle(originalMD, 0, 'Title')
      assert.equal(result, expectedMD)
    })

    it('update title with markdown', () => {
      const originalMD = removeFileIndents`
        \`\`\`[tasklist]
          ### Tasks
          - [ ] item 1
        \`\`\`
      `

      const expectedMD = removeFileIndents`
        \`\`\`[tasklist]
          ### **Bold Title**
          - [ ] item 1
        \`\`\`
      `
      const result = updateTasklistTitle(originalMD, 0, '**Bold Title**')
      assert.equal(result, expectedMD)
    })
  })
})

/**
 * Allows us to inline string literals without having to start them at the zero column of the file
 */
function removeFileIndents(strings: TemplateStringsArray) {
  // Remove leading whitespace from each line
  const lines = strings
    .join()
    .split('\n')
    .map(line => line.trimStart())

  // Join the lines back together with a newline separator
  return lines.join('\n').trimStart()
}
