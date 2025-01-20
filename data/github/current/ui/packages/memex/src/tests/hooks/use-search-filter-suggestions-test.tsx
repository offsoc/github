import {renderHook} from '@testing-library/react'

import {useSearchFilterSuggestions} from '../../client/hooks/use-search-filter-suggestions'
import {createColumnModel} from '../../client/models/column-model'
import {useMemexItems} from '../../client/state-providers/memex-items/use-memex-items'
import {
  assigneesColumn,
  customIterationColumn,
  labelsColumn,
  parentIssueColumn,
  reviewersColumn,
  statusColumn,
  trackedByColumn,
} from '../../mocks/data/columns'
import {DefaultMemex} from '../../mocks/data/memexes'
import {DefaultTeam} from '../../mocks/data/teams'
import {DefaultCollaborator} from '../../mocks/data/users'
import {
  DefaultClosedPullRequest,
  DefaultOpenIssue,
  DefaultOpenPullRequest,
  DefaultSubIssue,
  DefaultTrackedByIssue,
} from '../../mocks/memex-items'
import {DefaultColumns, IterationDemoColumns, SubIssueDemoColumns, TrackedByDemoColumns} from '../../mocks/mock-data'
import {createMockEnvironment} from '../create-mock-environment'
import {QueryClientWrapper} from '../test-app-wrapper'

const Wrapper: React.FC<React.PropsWithChildren<unknown>> = ({children}) => (
  <QueryClientWrapper>{children}</QueryClientWrapper>
)

