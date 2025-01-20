import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {buildPullRequestDiffThread, buildReviewThread, buildStaticDiffLine} from '../../test-utils/query-data'
import type {Thread} from '../../types'
import {StaticUnifiedDiffPreview} from '../StaticUnifiedDiffPreview'

interface TestComponentProps {
  thread: Thread
}

function TestComponent({thread}: TestComponentProps) {
  return <StaticUnifiedDiffPreview tabSize={1} thread={thread} />
}

test('renders nothing if there are no difflines', async () => {
  const commitOid = '8a8378'
  const thread = buildReviewThread({
    subject: buildPullRequestDiffThread({
      abbreviatedOid: commitOid,
      diffLines: null,
    }),
  })
  render(<TestComponent thread={thread} />)

  const commitHeader = screen.queryByText(commitOid)
  expect(commitHeader).not.toBeInTheDocument()
})

test('renders nothing if difflines are empty', async () => {
  const commitOid = '8a8378'
  const thread = buildReviewThread({
    subject: buildPullRequestDiffThread({
      abbreviatedOid: commitOid,
      diffLines: [],
    }),
  })
  render(<TestComponent thread={thread} />)

  const commitHeader = screen.queryByText(commitOid)
  expect(commitHeader).not.toBeInTheDocument()
})

test('renders a static representation of the difflines', async () => {
  const commitOid = '8a8378'
  const thread = buildReviewThread({
    subject: buildPullRequestDiffThread({
      abbreviatedOid: commitOid,
      startDiffSide: 'LEFT',
      endDiffSide: 'RIGHT',
      originalStartLine: 5,
      originalEndLine: 8,
      diffLines: [
        buildStaticDiffLine({
          type: 'HUNK',
          text: '@@ -5,7 +5,7 @@ def intialize(color, model)',
          left: 4,
          right: 4,
          html: '@@ -5,7 +5,7 @@ def intialize(color, model)',
        }),
        buildStaticDiffLine({
          type: 'CONTEXT',
          text: ' end',
          left: 5,
          right: 5,
          html: ' <span class=pl-k>end</span>',
        }),
        buildStaticDiffLine({
          type: 'CONTEXT',
          text: ' ',
          left: 6,
          right: 6,
          html: '<br>',
        }),
        buildStaticDiffLine({
          type: 'CONTEXT',
          text: ' def drive',
          left: 7,
          right: 7,
          html: ` <span class=pl-k>def</span> <span class=pl-en>drive</span>`,
        }),
        buildStaticDiffLine({
          type: 'DELETION',
          text: "- puts 'delete me'",
          left: 8,
          right: 7,
          html: ` <span class="pl-en">puts</span> <span class="pl-s">'delete me'</span>"`,
        }),
        buildStaticDiffLine({
          type: 'ADDITION',
          text: `+ puts 'no longer still driving'`,
          right: 8,
          html: ` <span class="pl-en">puts</span> <span class="pl-s">'<span class="x x-first x-last">add this syntax highlighted text </span>delete me'</span>"`,
        }),
      ],
    }),
  })

  render(<TestComponent thread={thread} />)

  const diffLinesText = screen.getByText(`Line -5 to +8, commit`)
  expect(diffLinesText).toBeInTheDocument()
  const commitSha = screen.getByText(commitOid)
  expect(commitSha).toBeInTheDocument()
  const hunkCellText = screen.getByText(`@@ -5,7 +5,7 @@ def intialize(color, model)`)
  expect(hunkCellText).toBeInTheDocument()

  const contextLineNumber5 = screen.queryAllByText('6')
  expect(contextLineNumber5).toHaveLength(2)

  const contextLineNumber6 = screen.queryAllByText('6')
  expect(contextLineNumber6).toHaveLength(2)

  const contextLineNumber7 = screen.queryAllByText('7')
  expect(contextLineNumber7).toHaveLength(2)

  const additionAndDeletionLineNumbers = screen.queryAllByText('8')
  expect(additionAndDeletionLineNumbers).toHaveLength(2)

  const deletionText = `'delete me'`
  expect(screen.queryAllByText(deletionText)).toHaveLength(2)
  const deletionLineMarker = '-'
  expect(screen.getByText(deletionLineMarker)).toBeInTheDocument()

  const additionText = `add this syntax highlighted text`
  expect(screen.getByText(additionText)).toBeInTheDocument()
  const additionLineMarker = '+'
  expect(screen.getByText(additionLineMarker)).toBeInTheDocument()
})
