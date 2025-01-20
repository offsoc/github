import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import type {RefComparison} from '@github-ui/code-view-types'
import {fireEvent, screen} from '@testing-library/react'

import {testTreePayload} from '../../../../__tests__/test-helpers'
import {ContributeButton} from '../../BranchInfoBar/ContributeButton'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {FilesPageInfoProvider} from '../../../../contexts/FilesPageInfoContext'
import {render} from '@github-ui/react-core/test-utils'

const sampleComparison: RefComparison = {
  ahead: 0,
  behind: 0,
  baseBranch: 'main',
  baseBranchRange: 'main',
  currentRef: 'feature-branch',
  isTrackingBranch: false,
}

describe('ContributeButton', () => {
  it('emits user analytics event on click', async () => {
    render(
      <CurrentRepositoryProvider repository={testTreePayload.repo}>
        <FilesPageInfoProvider
          action="tree"
          copilotAccessAllowed={false}
          path={testTreePayload.path}
          refInfo={testTreePayload.refInfo}
        >
          <ContributeButton comparison={sampleComparison} />
        </FilesPageInfoProvider>
      </CurrentRepositoryProvider>,
    )

    const button = screen.getByText('Contribute')
    expect(button).toBeInTheDocument()

    fireEvent.click(button)

    expectAnalyticsEvents({
      type: 'repository.click',
      target: 'CONTRIBUTE_BUTTON',
      data: {
        category: 'Branch Infobar',
        action: 'Open Contribute dropdown',
        label: 'ref_loc:contribute_dropdown',
      },
    })
  })
})
