import type {Meta} from '@storybook/react'

import {ReactionViewerAnchor} from './ReactionViewerAnchor'

const meta = {
  title: 'ReactionViewer/ReactionViewerAnchor',
  component: ReactionViewerAnchor,
} satisfies Meta<typeof ReactionViewerAnchor>

export default meta

export const Example = {
  args: {
    renderAnchorProps: <p />,
  },
}
