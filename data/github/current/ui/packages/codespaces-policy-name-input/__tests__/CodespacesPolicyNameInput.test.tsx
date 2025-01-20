import {screen, fireEvent} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {CodespacesPolicyNameInput} from '../CodespacesPolicyNameInput'
import {getCodespacesPolicyNameInputProps} from '../test-utils/mock-data'

test('Renders the CodespacesPolicyNameInput with existing policy', () => {
  const props = getCodespacesPolicyNameInputProps()
  render(<CodespacesPolicyNameInput {...props} />)
  expect(screen.queryByTestId('codespaces-policy-name-input')).toHaveValue(props.existingPolicyName)
})

test('Renders the CodespacesPolicyNameInput without existing policy', () => {
  render(<CodespacesPolicyNameInput />)
  expect(screen.queryByTestId('codespaces-policy-name-input')).toHaveValue('')
})

test('Renders validation error when input is too short', () => {
  render(<CodespacesPolicyNameInput />)
  const input = screen.getByTestId('codespaces-policy-name-input')
  expect(screen.queryByText("Policy name can't be blank")).toBeNull()
  fireEvent.change(input, {target: {value: '1'}})
  fireEvent.change(input, {target: {value: ''}})
  expect(screen.getByTestId('codespaces-policy-name-input')).toHaveValue('')
  expect(screen.getAllByText("Policy name can't be blank")).toHaveLength(1)
})

test('Renders validation error when input is empty string', () => {
  render(<CodespacesPolicyNameInput />)
  const input = screen.getByTestId('codespaces-policy-name-input')
  expect(screen.queryByText("Policy name can't be blank")).toBeNull()
  const emptyString = '     '
  fireEvent.change(input, {target: {value: emptyString}})
  expect(screen.getByTestId('codespaces-policy-name-input')).toHaveValue(emptyString)
  expect(screen.getAllByText("Policy name can't be blank")).toHaveLength(1)
})

test('Renders validation error when input is too long', () => {
  render(<CodespacesPolicyNameInput />)
  const input = screen.getByTestId('codespaces-policy-name-input')
  const tooLong = 'a'.repeat(65)
  expect(screen.queryByText('Policy name is too long (maximum is 64 characters)')).toBeNull()
  fireEvent.change(input, {target: {value: tooLong}})
  expect(screen.getAllByText('Policy name is too long (maximum is 64 characters)')).toHaveLength(1)
})

test('Trailing whitespace does not impact input too long', () => {
  render(<CodespacesPolicyNameInput />)
  const input = screen.getByTestId('codespaces-policy-name-input')
  const tooLong = `a${' '.repeat(65)}`
  fireEvent.change(input, {target: {value: tooLong}})
  expect(screen.queryByText('Policy name is too long (maximum is 64 characters)')).toBeNull()
})

test('Accepts valid changes', () => {
  render(<CodespacesPolicyNameInput />)
  const input = screen.getByTestId('codespaces-policy-name-input')
  fireEvent.change(input, {target: {value: 'new name'}})
  expect(screen.queryByText('Policy name is too long (maximum is 64 characters)')).toBeNull()
  expect(screen.queryByText("Policy name can't be blank")).toBeNull()
})
