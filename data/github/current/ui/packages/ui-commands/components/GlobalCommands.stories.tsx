import {Box, FormControl} from '@primer/react'
import type {Meta, StoryFn} from '@storybook/react'
import {useId, useState} from 'react'

import type {CommandEvent} from '../command-event'
import {CommandKeybindingHint} from './CommandKeybindingHint'
import {GlobalCommands} from './GlobalCommands'

export default {
  title: 'Utilities/ui-commands/GlobalCommands',
  component: GlobalCommands,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof GlobalCommands>

export const GlobalCommandsExample: StoryFn = () => {
  const [output, setOutput] = useState('')

  const handleCommand = (event: CommandEvent) => setOutput(JSON.stringify(event))

  const outputId = useId()

  return (
    <>
      <GlobalCommands commands={{'github:submit-form': handleCommand}} />

      <p>
        Try pressing <CommandKeybindingHint commandId="github:submit-form" format="full" /> to trigger a command.
      </p>

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
GlobalCommandsExample.storyName = 'GlobalCommands'
