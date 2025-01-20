import DiffRowSelectedChecker from '../diff-row-selected-checker'

test('returns isRowSelected false and empty selected lines if the selectedDiffRowRange is only on one cell', () => {
  const result = DiffRowSelectedChecker({
    selectedDiffRowRange: {
      diffAnchor: 'diff-082e88e7f8de5cd52df8f8b7ab31eb4262ba4029499b41b71c10e98f408f6789',
      startOrientation: 'right',
      startLineNumber: 1,
      endOrientation: 'right',
      endLineNumber: 1,
      firstSelectedLineNumber: 1,
      firstSelectedOrientation: 'right',
    },
    leftLines: [
      {
        left: 0,
        right: 0,
        blobLineNumber: 0,
        html: '@@ -1,7 +1,9 @@',
        type: 'HUNK',
        text: '@@ -1,7 +1,9 @@',
      },
      {
        left: 1,
        right: 1,
        blobLineNumber: 1,
        html: ' Name should be truncated',
        type: 'CONTEXT',
        text: ' Name should be truncated',
      },
    ],
    rightLines: [
      {
        left: 0,
        right: 0,
        blobLineNumber: 0,
        html: '@@ -1,7 +1,9 @@',
        type: 'HUNK',
        text: '@@ -1,7 +1,9 @@',
      },
      {
        left: 1,
        right: 1,
        blobLineNumber: 1,
        html: ' Name should be truncated',
        type: 'CONTEXT',
        text: ' Name should be truncated',
      },
      {
        left: 2,
        right: 2,
        blobLineNumber: 2,
        html: '<br>',
        type: 'CONTEXT',
        text: ' ',
      },
    ],
  })

  expect(result.selectedLeftLines).toEqual([])
  expect(result.selectedRightLines).toEqual([])
  expect(result.isRowSelected.toString()).toEqual('()=>false')
})
