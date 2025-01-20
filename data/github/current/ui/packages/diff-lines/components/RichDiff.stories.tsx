import type {Meta, StoryObj} from '@storybook/react'

import {RichDiff} from './RichDiff'
import type {SafeHTMLString} from '@github-ui/safe-html'

const meta: Meta<typeof RichDiff> = {
  title: 'DiffLines/RichDiff',
  component: RichDiff,
}

type Story = StoryObj<typeof RichDiff>

const args = {
  dependencyDiffPath: undefined,
  fileRendererInfo: undefined,
  loading: false,
  proseDiffHtml: 'HTML Diff' as SafeHTMLString,
}

export const RichDiffStory: Story = {
  render: () => (
    <RichDiff
      dependencyDiffPath={args.dependencyDiffPath}
      fileRendererInfo={args.fileRendererInfo}
      loading={args.loading}
      proseDiffHtml={args.proseDiffHtml}
    />
  ),
}

export default meta
