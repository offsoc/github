import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {getAllRegisteredCommands} from '../commands-registry'
import {GlobalCommands} from '../components/GlobalCommands'
import {ScopedCommands} from '../components/ScopedCommands'
import {
  chordCommand,
  conflictingChordCommand,
  expectEventObject,
  flaggedCommand,
  mockHandler,
  sequenceCommand,
} from './__fixtures__/commands'
import {withDisabledCharacterKeys} from './utils'

const sendEventMock = jest.fn()
const isFeatureEnabledMock = jest.fn().mockReturnValue(true)

jest.mock('@github/hydro-analytics-client', () => ({
  AnalyticsClient: class AnalyticsClient {
    sendEvent(...args: unknown[]) {
      sendEventMock(...args)
    }
  },
}))

jest.mock('@github-ui/feature-flags', () => ({
  isFeatureEnabled(...args: unknown[]) {
    return isFeatureEnabledMock(...args)
  },
}))

describe('GlobalCommands', () => {
  beforeEach(() => {
    sendEventMock.mockReset()
  })

  it('fires commands when triggered', async () => {
    const handler = mockHandler()
    render(<GlobalCommands commands={{[chordCommand.id]: handler}} />)

    await chordCommand.fire()

    expect(handler).toHaveBeenCalledWith(expectEventObject(chordCommand))
  })

  it('works with sequences', async () => {
    const handler = mockHandler()
    render(<GlobalCommands commands={{[sequenceCommand.id]: handler}} />)

    await sequenceCommand.fire()

    expect(handler).toHaveBeenCalledWith(expectEventObject(sequenceCommand))
  })

  it('does not fire single character key commands when disabled', () =>
    withDisabledCharacterKeys(async () => {
      const handler = mockHandler()
      render(<GlobalCommands commands={{[sequenceCommand.id]: handler}} />)

      await sequenceCommand.fire()

      expect(handler).not.toHaveBeenCalled()
    }))

  it('does not fire sequences when there is a long delay between presses', async () => {
    jest.useFakeTimers()

    const handler = mockHandler()
    const {user} = render(<GlobalCommands commands={{[sequenceCommand.id]: handler}} />)

    await user.keyboard('g')
    jest.advanceTimersByTime(10_000)
    await user.keyboard('q')

    expect(handler).not.toHaveBeenCalled()
  })

  it("fires non-sequence commands at the end of a sequence that doesn't match a command", async () => {
    const handler = mockHandler()
    const {user} = render(<GlobalCommands commands={{[chordCommand.id]: handler}} />)

    await user.keyboard('g')
    await chordCommand.fire()

    expect(handler).toHaveBeenCalledWith(expectEventObject(chordCommand))
  })

  it('does not fire single character key commands when focus is in a form field', async () => {
    const handler = mockHandler()
    render(
      <>
        <GlobalCommands commands={{[sequenceCommand.id]: handler}} />
        <textarea />
      </>,
    )

    screen.getByRole('textbox').focus()
    await sequenceCommand.fire()

    expect(handler).not.toHaveBeenCalled()
  })

  it('fires chord commands when focus is in a form field', async () => {
    const handler = mockHandler()
    render(
      <>
        <GlobalCommands commands={{[chordCommand.id]: handler}} />
        <textarea />
      </>,
    )

    screen.getByRole('textbox').focus()
    await chordCommand.fire()

    expect(handler).toHaveBeenCalled()
  })

  it('does not fire a handled scoped command', async () => {
    const globalHandler = mockHandler()
    const innerHandler = mockHandler()
    render(
      <>
        <GlobalCommands commands={{[chordCommand.id]: globalHandler}} />
        <ScopedCommands commands={{[chordCommand.id]: innerHandler}}>
          <textarea />
        </ScopedCommands>
      </>,
    )

    screen.getByRole('textbox').focus()
    await chordCommand.fire()

    expect(innerHandler).toHaveBeenCalledWith(expectEventObject(chordCommand))
    expect(globalHandler).not.toHaveBeenCalled()
  })

  it('does not fire twice if rendered twice (stops propagation)', async () => {
    jest.useFakeTimers()

    const handler = mockHandler()
    render(
      <>
        <GlobalCommands commands={{[chordCommand.id]: handler}} />
        <GlobalCommands commands={{[chordCommand.id]: handler}} />
      </>,
    )

    await chordCommand.fire()

    expect(handler).toHaveBeenCalledWith(expectEventObject(chordCommand))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('detaches the listener on dismount', async () => {
    const handler = mockHandler()
    const {unmount} = render(<GlobalCommands commands={{[chordCommand.id]: handler}} />)

    unmount()
    await chordCommand.fire()

    expect(handler).not.toHaveBeenCalled()
  })

  it('warns if commands are registered with conflicting keybindings', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <>
        <GlobalCommands commands={{[chordCommand.id]: jest.fn()}} />
        <GlobalCommands commands={{[conflictingChordCommand.id]: jest.fn()}} />
      </>,
    )

    expect(warn).toHaveBeenNthCalledWith(
      1,
      'The keybinding (Control+Shift+Enter) for the "ui-commands:conflicting-chord" command conflicts with the keybinding for the already-registered command(s) "ui-commands:test-chord". This may result in unpredictable behavior.',
    )

    // the result of triggering a conflicting command is intentionally left undefined and untested
  })

  it('does not warn if the same command is rendered twice', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <>
        <GlobalCommands commands={{[chordCommand.id]: jest.fn()}} />
        <GlobalCommands commands={{[chordCommand.id]: jest.fn()}} />
      </>,
    )

    expect(warn).not.toHaveBeenCalled()
  })

  it('records metrics for executed commands', async () => {
    render(<GlobalCommands commands={{[chordCommand.id]: jest.fn()}} />)
    await chordCommand.fire()

    expect(sendEventMock).toHaveBeenCalledWith('command.trigger', {
      // eslint-disable-next-line camelcase
      command_id: chordCommand.id,
      // eslint-disable-next-line camelcase
      trigger_type: 'keybinding',
      // eslint-disable-next-line camelcase
      target_element_html: expect.stringMatching(/^<body.*>$/),
      keybinding: 'Control+Shift+Enter',
    })
  })

  it('binds flagged command when feature is enabled', async () => {
    isFeatureEnabledMock.mockReturnValueOnce(true)

    const handler = mockHandler()
    render(<GlobalCommands commands={{[flaggedCommand.id]: handler}} />)

    await flaggedCommand.fire()

    expect(handler).toHaveBeenCalledWith(expectEventObject(flaggedCommand))
  })

  it('does not bind flagged command when feature is disabled', async () => {
    isFeatureEnabledMock.mockReturnValueOnce(false)

    const handler = mockHandler()
    render(<GlobalCommands commands={{[flaggedCommand.id]: handler}} />)

    await flaggedCommand.fire()

    expect(handler).not.toHaveBeenCalled()
  })

  it('records commands in the global registry', () => {
    const {unmount} = render(<GlobalCommands commands={{[chordCommand.id]: jest.fn()}} />)

    expect(getAllRegisteredCommands()[0]?.commands.filter(c => c.id === chordCommand.id)).toBeTruthy()

    unmount()

    expect(getAllRegisteredCommands()[0]?.commands.filter(c => c.id === chordCommand.id)).toBeFalsy()
  })
})
