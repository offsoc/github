import '../../test-utils/mocks'

import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {getCopilotTaskOverviewPayload} from '../../test-utils/mock-data'
import {TestComponentWrapper} from '../../test-utils/TestComponentWrapper'
import {OverviewContent} from '../OverviewContent'

function TestComponent() {
  return (
    <TestComponentWrapper>
      <OverviewContent />
    </TestComponentWrapper>
  )
}

test('renders overview content', () => {
  render(<TestComponent />, {routePayload: getCopilotTaskOverviewPayload()})

  expect(screen.getByText('PR title')).toBeVisible()
  expect(screen.getByText('PR body')).toBeVisible()
  expect(screen.getByText('View pull request details')).toBeVisible()
  expect(screen.getByText('my label')).toBeVisible()
  expect(screen.getByText('feature-branch')).toBeVisible()
  expect(screen.getByText('main-branch')).toBeVisible()
})
