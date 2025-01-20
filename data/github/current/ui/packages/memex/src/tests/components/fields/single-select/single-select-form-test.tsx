import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {SingleSelectForm} from '../../../../client/components/fields/single-select/single-select-form'
import {getInitialState} from '../../../../client/helpers/initial-state'
import type {SettingsOption} from '../../../../client/helpers/new-column'
import {Resources} from '../../../../client/strings'
import {asMockHook} from '../../../mocks/stub-utilities'

const LIMIT = 10

const renderForm = ({optionsCount = LIMIT - 1, canRemoveOption = true} = {}) => {
  const addOptionMock = jest.fn()
  const updateOptionMock = jest.fn()
  const removeOptionMock = jest.fn()

  const options: Array<SettingsOption> = []
  for (let i = 0; i < optionsCount; i++)
    options.push({id: `id-${i}`, name: i.toString(), description: `Description for ${i}`, color: 'BLUE'})

  const view = render(
    <SingleSelectForm
      onAddOption={addOptionMock}
      onRemoveOption={removeOptionMock}
      onUpdateOption={updateOptionMock}
      options={options}
      canRemoveOption={canRemoveOption}
      onDrop={noop}
    />,
  )

  const user = userEvent.setup()

  const getOptionsLimitWarning = () => screen.getByText(Resources.singleSelectOptionLimitWarning(LIMIT))

  const getOptions = () => screen.getAllByRole('listitem')

  const getEditButton = () => screen.getByTestId('single-select-item-edit-button')
  const getMoveButton = () => screen.getByTestId('single-select-item-move-button')
  const getDeleteButton = () => screen.getByTestId('single-select-item-delete-button')
  const queryDeleteButton = () => screen.queryByRole('menuitem', {name: 'Remove option'})
  const getMenuButton = (option: HTMLElement) => within(option).getByTestId('single-select-item-menu-button')

  const getAddInput = () => screen.getByRole('textbox', {name: 'Label text'})
  const getAddButton = () => screen.getByRole('button', {name: 'Add'})

  return {
    ...view,
    user,
    addOptionMock,
    updateOptionMock,
    removeOptionMock,
    getOptionsLimitWarning,
    getOptions,
    getEditButton,
    getDeleteButton,
    getAddButton,
    getAddInput,
    queryDeleteButton,
    getMenuButton,
    getMoveButton,
  }
}

jest.mock('../../../../client/helpers/initial-state')

describe('SingleSelectForm', () => {
  beforeEach(() => {
    asMockHook(getInitialState).mockReturnValue({
      projectLimits: {singleSelectColumnOptionsLimit: LIMIT} as any,
    })
  })

  it('renders options in order', () => {
    const {getOptions} = renderForm({optionsCount: 3})

    const options = getOptions()

    for (const [i, option] of options.entries()) expect(option).toHaveTextContent(i.toString())
  })

  it('renders descriptions', () => {
    const {getOptions} = renderForm({optionsCount: 3})

    const options = getOptions()

    for (const [i, option] of options.entries()) expect(option).toHaveTextContent(`Description for ${i}`)
  })

  it('opens edit modal when button clicked', async () => {
    const {user, getOptions, getEditButton, getMenuButton} = renderForm()
    await user.click(getMenuButton(getOptions()[0]))
    await user.click(getEditButton())
    expect(screen.getByRole('dialog', {name: 'Edit option'})).toBeInTheDocument()
  })

  it('opens move modal when button clicked', async () => {
    const {user, getOptions, getMenuButton, getMoveButton} = renderForm()
    await user.click(getMenuButton(getOptions()[0]))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(getMoveButton())
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('cannot submit move modal with invalid entry', async () => {
    const {user, getOptions, getMenuButton, getMoveButton} = renderForm()
    await user.click(getMenuButton(getOptions()[0]))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(getMoveButton())
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByRole('combobox', {name: /Action */i}), 'Move to row')
    expect(screen.getByRole('spinbutton', {name: /Move to row */i})).toBeDefined()
    await user.type(screen.getByTestId('drag-and-drop-move-modal-position-input'), '12')
    await user.click(screen.getByRole('button', {name: 'Move item'}))
    expect(screen.getByRole('dialog')).toBeInTheDocument() // still in the document as 12 is not a valid row input
  })

  it('updates option when edit modal submitted', async () => {
    const {user, getOptions, getMenuButton, getEditButton, updateOptionMock} = renderForm()
    await user.click(getMenuButton(getOptions()[0]))
    await user.click(getEditButton())
    await user.type(screen.getByTestId('single-select-option-text-input'), 'New name')
    await user.click(screen.getByRole('button', {name: 'Save'}))

    expect(updateOptionMock).toHaveBeenCalledWith({
      name: '0New name',
      color: 'BLUE',
      description: 'Description for 0',
      id: 'id-0',
    })
  })

  it('deletes option when delete button clicked', async () => {
    const {user, getOptions, getMenuButton, getDeleteButton, removeOptionMock} = renderForm()

    await user.click(getMenuButton(getOptions()[0]))
    await user.click(getDeleteButton())

    expect(removeOptionMock).toHaveBeenCalledWith('id-0')
  })

  it('hides delete buttons when not allowed', async () => {
    const {getOptions, queryDeleteButton, user, getMenuButton} = renderForm({canRemoveOption: false})
    await user.click(getMenuButton(getOptions()[0]))
    expect(queryDeleteButton()).not.toBeInTheDocument()
  })

  it('disables add button when "add option" empty', async () => {
    const {getAddButton, getAddInput, user} = renderForm()
    expect(getAddInput()).toHaveValue('')
    expect(getAddButton()).toBeDisabled()
    await user.type(getAddInput(), ' ')
    expect(getAddButton()).toBeDisabled()
  })

  it('adds option when "add option" clicked', async () => {
    const {getAddButton, getAddInput, user, addOptionMock} = renderForm()

    await user.type(getAddInput(), 'New option')
    expect(getAddButton()).not.toBeDisabled()

    await user.click(getAddButton())

    expect(addOptionMock).toHaveBeenCalledWith({name: 'New option', color: 'GRAY', description: ''})
    expect(getAddInput()).toHaveValue('')
  })

  it('adds option when "enter" pressed', async () => {
    const {getAddInput, user, addOptionMock} = renderForm()

    await user.type(getAddInput(), 'New option')
    await user.keyboard('{enter}')

    expect(addOptionMock).toHaveBeenCalledWith({name: 'New option', color: 'GRAY', description: ''})
    expect(getAddInput()).toHaveValue('')
  })

  it('replaces adder with warning when limit reached', () => {
    const {getOptionsLimitWarning, getOptions} = renderForm({optionsCount: LIMIT + 1})

    expect(getOptionsLimitWarning()).toBeInTheDocument()
    expect(getOptions()).toHaveLength(LIMIT)
  })
})
