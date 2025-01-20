import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'

import {ListViewActionBar, type ListViewActionBarProps} from '../ActionBar'
import {ListViewDensityToggle} from '../DensityToggle'
import {TitleProvider} from '../TitleContext'
import {VariantProvider, type VariantType} from '../VariantContext'

type RenderActionBarProps = ListViewActionBarProps & {listTitle?: string; listVariant?: VariantType}

function renderActionBar({listTitle = 'My list view', listVariant, ...props}: RenderActionBarProps) {
  render(
    <TitleProvider title={listTitle}>
      <VariantProvider variant={listVariant}>
        <ListViewActionBar {...props} />
      </VariantProvider>
    </TitleProvider>,
  )
}

it('renders density toggle with Comfortable display density selected by default', () => {
  renderActionBar({densityToggle: <ListViewDensityToggle />})

  const actions = screen.getByTestId('list-view-actions')
  expect(actions).toBeInTheDocument()
  const densityToggle = within(actions).getByTestId('density-toggle')
  expect(within(densityToggle).getByLabelText('Comfortable display density')).toHaveAttribute('aria-current', 'true')
  expect(within(densityToggle).getByLabelText('Compact display density')).toHaveAttribute('aria-current', 'false')
})

it('renders density toggle with Compact display density selected when variant=compact', () => {
  renderActionBar({densityToggle: <ListViewDensityToggle />, listVariant: 'compact'})

  const actions = screen.getByTestId('list-view-actions')
  expect(actions).toBeInTheDocument()
  const densityToggle = within(actions).getByTestId('density-toggle')
  expect(within(densityToggle).getByLabelText('Comfortable display density')).toHaveAttribute('aria-current', 'false')
  expect(within(densityToggle).getByLabelText('Compact display density')).toHaveAttribute('aria-current', 'true')
})

it('renders custom styling', () => {
  renderActionBar({densityToggle: <ListViewDensityToggle />, sx: {border: '1px solid red'}})

  const actions = screen.getByTestId('list-view-actions')
  expect(actions).toBeInTheDocument()
  expect(actions).toHaveStyle('border: 1px solid red')
  expect(within(actions).getByTestId('density-toggle')).not.toBeNull()
})

it('renders given children without density toggle', () => {
  renderActionBar({children: <p>hello world</p>})

  const actions = screen.getByTestId('list-view-actions')
  expect(actions).toBeInTheDocument()
  expect(within(actions).queryByTestId('density-toggle')).toBeNull()
  expect(within(actions).getByRole('paragraph')).toHaveTextContent('hello world')
})

it('renders given children with density toggle', () => {
  renderActionBar({densityToggle: <ListViewDensityToggle />, children: <p>hello world</p>})

  const actions = screen.getByTestId('list-view-actions')
  expect(actions).toBeInTheDocument()
  expect(within(actions).getByTestId('density-toggle')).not.toBeNull()
  expect(within(actions).getByRole('paragraph')).toHaveTextContent('hello world')
})

it('renders action bar with given label', () => {
  renderActionBar({
    listTitle: 'A Fancy List',
    actionsLabel: 'Hello world',
    actions: [{key: '1', render: () => <button>Foo</button>}],
  })

  const container = screen.getByRole('toolbar', {name: 'Hello world'})
  const actionBar = within(container).getByTestId('action-bar')
  const actionBarItem = within(actionBar).getByTestId('action-bar-item-1')
  expect(within(actionBarItem).getByRole('button')).toHaveTextContent('Foo')
})
