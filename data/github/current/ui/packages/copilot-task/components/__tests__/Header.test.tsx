import '../../test-utils/mocks'

import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {getCopilotTaskRoutePayload} from '../../test-utils/mock-data'
import {TestComponentWrapper} from '../../test-utils/TestComponentWrapper'
import {Header, type HeaderProps} from '../Header'

const terminateMock = jest.fn()
const onCopilotClickMock = jest.fn()

// Web workers are not supported on jsdom, so we mock the minimum we need for this test,
// which will call onmessage once per each postMessage with a fixed resultset.
window.Worker = class {
  // onmessage will be replaced by the caller to handle responses
  onmessage = (data: unknown) => data
  postMessage() {
    this.onmessage({data: {query: 'any', list: ['contra', 'transport', 'ter/rain'], startTime: 20, baseCount: 4}})
  }
  terminate = terminateMock
} as unknown as typeof Worker

jest.useFakeTimers()

function TestComponent({subjectTitle}: Partial<HeaderProps>) {
  return (
    <TestComponentWrapper>
      <Header
        subjectTitle={subjectTitle ?? 'my pull request'}
        subjectNumber="1"
        onCopilotClick={onCopilotClickMock}
        copilotHeaderButtonRef={{current: null}}
        commitButtonRef={{current: null}}
        onOverviewClick={() => {}}
      />
    </TestComponentWrapper>
  )
}

describe('Header', () => {
  test('renders header', () => {
    const routePayload = getCopilotTaskRoutePayload()
    render(<TestComponent subjectTitle="my pull request" />, {routePayload})

    expect(screen.getByText('my pull request')).toBeVisible()
    expect(screen.getByText('Commit changes...')).toBeVisible()
    const ownerBreadcrumb = screen.getByText('owner')
    expect(ownerBreadcrumb).toBeVisible()
    const repoBreadcrumb = screen.getByText('repo')
    expect(repoBreadcrumb).toBeVisible()
  })

  test('copilot panel button', async () => {
    const routePayload = getCopilotTaskRoutePayload()
    const {user} = render(<TestComponent subjectTitle="my pull request" />, {routePayload})

    const copilotPanelButton = screen.getByLabelText('Toggle Copilot panel')
    expect(copilotPanelButton).toBeVisible()
    await user.click(copilotPanelButton)

    expect(onCopilotClickMock).toHaveBeenCalled()
  })

  test('compare picker', async () => {
    const routePayload = getCopilotTaskRoutePayload()
    const {user} = render(<TestComponent subjectTitle="my pull request" />, {routePayload})

    const comparePicker = screen.getByText('Compare')
    expect(comparePicker).toBeVisible()
    await user.click(comparePicker)

    expect(screen.getByText('Pull request #1 branch')).toBeInTheDocument()
    expect(screen.getByText('Default branch')).toBeInTheDocument()
  })
})
