import {render, screen} from '@testing-library/react'
import {IterationItem} from '../IterationItem'

jest.useFakeTimers().setSystemTime(new Date('2024-05-10'))

describe('IterationItem', () => {
  it('renders the title and date correctly', () => {
    const startDate = '2024-05-10'
    const durationInDays = 7
    const titleHTML = '<h1>Iteration Title</h1>'

    render(<IterationItem startDate={startDate} durationInDays={durationInDays} titleHTML={titleHTML} />)

    expect(screen.getByText('Iteration Title')).toBeInTheDocument()
    // {exact: false} because we don't care about current or not current in this test
    expect(screen.getByText('May 10 - May 16', {exact: false})).toBeInTheDocument()
  })

  it('renders "Current" when the iteration is ongoing', () => {
    const startDate = '2024-05-08'
    const durationInDays = 7
    const titleHTML = '<h1>Iteration Title</h1>'

    render(<IterationItem startDate={startDate} durationInDays={durationInDays} titleHTML={titleHTML} />)

    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('does not render "Current" when the iteration is not ongoing', () => {
    const startDate = '2022-01-01'
    const durationInDays = 7
    const titleHTML = '<h1>Iteration Title</h1>'

    render(<IterationItem startDate={startDate} durationInDays={durationInDays} titleHTML={titleHTML} />)

    expect(screen.queryByText('Current')).toBeNull()
  })
})
