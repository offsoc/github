import {ActionList} from '@primer/react'
import {render, screen, within} from '@testing-library/react'

import {CommandActionListItem} from '../components/CommandActionListItem'
import {GlobalCommands} from '../components/GlobalCommands'
import {ScopedCommands} from '../ui-commands'

describe('CommandActionListItem', () => {
  it('renders a listitem with the command name as its label by default', () => {
    render(
      <ActionList>
        <CommandActionListItem commandId="ui-commands:test-chord" />
      </ActionList>,
    )
    expect(screen.getByRole('listitem', {name: /^Test chord/})).toBeInTheDocument()
  })

  it('allows overriding the label', () => {
    render(
      <ActionList>
        <CommandActionListItem commandId="ui-commands:test-chord">Overridden Label</CommandActionListItem>
      </ActionList>,
    )
    expect(screen.getByRole('listitem', {name: /^Overridden Label/})).toBeInTheDocument()
  })

  it('triggers scoped command when clicked', () => {
    const handler = jest.fn()
    render(
      <ScopedCommands commands={{'ui-commands:test-chord': handler}}>
        <ActionList>
          <CommandActionListItem commandId="ui-commands:test-chord" />
        </ActionList>
      </ScopedCommands>,
    )

    const listitem = screen.getByRole('listitem', {name: /^Test chord/})
    listitem.click()

    expect(handler).toHaveBeenCalled()
  })

  it('triggers global command when clicked', () => {
    const handler = jest.fn()
    render(
      <>
        <GlobalCommands commands={{'ui-commands:test-chord': handler}} />
        <ActionList>
          <CommandActionListItem commandId="ui-commands:test-chord" />
        </ActionList>
      </>,
    )

    const listitem = screen.getByRole('listitem', {name: /^Test chord/})
    listitem.click()

    expect(handler).toHaveBeenCalled()
  })

  it('renders nothing for flagged command behind disabled flag', () => {
    render(
      <ActionList>
        <CommandActionListItem commandId="ui-commands:flagged-command" />
      </ActionList>,
    )
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('renders keybinding hint as trailing visual by default', () => {
    render(
      <ActionList>
        <CommandActionListItem commandId="ui-commands:test-chord" />
      </ActionList>,
    )
    const listitem = screen.getByRole('listitem', {name: /^Test chord/})
    // kbd elements have no default role to query against
    // eslint-disable-next-line testing-library/no-node-access
    expect(listitem.querySelector('kbd')).toBeInTheDocument()
  })

  it('allows overriding the trailing visual', () => {
    render(
      <ActionList>
        <CommandActionListItem commandId="ui-commands:test-chord" trailingVisual="not hint" />
      </ActionList>,
    )
    const listitem = screen.getByRole('listitem', {name: /^Test chord/})
    // kbd elements have no default role to query against
    // eslint-disable-next-line testing-library/no-node-access
    expect(listitem.querySelector('kbd')).not.toBeInTheDocument()
    expect(within(listitem).getByText('not hint')).toBeInTheDocument()
  })
})
