import {screen} from '@testing-library/react'

import {render} from '../../test-utils/Render'
import {SecurityCenterUnifiedAlerts} from '../SecurityCenterUnifiedAlerts'
import {getUnifiedAlertsProps} from '../test-utils/mock-data'

describe('SecurityCenterUnifiedAlerts', () => {
  it('should render', () => {
    const props = getUnifiedAlertsProps()
    render(<SecurityCenterUnifiedAlerts {...props} />)
    expect(screen.getByText('Alerts')).toBeInTheDocument()
    expect(screen.getByText(props.feedbackLink.text)).toBeInTheDocument()
  })
})
