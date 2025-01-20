import type {Meta} from '@storybook/react'
import {EmptyDiffLine} from './EmptyDiffLine'
import {tableDecorator} from './StoryHelpers'

type EmptyDiffLineProps = React.ComponentProps<typeof EmptyDiffLine>

const args = {isLeftColumn: false} satisfies EmptyDiffLineProps

const meta = {
  title: 'Diffs/EmptyDiffLine',
  component: EmptyDiffLine,
  decorators: [tableDecorator],
} satisfies Meta<typeof EmptyDiffLine>

export default meta

export const Example = {args}
