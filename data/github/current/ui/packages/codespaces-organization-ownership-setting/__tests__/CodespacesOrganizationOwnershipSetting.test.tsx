import {screen, fireEvent, act} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {CodespacesOrganizationOwnershipSetting, USER_CONFIRM_MESSAGE} from '../CodespacesOrganizationOwnershipSetting'
import {getCodespacesOrganizationOwnershipSettingProps} from '../test-utils/mock-data'
import {mockFetch} from '@github-ui/mock-fetch'

test('Renders the CodespacesOrganizationOwnershipSetting', () => {
  const props = getCodespacesOrganizationOwnershipSettingProps()
  render(<CodespacesOrganizationOwnershipSetting {...props} />)
  expect(screen.getByTestId('codespaces-org-ownership-setting')).toHaveTextContent('Organization ownership')
})

test('Selects radio button based on props', () => {
  const props = getCodespacesOrganizationOwnershipSettingProps()
  render(<CodespacesOrganizationOwnershipSetting {...{...props, currentValue: 'user'}} />)
  expect(screen.getByTestId('user-radio-button')).toHaveAttribute('checked')
})

test('Disables form based on props', () => {
  const props = getCodespacesOrganizationOwnershipSettingProps()
  render(<CodespacesOrganizationOwnershipSetting {...{...props, disabled: true}} />)
  expect(screen.getByTestId('user-radio-button')).toHaveAttribute('disabled')
})

test('Opens warning model with correct warning text when hitting save', async () => {
  const props = getCodespacesOrganizationOwnershipSettingProps()
  render(<CodespacesOrganizationOwnershipSetting {...props} />)
  const userRadioButton = await screen.findByText('User ownership')
  fireEvent.click(userRadioButton)

  const saveButton = screen.getByTestId('save-button')
  fireEvent.click(saveButton)

  const dialog = screen.getByTestId('dialog')
  expect(dialog).toHaveTextContent(USER_CONFIRM_MESSAGE)
})

test('Handles submit', async () => {
  const props = getCodespacesOrganizationOwnershipSettingProps()
  render(<CodespacesOrganizationOwnershipSetting {...props} />)
  const userRadioButton = await screen.findByText('User ownership')
  fireEvent.click(userRadioButton)

  const saveButton = screen.getByTestId('save-button')
  fireEvent.click(saveButton)

  const submitButton = await screen.findByText('Submit')
  fireEvent.click(submitButton)
  await act(() => mockFetch.resolvePendingRequest(props.submitUrl, {message: 'Updated successfully'}))

  const component = screen.getByTestId('codespaces-org-ownership-setting')
  expect(component).toHaveTextContent('Updated successfully')
})
