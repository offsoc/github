import type {Meta} from '@storybook/react'
import {ControlGroup} from '../ControlGroup'
import type {ComponentType} from 'react'
import {PersonIcon, VersionsIcon} from '@primer/octicons-react'
import type React from 'react'

const meta: Meta<
  | typeof ControlGroup
  | typeof ControlGroup.Item
  | typeof ControlGroup.Title
  | ComponentType<{
      titleText: string
      descriptionText: string
      controls: string
      leadingIcon: string
      titleAs: string
      value: string
      children: React.ReactNode
    }>
> = {
  title: 'Recipes/ControlGroup/Playground',
  component: ControlGroup,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    border: {
      control: {
        type: 'boolean',
      },
      table: {
        category: 'ControlGroup',
      },
    },
    nestedLevel: {
      value: 0,
      control: {
        type: 'radio',
      },
      options: [0, 1, 2],
      table: {
        category: 'ControlGroup.Item',
      },
    },
    titleText: {
      name: 'children',
      value: 'Toggle switch item with a lot longer of a description',
      control: {
        type: 'text',
      },
      table: {
        category: 'ControlGroup.Title',
      },
    },
    descriptionText: {
      name: 'children',
      value: 'This is an optional short description',
      control: {
        type: 'text',
      },
      table: {
        category: 'ControlGroup.Description',
      },
    },
    controls: {
      name: 'controls',
      options: ['ControlGroup.ToggleSwitch', 'ControlGroup.Button', 'ControlGroup.Custom', 'ControlGroup.InlineEdit'],
      control: {
        type: 'radio',
      },
      table: {
        category: 'ControlGroup',
      },
    },
    leadingIcon: {
      control: {
        type: 'select',
      },
      options: ['unset', 'VersionsIcon', 'PersonIcon'],
      table: {
        category: 'ControlGroup.LinkItem',
      },
    },
    titleAs: {
      name: 'as',
      control: {
        type: 'select',
      },
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      table: {
        category: 'ControlGroup.Title',
      },
    },
    value: {
      control: {
        type: 'text',
      },
      table: {
        category: 'ControlGroup.LinkItem',
      },
    },
  },
  args: {
    border: true,
    titleText: 'ControlGroup item title',
    descriptionText: 'This is an optional short description',
    nestedLevel: 0,
    controls: 'ControlGroup.ToggleSwitch',
    leadingIcon: 'unset',
    titleAs: 'h3',
    value: 'Value',
  },
}

export default meta

type Args = {
  controls: 'ControlGroup.ToggleSwitch' | 'ControlGroup.Button' | 'ControlGroup.Custom' | 'ControlGroup.InlineEdit'
  border: boolean
  titleText: string
  descriptionText: string
  nestedLevel: 0 | 1 | 2
  leadingIcon: 'unset' | 'VersionsIcon' | 'PersonIcon'
  titleAs: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  value: string
}

export const ControlGroupPlayground = (args: Omit<Args, 'leadingIcon' | 'value' | 'fullWidth'>) => (
  <ControlGroup border={args.border}>
    <ControlGroup.Item nestedLevel={args.nestedLevel}>
      <ControlGroup.Title id="title" as={args.titleAs}>
        {args.titleText}
      </ControlGroup.Title>
      <ControlGroup.Description>{args.descriptionText}</ControlGroup.Description>
      {args.controls === 'ControlGroup.ToggleSwitch' && <ControlGroup.ToggleSwitch aria-labelledby="title" />}
      {args.controls === 'ControlGroup.Button' && <ControlGroup.Button>Button</ControlGroup.Button>}
      {args.controls === 'ControlGroup.InlineEdit' && <ControlGroup.InlineEdit value="Value" />}
      {args.controls === 'ControlGroup.Custom' && <ControlGroup.Custom>Custom slot</ControlGroup.Custom>}
    </ControlGroup.Item>
  </ControlGroup>
)

ControlGroupPlayground.storyName = 'Item'
ControlGroupPlayground.parameters = {
  controls: {exclude: ['leadingIcon', 'value', 'fullWidth']},
}

export const LinkPlayground = (args: Omit<Args, 'controls'>) => (
  <ControlGroup border={args.border}>
    <ControlGroup.LinkItem
      href="#"
      nestedLevel={args.nestedLevel}
      value={args.value}
      leadingIcon={
        args.leadingIcon === 'VersionsIcon' ? (
          <VersionsIcon />
        ) : args.leadingIcon === 'PersonIcon' ? (
          <PersonIcon />
        ) : undefined
      }
    >
      <ControlGroup.Title>{args.titleText}</ControlGroup.Title>
      <ControlGroup.Description>{args.descriptionText}</ControlGroup.Description>
    </ControlGroup.LinkItem>
  </ControlGroup>
)

LinkPlayground.storyName = 'LinkItem'
LinkPlayground.parameters = {
  controls: {exclude: ['controls', 'fullWidth']},
}
