import type {SafeHTMLString} from '@github-ui/safe-html'

import type {FocusedTaskData} from '../copilot-task-types'
import {
  applySuggestions,
  getFilePathsForSuggestion,
  PROBLEM_ALREADY_APPLIED,
  PROBLEM_APPLIES_TO_DELETED_FILES,
  PROBLEM_NO_SUGGESTION,
  problemWithSuggestion,
} from '../suggestion-helpers'

describe('files for suggestion', () => {
  test('one file', () => {
    const task = {
      suggestions: [{filePath: 'README.md'}],
    }

    const result = getFilePathsForSuggestion(task as FocusedTaskData)
    expect(Array.from(result)).toEqual(['README.md'])
  })

  test('more files with dups', () => {
    const task = {
      suggestions: [{filePath: 'README.md'}, {filePath: 'README.md'}, {filePath: 'OTHER.md'}],
    }

    const result = getFilePathsForSuggestion(task as FocusedTaskData)
    expect(Array.from(result)).toEqual(['README.md', 'OTHER.md'])
  })
})

describe('problems applying suggestion', () => {
  test('nothing applied, go for it', () => {
    const task = {suggestions: []} as unknown as FocusedTaskData
    const result = problemWithSuggestion([], {}, task)
    expect(result).toBe(undefined)
  })

  test('no task, cannot apply', () => {
    const result = problemWithSuggestion([], {}, undefined)
    expect(result).toBe(PROBLEM_NO_SUGGESTION)
  })

  test('already applied, cannot do it', () => {
    const task = {sourceId: 42, suggestions: []} as unknown as FocusedTaskData
    const result = problemWithSuggestion([42], {}, task)
    expect(result).toBe(PROBLEM_ALREADY_APPLIED)
  })

  test('includes deleted file, also cannot', () => {
    const task = {
      sourceId: 42,
      suggestions: [{filePath: 'Still.here'}, {filePath: 'README.md'}],
    } as FocusedTaskData
    const result = problemWithSuggestion([], {'README.md': 'D'}, task)
    expect(result).toBe(PROBLEM_APPLIES_TO_DELETED_FILES)
  })
})

describe('apply suggestions', () => {
  test('no task, just content', () => {
    const task = undefined
    const result = applySuggestions('README.md', 'content', task)
    expect(result).toBe('content')
  })

  test('basic suggestion', () => {
    const task = makeFocusedTask({
      filePath: 'README.md',
      oldStart: 1,
      oldLines: 1,
      newStart: 1,
      newLines: 1,
      lines: ['-content', '+discontent'],
      suggester: 'testuser',
    })
    const result = applySuggestions('README.md', 'content', task)
    expect(result).toBe('discontent')
  })

  test('multiline file', () => {
    const task = makeFocusedTask({
      filePath: 'README.md',
      oldStart: 1,
      oldLines: 1,
      newStart: 1,
      newLines: 1,
      lines: ['-content', '+discontent'],
      suggester: 'testuser',
    })
    const result = applySuggestions('README.md', 'content\ngoes here', task)
    expect(result).toBe('discontent\ngoes here')
  })

  test('multiline target in file', () => {
    const task = makeFocusedTask({
      filePath: 'README.md',
      oldStart: 1,
      oldLines: 2,
      newStart: 1,
      newLines: 1,
      lines: ['-content', '-content', '+discontent'],
      suggester: 'testuser',
    })
    const result = applySuggestions('README.md', 'content\ncontent\ncontent!', task)
    expect(result).toBe('discontent\ncontent!')
  })

  test('multiline suggestion to add', () => {
    const task = makeFocusedTask({
      filePath: 'README.md',
      oldStart: 1,
      oldLines: 1,
      newStart: 1,
      newLines: 3,
      lines: ['-content', '+discontent', '+discontent', '+discontent'],
      suggester: 'testuser',
    })
    const result = applySuggestions('README.md', 'content', task)
    expect(result).toBe('discontent\ndiscontent\ndiscontent')
  })

  test('just removing stuff', () => {
    const task = makeFocusedTask({
      filePath: 'README.md',
      oldStart: 2,
      oldLines: 1,
      newStart: -42,
      newLines: -42,
      lines: ['-content'],
      suggester: 'testuser',
    })
    const result = applySuggestions('README.md', 'CONTENT\ncontent', task)
    expect(result).toBe('CONTENT')
  })

  test('only apply to your file', () => {
    const task = makeFocusedTask({
      filePath: 'SOMEOTHER.md',
      oldStart: 1,
      oldLines: 1,
      newStart: 1,
      newLines: 1,
      lines: ['-not it', '+NOT IT'],
      suggester: 'testuser',
    })

    const result = applySuggestions('README.md', 'not it', task)
    expect(result).toBe('not it')
  })

  test('cannot apply if original does not match', () => {
    const task = makeFocusedTask({
      filePath: 'README.md',
      oldStart: 1,
      oldLines: 1,
      newStart: 1,
      newLines: 1,
      lines: ['-content', '+discontent'],
      suggester: 'testuser',
    })

    jest.spyOn(console, 'error').mockImplementation()
    window.alert = jest.fn()

    const result = applySuggestions('README.md', 'CONTENT\ncontent!', task)
    expect(result).toBe('CONTENT\ncontent!')

    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalled()
    expect(window.alert).toHaveBeenCalled()
  })
})

function makeFocusedTask({
  filePath,
  oldStart,
  oldLines,
  newStart,
  newLines,
  lines,
  suggester,
}: {
  filePath: string
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: string[]
  suggester: string
}): FocusedTaskData {
  return {
    sourceId: 1,
    sourceType: 'bunk',
    suggester: {
      displayLogin: suggester,
      avatarUrl: 'http://',
    },
    html: '' as SafeHTMLString,
    suggestions: [
      {
        filePath,
        oldStart,
        oldLines,
        newStart,
        newLines,
        lines,
      },
    ],
    type: 'suggestion',
  }
}
