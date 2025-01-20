import {setupUserEvent} from '@github-ui/react-core/test-utils'

import type {CommandId} from '../../commands'

const userEvent = setupUserEvent()

export const chordCommand = {
  id: 'ui-commands:test-chord',
  async fire() {
    await userEvent.keyboard('{Control>}{Shift>}{Enter}{/Shift}{/Control}')
  },
} as const
export const sequenceCommand = {
  id: 'ui-commands:test-sequence',
  async fire() {
    await userEvent.keyboard('g')
    await userEvent.keyboard('q')
  },
} as const
export const conflictingChordCommand = {
  id: 'ui-commands:conflicting-chord',
  // eslint-disable-next-line @typescript-eslint/unbound-method
  fire: chordCommand.fire,
} as const
export const flaggedCommand = {
  id: 'ui-commands:flagged-command',
  async fire() {
    await userEvent.keyboard('a')
  },
} as const

export const mockHandler = () => jest.fn()
export const expectEventObject = ({id}: {id: CommandId}) => expect.objectContaining({commandId: id})
