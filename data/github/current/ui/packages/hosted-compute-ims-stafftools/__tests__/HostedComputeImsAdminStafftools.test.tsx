import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {Main} from '../routes/stafftools/Main'
import {getMainRoutePayload} from '../test-utils/mock-data'
import {Constants} from '../constants/constants'

test('Renders the HostedComputeImsAdminStafftools', () => {
  const routePayload = getMainRoutePayload()
  render(<Main />, {
    routePayload,
  })
  expect(screen.getByText(Constants.stafftoolPageTitle)).toBeInTheDocument()
})
