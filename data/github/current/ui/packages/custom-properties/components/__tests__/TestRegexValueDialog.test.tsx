import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {createRef} from 'react'

import {TestRegexValueDialog} from '../TestRegexValueDialog'

describe('TestRegexValueDialog', () => {
  it('focuses pattern input and does not send request if pattern invalid', async () => {
    const {user} = render(
      <TestRegexValueDialog
        onDismiss={jest.fn()}
        regexPattern="("
        regexPatternValidationError="Invalid pattern"
        onRegexPatternChange={jest.fn()}
        returnFocusRef={createRef()}
      />,
    )

    expect(screen.getByText('Invalid pattern')).toBeInTheDocument()
    await user.click(screen.getByRole('button', {name: 'Check value'}))

    expect(screen.getByLabelText('Regular expression input')).toHaveFocus()
    expectMockFetchCalledTimes('/repos/validate_regex/value', 0)
  })

  it('focuses pattern input and does not send request if pattern blank', async () => {
    const {user} = render(
      <TestRegexValueDialog
        onDismiss={jest.fn()}
        regexPattern=""
        onRegexPatternChange={jest.fn()}
        returnFocusRef={createRef()}
      />,
    )

    await user.click(screen.getByRole('button', {name: 'Check value'}))

    expect(screen.getByText('Regular expression pattern is required')).toBeInTheDocument()

    expect(screen.getByLabelText('Regular expression input')).toHaveFocus()
    expectMockFetchCalledTimes('/repos/validate_regex/value', 0)
  })

  it('focuses value input and displays error if pattern does not match', async () => {
    const {user} = render(
      <TestRegexValueDialog
        onDismiss={jest.fn()}
        regexPattern="abc"
        onRegexPatternChange={jest.fn()}
        returnFocusRef={createRef()}
      />,
    )

    mockFetch.mockRouteOnce('/repos/validate_regex/value', {valid: false})

    const testValueInput = screen.getByLabelText('Test regular expression value')

    await user.type(testValueInput, 'abc')
    await user.click(screen.getByRole('button', {name: 'Check value'}))

    expect(await screen.findByText('Value does not match pattern')).toBeInTheDocument()
    expect(testValueInput).toHaveFocus()
  })

  it('displays success message if pattern matches', async () => {
    const {user} = render(
      <TestRegexValueDialog
        onDismiss={jest.fn()}
        regexPattern="abc"
        onRegexPatternChange={jest.fn()}
        returnFocusRef={createRef()}
      />,
    )

    mockFetch.mockRouteOnce('/repos/validate_regex/value', {valid: true})

    const testValueInput = screen.getByLabelText('Test regular expression value')

    await user.type(testValueInput, 'abc')
    await user.click(screen.getByRole('button', {name: 'Check value'}))

    expect(await screen.findByText('Value matches pattern')).toBeInTheDocument()
  })

  it('checks value on enter', async () => {
    const {user} = render(
      <TestRegexValueDialog
        onDismiss={jest.fn()}
        regexPattern="abc"
        onRegexPatternChange={jest.fn()}
        returnFocusRef={createRef()}
      />,
    )

    mockFetch.mockRouteOnce('/repos/validate_regex/value', {valid: true})

    const testValueInput = screen.getByLabelText('Test regular expression value')

    await user.type(testValueInput, 'abc')
    await user.type(testValueInput, '{Enter}')

    expect(await screen.findByText('Value matches pattern')).toBeInTheDocument()
  })

  it('focuses value input and does not send request if value blank', async () => {
    const {user} = render(
      <TestRegexValueDialog
        onDismiss={jest.fn()}
        regexPattern="abc"
        onRegexPatternChange={jest.fn()}
        returnFocusRef={createRef()}
      />,
    )

    await user.click(screen.getByRole('button', {name: 'Check value'}))

    expect(screen.getByLabelText('Test regular expression value')).toHaveFocus()
    expect(await screen.findByText('Test value is required')).toBeInTheDocument()
    expectMockFetchCalledTimes('/repos/validate_regex/value', 0)
  })
})
