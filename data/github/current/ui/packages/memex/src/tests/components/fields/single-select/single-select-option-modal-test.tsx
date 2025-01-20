import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {SingleSelectOptionModal} from '../../../../client/components/fields/single-select/single-select-option-modal'

const initialOption = {
  id: 'id-0',
  name: 'Initial name',
  nameHtml: 'Initial name',
  color: 'GREEN',
  description: 'Initial description',
} as const

const renderModal = () => {
  const saveMock = jest.fn()
  const cancelMock = jest.fn()

  const view = render(<SingleSelectOptionModal initialOption={initialOption} onSave={saveMock} onCancel={cancelMock} />)

  const user = userEvent.setup()

  const getPreview = () => screen.getByRole('figure')
  const getNameInput = () => screen.getByRole('textbox', {name: content => content.startsWith('Label text')})
  const getDescriptionInput = () => screen.getByRole('textbox', {name: 'Description'})
  const getSaveButton = () => screen.getByRole('button', {name: 'Save'})

  return {
    ...view,
    user,
    saveMock,
    cancelMock,
    getPreview,
    getNameInput,
    getDescriptionInput,
    getSaveButton,
  }
}

describe('SingleSelectOptionModal', () => {
  it('renders a named modal', () => {
    renderModal()
    expect(screen.getByRole('dialog', {name: 'Edit option'})).toBeInTheDocument()
  })

  it('cancels on close', async () => {
    const {cancelMock, user} = renderModal()
    await user.click(screen.getByRole('button', {name: 'Close'}))
    expect(cancelMock).toHaveBeenCalled()
  })

  it('cancels on Cancel click', async () => {
    const {cancelMock, user} = renderModal()
    await user.click(screen.getByRole('button', {name: 'Cancel'}))
    expect(cancelMock).toHaveBeenCalled()
  })

  it('renders a live preview', async () => {
    const {user, getPreview, getNameInput} = renderModal()
    expect(getPreview()).toHaveTextContent(initialOption.name)

    await user.type(getNameInput(), ' changed')
    expect(getPreview()).toHaveTextContent(`${initialOption.name} changed`)
  })

  it('saves on Save click', async () => {
    const {saveMock, user, getNameInput, getSaveButton} = renderModal()
    await user.type(getNameInput(), ' changed')
    await user.click(getSaveButton())
    expect(saveMock).toHaveBeenCalledWith({
      name: `${initialOption.name} changed`,
      color: initialOption.color,
      description: initialOption.description,
    })
  })

  it('fails to save if name is empty', async () => {
    const {saveMock, user, getNameInput, getSaveButton} = renderModal()
    const input = getNameInput()

    await user.clear(input)
    await user.type(input, ' ')
    await user.click(getSaveButton())

    expect(saveMock).not.toHaveBeenCalled()

    expect(input).toBeInvalid()
    expect(input).toHaveAccessibleDescription('Label text is required')
  })

  it('updates color on save', async () => {
    const {saveMock, user} = renderModal()

    await user.click(screen.getByRole('radio', {name: 'Red'}))
    await user.click(screen.getByRole('button', {name: 'Save'}))

    expect(saveMock).toHaveBeenCalledWith({
      name: initialOption.name,
      description: initialOption.description,
      color: 'RED',
    })
  })

  it('updates the description on save', async () => {
    const {saveMock, user, getDescriptionInput, getSaveButton} = renderModal()
    await user.type(getDescriptionInput(), ' new text')
    await user.click(getSaveButton())
    expect(saveMock).toHaveBeenCalledWith({
      name: initialOption.name,
      color: initialOption.color,
      description: `${initialOption.description} new text`,
    })
  })
})
