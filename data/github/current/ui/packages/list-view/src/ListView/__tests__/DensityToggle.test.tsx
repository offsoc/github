import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'

import {ListViewDensityToggle, type ListViewDensityToggleProps} from '../DensityToggle'
import {TitleProvider} from '../TitleContext'
import {VariantProvider, type VariantType} from '../VariantContext'

it('renders options to change the view mode', async () => {
  renderDensityToggle({listTitle: 'My list of things'})

  const segmentedControl = await screen.findByTestId('density-toggle')
  expect(segmentedControl).toHaveAttribute('aria-label', 'My list of things display density')
  expect(within(segmentedControl).getByLabelText('Comfortable display density')).toBeInTheDocument()
  expect(within(segmentedControl).getByLabelText('Compact display density')).toBeInTheDocument()
})

it('selects list view when list variant=default', async () => {
  renderDensityToggle({listVariant: 'default'})

  const listView = await screen.findByLabelText('Comfortable display density')
  expect(listView).toHaveAttribute('aria-current', 'true')
  const compactView = await screen.findByLabelText('Compact display density')
  expect(compactView).toHaveAttribute('aria-current', 'false')
})

it('selects compact view when list variant=compact', async () => {
  renderDensityToggle({listVariant: 'compact'})

  const listView = await screen.findByLabelText('Comfortable display density')
  expect(listView).toHaveAttribute('aria-current', 'false')
  const compactView = await screen.findByLabelText('Compact display density')
  expect(compactView).toHaveAttribute('aria-current', 'true')
})

it('changes the selected variant on click', async () => {
  let listVariant: VariantType = 'default'
  let callCount = 0
  const setListVariant = (newVariant: VariantType) => {
    listVariant = newVariant
    callCount++
  }
  const {user} = renderDensityToggle({listVariant, setListVariant})

  const compactView = await screen.findByLabelText('Compact display density')
  await user.click(compactView)

  expect(callCount).toBe(1)
  expect(listVariant).toBe('compact')
})

it('saves selected density variant in the session', async () => {
  window.localStorage.clear()
  let listVariant: VariantType = 'default'
  const DENSITY_VARIANT = 'DENSITY_VARIANT'

  const setListVariant = (newVariant: VariantType) => {
    listVariant = newVariant
  }

  const {user} = renderDensityToggle({listVariant, setListVariant, localStorageVariantKey: DENSITY_VARIANT})

  expect(window.localStorage).not.toContain('DENSITY_VARIANT')

  const compactView = await screen.findByLabelText('Compact display density')
  await user.click(compactView)

  expect(window.localStorage['DENSITY_VARIANT']).toBe('1')

  const defaultView = await screen.findByLabelText('Comfortable display density')
  await user.click(defaultView)

  expect(window.localStorage['DENSITY_VARIANT']).toBe('0')
})

it('applies custom styling and defaults to size medium', () => {
  renderDensityToggle({sx: {color: '#00ff00'}})

  const densityToggle = screen.getByTestId('density-toggle')
  expect(densityToggle).toHaveStyle('color: #00ff00') // custom styling
  expect(densityToggle).toHaveStyle('height: 32px') // default size=medium
})

it('respects given segmented control size', () => {
  renderDensityToggle({size: 'small'})

  const densityToggle = screen.getByTestId('density-toggle')
  expect(densityToggle).toHaveStyle('height: 28px') // size=small
})

it('triggers given onChange handler when selection changes', async () => {
  const onChange = jest.fn()

  const {user} = renderDensityToggle({onChange})

  expect(onChange).not.toHaveBeenCalled() // just rendering shouldn't trigger it
  const densityToggle = screen.getByTestId('density-toggle')

  const compactView = within(densityToggle).getByLabelText('Compact display density')
  await user.click(compactView)

  expect(onChange).toHaveBeenCalledTimes(1)

  const comfortableView = within(densityToggle).getByLabelText('Comfortable display density')
  await user.click(comfortableView)

  expect(onChange).toHaveBeenCalledTimes(2)
})

type RenderDensityToggleProps = ListViewDensityToggleProps & {
  listTitle?: string
  listVariant?: VariantType
  setListVariant?: (variant: VariantType) => void
}

function renderDensityToggle({
  listTitle = 'Test list',
  listVariant,
  setListVariant = noop,
  ...props
}: RenderDensityToggleProps) {
  return render(
    <TitleProvider title={listTitle}>
      <VariantProvider variant={listVariant} setVariant={setListVariant}>
        <ListViewDensityToggle {...props} />
      </VariantProvider>
    </TitleProvider>,
  )
}
