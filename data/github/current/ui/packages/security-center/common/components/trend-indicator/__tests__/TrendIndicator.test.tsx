import {render, screen} from '@testing-library/react'

import {TrendIndicator} from '../TrendIndicator'

describe('TrendIndicator', () => {
  it('displays the correct data', async () => {
    render(<TrendIndicator loading={false} error={false} value={12} />)

    expect(screen.getByText(/12%/)).toBeInTheDocument()
  })

  it('displays 999%+ if the value is equal to 999', async () => {
    render(<TrendIndicator loading={false} error={false} value={999} />)

    expect(screen.getByText(/999%+/)).toBeInTheDocument()
  })

  it('displays 999%+ if the value is greater than 999', async () => {
    render(<TrendIndicator loading={false} error={false} value={1000} />)

    expect(screen.getByText(/999%+/)).toBeInTheDocument()
  })

  it('displays nothing if error is true', async () => {
    render(<TrendIndicator loading={true} error={true} value={12} />)

    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })

  it('displays a spinner if loading is true', async () => {
    render(<TrendIndicator loading={true} error={false} value={12} />)

    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
    expect(screen.getByTestId('trend-indicator-spinner')).toBeInTheDocument()
  })
})
