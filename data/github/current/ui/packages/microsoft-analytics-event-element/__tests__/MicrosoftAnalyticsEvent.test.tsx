import {render, screen} from '@testing-library/react'
import MicrosoftAnalyticsEvent from '../MicrosoftAnalyticsEvent'

describe('MicrosoftAnalyticsEvent', () => {
  it('shows microsoft analytics custom component with the expected behavior', async () => {
    render(<MicrosoftAnalyticsEvent />)

    const microsoftAnalyticsEvent = await screen.findByTestId('microsoft-analytics-event')

    await expect(microsoftAnalyticsEvent).toHaveAttribute('data-behavior', 'contact')
    await expect(microsoftAnalyticsEvent).toHaveAttribute('data-catalyst')
  })
})
