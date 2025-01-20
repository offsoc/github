import type {Meta} from '@storybook/react'
import {ColorPicker, type ColorPickerProps} from './ColorPicker'
import {useState} from 'react'
import type {ColorName} from '@github-ui/use-named-color'

const meta = {
  title: 'Recipes/ColorPicker',
  component: ColorPicker,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof ColorPicker>

export default meta

const defaultArgs: Partial<ColorPickerProps> = {
  label: 'Pick a color',
}

const ColorPickerWrapper = (props: ColorPickerProps) => {
  const [color, setColor] = useState<ColorName>(props.value ?? 'GRAY')

  return <ColorPicker {...props} value={color} onChange={props.onChange ?? setColor} />
}

export const ColorPickerExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: ColorPickerProps) => <ColorPickerWrapper {...args} />,
}
