import type {Meta} from '@storybook/react'
import {ControlGroup} from '../ControlGroup'
import {PersonIcon} from '@primer/octicons-react'

const meta: Meta = {
  title: 'Recipes/ControlGroup/ControlGroup.LinkItem',
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
      <ControlGroup.LinkItem href="#">
        <ControlGroup.Title>Link item</ControlGroup.Title>
      </ControlGroup.LinkItem>
    </ControlGroup>
  ),
}
export const Description = {
  name: 'Description',
  render: () => (
    <ControlGroup>
      <ControlGroup.LinkItem href="#">
        <ControlGroup.Title>Link item</ControlGroup.Title>
        <ControlGroup.Description>This is a short optional description</ControlGroup.Description>
      </ControlGroup.LinkItem>
    </ControlGroup>
  ),
}
export const LeadingIcon = {
  name: 'Leading Icon',
  render: () => (
    <ControlGroup>
      <ControlGroup.LinkItem href="#" leadingIcon={<PersonIcon />}>
        <ControlGroup.Title>Link item with icon</ControlGroup.Title>
      </ControlGroup.LinkItem>
    </ControlGroup>
  ),
}
export const NoBorder = {
  name: 'No border',
  render: () => (
    <ControlGroup>
      <ControlGroup.LinkItem href="#" leadingIcon={<PersonIcon />}>
        <ControlGroup.Title>Link item with icon</ControlGroup.Title>
      </ControlGroup.LinkItem>
    </ControlGroup>
  ),
}
export const Nested = {
  name: 'Nested',
  render: () => (
    <ControlGroup>
      <ControlGroup.LinkItem href="#">
        <ControlGroup.Title>Link item with icon</ControlGroup.Title>
      </ControlGroup.LinkItem>
      <ControlGroup.LinkItem href="#" nestedLevel={1}>
        <ControlGroup.Title>Link item with icon</ControlGroup.Title>
      </ControlGroup.LinkItem>
      <ControlGroup.LinkItem href="#" nestedLevel={2}>
        <ControlGroup.Title>Link item with icon</ControlGroup.Title>
      </ControlGroup.LinkItem>
    </ControlGroup>
  ),
}
