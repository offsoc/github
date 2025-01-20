import type {Meta} from '@storybook/react'
import {HunkHeaderDiffLine} from './HunkHeaderDiffLine'
import {tableDecorator, line} from './StoryHelpers'

type HunkHeaderDiffLineProps = React.ComponentProps<typeof HunkHeaderDiffLine>

const args = {
  currentLine: line,
  isLeftColumn: false,
  isSplit: false,
} satisfies HunkHeaderDiffLineProps

const meta = {
  title: 'Diffs/HunkHeaderDiffLine',
  component: HunkHeaderDiffLine,
  decorators: [tableDecorator],
} satisfies Meta<typeof HunkHeaderDiffLine>

export default meta

export const Example = {args}

export const WithHunkButton = {args: {...args, hunkButton: <button>hunk button</button>}}
