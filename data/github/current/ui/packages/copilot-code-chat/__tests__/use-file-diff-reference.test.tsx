import {renderRelay} from '@github-ui/relay-test-utils'
import {screen} from '@testing-library/react'
import {MockFileDiffReference, MockPullRequestResolvedData} from './__utils__/mock-data'
import {buildFileDiffReference, useFileDiffReference} from '../use-file-diff-reference'
import {graphql} from 'relay-runtime'
import type {useFileDiffReferenceTest_PullRequestQuery} from './__generated__/useFileDiffReferenceTest_PullRequestQuery.graphql'
import {useLazyLoadQuery} from 'react-relay'
import {assertDataPresent} from '@github-ui/assert-data-present'

const TestComponent = () => {
  const data = useLazyLoadQuery<useFileDiffReferenceTest_PullRequestQuery>(
    graphql`
      query useFileDiffReferenceTest_PullRequestQuery {
        node(id: "PR_kwADzmil8Rc") {
          ... on PullRequest {
            comparison {
              ...useFileDiffReference_Comparison
              diffEntry(path: "ui/packages/copilot-code-chat/__tests__/use-file-diff-reference.test.tsx") {
                ...useFileDiffReference_DiffEntry
              }
            }
          }
        }
      }
    `,
    {},
  )

  assertDataPresent(data.node?.comparison?.diffEntry)

  const ref = useFileDiffReference(data.node.comparison, data.node.comparison.diffEntry)

  return <div data-testid="ref">{JSON.stringify(ref)}</div>
}

describe('useFileDiffReference', () => {
  test('builds reference correctly from query response', async () => {
    renderRelay<{
      TestPRQuery: useFileDiffReferenceTest_PullRequestQuery
    }>(TestComponent, {
      relay: {
        queries: {TestPRQuery: {type: 'lazy'}},
        mockResolvers: {PullRequest: () => MockPullRequestResolvedData},
      },
    })
    const ref = JSON.parse(screen.getByTestId('ref').textContent ?? '')
    expect(ref).toStrictEqual(MockFileDiffReference)
  })

  describe('does not build reference for certain types of diffs', () => {
    test('deleted files', async () => {
      expect(
        buildFileDiffReference(MockPullRequestResolvedData.comparison, {
          ...MockPullRequestResolvedData.comparison.diffEntry,
          newTreeEntry: undefined,
        }),
      ).toBeUndefined()
    })

    test('binary', async () => {
      expect(
        buildFileDiffReference(MockPullRequestResolvedData.comparison, {
          ...MockPullRequestResolvedData.comparison.diffEntry,
          isBinary: true,
        }),
      ).toBeUndefined()
    })

    // https://github.com/github/arguably-incorrectors/issues/293
    test('submodule', async () => {
      expect(
        buildFileDiffReference(MockPullRequestResolvedData.comparison, {
          ...MockPullRequestResolvedData.comparison.diffEntry,
          isSubmodule: true,
        }),
      ).toBeUndefined()
    })

    test('lfs', async () => {
      expect(
        buildFileDiffReference(MockPullRequestResolvedData.comparison, {
          ...MockPullRequestResolvedData.comparison.diffEntry,
          isLfsPointer: true,
        }),
      ).toBeUndefined()
    })

    test('file size', async () => {
      expect(
        buildFileDiffReference(MockPullRequestResolvedData.comparison, {
          ...MockPullRequestResolvedData.comparison.diffEntry,
          newTreeEntry: {
            ...MockPullRequestResolvedData.comparison.diffEntry.newTreeEntry,
            size: 2_000_000,
          },
        }),
      ).toBeUndefined()
    })
  })
})
