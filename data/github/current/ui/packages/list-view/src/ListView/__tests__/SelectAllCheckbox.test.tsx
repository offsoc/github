import {announceFromElement} from '@github-ui/aria-live'
import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'

import {MultiPageSelectionProvider, type MultiPageSelectionProviderProps} from '../MultiPageSelectionContext'
import {ListViewSelectAllCheckbox} from '../SelectAllCheckbox'
import {SelectionProvider, type SelectionProviderProps} from '../SelectionContext'
import {TitleProvider, type TitleProviderProps} from '../TitleContext'

jest.mock('@github-ui/aria-live', () => ({
  announceFromElement: jest.fn(),
}))

const mockOnToggle = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

it('renders selected count when multiple list items are selected', async () => {
  renderSelectAllCheckbox({
    selectedCount: 2,
    pluralUnits: 'geese',
    countOnPage: 30,
    totalCount: 100,
    title: 'My nice list view',
  })

  const selectAllContainer = await screen.findByTestId('list-view-select-all-container')
  expect(selectAllContainer).toBeInTheDocument()

  const selectAllCheckbox = await screen.findByRole('checkbox', {name: 'Select all geese: My nice list view'})
  expect(selectAllCheckbox).toBeInTheDocument()
  expect(selectAllCheckbox).toBePartiallyChecked()

  const checkboxId = selectAllCheckbox.id
  expect(checkboxId.length).toBeGreaterThan(0)

  const selectAllLabel = await screen.findByTestId('select-all-label')
  expect(selectAllLabel).toBeInTheDocument()
  expect(selectAllLabel.textContent).toBe('Select all geese: My nice list view')
  expect(selectAllLabel.getAttribute('for')).toBe(checkboxId)

  const selectedCountContainer = await screen.findByTestId('select-all-selected-count')
  expect(selectedCountContainer).toBeInTheDocument()
  expect(within(selectedCountContainer).getByTestId('select-all-selected-count-without-units').textContent).toBe(
    '2 of 100 selected ',
  )
  expect(within(selectedCountContainer).getByText('2 geese of 100 selected', {selector: 'span'})).toBeInTheDocument()
})

it('renders selected count when a single list item is selected', async () => {
  renderSelectAllCheckbox({
    selectedCount: 1,
    singularUnits: 'house cat',
    pluralUnits: 'house cats',
    countOnPage: 30,
    totalCount: 100,
    title: 'Pets',
  })

  const selectAllLabel = await screen.findByTestId('select-all-label')
  expect(selectAllLabel).toBeInTheDocument()
  expect(selectAllLabel.textContent).toBe('Select all house cats: Pets')

  const selectedCountContainer = await screen.findByTestId('select-all-selected-count')
  expect(within(selectedCountContainer).getByTestId('select-all-selected-count-without-units').textContent).toBe(
    '1 of 100 selected ',
  )
  expect(
    within(selectedCountContainer).getByText('1 house cat of 100 selected', {selector: 'span'}),
  ).toBeInTheDocument()
})

it('renders a partially checked checkbox when multiple pages can be selected and not all pages of results are selected', async () => {
  renderSelectAllCheckbox({selectedCount: 99, countOnPage: 30, totalCount: 100, multiPageSelectionAllowed: true})

  const selectAllCheckbox = await screen.findByRole('checkbox', {name: 'Select all list items: My test list'})
  expect(selectAllCheckbox).toBeInTheDocument()
  expect(selectAllCheckbox).toBePartiallyChecked()
})

it('renders an unchecked checkbox when multiple pages can be selected and no results are selected', async () => {
  renderSelectAllCheckbox({selectedCount: 0, countOnPage: 30, totalCount: 100, multiPageSelectionAllowed: true})

  const selectAllCheckbox = await screen.findByRole('checkbox', {name: 'Select all list items: My test list'})
  expect(selectAllCheckbox).toBeInTheDocument()
  expect(selectAllCheckbox).not.toBeChecked()
})

it('renders a checked checkbox when multiple pages can be selected and all pages of results are selected', async () => {
  renderSelectAllCheckbox({selectedCount: 100, countOnPage: 30, totalCount: 100, multiPageSelectionAllowed: true})

  const selectAllCheckbox = await screen.findByRole('checkbox', {name: 'Select all list items: My test list'})
  expect(selectAllCheckbox).toBeInTheDocument()
  expect(selectAllCheckbox).toBeChecked()
})

it('renders a fully checked checkbox when all items on the page are checked', async () => {
  renderSelectAllCheckbox({selectedCount: 30, countOnPage: 30, totalCount: 100})

  const selectAllCheckbox = await screen.findByRole('checkbox', {name: 'Select all list items: My test list'})
  expect(selectAllCheckbox).toBeInTheDocument()
  expect(selectAllCheckbox).toBeChecked()
})

it('renders a fully unchecked checkbox when no items on the page are checked', async () => {
  renderSelectAllCheckbox({selectedCount: 0, countOnPage: 30, totalCount: 100})

  const selectAllCheckbox = await screen.findByRole('checkbox', {name: 'Select all list items: My test list'})
  expect(selectAllCheckbox).toBeInTheDocument()
  expect(selectAllCheckbox).not.toBeChecked()

  const selectedCountContainer = await screen.findByTestId('select-all-selected-count')
  expect(selectedCountContainer).toBeInTheDocument()
  expect(within(selectedCountContainer).getByTestId('select-all-selected-count-without-units').textContent).toBe(
    '0 of 100 selected ',
  )
  expect(
    within(selectedCountContainer).getByText('0 list items of 100 selected', {selector: 'span'}),
  ).toBeInTheDocument()
})

