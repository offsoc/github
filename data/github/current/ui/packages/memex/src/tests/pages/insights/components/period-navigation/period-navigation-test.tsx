import {ThemeProvider} from '@primer/react'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'

import {PeriodNavigation} from '../../../../../client/pages/insights/components/period-navigation/period-navigation'

describe('PeriodNavigation', () => {
  it('renders expected link for 2W period', async () => {
    render(
      <MemoryRouter initialEntries={['/orgs/monalisa/projects/1/insights']}>
        <ThemeProvider>
          <PeriodNavigation period="2W" />
        </ThemeProvider>
      </MemoryRouter>,
    )
    expect(await screen.findByText(/2W/i)).toHaveAttribute('href', '/orgs/monalisa/projects/1/insights?period=2W')
  })

  it('renders expected link for 1M period', async () => {
    render(
      <MemoryRouter initialEntries={['/orgs/monalisa/projects/1/insights']}>
        <ThemeProvider>
          <PeriodNavigation period="1M" />
        </ThemeProvider>
      </MemoryRouter>,
    )
    expect(await screen.findByText(/1M/i)).toHaveAttribute('href', '/orgs/monalisa/projects/1/insights?period=1M')
  })

  it('renders expected link for 3M period', async () => {
    render(
      <MemoryRouter initialEntries={['/orgs/monalisa/projects/1/insights']}>
        <ThemeProvider>
          <PeriodNavigation period="3M" />
        </ThemeProvider>
      </MemoryRouter>,
    )
    expect(await screen.findByText(/3M/i)).toHaveAttribute('href', '/orgs/monalisa/projects/1/insights?period=3M')
  })

  it('renders expected link for "max" period', async () => {
    render(
      <MemoryRouter initialEntries={['/orgs/monalisa/projects/1/insights']}>
        <ThemeProvider>
          <PeriodNavigation period="max" />
        </ThemeProvider>
      </MemoryRouter>,
    )
    expect(await screen.findByText(/Max/i)).toHaveAttribute('href', '/orgs/monalisa/projects/1/insights?period=max')
  })
})
