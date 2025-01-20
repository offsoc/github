import type {Meta} from '@storybook/react'
import {SharedEmptyPicker, type EmptyPickerProps} from './SharedEmptyPicker'
import {MarkGithubIcon} from '@primer/octicons-react'

const meta = {
  title: 'ItemPicker/SharedEmptyPicker',
  component: SharedEmptyPicker,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<EmptyPickerProps>

export default meta

const defaultArgs = {label: 'label', leadingIcon: MarkGithubIcon, hotKey: 'k'} satisfies EmptyPickerProps

export const Example = {
  args: {...defaultArgs},
}
