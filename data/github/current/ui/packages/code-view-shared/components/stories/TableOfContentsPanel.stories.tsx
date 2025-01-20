import type {Meta, StoryObj} from '@storybook/react'

import type {SafeHTMLString} from '@github-ui/safe-html'
import TableOfContentsPanel from '../TableOfContentsPanel'

const meta = {
  title: 'Apps/Code View Shared/TableOfContentsPanel',
  component: TableOfContentsPanel,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof TableOfContentsPanel>

export default meta

const defaultArgs = {
  onClose: () => {},
  toc: [
    {
      level: 1,
      htmlText: 'HTML Text' as SafeHTMLString,
      anchor: 'Anchor',
    },
  ],
}

type Story = StoryObj<typeof TableOfContentsPanel>

export const Default: Story = {
  render: () => <TableOfContentsPanel onClose={defaultArgs.onClose} toc={defaultArgs.toc} />,
}
