import {setupExpectedAsyncErrorHandler, updateFilterValue} from '@github-ui/filter/test-utils'
import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor, within} from '@testing-library/react'

import {ReposFilter} from '../ReposFilter'

const sampleProps = {
  id: 'test-id',
  definitions: [],
  types: [],
  label: 'Repos!!!',
  onChange: jest.fn(),
}

describe('ReposFilter', () => {
  beforeEach(() => {
    setupExpectedAsyncErrorHandler()
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })
  it('renders the component', async () => {
    render(<ReposFilter {...sampleProps} filterValue="Query" />)
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('Query')
    })
  })

  it('shows `no` qualifier', async () => {
    const {user} = render(<WrappedReposFilter />)

    await user.click(screen.getByRole('combobox'))

    await updateFilterValue('no')

    await waitFor(() => {
      const suggestions = screen.getByTestId('filter-results')
      expect(within(suggestions).getByText('No')).toBeInTheDocument()
    })
  })

  // Flakey test! See https://github.com/github/web-systems/issues/2277 for more information
  // https://github.com/github/github/actions/runs/10262675969/job/28392957038
  it.skip('suggests the proper filter when partial text entered', async () => {
    render(<WrappedReposFilter />)

    await updateFilterValue('Fork')

    await waitFor(() => {
      const options = within(screen.getByTestId('filter-results')).getAllByRole('option')
      expect(options).toHaveLength(1)
    })

    expect(screen.getByTestId('filter-results')).toHaveTextContent('Fork')

    await updateFilterValue('fork:')
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('fork:'))

    await waitFor(() => {
      const options = within(screen.getByTestId('filter-results')).getAllByRole('option')
      expect(options).toHaveLength(2)
    })

    expect(screen.getByTestId('filter-results')).toHaveTextContent('Only forks')
  })

  it('warns when using a deprecated filter', async () => {
    render(<WrappedReposFilter />)

    await updateFilterValue('is:private ')

    await waitFor(() => screen.findByTestId('validation-error-count'))

    expect(
      screen.getByText('Filter "is:" is deprecated, use "visibility:" or "sponsorable:" instead'),
    ).toBeInTheDocument()
  })
})

function WrappedReposFilter() {
  return (
    <ReposFilter
      id="test-id"
      definitions={[{propertyName: 'version', required: false, valueType: 'string'}]}
      label="Repos!!!"
    />
  )
}
