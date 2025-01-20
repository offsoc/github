import {buildDiffLine} from '../../test-utils/query-data'
import type {ClientDiffLine} from '../../types'
import {getDiffHunksData, getLineHunkData} from '../hunk-data-helpers'

describe('getLineHunkData', () => {
  describe('when there is only one hunk', () => {
    test('it only returns the current hunk', () => {
      const hunksData = [{startBlobLineNumber: 0, endBlobLineNumber: 10}]
      const diffLine = buildDiffLine({blobLineNumber: 5})
      expect(getLineHunkData(diffLine, hunksData)).toEqual({
        currentHunk: {startBlobLineNumber: 0, endBlobLineNumber: 10},
        previousHunk: undefined,
        nextHunk: undefined,
      })
    })
  })

  describe('when there is only two hunks', () => {
    describe('when the diffline is in the 1st hunk', () => {
      test('it only returns the currentHunk and nextHunk', () => {
        const firstHunk = {startBlobLineNumber: 0, endBlobLineNumber: 10}
        const secondHunk = {startBlobLineNumber: 51, endBlobLineNumber: 99}
        const hunksData = [firstHunk, secondHunk]
        const diffLine = buildDiffLine({blobLineNumber: 5})
        expect(getLineHunkData(diffLine, hunksData)).toEqual({
          currentHunk: firstHunk,
          previousHunk: undefined,
          nextHunk: secondHunk,
        })
      })
    })

    describe('when the diffline is in the 2nd hunk', () => {
      test('it only returns the currentHunk and previousHunk', () => {
        const firstHunk = {startBlobLineNumber: 0, endBlobLineNumber: 10}
        const secondHunk = {startBlobLineNumber: 51, endBlobLineNumber: 99}
        const hunksData = [firstHunk, secondHunk]
        const diffLine = buildDiffLine({blobLineNumber: 63})
        expect(getLineHunkData(diffLine, hunksData)).toEqual({
          currentHunk: secondHunk,
          previousHunk: firstHunk,
          nextHunk: undefined,
        })
      })
    })
  })

  describe('when there is only three hunks', () => {
    describe('when the diffline is in the 1st hunk', () => {
      test('it only returns the currentHunk and nextHunk', () => {
        const firstHunk = {startBlobLineNumber: 0, endBlobLineNumber: 10}
        const secondHunk = {startBlobLineNumber: 51, endBlobLineNumber: 99}
        const thirdHunk = {startBlobLineNumber: 145, endBlobLineNumber: 900}
        const hunksData = [firstHunk, secondHunk, thirdHunk]
        const diffLine = buildDiffLine({blobLineNumber: 5})
        expect(getLineHunkData(diffLine, hunksData)).toEqual({
          currentHunk: firstHunk,
          previousHunk: undefined,
          nextHunk: secondHunk,
        })
      })
    })

    describe('when the diffline is in the 2nd hunk', () => {
      test('it returns currentHunk, nextHunk, and previousHunk', () => {
        const firstHunk = {startBlobLineNumber: 0, endBlobLineNumber: 10}
        const secondHunk = {startBlobLineNumber: 51, endBlobLineNumber: 99}
        const thirdHunk = {startBlobLineNumber: 145, endBlobLineNumber: 900}
        const hunksData = [firstHunk, secondHunk, thirdHunk]
        const diffLine = buildDiffLine({blobLineNumber: 63})
        expect(getLineHunkData(diffLine, hunksData)).toEqual({
          currentHunk: secondHunk,
          previousHunk: firstHunk,
          nextHunk: thirdHunk,
        })
      })
    })

    describe('when the diffline is in the 3rd hunk', () => {
      test('it only returns currentHunk and nextHunk', () => {
        const firstHunk = {startBlobLineNumber: 0, endBlobLineNumber: 10}
        const secondHunk = {startBlobLineNumber: 51, endBlobLineNumber: 99}
        const thirdHunk = {startBlobLineNumber: 145, endBlobLineNumber: 900}
        const hunksData = [firstHunk, secondHunk, thirdHunk]
        const diffLine = buildDiffLine({blobLineNumber: 155})
        expect(getLineHunkData(diffLine, hunksData)).toEqual({
          currentHunk: thirdHunk,
          previousHunk: secondHunk,
          nextHunk: undefined,
        })
      })
    })
  })

  describe('when there is more than three hunks', () => {
    describe('when the diffline is in the 1st hunk', () => {
      test('it only returns the currentHunk and nextHunk', () => {
        const firstHunk = {startBlobLineNumber: 0, endBlobLineNumber: 10}
        const secondHunk = {startBlobLineNumber: 51, endBlobLineNumber: 99}
        const thirdHunk = {startBlobLineNumber: 145, endBlobLineNumber: 900}
        const forthHunk = {startBlobLineNumber: 900, endBlobLineNumber: 1002}
        const hunksData = [firstHunk, secondHunk, thirdHunk, forthHunk]
        const diffLine = buildDiffLine({blobLineNumber: 5})
        expect(getLineHunkData(diffLine, hunksData)).toEqual({
          currentHunk: firstHunk,
          previousHunk: undefined,
          nextHunk: secondHunk,
        })
      })
    })

    describe('when the diffline is in the last hunk', () => {
      test('it only returns currentHunk and previousHunk', () => {
        const firstHunk = {startBlobLineNumber: 0, endBlobLineNumber: 10}
        const secondHunk = {startBlobLineNumber: 51, endBlobLineNumber: 99}
        const thirdHunk = {startBlobLineNumber: 145, endBlobLineNumber: 900}
        const forthHunk = {startBlobLineNumber: 900, endBlobLineNumber: 1002}
        const hunksData = [firstHunk, secondHunk, thirdHunk, forthHunk]
        const diffLine = buildDiffLine({blobLineNumber: 901})
        expect(getLineHunkData(diffLine, hunksData)).toEqual({
          currentHunk: forthHunk,
          previousHunk: thirdHunk,
          nextHunk: undefined,
        })
      })
    })

    test('when the diffline is a hunk type and has a "final-hunk-header-line" __id value', () => {
      const firstHunk = {startBlobLineNumber: 0, endBlobLineNumber: 10}
      // these would be un-rendered difflines in view code at EOF
      const secondHunk = {startBlobLineNumber: 11, endBlobLineNumber: 31}
      const hunksData = [firstHunk, secondHunk]
      const diffLine = buildDiffLine({blobLineNumber: 11, type: 'HUNK', __id: 'final-hunk-header-line'})
      expect(getLineHunkData(diffLine, hunksData)).toEqual({
        currentHunk: secondHunk,
        previousHunk: firstHunk,
        nextHunk: undefined,
      })
    })
  })

  describe('when the function is called with un-ordered hunks data (e.g. not sorted by O..n using startBlobLineNumber', () => {
    it('will return the correct currentHunk, previousHunk and nextHunk data', () => {
      const firstHunk = {startBlobLineNumber: 0, endBlobLineNumber: 10}
      const secondHunk = {startBlobLineNumber: 51, endBlobLineNumber: 99}
      const thirdHunk = {startBlobLineNumber: 145, endBlobLineNumber: 900}
      const forthHunk = {startBlobLineNumber: 900, endBlobLineNumber: 1002}
      const unorderedHunksData = [secondHunk, forthHunk, thirdHunk, firstHunk]
      const diffLine = buildDiffLine({blobLineNumber: 52})
      expect(getLineHunkData(diffLine, unorderedHunksData)).toEqual({
        currentHunk: secondHunk,
        previousHunk: firstHunk,
        nextHunk: thirdHunk,
      })
    })
  })
})

