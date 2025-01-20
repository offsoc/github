import {screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import FailureReasonDialog from '../components/FailureReasonDialog'
import App from '../App'
import {defaultAppContext} from '../test-utils/mock-data'

describe('FailureReasonDialog', () => {
  it('renders the title and body', () => {
    render(
      <App>
        <FailureReasonDialog
          reason="Code scanning default setup can only be enabled if advanced setup is disabled."
          repositoryName={'test'}
          configurationName={'GitHub Recommended'}
          setShowFailureReasonDialog={() => {}}
        />
      </App>,
      {routePayload: defaultAppContext()},
    )

    const dialog = screen.getByRole('dialog')
    const title = within(dialog).getByText('Code scanning: Advanced setup conflict')
    expect(title).toBeTruthy()

    const body = within(dialog).getByTestId('failure-dialog-body')
    expect(body).toHaveTextContent(
      'GitHub Recommended is enabling code scanning default setup but test has an existing advanced setup.',
    )
  })

  it('renders the remediations', () => {
    render(
      <App>
        <FailureReasonDialog
          reason="Advanced security has not been purchased."
          repositoryName={'test'}
          configurationName={'GitHub Recommended'}
          setShowFailureReasonDialog={() => {}}
        />
      </App>,
      {routePayload: defaultAppContext()},
    )

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(2)

    expect(listItems[0]).toHaveTextContent('Trial GitHub Advanced Security.')
    expect(listItems[1]).toHaveTextContent('Apply a configuration that excludes GitHub Advanced Security.')
  })
})
