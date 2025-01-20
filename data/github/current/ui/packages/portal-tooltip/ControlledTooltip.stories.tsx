import type {Meta} from '@storybook/react'
import {ControlledTooltip} from './ControlledTooltip'

type ControlledTooltipProps = React.ComponentProps<typeof ControlledTooltip>

const args = {
  open: true,
  'aria-label': 'Tooltip content',
  direction: 'se',
  align: 'left',
} satisfies ControlledTooltipProps

const meta = {
  title: 'Recipes/PortalTooltip/ControlledTooltip',
  component: ControlledTooltip,
  decorators: [
    Story => (
      <div id="__primerPortalRoot__">
        Some example text.
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ControlledTooltip>

export default meta

export const Example = {args}
