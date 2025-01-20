import type {StoryFn} from '@storybook/react'

import {CommandButton} from './CommandButton'
import {CommandKeybindingHint} from './CommandKeybindingHint'
import {GlobalCommands} from './GlobalCommands'

export default {
  title: 'Utilities/ui-commands/CommandButton',
  parameters: {},
  argTypes: {},
}

export const Default: StoryFn = () => (
  <>
    <p>
      This button is rendered with the <code>CommandButton</code> component, so its label text and click handler are
      provided automatically. The command can be triggered by clicking the button or by activating the{' '}
      <CommandKeybindingHint commandId="github:submit-form" format="full" /> keybinding.
    </p>
    <GlobalCommands commands={{'github:submit-form': () => alert('"Submit form" command triggered')}} />
    <CommandButton commandId="github:submit-form" />
  </>
)

export const WithKeybindingHint: StoryFn = () => (
  <>
    <GlobalCommands commands={{'github:submit-form': () => alert('"Submit form" command triggered')}} />
    <CommandButton commandId="github:submit-form" showKeybindingHint />
  </>
)
