import {HeartFillIcon} from '@primer/octicons-react'
import {render, screen} from '@testing-library/react'

import {CommandIconButton} from '../components/CommandIconButton'
import {GlobalCommands} from '../components/GlobalCommands'
import {ScopedCommands} from '../ui-commands'

describe('CommandIconButton', () => {
  it('renders a button with the command name as its label by default', () => {
    render(<CommandIconButton commandId="ui-commands:test-chord" icon={HeartFillIcon} />)
    expect(screen.getByRole('button', {name: 'Test chord'})).toBeInTheDocument()
  })

  it('allows overriding the button label', () => {
    render(<CommandIconButton commandId="ui-commands:test-chord" icon={HeartFillIcon} aria-label="Overridden Label" />)
    expect(screen.getByRole('button', {name: 'Overridden Label'})).toBeInTheDocument()
  })

  it('triggers scoped command when clicked', () => {
    const handler = jest.fn()
    render(
      <ScopedCommands commands={{'ui-commands:test-chord': handler}}>
        <CommandIconButton commandId="ui-commands:test-chord" icon={HeartFillIcon} />
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
        <CommandIconButton commandId="ui-commands:test-chord" icon={HeartFillIcon} />
      </>,
    )

    const button = screen.getByRole('button', {name: 'Test chord'})
    button.click()

    expect(handler).toHaveBeenCalled()
  })

  it('renders nothing for flagged command behind disabled flag', () => {
    render(<CommandIconButton commandId="ui-commands:flagged-command" icon={HeartFillIcon} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
