import type {Meta, StoryObj} from '@storybook/react'

import PublishBanners from '../PublishBanners'

const meta = {
  title: 'Apps/Code View Shared/PublishBanners',
  component: PublishBanners,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof PublishBanners>

export default meta

const defaultArgs = {
  dismissActionNoticePath: '/dissmiss/path',
  showPublishActionBanner: true,
  releasePath: '/test/path',
}

type Story = StoryObj<typeof PublishBanners>

export const Default: Story = {
  render: () => (
    <PublishBanners
      showPublishActionBanner={defaultArgs.showPublishActionBanner}
      releasePath={defaultArgs.releasePath}
      dismissActionNoticePath={defaultArgs.dismissActionNoticePath}
    />
  ),
}
