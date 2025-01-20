import type {Meta} from '@storybook/react'
import {SharedPicker, type SharedPickerProps} from './SharedPicker'
import {MarkGithubIcon} from '@primer/octicons-react'

const meta = {
  title: 'ItemPicker/SharedPicker',
  // @ts-expect-error LegacyRef is accepted by component not allowed
  component: SharedPicker,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<SharedPickerProps>

export default meta

const defaultArgs = {
  anchorText: 'label',
  sharedPickerMainValue: <>Main value</>,
  leadingIconElement: <MarkGithubIcon />,
  nested: false,
} satisfies SharedPickerProps

export const Example = {
  args: {...defaultArgs},
}
