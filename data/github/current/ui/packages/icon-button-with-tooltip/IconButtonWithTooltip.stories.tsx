import type {Meta} from '@storybook/react'
import {IconButtonWithTooltip} from './IconButtonWithTooltip'
import {KebabHorizontalIcon} from '@primer/octicons-react'
import {Box} from '@primer/react'

type IconButtonWithTooltipProps = React.ComponentProps<typeof IconButtonWithTooltip>

const args = {
  icon: KebabHorizontalIcon,
  label: 'Ship it',
  tooltipDirection: 'e',
} satisfies IconButtonWithTooltipProps

const meta = {
  title: 'IconButtonWithTooltip',
  component: IconButtonWithTooltip,
} satisfies Meta<typeof IconButtonWithTooltip>

export default meta

export const Example = {
  render: () => (
    <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
      <IconButtonWithTooltip {...args} size="large" />
      <IconButtonWithTooltip {...args} size="medium" />
      <IconButtonWithTooltip {...args} size="small" />
    </Box>
  ),
}