describe('useSearchFilterSuggestions', () => {
  it('can retrieve results for assignees field', () => {
    createMockEnvironment({
      jsonIslandData: {
        'memex-columns-data': DefaultColumns,
        'memex-data': DefaultMemex,
        'logged-in-user': {
          id: 1234,
          global_relay_id: 'MDQ6VXNl',
          login: 'test-user',
          name: 'Test User',
          avatarUrl: 'https://github.com/test-user.png',
          isSpammy: false,
        },
        'memex-items-data': [DefaultOpenIssue, DefaultOpenPullRequest],
      },
      collaborators: [DefaultCollaborator, DefaultTeam],
    })

    const assigneesField = createColumnModel(assigneesColumn)

    const {result} = renderHook(
      () => {
        const {items} = useMemexItems()
        return useSearchFilterSuggestions(items)
      },
      {
        wrapper: Wrapper,
      },
    )

    const {uniqueColumnValues, filteredKeys} = result.current.getSuggestionsForColumn(assigneesField, '', '', false)

    expect(uniqueColumnValues.size).toBe(5)
    expect(uniqueColumnValues.get('traumverloren')).toBeDefined()
    expect(uniqueColumnValues.get('@me')).toBeDefined()

    expect(filteredKeys).toMatchObject([
      '@me',
      `present-${assigneesField.databaseId}`,
      `empty-${assigneesField.databaseId}`,
      `exclude-${assigneesField.databaseId}`,
      'traumverloren',
    ])
  })

  it('can retrieve results for reviewers field', () => {
    createMockEnvironment({
      jsonIslandData: {
        'memex-columns-data': DefaultColumns,
        'memex-data': DefaultMemex,
        'logged-in-user': {
          id: 1234,
          global_relay_id: 'MDQ6VXNl',
          login: 'test-user',
          name: 'Test User',
          avatarUrl: 'https://github.com/test-user.png',
          isSpammy: false,
        },
        'memex-items-data': [DefaultOpenIssue, DefaultClosedPullRequest],
      },
      collaborators: [DefaultCollaborator, DefaultTeam],
    })

    const reviewersField = createColumnModel(reviewersColumn)

    const {result} = renderHook(
      () => {
        const {items} = useMemexItems()
        return useSearchFilterSuggestions(items)
      },
      {
        wrapper: Wrapper,
      },
    )

    const {uniqueColumnValues, filteredKeys} = result.current.getSuggestionsForColumn(reviewersField, '', '', false)
    expect(uniqueColumnValues.size).toBe(6)
    expect(uniqueColumnValues.get('@me')).toBeDefined()
    expect(uniqueColumnValues.get('Memex Team 1')).toBeDefined()
    expect(uniqueColumnValues.get('dmarcey')).toBeDefined()

    expect(filteredKeys).toMatchObject([
      '@me',
      `present-${reviewersField.databaseId}`,
      `empty-${reviewersField.databaseId}`,
      `exclude-${reviewersField.databaseId}`,
      'dmarcey',
      'Memex Team 1',
    ])
  })

  it('can retrieve results for labels field', () => {
    createMockEnvironment({
      jsonIslandData: {
        'memex-columns-data': DefaultColumns,
        'memex-data': DefaultMemex,
        'memex-items-data': [DefaultOpenIssue, DefaultOpenPullRequest],
      },
      collaborators: [DefaultCollaborator, DefaultTeam],
    })

    const labelsField = createColumnModel(labelsColumn)

    const {result} = renderHook(
      () => {
        const {items} = useMemexItems()
        return useSearchFilterSuggestions(items)
      },
      {
        wrapper: Wrapper,
      },
    )

    const {uniqueColumnValues} = result.current.getSuggestionsForColumn(labelsField, '', '', false)

    expect(uniqueColumnValues.size).toBe(4)
    expect(uniqueColumnValues.get('enhancement ✨')).toBeDefined()
  })

  it('can retrieve results for iteration field', () => {
    createMockEnvironment({
      jsonIslandData: {
        'memex-columns-data': IterationDemoColumns,
        'memex-data': DefaultMemex,
      },
      collaborators: [DefaultCollaborator, DefaultTeam],
    })

    const iterationField = createColumnModel(customIterationColumn)

    const {result} = renderHook(
      () => {
        const {items} = useMemexItems()
        return useSearchFilterSuggestions(items)
      },
      {
        wrapper: Wrapper,
      },
    )

    const {uniqueColumnValues, filteredKeys} = result.current.getSuggestionsForColumn(iterationField, '', '', false)

    expect(uniqueColumnValues.size).toBe(6)
    expect(uniqueColumnValues.get('@current')).toBeDefined()
    expect(uniqueColumnValues.get('@next')).toBeDefined()
    expect(uniqueColumnValues.get('@previous')).toBeDefined()

    expect(filteredKeys).toMatchObject([
      '@current',
      '@next',
      '@previous',
      `present-${iterationField.databaseId}`,
      `empty-${iterationField.databaseId}`,
      `exclude-${iterationField.databaseId}`,
    ])
  })

  it('can retrieve results for tracked by field', () => {
    createMockEnvironment({
      jsonIslandData: {
        'memex-columns-data': TrackedByDemoColumns,
        'memex-data': DefaultMemex,
        'memex-items-data': [DefaultTrackedByIssue],
      },
      collaborators: [DefaultCollaborator, DefaultTeam],
    })

    const trackedByField = createColumnModel(trackedByColumn)

    const {result} = renderHook(
      () => {
        const {items} = useMemexItems()
        return useSearchFilterSuggestions(items)
      },
      {
        wrapper: Wrapper,
      },
    )

    const {uniqueColumnValues, filteredKeys} = result.current.getSuggestionsForColumn(trackedByField, '', '', false)

    expect(uniqueColumnValues.size).toBe(5)
    expect(uniqueColumnValues.get('github/memex#335')?.value).toEqual('complex new feature')
    expect(uniqueColumnValues.get('github/memex#321')?.value).toEqual('style nitpick')

    expect(filteredKeys).toMatchObject([
      `present-${trackedByField.databaseId}`,
      `empty-${trackedByField.databaseId}`,
      `exclude-${trackedByField.databaseId}`,
      'github/memex#321',
      'github/memex#335',
    ])
  })

  it('returns a result for tracked by field when looking by issue title', () => {
    createMockEnvironment({
      jsonIslandData: {
        'memex-columns-data': TrackedByDemoColumns,
        'memex-data': DefaultMemex,
        'memex-items-data': [DefaultTrackedByIssue],
      },
      collaborators: [DefaultCollaborator, DefaultTeam],
    })

    const trackedByField = createColumnModel(trackedByColumn)

    const {result} = renderHook(
      () => {
        const {items} = useMemexItems()
        return useSearchFilterSuggestions(items)
      },
      {
        wrapper: Wrapper,
      },
    )

    const {uniqueColumnValues, filteredKeys} = result.current.getSuggestionsForColumn(
      trackedByField,
      'nitpick',
      'nitpick',
      false,
    )

    expect(uniqueColumnValues.size).toBe(2)
    expect(uniqueColumnValues.get('github/memex#335')?.value).toEqual('complex new feature')
    expect(uniqueColumnValues.get('github/memex#321')?.value).toEqual('style nitpick')
    expect(filteredKeys).toMatchObject(['github/memex#321'])
  })

  it('can retrieve suggestion results for parent issue field', () => {
    createMockEnvironment({
      jsonIslandData: {
        'memex-columns-data': SubIssueDemoColumns,
        'memex-data': DefaultMemex,
        'memex-items-data': [DefaultSubIssue],
      },
      collaborators: [DefaultCollaborator, DefaultTeam],
    })

    const parentIssueField = createColumnModel(parentIssueColumn)

    const {result} = renderHook(
      () => {
        const {items} = useMemexItems()
        return useSearchFilterSuggestions(items)
      },
      {
        wrapper: Wrapper,
      },
    )

    const {uniqueColumnValues, filteredKeys} = result.current.getSuggestionsForColumn(parentIssueField, '', '', false)

    expect(uniqueColumnValues.size).toBe(4)
    expect(uniqueColumnValues.get('github/memex#100')?.value).toEqual('Parent Issue')

    expect(filteredKeys).toMatchObject([
      `present-${parentIssueField.databaseId}`,
      `empty-${parentIssueField.databaseId}`,
      `exclude-${parentIssueField.databaseId}`,
      'github/memex#100',
    ])
  })

  it('can retrieve suggestion results for parent issue field based on title', () => {
    createMockEnvironment({
      jsonIslandData: {
        'memex-columns-data': SubIssueDemoColumns,
        'memex-data': DefaultMemex,
        'memex-items-data': [DefaultSubIssue],
      },
      collaborators: [DefaultCollaborator, DefaultTeam],
    })

    const parentIssueField = createColumnModel(parentIssueColumn)

    const {result} = renderHook(
      () => {
        const {items} = useMemexItems()
        return useSearchFilterSuggestions(items)
      },
      {
        wrapper: Wrapper,
      },
    )

    const query = 'parent'
    const {uniqueColumnValues, filteredKeys} = result.current.getSuggestionsForColumn(
      parentIssueField,
      query,
      query,
      false,
    )

    expect(uniqueColumnValues.size).toBe(1)

    expect(filteredKeys).toMatchObject(['github/memex#100'])
  })

  it('does not suggest present, empty or exclude when currentFilterValue exists', () => {
    createMockEnvironment({
      jsonIslandData: {
        'memex-columns-data': DefaultColumns,
        'memex-data': DefaultMemex,
      },
      collaborators: [DefaultCollaborator, DefaultTeam],
    })

    const statusField = createColumnModel(statusColumn)

    const {result} = renderHook(
      () => {
        const {items} = useMemexItems()
        return useSearchFilterSuggestions(items)
      },
      {
        wrapper: Wrapper,
      },
    )

    const {uniqueColumnValues} = result.current.getSuggestionsForColumn(statusField, 'Backlog,', '', false)

    expect(uniqueColumnValues.get(`present-${statusField.databaseId}`)).not.toBeDefined()
    expect(uniqueColumnValues.get(`empty-${statusField.databaseId}`)).not.toBeDefined()
    expect(uniqueColumnValues.get(`exclude-${statusField.databaseId}`)).not.toBeDefined()
  })
})
