import {ActionList, ActionMenu, Button} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'

import {ActionMenuOverlay, MenuPortalContainer} from './PortalContainerUtils'

const meta = {
  title: 'Apps/Copilot/PortalContainerUtils',
  component: MenuPortalContainer,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof MenuPortalContainer>

export default meta

export const Standalone: StoryObj = {
  render: args => <MenuPortalContainer {...args} />,
}

export const ActionMenuOverlayExample: StoryObj = {
  render: args => (
    <>
      <MenuPortalContainer />
      <ActionMenu>
        <ActionMenu.Anchor>
          <Button>Open</Button>
        </ActionMenu.Anchor>
        <ActionMenuOverlay {...args}>
          <ActionList>
            <ActionList.Item>Item 1</ActionList.Item>
            <ActionList.Item>Item 2</ActionList.Item>
            <ActionList.Item>Item 3</ActionList.Item>
          </ActionList>
        </ActionMenuOverlay>
      </ActionMenu>
    </>
  ),
}
