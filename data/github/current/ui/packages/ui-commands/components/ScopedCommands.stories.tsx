import {Box, FormControl, Textarea} from '@primer/react'
import type {Meta, StoryFn} from '@storybook/react'
import {useId, useState} from 'react'

import type {CommandEvent} from '../command-event'
import {CommandKeybindingHint} from './CommandKeybindingHint'
import {ScopedCommands} from './ScopedCommands'

export default {
  title: 'Utilities/ui-commands/ScopedCommands',
  component: ScopedCommands,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof ScopedCommands>

export const ScopedCommandsExample: StoryFn = () => {
  const [output, setOutput] = useState('')

  const handleCommand = (event: CommandEvent) => setOutput(JSON.stringify(event))

  const outputId = useId()

  return (
    <>
      <ScopedCommands commands={{'github:submit-form': handleCommand}}>
        <FormControl>
          <FormControl.Label>In-scope input</FormControl.Label>
          <FormControl.Caption>
            Try focusing and pressing <CommandKeybindingHint commandId="github:submit-form" format="full" /> to trigger
            a command.
          </FormControl.Caption>
          <Textarea />
        </FormControl>
      </ScopedCommands>

      {output && (
        <FormControl id={outputId}>
          <FormControl.Label sx={{mt: 2}}>Received command event</FormControl.Label>
          <Box as="output" sx={{fontFamily: 'monospace'}} id={outputId}>
            {output}
          </Box>
        </FormControl>
      )}
    </>
  )
}
ScopedCommandsExample.storyName = 'ScopedCommands'
