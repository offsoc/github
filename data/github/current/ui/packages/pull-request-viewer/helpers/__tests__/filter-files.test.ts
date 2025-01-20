import {filterFiles} from '../../helpers/filter-files'

describe('filterFiles', () => {
  test('when viewed filter is unchecked, returns false to exclude a file that has been viewed', () => {
    const filterState = {
      showViewed: false,
      showOnlyFilesCodeownedByUser: false,
      unselectedFileExtensions: new Set([]),
    }
    const queryText = ''
    const file = {
      viewed: true,
      isOwnedByViewer: true,
      codeowners: [],
      newPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
      oldPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
    }

    expect(filterFiles(filterState, queryText, file)).toBe(false)
  })

  test('when viewed filter is checked, returns true to include the file that has been viewed', () => {
    const filterState = {
      showViewed: true,
      showOnlyFilesCodeownedByUser: false,
      unselectedFileExtensions: new Set([]),
    }
    const queryText = ''
    const file = {
      viewed: true,
      isOwnedByViewer: true,
      codeowners: [],
      newPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
      oldPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
    }

    expect(filterFiles(filterState, queryText, file)).toBe(true)
  })

  test('when viewed filter is checked, returns true to include file that has not been viewed', () => {
    const filterState = {
      showViewed: true,
      showOnlyFilesCodeownedByUser: false,
      unselectedFileExtensions: new Set([]),
    }
    const queryText = ''
    const file = {
      viewed: false,
      isOwnedByViewer: true,
      codeowners: [],
      newPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
      oldPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
    }

    expect(filterFiles(filterState, queryText, file)).toBe(true)
  })

  test('when codeowners filter is checked, returns true to include file that is owned by the user', () => {
    const filterState = {
      showViewed: true,
      showOnlyFilesCodeownedByUser: true,
      unselectedFileExtensions: new Set([]),
    }
    const queryText = ''
    const file = {
      viewed: false,
      isOwnedByViewer: true,
      codeowners: [],
      newPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
      oldPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
    }

    expect(filterFiles(filterState, queryText, file)).toBe(true)
  })

  test('when codeowners filter is checked, returns false to exclude file unowned by user', () => {
    const filterState = {
      showViewed: true,
      showOnlyFilesCodeownedByUser: true,
      unselectedFileExtensions: new Set([]),
    }
    const queryText = ''
    const file = {
      viewed: false,
      isOwnedByViewer: false,
      codeowners: [],
      newPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
      oldPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
    }

    expect(filterFiles(filterState, queryText, file)).toBe(false)
  })

  test('when codeowners filter is unchecked, returns true to include file that is not owned by the user', () => {
    const filterState = {
      showViewed: true,
      showOnlyFilesCodeownedByUser: false,
      unselectedFileExtensions: new Set([]),
    }
    const queryText = ''
    const file = {
      viewed: false,
      isOwnedByViewer: false,
      codeowners: [],
      newPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
      oldPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
    }

    expect(filterFiles(filterState, queryText, file)).toBe(true)
  })

  test('when query text is not empty, returns false to exclude file that does not match the new or old file path', () => {
    const filterState = {
      showViewed: true,
      showOnlyFilesCodeownedByUser: false,
      unselectedFileExtensions: new Set([]),
    }
    const queryText = 'boop'
    const file = {
      viewed: false,
      isOwnedByViewer: false,
      codeowners: [],
      newPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
      oldPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
    }

    expect(filterFiles(filterState, queryText, file)).toBe(false)
  })

  test('when query text is not empty, returns true if query text is contained in new path', () => {
    const filterState = {
      showViewed: true,
      showOnlyFilesCodeownedByUser: false,
      unselectedFileExtensions: new Set([]),
    }
    const queryText = 'boop'
    const file = {
      viewed: false,
      isOwnedByViewer: false,
      codeowners: [],
      newPath: 'boop.ts',
      oldPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
    }

    expect(filterFiles(filterState, queryText, file)).toBe(true)
  })

  test('when query text is not empty, returns true if query text is contained in old path', () => {
    const filterState = {
      showViewed: true,
      showOnlyFilesCodeownedByUser: false,
      unselectedFileExtensions: new Set([]),
    }
    const queryText = 'boop'
    const file = {
      viewed: false,
      isOwnedByViewer: false,
      codeowners: [],
      newPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
      oldPath: 'boop',
    }

    expect(filterFiles(filterState, queryText, file)).toBe(true)
  })

  test('when a file extension is unselected, returns false if path does not match', () => {
    const filterState = {
      showViewed: true,
      showOnlyFilesCodeownedByUser: false,
      unselectedFileExtensions: new Set(['.ts']),
    }
    const queryText = ''
    const file = {
      viewed: false,
      isOwnedByViewer: false,
      codeowners: [],
      newPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
      oldPath: 'app/assets/modules/react-shared/PullRequests/viewer/filter-query/filter-files.ts',
    }

    expect(filterFiles(filterState, queryText, file)).toBe(false)
  })
})
