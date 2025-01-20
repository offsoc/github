import type {Meta} from '@storybook/react'
import {ValidationErrorPopover} from './ValidationErrorPopover'
import {Box} from '@primer/react'

type ValidationErrorPopoverProps = React.ComponentProps<typeof ValidationErrorPopover>

const args = {
  id: 'example_popover',
  message: 'This is an example error message',
} satisfies ValidationErrorPopoverProps

const meta = {
  title: 'Recipes/ValidationErrorPopover',
  component: ValidationErrorPopover,
  decorators: [
    Story => (
      <Box sx={{position: 'relative'}}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ValidationErrorPopover>

export default meta

export const Example = {args}
