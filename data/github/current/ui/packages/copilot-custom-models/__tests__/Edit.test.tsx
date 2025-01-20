import {getEditRoutePayload} from '../test-utils/mock-data'
import {Edit} from '../routes/Edit/Page'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

describe('<Edit />', () => {
  it('renders', () => {
    const routePayload = getEditRoutePayload()
    routePayload.repoCount = 1

    render(<Edit />, {routePayload})

    expect(screen.getByText('1 selected', {exact: false})).toBeInTheDocument()
  })
})
