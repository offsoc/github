import type {Meta} from '@storybook/react'
import {ControlGroup} from '../ControlGroup'

const meta = {
  title: 'Recipes/ControlGroup',
  component: ControlGroup,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof ControlGroup>

export default meta

export const DefaultExample = {
  name: 'Default',
  render: () => (
    <ControlGroup>
      {/* Simple item */}
      <ControlGroup.Item>
        <ControlGroup.Title id="toggle">Toggle switch item</ControlGroup.Title>
        <ControlGroup.Description>This is an optional short description</ControlGroup.Description>
        <ControlGroup.ToggleSwitch aria-labelledby="toggle" />
      </ControlGroup.Item>

      {/* Link item */}
      <ControlGroup.LinkItem href="#">
        <ControlGroup.Title>Link item</ControlGroup.Title>
        <ControlGroup.Description>This is an optional short description</ControlGroup.Description>
      </ControlGroup.LinkItem>
    </ControlGroup>
  ),
}
