import '../copilot-inline-diff-element'

function createInlineDiffElement(diff: string, path: string): Element {
  document.body.innerHTML = `<copilot-inline-diff data-diff="${diff}" data-filepath="${path}"></copilot-inline-diff>`
  return document.querySelector('copilot-inline-diff')!
}

it('correctly parses a single-line diff when styling diff code blocks', () => {
  const diff = `[-1,1]+console.log('hello world')`
  const path = 'file.js'
  const element = createInlineDiffElement(diff, path)

  expect(element.querySelectorAll('.blob-code-addition').length).toBe(1)
  expect(element.querySelector('.blob-code-addition')?.textContent).toBe("console.log('hello world')")
  expect(element.querySelectorAll('.non-expandable').length).toBe(0)
})

it('correctly renders up to the max number of lines when no line numbers are specified when styling diff code blocks', () => {
  const diff = `@@ -1 +10,15 @@
[210,210] My Content
[211,211]
[212,212]+TODO: More stuff
[213,213]-Old stuff
[213,214]+More stuff
[214,215]
[215,216]
[216,217]
[217,218]
[218,219]
[219,220]
[220,221]
[221,222]
[222,223]
[223,224]
[224,225]
[225,226]
[226,227]
[227,228]
[228,229] My Content
[229,230]
[230,231]
[231,232]
[232,233]
[233,234]
[234,235]
[235,236]
[236,237]
[237,238] My Content
[238,239]
[239,240]
[240,241] My Content
[241,242]`
  const path = 'file.md'
  const element = createInlineDiffElement(diff, path)

  expect(element.querySelectorAll('.blob-code-addition').length).toBe(2)
  expect(element.querySelectorAll('.blob-code-deletion').length).toBe(1)
  expect(element.querySelectorAll('.non-expandable').length).toBe(1)
})

it('correctly parses a diff with leading white spaces when styling diff code blocks', () => {
  const diff = ` @@ -1 +1,4 @@
  [1,1] My Content
  [1,2]+
  [1,3]+TODO: More stuff
  [1,4]+
  [2,5]`
  const path = 'file.md:1-4'
  const element = createInlineDiffElement(diff, path)

  expect(element.querySelectorAll('.blob-code-addition').length).toBe(3)
  expect(element.querySelectorAll('.blob-code-addition')[1]?.textContent).toBe('TODO: More stuff')
  expect(element.querySelectorAll('.non-expandable').length).toBe(0)
})

it('correctly parses a multiline diff with additions and deletion when styling diff code blocks', () => {
  const diff = `@@ -1 +1,5 @@
[1,1] My Content
[2,2]
[3,3]+TODO: More stuff
[3,3]-Old stuff
[3,4]+More stuff
[4,5]`
  const path = 'file.md:3-4'
  const element = createInlineDiffElement(diff, path)

  expect(element.querySelectorAll('.blob-code-addition').length).toBe(2)
  expect(element.querySelectorAll('.blob-code-deletion').length).toBe(1)
  expect(element.querySelectorAll('.non-expandable').length).toBe(0)
})

it('correctly parses a diff with a new file added when styling diff code blocks', () => {
  const diff = `@@ -0,0 +1,25 @@
  [-1,1]+
  [-1,2]+.markdown-body .diff-table {
  [-1,3]+  width: 100%;
  [-1,4]+
  [-1,5]+  td, th, tr {
  [-1,6]+    border: 0;
  [-1,7]+  }
  [-1,8]+
  [-1,9]+  tr {
  [-1,10]+    background-color: transparent !important;
  [-1,11]+  }
  [-1,12]+
  [-1,13]+  td, th {
  [-1,14]+    padding: 0 -1;
  [-1,15]+  }
  [-1,16]+
  [-1,17]+  .blob-num {
  [-1,18]+    min-width: 32px;
  [-1,19]+  }
  [-1,20]+
  [-1,21]+  .file-header {
  [-1,22]+    padding: -2;
  [-1,23]+    border-bottom: ;
  [-1,24]+  }
  [-1,25]+}`
  const path = 'styles.css:1-25'
  const element = createInlineDiffElement(diff, path)

  expect(element.querySelectorAll('.blob-code-addition').length).toBe(25)
  expect(element.querySelectorAll('.blob-code-addition')[1]?.textContent).toBe('.markdown-body .diff-table {')
  expect(element.querySelectorAll('.non-expandable').length).toBe(0)
})

