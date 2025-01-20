import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  DeleteProjectDialog,
  type DeleteProjectDialogProps,
} from '../../../../client/pages/settings/components/delete-project-dialog'
import {SettingsResources} from '../../../../client/strings'

describe('DeleteProjectDialog', () => {
  let props: DeleteProjectDialogProps
  let onClose: jest.Mock
  let onConfirm: jest.Mock

  beforeEach(() => {
    onClose = jest.fn()
    // calling e.preventDefault() gets rid of console error related to HTMLFormElement.prototype.submit not being defined in jsdom
    onConfirm = jest.fn().mockImplementation(e => e.preventDefault())
    props = {projectName: 'My Project 1', draftIssueCount: 5, onClose, onConfirm}
  })

  it('should automatically focus the input', () => {
    render(<DeleteProjectDialog {...props} />)

    expect(screen.getByTestId('confirm-delete-input')).toHaveFocus()
  })

  it('should call onClose when the close button is clicked', async () => {
    render(<DeleteProjectDialog {...props} />)

    await userEvent.click(screen.getByRole('button', {name: 'Close'}))
    expect(props.onClose).toHaveBeenCalled()
  })

  it('should disable the button if the input text does not match the project name', async () => {
    render(<DeleteProjectDialog {...props} />)

    await userEvent.type(screen.getByTestId('confirm-delete-input'), 'asdf')
    expect(screen.getByRole('button', {name: SettingsResources.deleteProjectConfirmation})).toBeDisabled()
  })

  it('should trim project name for form validation', async () => {
    render(<DeleteProjectDialog {...props} projectName="Project Name      " />)

    await userEvent.type(screen.getByTestId('confirm-delete-input'), 'Project Name')
    expect(screen.getByRole('button', {name: SettingsResources.deleteProjectConfirmation})).not.toBeDisabled()
  })

  it('should call onConfirm after clicking the button if the input text matches project name', async () => {
    render(<DeleteProjectDialog {...props} />)

    await userEvent.type(screen.getByTestId('confirm-delete-input'), props.projectName)

    const button = screen.getByRole('button', {name: SettingsResources.deleteProjectConfirmation})
    expect(button).toBeEnabled()

    await userEvent.click(button)
    expect(props.onConfirm).toHaveBeenCalled()
  })

  it('should call onConfirm after typing Enter if the input text matches project name', async () => {
    render(<DeleteProjectDialog {...props} />)

    await userEvent.type(screen.getByTestId('confirm-delete-input'), props.projectName)

    const button = screen.getByRole('button', {name: SettingsResources.deleteProjectConfirmation})
    expect(button).toBeEnabled()

    await userEvent.keyboard('{enter}')
    expect(props.onConfirm).toHaveBeenCalled()
  })

  it('includes draft issue count in text', () => {
    render(<DeleteProjectDialog {...props} draftIssueCount={5} />)

    // Uses textContext directly, as the text is spread out across multiple DOM nodes,
    // so queryByText() won't work.
    const textContent = document.body.textContent
    expect(textContent).toContain('5 draft issues that were created in this project')
  })

  it('does not draft issue count in text if count is 0', () => {
    render(<DeleteProjectDialog {...props} draftIssueCount={0} />)

    const textContent = document.body.textContent
    expect(textContent).not.toContain(' created in this project')
  })

  it('handles a draft issue count of 1', () => {
    render(<DeleteProjectDialog {...props} draftIssueCount={1} />)

    const textContent = document.body.textContent
    expect(textContent).toContain('1 draft issue that was created in this project')
  })
})
