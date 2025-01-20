import type {Meta} from '@storybook/react'
import {storyWrapper} from '@github-ui/react-core/test-utils'
import {Nav} from './Nav'

const meta = {
  title: 'Apps/React Core/Navigation Test/Nav',
  component: Nav,
  decorators: [storyWrapper()],
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof Nav>

export default meta

export const NavExample = {}
