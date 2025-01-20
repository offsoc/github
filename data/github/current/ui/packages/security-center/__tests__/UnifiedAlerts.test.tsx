import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {useParams} from 'react-router-dom'

import {UnifiedAlerts} from '../routes/UnifiedAlerts'
import {getUnifiedAlertsRoutePayload} from '../test-utils/mock-data'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}))

describe('UnifiedAlerts', () => {
  describe('at organization scope', () => {
    it('renders the view', () => {
      jest.mocked(useParams).mockImplementation(() => ({org: 'my-org'}))
      const routePayload = getUnifiedAlertsRoutePayload()

      render(<UnifiedAlerts />, {routePayload})

      expect(screen.getAllByRole('heading')?.[0]).toHaveTextContent('Alerts')
      expect(screen.getByText(routePayload.feedbackLink.text)).toBeInTheDocument()
    })
  })
})
