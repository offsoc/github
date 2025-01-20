import {CheckIcon} from '@primer/octicons-react'
import type {StoryFn} from '@storybook/react'

import {CommandIconButton} from './CommandIconButton'
import {CommandKeybindingHint} from './CommandKeybindingHint'
import {GlobalCommands} from './GlobalCommands'

export default {
  title: 'Utilities/ui-commands/CommandIconButton',
  parameters: {},
  argTypes: {},
}

export const CommandIconButtonExample: StoryFn = () => (
  <>
    <p>
      This icon button is rendered with the <code>CommandIconButton</code> component, so its <code>aria-label</code>
      and click handler are provided automatically. The command can be triggered by clicking the button or by activating
      the <CommandKeybindingHint commandId="github:submit-form" format="full" /> keybinding.
    </p>
    <GlobalCommands commands={{'github:submit-form': () => alert('"Submit form" command triggered')}} />
    <CommandIconButton icon={CheckIcon} commandId="github:submit-form" />
  </>
)

CommandIconButtonExample.storyName = 'CommandIconButton'
