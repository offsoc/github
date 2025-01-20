import type {Meta} from '@storybook/react'
import {PercentageCircle} from './PercentageCircle'

type PercentageCircleProps = React.ComponentProps<typeof PercentageCircle>

const args = {
  progress: 0.66,
} satisfies PercentageCircleProps

const meta = {
  title: 'Recipes/PercentageCircle',
  component: PercentageCircle,
} satisfies Meta<typeof PercentageCircle>

export default meta

export const Example = {args}

export const Success = {args: {...args, isSuccess: true}}