it('does not render when isSelectable=false', () => {
  renderSelectAllCheckbox({isSelectable: false})
  expect(screen.queryByTestId('list-view-select-all-container')).not.toBeInTheDocument()
})

it('announces via screen reader when all items on the page are checked', async () => {
  renderSelectAllCheckbox({selectedCount: 30, countOnPage: 30, totalCount: 100})

  const selectAllCheckbox = await screen.findByRole('checkbox', {name: 'Select all list items: My test list'})
  expect(selectAllCheckbox).toBeInTheDocument()
  expect(selectAllCheckbox).toBeChecked()

  const srContent = await screen.findByTestId('sr-content')

  expect(srContent).toHaveTextContent('30 list items of 100 selected')
  expect(announceFromElement).toHaveBeenCalled()
  expect(announceFromElement).toHaveBeenCalledWith(srContent)
})

it('toggles all items on the page when the checkbox is clicked', async () => {
  renderSelectAllCheckbox({selectedCount: 0, countOnPage: 30, totalCount: 100})

  const selectAllCheckbox = await screen.findByRole('checkbox', {name: 'Select all list items: My test list'})
  expect(selectAllCheckbox).toBeInTheDocument()
  expect(selectAllCheckbox).not.toBeChecked()

  selectAllCheckbox.click()
  expect(mockOnToggle).toHaveBeenCalledWith(true)
})

it('toggles all items on the page when the checkbox is clicked and some items are already selected', async () => {
  renderSelectAllCheckbox({selectedCount: 15, countOnPage: 30, totalCount: 100})

  const selectAllCheckbox = await screen.findByRole('checkbox', {name: 'Select all list items: My test list'})
  expect(selectAllCheckbox).toBeInTheDocument()
  expect(selectAllCheckbox).not.toBeChecked()

  selectAllCheckbox.click()
  expect(mockOnToggle).toHaveBeenCalledWith(false)
})

it('toggles all items on the page when the checkbox is clicked and all items are already selected', async () => {
  renderSelectAllCheckbox({selectedCount: 100, countOnPage: 30, totalCount: 100})

  const selectAllCheckbox = await screen.findByRole('checkbox', {name: 'Select all list items: My test list'})
  expect(selectAllCheckbox).toBeInTheDocument()
  expect(selectAllCheckbox).toBeChecked()

  selectAllCheckbox.click()
  expect(mockOnToggle).toHaveBeenCalledWith(false)
})

it('toggles all items using keyboard when the checkbox is focused and the space key is pressed', async () => {
  const {user} = renderSelectAllCheckbox({selectedCount: 0, countOnPage: 30, totalCount: 100})

  const selectAllCheckbox = await screen.findByRole('checkbox', {name: 'Select all list items: My test list'})
  expect(selectAllCheckbox).toBeInTheDocument()
  expect(selectAllCheckbox).not.toBeChecked()

  selectAllCheckbox.focus()
  await user.keyboard(' ')
  expect(mockOnToggle).toHaveBeenCalledWith(true)
})

it('toggles all items using keyboard when the checkbox is focused and the enter key is pressed', async () => {
  const {user} = renderSelectAllCheckbox({selectedCount: 0, countOnPage: 30, totalCount: 100})

  const selectAllCheckbox = await screen.findByRole('checkbox', {name: 'Select all list items: My test list'})
  expect(selectAllCheckbox).toBeInTheDocument()
  expect(selectAllCheckbox).not.toBeChecked()

  selectAllCheckbox.focus()
  await user.keyboard('{Enter}')
  expect(mockOnToggle).toHaveBeenCalledWith(true)
})

type RenderSelectAllCheckboxProps = Pick<SelectionProviderProps, 'totalCount' | 'singularUnits' | 'pluralUnits'> &
  Pick<TitleProviderProps, 'titleHeaderTag'> & {
    isSelectable?: SelectionProviderProps['isSelectable']
    selectedCount?: SelectionProviderProps['selectedCount']
    countOnPage?: SelectionProviderProps['countOnPage']
    title?: TitleProviderProps['title']
  } & MultiPageSelectionProviderProps

function renderSelectAllCheckbox({
  isSelectable = true,
  selectedCount = 0,
  countOnPage = 0,
  totalCount,
  title = 'My test list',
  titleHeaderTag,
  singularUnits,
  pluralUnits,
  multiPageSelectionAllowed,
}: RenderSelectAllCheckboxProps) {
  return render(
    <TitleProvider {...{title, titleHeaderTag}}>
      <SelectionProvider
        singularUnits={singularUnits}
        isSelectable={isSelectable}
        pluralUnits={pluralUnits}
        selectedCount={selectedCount}
        totalCount={totalCount}
        countOnPage={countOnPage}
      >
        <MultiPageSelectionProvider multiPageSelectionAllowed={multiPageSelectionAllowed}>
          <ListViewSelectAllCheckbox onToggle={mockOnToggle} />
        </MultiPageSelectionProvider>
      </SelectionProvider>
    </TitleProvider>,
  )
}
