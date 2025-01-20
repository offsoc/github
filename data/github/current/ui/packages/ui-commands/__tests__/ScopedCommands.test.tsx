import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'

import {getAllRegisteredCommands} from '../commands-registry'
import {ScopedCommands} from '../components/ScopedCommands'
import {
  chordCommand,
  conflictingChordCommand,
  expectEventObject,
  mockHandler,
  sequenceCommand,
} from './__fixtures__/commands'
import {withDisabledCharacterKeys} from './utils'

const sendEventMock = jest.fn()

jest.mock('@github/hydro-analytics-client', () => ({
  AnalyticsClient: class AnalyticsClient {
    sendEvent(...args: unknown[]) {
      sendEventMock(...args)
    }
  },
}))

describe('ScopedCommands', () => {
  beforeEach(() => {
    sendEventMock.mockReset()
  })

  it('fires commands when focus is inside scope', async () => {
    const handler = mockHandler()
    render(
      <ScopedCommands commands={{[chordCommand.id]: handler}}>
        <textarea />
      </ScopedCommands>,
    )

    screen.getByRole('textbox').focus()
    await chordCommand.fire()

    expect(handler).toHaveBeenCalledWith(expectEventObject(chordCommand))
  })

  it('works with sequences', async () => {
    const handler = mockHandler()
    render(
      <ScopedCommands commands={{[sequenceCommand.id]: handler}}>
        <button>Button</button>
      </ScopedCommands>,
    )

    screen.getByRole('button').focus()
    await sequenceCommand.fire()

    expect(handler).toHaveBeenCalledWith(expectEventObject(sequenceCommand))
  })

  it('does not fire commands when focus is out of scope', async () => {
    const handler = mockHandler()
    render(
      <>
        <ScopedCommands commands={{[chordCommand.id]: handler}}>...</ScopedCommands>
        <textarea />
      </>,
    )

    screen.getByRole('textbox').focus()
    await chordCommand.fire()

    expect(handler).not.toHaveBeenCalled()
  })

  it('does not fire single character key commands when disabled', () =>
    withDisabledCharacterKeys(async () => {
      const handler = mockHandler()
      render(
        <ScopedCommands commands={{[sequenceCommand.id]: handler}}>
          <button>Button</button>
        </ScopedCommands>,
      )

      screen.getByRole('button').focus()
      await sequenceCommand.fire()

      expect(handler).not.toHaveBeenCalled()
    }))

  it('does not fire single character key commands when focus is in a form field', async () => {
    const handler = mockHandler()
    render(
      <ScopedCommands commands={{[sequenceCommand.id]: handler}}>
        <textarea />
      </ScopedCommands>,
    )

    screen.getByRole('textbox').focus()
    await sequenceCommand.fire()

    expect(handler).not.toHaveBeenCalled()
  })

  it('does not fire `Enter` commands when composing', async () => {
    const handler = mockHandler()
    render(
      <ScopedCommands commands={{[chordCommand.id]: handler}}>
        <textarea />
      </ScopedCommands>,
    )

    const input = screen.getByRole('textbox')
    input.focus()
    fireEvent.compositionStart(input)
    await chordCommand.fire()
    fireEvent.compositionEnd(input)

    expect(handler).not.toHaveBeenCalled()
  })

  it('does not fire sequences when there is a long delay between presses', async () => {
    jest.useFakeTimers()

    const handler = mockHandler()
    const {user} = render(
      <ScopedCommands commands={{[sequenceCommand.id]: handler}}>
        <button>Button</button>
      </ScopedCommands>,
    )

    screen.getByRole('button').focus()
    await user.keyboard('g')
    jest.advanceTimersByTime(10_000)
    await user.keyboard('q')

    expect(handler).not.toHaveBeenCalled()
  })

  it("fires non-sequence commands at the end of a sequence that doesn't match a command", async () => {
    const handler = mockHandler()
    const {user} = render(
      <ScopedCommands commands={{[chordCommand.id]: handler}}>
        <button>Button</button>
      </ScopedCommands>,
    )

    screen.getByRole('button').focus()
    await user.keyboard('g')
    await chordCommand.fire()

    expect(handler).toHaveBeenCalledWith(expectEventObject(chordCommand))
  })

  it('stops propagation when a command is handled', async () => {
    const outerHandler = mockHandler()
    const innerHandler = mockHandler()
    render(
      <ScopedCommands commands={{[chordCommand.id]: outerHandler}}>
        <ScopedCommands commands={{[chordCommand.id]: innerHandler}}>
          <textarea />
        </ScopedCommands>
      </ScopedCommands>,
    )

    screen.getByRole('textbox').focus()
    await chordCommand.fire()

    expect(innerHandler).toHaveBeenCalledWith(expectEventObject(chordCommand))
    expect(outerHandler).not.toHaveBeenCalled()
  })

  it('allows propagation when command handler is `undefined`', async () => {
    const outerHandler = mockHandler()
    render(
      <ScopedCommands commands={{[chordCommand.id]: outerHandler}}>
        <ScopedCommands commands={{[chordCommand.id]: undefined}}>
          <textarea />
        </ScopedCommands>
      </ScopedCommands>,
    )

    screen.getByRole('textbox').focus()
    await chordCommand.fire()

    expect(outerHandler).toHaveBeenCalledWith(expectEventObject(chordCommand))
  })

  it('warns if commands are registered with conflicting keybindings', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <ScopedCommands commands={{[chordCommand.id]: jest.fn(), [conflictingChordCommand.id]: jest.fn()}}>
        <textarea />
      </ScopedCommands>,
    )

    expect(warn).toHaveBeenNthCalledWith(
      1,
      'The keybinding (Control+Shift+Enter) for the "ui-commands:conflicting-chord" command conflicts with the keybinding for the already-registered command(s) "ui-commands:test-chord". This may result in unpredictable behavior.',
    )

    // the result of triggering a conflicting command is intentionally left undefined and untested
  })

  it('records metrics for executed commands', async () => {
    render(
      <ScopedCommands commands={{[chordCommand.id]: jest.fn()}}>
        <textarea />
      </ScopedCommands>,
    )

    screen.getByRole('textbox').focus()
    await chordCommand.fire()

    expect(sendEventMock).toHaveBeenCalledWith('command.trigger', {
      // eslint-disable-next-line camelcase
      command_id: chordCommand.id,
      // eslint-disable-next-line camelcase
      trigger_type: 'keybinding',
      // eslint-disable-next-line camelcase
      target_element_html: expect.stringMatching(/^<textarea.*>$/),
      keybinding: 'Control+Shift+Enter',
    })
  })

  it('records commands in the global registry', () => {
    const {unmount} = render(
      <ScopedCommands commands={{[chordCommand.id]: jest.fn()}}>
        <textarea />
      </ScopedCommands>,
    )

    expect(getAllRegisteredCommands()[0]?.commands.filter(c => c.id === chordCommand.id)).toBeTruthy()

    unmount()

    expect(getAllRegisteredCommands()[0]?.commands.filter(c => c.id === chordCommand.id)).toBeFalsy()
  })

  it('allows overriding element type with `as`', async () => {
    const handler = mockHandler()
    render(
      <ScopedCommands commands={{[chordCommand.id]: handler}} as="label">
        Test input
        <textarea />
      </ScopedCommands>,
    )

    // expect input to be labelled by a label element
    const input = screen.getByRole('textbox', {name: 'Test input'})
    // eslint-disable-next-line testing-library/no-node-access
    expect(input.parentElement).toBeInstanceOf(HTMLLabelElement)

    input.focus()
    await chordCommand.fire()

    expect(handler).toHaveBeenCalledWith(expectEventObject(chordCommand))
  })
})
