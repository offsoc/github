import {sendEvent} from '@github-ui/hydro-analytics'
import {fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {EcosystemsFilter} from '../EcosystemsFilter'
import {getEcosystemsFilterProps} from '../test-utils/mock-data'

jest.mock('@github-ui/hydro-analytics', () => {
  return {
    ...jest.requireActual('@github-ui/hydro-analytics'),
    sendEvent: jest.fn(),
  }
})

beforeEach(() => (sendEvent as jest.Mock).mockClear())

test('Renders the SponsorsExploreFilter', () => {
  const mockSetFilter = jest.fn()
  render(<EcosystemsFilter {...getEcosystemsFilterProps()} setEcosystemsFilter={mockSetFilter} />)
  expect(screen.getByTestId('ecosystems-button')).toHaveTextContent('1 ecosystem')
})

test('Sets updated ecosystems on select', () => {
  const mockSetFilter = jest.fn()
  render(<EcosystemsFilter {...getEcosystemsFilterProps()} setEcosystemsFilter={mockSetFilter} />)

  const menuButton = screen.getByTestId('ecosystems-button')
  fireEvent.click(menuButton)

  const fooListItem = screen.getByTestId('ecosystems-FOO')
  fireEvent.click(fooListItem)
  const barListItem = screen.getByTestId('ecosystems-BAR')
  fireEvent.click(barListItem)

  expect(mockSetFilter.mock.calls.length).toBe(2)
  expect(mockSetFilter.mock.calls[0][0]).toStrictEqual([])
  expect(mockSetFilter.mock.calls[1][0]).toStrictEqual(['FOO', 'BAR'])
})

test('Fires click event on select', () => {
  const sendEventCalls = sendEvent as jest.Mock
  render(<EcosystemsFilter {...getEcosystemsFilterProps()} />)

  const menuButton = screen.getByTestId('ecosystems-button')
  fireEvent.click(menuButton)

  const fooListItem = screen.getByTestId('ecosystems-FOO')
  fireEvent.click(fooListItem)
  const barListItem = screen.getByTestId('ecosystems-BAR')
  fireEvent.click(barListItem)

  expect(sendEventCalls.mock.calls.length).toBe(2)
  expect(sendEventCalls.mock.calls[0]).toStrictEqual([
    'sponsors.explore_filter_change',
    {enabled: false, filter_option: 'FOO'},
  ])
  expect(sendEventCalls.mock.calls[1]).toStrictEqual([
    'sponsors.explore_filter_change',
    {enabled: true, filter_option: 'BAR'},
  ])
})
