import type {Meta} from '@storybook/react'
import {ControlGroup} from '../ControlGroup'
import {SegmentedControl, Text} from '@primer/react'
import ActionMenuItem from './ActionMenuExample'

const meta: Meta = {
  title: 'Recipes/ControlGroup/ControlGroup.Item',
  tags: ['autodocs'],
  component: ControlGroup,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
    options: {
      order: ['Docs', '*'],
    },
  },
}

export default meta

export const Default = {
  name: 'Default',
  render: () => (
    <ControlGroup>
      <ControlGroup.Item>
        <ControlGroup.Title id="toggle">Toggle switch item</ControlGroup.Title>
        <ControlGroup.ToggleSwitch aria-labelledby="toggle" />
      </ControlGroup.Item>
    </ControlGroup>
  ),
}
export const Description = {
  name: 'Description',
  render: () => (
    <ControlGroup>
      <ControlGroup.Item>
        <ControlGroup.Title id="toggle">Toggle switch item</ControlGroup.Title>
        <ControlGroup.Description>This is a short optional description</ControlGroup.Description>
        <ControlGroup.ToggleSwitch aria-labelledby="toggle" />
      </ControlGroup.Item>
    </ControlGroup>
  ),
}
export const ToggleSwitch = {
  name: 'Type: ToggleSwitch',
  render: () => (
    <ControlGroup>
      <ControlGroup.Item>
        <ControlGroup.Title id="toggle">Toggle switch item</ControlGroup.Title>
        <ControlGroup.ToggleSwitch aria-labelledby="toggle" />
      </ControlGroup.Item>
    </ControlGroup>
  ),
}
export const ActionMenu = {
  name: 'Type: Custom (ActionMenu)',
  render: () => (
    <ControlGroup>
      <ControlGroup.Item>
        <ControlGroup.Title>Action Menu item</ControlGroup.Title>
        <ControlGroup.Custom>
          <ActionMenuItem />
        </ControlGroup.Custom>
      </ControlGroup.Item>
    </ControlGroup>
  ),
}
export const Button = {
  name: 'Type: Button',
  render: () => (
    <ControlGroup>
      <ControlGroup.Item>
        <ControlGroup.Title>Button item</ControlGroup.Title>
        <ControlGroup.Button>Button</ControlGroup.Button>
      </ControlGroup.Item>
    </ControlGroup>
  ),
}
export const Segmented = {
  name: 'Type: Custom (Segmented)',
  render: () => (
    <ControlGroup>
      <ControlGroup.Item>
        <ControlGroup.Title>Segmented control item</ControlGroup.Title>
        <ControlGroup.Custom>
          <SegmentedControl size="small" aria-label="Choices">
            <SegmentedControl.Button>Choice 1</SegmentedControl.Button>
            <SegmentedControl.Button>Choice 2</SegmentedControl.Button>
          </SegmentedControl>
        </ControlGroup.Custom>
      </ControlGroup.Item>
    </ControlGroup>
  ),
}
export const InlineEdit = {
  name: 'Type: InlineEdit',
  render: () => (
    <ControlGroup>
      <ControlGroup.Item>
        <ControlGroup.Title>Inline edit item</ControlGroup.Title>
        <ControlGroup.InlineEdit onClick={() => alert('Clicked button')} value="Value" />
      </ControlGroup.Item>
    </ControlGroup>
  ),
}
export const Nested = {
  name: 'Nested',
  render: () => (
    <ControlGroup>
      <ControlGroup.Item>
        <ControlGroup.Title id="toggle">Toggle switch item</ControlGroup.Title>
        <ControlGroup.ToggleSwitch aria-labelledby="toggle" />
      </ControlGroup.Item>
      <ControlGroup.Item nestedLevel={1}>
        <ControlGroup.Title id="toggle-2">Toggle switch item</ControlGroup.Title>
        <ControlGroup.ToggleSwitch aria-labelledby="toggle-2" />
      </ControlGroup.Item>
      <ControlGroup.Item nestedLevel={2}>
        <ControlGroup.Title id="toggle-3">Toggle switch item</ControlGroup.Title>
        <ControlGroup.ToggleSwitch aria-labelledby="toggle-3" />
      </ControlGroup.Item>
    </ControlGroup>
  ),
}
export const NoBorder = {
  name: 'No border',
  render: () => (
    <ControlGroup border={false}>
      <ControlGroup.Item>
        <ControlGroup.Title id="toggle">Toggle switch item</ControlGroup.Title>
        <ControlGroup.ToggleSwitch aria-labelledby="toggle" />
      </ControlGroup.Item>
    </ControlGroup>
  ),
}
export const Disabled = {
  name: 'Disabled',
  render: () => (
    <ControlGroup>
      <ControlGroup.Item disabled>
        <ControlGroup.Title>Disabled item</ControlGroup.Title>
        <ControlGroup.Description>This is an optional short description</ControlGroup.Description>
        <ControlGroup.Custom>
          <Text sx={{color: 'fg.muted'}}>Not set</Text>
        </ControlGroup.Custom>
      </ControlGroup.Item>
    </ControlGroup>
  ),
}