it('correctly parses a diff with a deleted file when styling diff code blocks', () => {
  const diff = `@@ -1,25 +0,0 @@
  [1,-1]-# Deleting an entire file here
  [2,-1]-
  [3,-1]-
  [4,-1]-
  [5,-1]-`
  const path = 'file.js'
  const element = createInlineDiffElement(diff, path)

  expect(element.querySelectorAll('.blob-code-deletion').length).toBe(5)
  expect(element.querySelector('.blob-code-deletion')?.textContent).toBe('# Deleting an entire file here')
  expect(element.querySelectorAll('.non-expandable').length).toBe(0)
})

it('correctly parses a diff with multiple line ranges when styling diff code blocks', () => {
  const diff = `@@ -0,0 +1,25 @@
  [-1,1]+/* stylelint-disable selector-max-type */
  [-1,2]+.markdown-body .diff-table {
  [-1,3]+  width: 100%;
  [-1,4]+
  [-1,5]+  td, th, tr {
  [-1,6]+    border: 0;
  [-1,7]+  }
  [-1,8]+
  [-1,9]+  tr {
  [-1,10]+    background-color: transparent !important;
  [-1,11]+  }
  [-1,12]+
  [-1,13]+  td, th {
  [-1,14]+    padding: 0 -1;
  [-1,15]+  }
  [-1,16]+
  [-1,17]+  .blob-num {
  [-1,18]+    min-width: 32px;
  [-1,19]+  }
  [-1,20]+
  [-1,21]+  .file-header {
  [-1,22]+    padding: -2;
  [-1,23]+    border-bottom: ;
  [-1,24]+  }
  [-1,25]+}`
  const path = 'styles.css:6-7,14-15'
  const element = createInlineDiffElement(diff, path)

  // The number of blob-code-addition hits should match the number of lines in the included ranges, not the entire file
  expect(element.querySelectorAll('.blob-code-addition').length).toBe(4)
  expect(element.querySelector('.blob-code-addition')?.textContent).toBe('    border: 0;')
  expect(element.querySelectorAll('.non-expandable').length).toBe(1)
})

it('should not render a diff if the line number(s) are not present in the diff hunk', () => {
  const diff = `@@ -63,8 +68,60 @@ export const MergeQueueMergeSection: Story = (function () {
    [67,78]+
    [67,79]+export const MergeQueueAutoMergeSection: Story = (function () {
    [67,80]+  const environment = createMockEnvironment()
    [67,81]+  return {
    [67,82]+    argTypes: {`
  const path = 'ui/packages/mergebox/components/sections/MergeSection.stories.tsx:135,140'
  const element = createInlineDiffElement(diff, path)

  expect(element.querySelectorAll('table').length).toBe(0)
})

it('should only render a diff for valid line numbers in the diff hunk', () => {
  const diff = `@@ -63,8 +68,60 @@ export const MergeQueueMergeSection: Story = (function () {
    [67,110]+                  ],
    [67,111]+                }),
    [67,112]+                buildMergeAction({
    [67,113]+                  name: MergeAction.MERGE_QUEUE,
    [67,114]+                  isAllowable: true,
    [67,115]+                  mergeMethods: [
    [67,116]+                    buildMergeMethod({
    [67,117]+                      name: MergeMethod.MERGE,
    [67,118]+                      isAllowable: true,
    [67,119]+                    }),
    [67,120]+                  ],
    [67,121]+                }),
    [67,122]+              ],
    [67,123]+            }
    [67,124]+          },
    [68,125]         })
    [69,126]       })
    [70,127]     },`
  const path = 'ui/packages/mergebox/components/sections/MergeSection.stories.tsx:110,135'
  const element = createInlineDiffElement(diff, path)

  // Only the diff (table) for line 110 should be rendered because line 135 is not present in the diff hunk
  expect(element.querySelectorAll('table').length).toBe(1)
})
