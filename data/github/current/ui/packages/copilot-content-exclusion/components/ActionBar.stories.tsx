import type {Meta} from '@storybook/react'

import {Box, Button} from '@primer/react'
import {ActionBar} from './ActionBar'

const meta = {
  title: 'Apps/Copilot/ContentExclusion/ActionBar',
  component: ActionBar,
  decorators: [StoryFn => <Box sx={{maxWidth: '760px'}}>{StoryFn()}</Box>],
} satisfies Meta<typeof ActionBar>

export default meta

export const Default = () => (
  <ActionBar>
    <Button>Discard changes</Button>
    <Button variant="primary">Save</Button>
  </ActionBar>
)

export const WithDetails = () => (
  <ActionBar>
    <ActionBar.Details>Some details can go here</ActionBar.Details>

    <Button>Discard changes</Button>
    <Button variant="primary">Save</Button>
  </ActionBar>
)
