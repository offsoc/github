import type {CommandPalette} from '@github-ui/command-palette'
import {render} from '@testing-library/react'

import {CommandProvider} from '../../../client/commands/command-provider'

describe('CommandProvider', () => {
  beforeEach(() => {
    window.commandPalette = undefined
  })

  it('registers commands in effect when global is present', () => {
    const registerProvider = jest.fn()

    const mockPalette: CommandPalette = {
      autocomplete: jest.fn(),
      clearCommands: jest.fn(),
      dismiss: jest.fn(),
      pushPage: jest.fn(),
      registerProvider,
    }

    window.commandPalette = mockPalette

    render(<CommandProvider />, {
      wrapper: ({children}) => <>{children}</>,
    })

    expect(registerProvider).toHaveBeenCalled()
  })

  it('registers commands in effect when global event is raised', () => {
    const registerProvider = jest.fn()

    const mockPalette: CommandPalette = {
      autocomplete: jest.fn(),
      clearCommands: jest.fn(),
      dismiss: jest.fn(),
      pushPage: jest.fn(),
      registerProvider,
    }

    render(<CommandProvider />, {
      wrapper: ({children}) => <>{children}</>,
    })

    expect(registerProvider).not.toHaveBeenCalled()

    // assign global after initially rendering component
    window.commandPalette = mockPalette

    // propagate expected event to document
    const event = new Event('command-palette-ready', {
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(event)

    // assert that the right method was invoked to perform setup
    expect(registerProvider).toHaveBeenCalled()
  })
})
