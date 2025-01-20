import {render, screen, waitFor} from '@testing-library/react'
import {RelativeTimeDescription, type RelativeTimeDescriptionProps} from '../components/RelativeTimeDescription'

describe('closed dates', () => {
  it('renders closed dates correctly', async () => {
    const date = new Date('2022-06-11')
    const isoString = date.toISOString()

    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    render(<TestComponent closed={true} givenDate={date} currentDate={new Date('2022-06-15')} />)

    await waitFor(() => {
      const element = screen.getByTestId('relative-time-description')
      expect(element).toBeInTheDocument()
    })

    const element = screen.getByTestId('relative-time-description')
    expect(element).toHaveTextContent(formattedDate)
    expect(element).toHaveAttribute('datetime', isoString)
    expect(element).toHaveAttribute('month', 'short')
    expect(element).toHaveAttribute('year', '')
    expect(element).toHaveAttribute('tense', 'past')
    expect(element).toHaveAttribute('format', 'auto')
    expect(element).toHaveAttribute('precision', 'second')
  })

  it('renders closed date < year correctly', () => {
    const date = new Date()
    date.setDate(date.getFullYear() - 2)

    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    render(<TestComponent closed={true} givenDate={date} currentDate={new Date()} />)

    expect(screen.getByText(formattedDate)).toBeInTheDocument()
  })

  it('renders closed date < month correctly', () => {
    const date = new Date()
    date.setMonth(date.getMonth() - 4)

    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    render(<TestComponent closed={true} givenDate={date} currentDate={new Date()} />)

    // eslint-disable-next-line testing-library/no-node-access
    const element = document.querySelector('[data-testid="relative-time-description"]')

    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent(formattedDate)

    // tense will change if more than a month
    expect(element).toHaveAttribute('tense', 'auto')
  })
})

describe('past dates', () => {
  it('renders past dates correctly', () => {
    const date = new Date('2022-06-11')
    const isoString = date.toISOString()

    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    render(<TestComponent closed={false} givenDate={date} currentDate={new Date('2022-06-15')} />)

    // eslint-disable-next-line testing-library/no-node-access
    const element = document.querySelector('[data-testid="relative-time-description"]')

    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent(formattedDate)
    expect(element).toHaveAttribute('datetime', isoString)
    expect(element).toHaveAttribute('month', 'long')
    expect(element).toHaveAttribute('year', 'numeric')
    expect(element).toHaveAttribute('tense', 'past')
    expect(element).toHaveAttribute('format', 'elapsed')
    expect(element).toHaveAttribute('precision', 'day')
  })
})

const TestComponent = ({closed, givenDate, currentDate}: RelativeTimeDescriptionProps) => {
  return <RelativeTimeDescription closed={closed} givenDate={givenDate} currentDate={currentDate} />
}
