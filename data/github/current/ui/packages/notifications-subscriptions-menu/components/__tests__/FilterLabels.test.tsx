import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import FilterLabels from '../FilterLabels'

const filter = (
  <FilterLabels
    items={[
      {text: 'Item 1', id: 'item1'},
      {text: 'Item 2', id: 'item2'},
      {text: 'Item 3', id: 'item3'},
    ]}
    labelsText="All"
    selectedLabels={[]}
    onChangeLabels={() => {
      return 'change'
    }}
    applyLabels={() => {
      return 'apply'
    }}
    resetLabels={() => {
      return 'reset'
    }}
    filterAction={() => {
      return 'filter'
    }}
  />
)

describe('FilterLabels', () => {
  test('renders the select panel button', async () => {
    render(filter)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('renders the select panel with correct text', () => {
    render(filter)

    expect(screen.getByText('All')).toBeInTheDocument()
  })

  test('renders the input with correct attributes', async () => {
    const {user} = render(filter)

    await user.click(screen.getByText('Labels:'))

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Filter labels')
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Filter labels')
  })

  test('renders the filter input', async () => {
    const {user} = render(filter)

    await user.click(screen.getByText('Labels:'))

    expect(screen.getAllByRole('textbox', {name: 'Filter labels'})[0]).toBeVisible()
  })

  test('renders the options of the filter', async () => {
    const {user} = render(filter)

    await user.click(screen.getByText('Labels:'))

    expect(screen.getAllByRole('option', {name: 'Item 1'})[0]).toBeVisible()
    expect(screen.getAllByRole('option', {name: 'Item 2'})[0]).toBeVisible()
    expect(screen.getAllByRole('option', {name: 'Item 3'})[0]).toBeVisible()
  })

  test('renders the labels text', async () => {
    const {user} = render(filter)

    await user.click(screen.getByText('Labels:'))

    expect(screen.getAllByRole('button', {name: 'Filter labels'})[0]).toBeVisible()
  })
})
