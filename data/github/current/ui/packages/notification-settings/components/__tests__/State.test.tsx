import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import State, {SavingStatus} from '../State'

describe('state rendering', () => {
  test('renders the state with success', () => {
    render(<State status={SavingStatus.SUCCESS} />)

    expect(screen.getByText('Saved')).toBeVisible()
  })

  test('renders the state with loading icon', () => {
    const {container} = render(<State status={SavingStatus.LOADING} />)

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('svg')?.getAttribute('class')).toMatch(/Spinner/gi)
  })

  test('renders the state with error', () => {
    render(<State status={SavingStatus.ERROR} />)

    expect(screen.getByText('Oops, something went wrong.')).toBeVisible()
  })

  test('renders the state empty', () => {
    const {container} = render(<State status={SavingStatus.IDLE} />)

    expect(screen.queryByText('Saved')).toBeNull()
    expect(screen.queryByText('Oops, something went wrong.')).toBeNull()
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('svg')).toBeNull()
  })
})
