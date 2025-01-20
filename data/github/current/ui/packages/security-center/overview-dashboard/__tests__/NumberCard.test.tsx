import {render, screen} from '@testing-library/react'

import {NumberCard} from '../components/NumberCard'

describe('NumberCard', () => {
  it('renders the component with the correct props', () => {
    render(
      <NumberCard
        title="Age of alerts"
        description="Average age of open alerts"
        trend={10}
        currentPeriodState={{kind: 'ready', count: 1337}}
        previousPeriodState={{kind: 'ready', count: 1337}}
      />,
    )

    expect(screen.getByText('Age of alerts')).toBeInTheDocument()
  })

  it('fetches and displays the correct data', async () => {
    render(
      <NumberCard
        title="Age of alerts"
        description="Average age of open alerts"
        trend={10}
        currentPeriodState={{kind: 'ready', count: 1337}}
        previousPeriodState={{kind: 'ready', count: 1337}}
      />,
    )

    expect(await screen.findByText('1,337')).toBeInTheDocument()
  })

  it('displays a no data state on error', async () => {
    render(
      <NumberCard
        title="Age of alerts"
        description="Average age of open alerts"
        trend={10}
        currentPeriodState={{kind: 'error'}}
        previousPeriodState={{kind: 'error'}}
      />,
    )

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
  })
})
