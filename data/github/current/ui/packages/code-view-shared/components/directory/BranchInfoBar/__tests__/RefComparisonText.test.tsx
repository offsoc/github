import type {FileTreePagePayload, RefComparison} from '@github-ui/code-view-types'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'

import {RefComparisonText} from '../RefComparisonText'
import {render} from '@github-ui/react-core/test-utils'
import {FilesPageInfoProvider} from '../../../../contexts/FilesPageInfoContext'
import {testTreePayload} from '../../../../__tests__/test-helpers'

const sampleComparison = {
  ahead: 0,
  behind: 0,
  baseBranch: 'main',
  baseBranchRange: 'main',
  currentRef: 'test-feature-branch',
} as RefComparison

const renderRefComparisonText = (payload: FileTreePagePayload, comparison: RefComparison, linkify: boolean) => {
  return render(
    <CurrentRepositoryProvider repository={payload.repo}>
      <FilesPageInfoProvider action="tree" copilotAccessAllowed={false} path={payload.path} refInfo={payload.refInfo}>
        <RefComparisonText repo={payload.repo} comparison={comparison} linkify={linkify} />
      </FilesPageInfoProvider>
    </CurrentRepositoryProvider>,
  )
}

describe('RefComparisonText', () => {
  const testSetups: Array<{data: RefComparison; expected: string; expectedNumberOfLinks: number; name: string}> = [
    {
      name: 'Up to date',
      data: sampleComparison,
      expected: 'This branch is up to date with main.',
      expectedNumberOfLinks: 0,
    },
    {
      name: 'Ahead',
      data: {...sampleComparison, ahead: 10},
      expected: 'This branch is 10 commits ahead of main.',
      expectedNumberOfLinks: 1,
    },
    {
      name: 'Behind',
      data: {...sampleComparison, behind: 10},
      expected: 'This branch is 10 commits behind main.',
      expectedNumberOfLinks: 1,
    },
    {
      name: 'Ahead and behind',
      data: {...sampleComparison, behind: 1, ahead: 10},
      expected: 'This branch is 10 commits ahead of, 1 commit behind main.',
      expectedNumberOfLinks: 2,
    },
  ]

  test.each
  for (const setup of testSetups) {
    test(`renders correct message for "${setup.name}" case with links`, async () => {
      const view = renderRefComparisonText(testTreePayload, setup.data, true)
      expect(view.baseElement.textContent?.trim()).toBe(setup.expected)

      expect(view.baseElement.querySelectorAll('a')).toHaveLength(setup.expectedNumberOfLinks)
    })

    test(`renders correct message for "${setup.name}" case without links`, async () => {
      const view = renderRefComparisonText(testTreePayload, setup.data, false)
      expect(view.baseElement.textContent?.trim()).toBe(setup.expected)

      expect(view.baseElement.querySelectorAll('a')).toHaveLength(0)
    })
  }
})
