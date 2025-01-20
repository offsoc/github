import {render, screen} from '@testing-library/react'

import {CommandButton} from '../components/CommandButton'
import {GlobalCommands} from '../components/GlobalCommands'
import {ScopedCommands} from '../ui-commands'

describe('CommandButton', () => {
  it('renders a button with the command name as its label by default', () => {
    render(<CommandButton commandId="ui-commands:test-chord" />)
    expect(screen.getByRole('button', {name: 'Test chord'})).toBeInTheDocument()
  })

  it('allows overriding the button label', () => {
    render(<CommandButton commandId="ui-commands:test-chord">Overridden Label</CommandButton>)
    expect(screen.getByRole('button', {name: 'Overridden Label'})).toBeInTheDocument()
  })

  it('triggers scoped command when clicked', () => {
    const handler = jest.fn()
    render(
      <ScopedCommands commands={{'ui-commands:test-chord': handler}}>
        <CommandButton commandId="ui-commands:test-chord" />
      </ScopedCommands>,
    )

    const button = screen.getByRole('button', {name: 'Test chord'})
    button.click()

    expect(handler).toHaveBeenCalled()
  })

  it('triggers global command when clicked', () => {
    const handler = jest.fn()
    render(
      <>
        <GlobalCommands commands={{'ui-commands:test-chord': handler}} />
        <CommandButton commandId="ui-commands:test-chord" />
      </>,
    )

    const button = screen.getByRole('button', {name: 'Test chord'})
    button.click()

    expect(handler).toHaveBeenCalled()
  })

  it('renders keybinding hint when enabled', () => {
    render(<CommandButton commandId="ui-commands:test-chord" showKeybindingHint />)
    expect(screen.getByRole('button', {name: 'Test chord ( control shift enter )'})).toBeVisible()
  })

  it('renders nothing for flagged command behind disabled flag', () => {
    render(<CommandButton commandId="ui-commands:flagged-command" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
