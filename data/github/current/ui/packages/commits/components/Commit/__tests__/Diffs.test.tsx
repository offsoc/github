import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
import {noop} from '@github-ui/noop'
import {commitContextLinesPath} from '@github-ui/paths'
import {screen} from '@testing-library/react'

import {
  payloadWithDiffs,
  payloadWithRichDependencyDiff,
  payloadWithRichDiff,
  payloadWithRichDiffNotLoaded,
  payloadWithRichRenderedDiff,
} from '../../../test-utils/commit-mock-data'
import {renderCommit} from '../../../test-utils/Render'
import type {CommitPayload, DiffEntryDataWithExtraInfo} from '../../../types/commit-types'
import {Diffs} from '../Diffs'

beforeEach(() => {
  jest.clearAllMocks()
  // jests querySelector doesn't like focus-within so we have to mock it
  jest.spyOn(document, 'querySelector').mockImplementation(() => {
    return null
  })
})

function renderDiffs(payload: CommitPayload, unselectedFileExtensions: Set<string>, selectedPathDigest: string) {
  return renderCommit(
    <Diffs
      isStickied={true}
      searchTerm={''}
      setSearchTerm={noop}
      ignoreWhitespace={payload.ignoreWhitespace}
      diffEntryData={payload.diffEntryData as DiffEntryDataWithExtraInfo[]}
      contextLinePathURL={commitContextLinesPath({
        owner: payload.repo.ownerLogin,
        repo: payload.repo.name,
        commitish: payload.commit.oid,
      })}
      unselectedFileExtensions={unselectedFileExtensions}
      selectedPathDigest={selectedPathDigest}
      repo={payload.repo}
      oid={payload.commit.oid}
    />,
    payload,
  )
}

test('renders diff files', () => {
  renderDiffs(payloadWithDiffs, new Set(), '')

  expect(screen.getByText('src/index.js')).toBeInTheDocument()
  expect(screen.getByText('src/components/Component.ts')).toBeInTheDocument()
  expect(screen.getByText('src/components/Component.test.js')).toBeInTheDocument()
  // An icon appears bewteen the old and new name for renamed files
  expect(screen.getByText('src/components/Component.css.old', {exact: false})).toBeInTheDocument()
})

test('shows old and new content for modified files for split view', () => {
  renderDiffs(payloadWithDiffs, new Set(), '')

  // Context lines will appear twice for each side in split view
  expect(screen.getAllByText('text2')).toHaveLength(2)
  expect(screen.getByText('text3')).toBeInTheDocument()
  expect(screen.getByText('text4')).toBeInTheDocument()
  // Context lines will appear twice for each side in split view
  expect(screen.getAllByText('text5')).toHaveLength(2)
})

test('shows old and new content for modified files for unified view', () => {
  renderDiffs({...payloadWithDiffs, splitViewPreference: 'unified'}, new Set(), '')

  // Context lines will appear once the in unified view
  expect(screen.getByText('text2')).toBeInTheDocument()
  expect(screen.getByText('text3')).toBeInTheDocument()
  expect(screen.getByText('text4')).toBeInTheDocument()
  expect(screen.getByText('text5')).toBeInTheDocument()
})

test('shows only new content for added files', () => {
  renderDiffs(payloadWithDiffs, new Set(), '')

  expect(screen.getByText('text1')).toBeInTheDocument()
})

test('renamed only files show that they have been renamed without changes', () => {
  renderDiffs(payloadWithDiffs, new Set(), '')

  expect(screen.getByText('File renamed without changes.')).toBeInTheDocument()
})

test('does not show content of deleted files by default', async () => {
  const {user} = renderDiffs(payloadWithDiffs, new Set(), '')

  expect(screen.queryByText('text6')).not.toBeInTheDocument()
  expect(screen.getByText('This file was deleted.')).toBeInTheDocument()

  const loadDiffButton = screen.getByText('Load Diff')
  expect(loadDiffButton).toBeInTheDocument()
  await user.click(loadDiffButton)

  expect(screen.getByText('text6')).toBeInTheDocument()
})

test('does not show files if thier extensions are unselected', () => {
  renderDiffs(payloadWithDiffs, new Set(['.js']), '')

  expect(screen.getByText('src/components/Component.ts')).toBeInTheDocument()
  expect(screen.queryByText('src/components/Component.test.js')).not.toBeInTheDocument()
})

test('renders prose diffs', () => {
  renderDiffs(payloadWithRichDiff, new Set(), '')

  expect(screen.getByText('proseDiffHtml')).toBeInTheDocument()
})

test('renders prose data async', async () => {
  mockFetch.mockRouteOnce('/monalisa/smile/commit/052a205c10a5a949ec8b00521da6508e7f2eab1fc/rich_diff/src%2Findex.js', {
    proseDiffHtml: 'proseDiffHtml',
  })
  renderDiffs(payloadWithRichDiffNotLoaded, new Set(), '')

  expectMockFetchCalledTimes(
    '/monalisa/smile/commit/052a205c10a5a949ec8b00521da6508e7f2eab1fc/rich_diff/src%2Findex.js',
    1,
  )

  expect(await screen.findByText('proseDiffHtml', undefined, {timeout: 1000})).toBeInTheDocument()
})

test('renders rendered rich diff', () => {
  renderDiffs(payloadWithRichRenderedDiff, new Set(), '')

  expect(screen.getByTitle('File display')).toBeInTheDocument()
})

test('renders rendered rich diff async', async () => {
  mockFetch.mockRouteOnce('/monalisa/smile/commit/052a205c10a5a949ec8b00521da6508e7f2eab1fc/rich_diff/src%2Findex.js', {
    fileRendererInfo: {
      identityUuid: 'identityUuid',
      type: 'renderType',
      size: 1,
      url: 'displayUrl',
    },
  })
  renderDiffs(payloadWithRichDiffNotLoaded, new Set(), '')

  expectMockFetchCalledTimes(
    '/monalisa/smile/commit/052a205c10a5a949ec8b00521da6508e7f2eab1fc/rich_diff/src%2Findex.js',
    1,
  )

  expect(await screen.findByTitle('File display', undefined, {timeout: 1000})).toBeInTheDocument()
})

test('renders dependency diff', () => {
  renderDiffs(payloadWithRichDependencyDiff, new Set(), 'pathDigest1')

  expect(screen.getByText('Loading Dependency Review...')).toBeInTheDocument()
})
