import type {Meta, StoryFn} from '@storybook/react'

import {CommandKeybindingHint} from '../components/CommandKeybindingHint'

export default {
  title: 'Utilities/ui-commands/CommandKeybindingHint',
  component: CommandKeybindingHint,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof CommandKeybindingHint>

export const Full: StoryFn = () => <CommandKeybindingHint commandId="github:submit-form" format="full" />

export const Condensed: StoryFn = () => <CommandKeybindingHint commandId="github:submit-form" format="condensed" />
