import {act, fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import SearchInput from '../components/SearchInput'

jest.useFakeTimers()
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(),
    mark: jest.fn(),
    clearResourceTimings: jest.fn(),
  },
})

// Mock useNavigate
const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  const actual = jest.requireActual('@github-ui/use-navigate')
  return {
    ...actual,
    useNavigate: () => navigateFn,
  }
})

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders SearchInput', () => {
  render(<SearchInput selectedPage="overview" />)

  expect(screen.getByRole('textbox', {name: 'Search'})).toBeVisible()
})

test('calls onChange after debounce', async () => {
  const onChange = jest.fn()
  render(<SearchInput selectedPage="all" onChange={onChange} />)
  const input = screen.getByRole('textbox', {name: 'Search'})
  fireEvent.change(input, {target: {value: 'new_value'}})
  expect(onChange).toHaveBeenCalledTimes(0)
  expect(navigateFn).toHaveBeenCalledTimes(0)
  await act(() => jest.runOnlyPendingTimers())
  expect(onChange).toHaveBeenCalledTimes(1)
  expect(navigateFn).toHaveBeenCalledTimes(0)
})

test('calls navigate when searching from a non-all page', async () => {
  const onChange = jest.fn()
  render(<SearchInput selectedPage="overview" onChange={onChange} />)
  const input = screen.getByRole('textbox', {name: 'Search'})
  fireEvent.change(input, {target: {value: 'new_value'}})
  expect(navigateFn).toHaveBeenCalledTimes(0)
  await act(() => jest.runOnlyPendingTimers())
  expect(navigateFn).toHaveBeenCalledTimes(1)
})
