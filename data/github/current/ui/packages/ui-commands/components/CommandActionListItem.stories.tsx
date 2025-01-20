import {ActionList} from '@primer/react'
import type {StoryFn} from '@storybook/react'

import {CommandActionListItem} from './CommandActionListItem'
import {GlobalCommands} from './GlobalCommands'

export default {
  title: 'Utilities/ui-commands/CommandActionListItem',
  parameters: {},
  argTypes: {},
}

export const CommandActionListItemExample: StoryFn = () => (
  <>
    <p>
      The second item in this list is rendered with <code>CommandActionListItem</code>, so its label text, click
      handler, and keybinding hint are all determined dynamically from the command metadata. The command can be
      triggered by clicking the item or by activating the keybinding.
    </p>
    <GlobalCommands commands={{'github:submit-form': () => alert('"Submit form" command triggered')}} />
    <ActionList>
      <ActionList.Item>Previous item</ActionList.Item>
      <CommandActionListItem commandId="github:submit-form" />
      <ActionList.Item>Next item</ActionList.Item>
    </ActionList>
  </>
)

CommandActionListItemExample.storyName = 'CommandActionListItem'
