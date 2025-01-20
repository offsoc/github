import {buildThread} from '@github-ui/diff-lines/test-utils'
import type {Meta, StoryObj} from '@storybook/react'

import type {GlobalMarkerNavigationProps} from './GlobalMarkerNavigation'
import {GlobalMarkerNavigation} from './GlobalMarkerNavigation'

const meta: Meta<typeof GlobalMarkerNavigation> = {
  title: 'Apps/React Shared/Conversations/GlobalMarkerNavigation',
  component: GlobalMarkerNavigation,
}

type Story = StoryObj<typeof GlobalMarkerNavigation>

export const Story = {
  args: {
    markerId: 'someThread1',
    markerNavigationImplementation: {
      incrementActiveMarker: () => {},
      decrementActiveMarker: () => {},
      filteredMarkers: [buildThread({id: 'someThread1'}), buildThread({})],
      onActivateGlobalMarkerNavigation: () => {},
      activeGlobalMarkerID: undefined,
    },
    onNavigate: () => {},
  },
  render: (args: GlobalMarkerNavigationProps) => <GlobalMarkerNavigation {...args} />,
}

export default meta