describe('getDiffHunksData', () => {
  test('it returns an array with one HunkData item when there is only one hunk of difflines', () => {
    const diffLines = [
      buildDiffLine({blobLineNumber: 0, right: 0, left: 0, type: 'HUNK'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 1, right: 1, left: 1, type: 'CONTEXT'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 1, right: 1, left: 2, type: 'DELETION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 2, right: 2, left: 2, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 3, right: 3, left: 3, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 4, right: 4, left: 4, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 5, right: 5, left: 5, type: 'ADDITION'}) as ClientDiffLine,
    ]

    expect(getDiffHunksData(diffLines)).toEqual([{startBlobLineNumber: 0, endBlobLineNumber: 5}])
  })

  test('it returns an array with multiple HunkData items when there is more than one hunk of difflines', () => {
    const diffLines = [
      // Hunk 1
      buildDiffLine({blobLineNumber: 0, right: 0, left: 0, type: 'HUNK'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 1, right: 1, left: 1, type: 'CONTEXT'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 1, right: 1, left: 2, type: 'DELETION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 2, right: 2, left: 2, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 3, right: 3, left: 3, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 4, right: 4, left: 4, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 5, right: 5, left: 5, type: 'ADDITION'}) as ClientDiffLine,

      // Hunk 2
      buildDiffLine({blobLineNumber: 50, right: 50, left: 50, type: 'HUNK'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 51, right: 51, left: 51, type: 'CONTEXT'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 51, right: 51, left: 52, type: 'DELETION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 52, right: 52, left: 52, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 53, right: 53, left: 53, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 54, right: 54, left: 54, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 55, right: 55, left: 55, type: 'ADDITION'}) as ClientDiffLine,
    ]

    expect(getDiffHunksData(diffLines)).toEqual([
      {startBlobLineNumber: 0, endBlobLineNumber: 5},
      {startBlobLineNumber: 50, endBlobLineNumber: 55},
    ])
  })

  test('it returns an array with multiple HunkData items, when there is a mixture of hunks of difflines and empty difflines present', () => {
    const diffLines = [
      // Hunk 1
      buildDiffLine({blobLineNumber: 0, right: 0, left: 0, type: 'HUNK'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 1, right: 1, left: 1, type: 'CONTEXT'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 1, right: 1, left: 2, type: 'DELETION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 2, right: 2, left: 2, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 3, right: 3, left: 3, type: 'ADDITION'}) as ClientDiffLine,
      'empty-diff-line' as ClientDiffLine,
      buildDiffLine({blobLineNumber: 4, right: 4, left: 4, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 5, right: 5, left: 5, type: 'ADDITION'}) as ClientDiffLine,
      'empty-diff-line' as ClientDiffLine,

      // Hunk 2
      buildDiffLine({blobLineNumber: 50, right: 50, left: 50, type: 'HUNK'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 51, right: 51, left: 51, type: 'CONTEXT'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 51, right: 51, left: 52, type: 'DELETION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 52, right: 52, left: 52, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 53, right: 53, left: 53, type: 'ADDITION'}) as ClientDiffLine,
      'empty-diff-line' as ClientDiffLine,
      buildDiffLine({blobLineNumber: 54, right: 54, left: 54, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 55, right: 55, left: 55, type: 'ADDITION'}) as ClientDiffLine,
    ]

    expect(getDiffHunksData(diffLines)).toEqual([
      {startBlobLineNumber: 0, endBlobLineNumber: 5},
      {startBlobLineNumber: 50, endBlobLineNumber: 55},
    ])
  })

  test('it returns an array with multiple HunkData items, when there is a mixture of hunks of difflines and a diffline with type of "HUNK" and an _id of "final-hunk-header-line"', () => {
    const diffLines = [
      // Hunk 1
      buildDiffLine({blobLineNumber: 0, right: 0, left: 0, type: 'HUNK'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 1, right: 1, left: 1, type: 'CONTEXT'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 1, right: 1, left: 2, type: 'DELETION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 2, right: 2, left: 2, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 3, right: 3, left: 3, type: 'ADDITION'}) as ClientDiffLine,
      'empty-diff-line' as ClientDiffLine,
      buildDiffLine({blobLineNumber: 4, right: 4, left: 4, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 5, right: 5, left: 5, type: 'ADDITION'}) as ClientDiffLine,
      'empty-diff-line' as ClientDiffLine,

      // Hunk 2
      buildDiffLine({blobLineNumber: 50, right: 50, left: 50, type: 'HUNK'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 51, right: 51, left: 51, type: 'CONTEXT'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 51, right: 51, left: 52, type: 'DELETION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 52, right: 52, left: 52, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 53, right: 53, left: 53, type: 'ADDITION'}) as ClientDiffLine,
      'empty-diff-line' as ClientDiffLine,
      buildDiffLine({blobLineNumber: 54, right: 54, left: 54, type: 'ADDITION'}) as ClientDiffLine,
      buildDiffLine({blobLineNumber: 55, right: 55, left: 55, type: 'ADDITION'}) as ClientDiffLine,

      // Hunk 3
      buildDiffLine({blobLineNumber: 56, __id: 'final-hunk-header-line', type: 'HUNK'}) as ClientDiffLine,
    ]

    expect(getDiffHunksData(diffLines)).toEqual([
      {startBlobLineNumber: 0, endBlobLineNumber: 5},
      {startBlobLineNumber: 50, endBlobLineNumber: 55},
      {startBlobLineNumber: 56, endBlobLineNumber: 76},
    ])
  })
})
