import type {Meta} from '@storybook/react'
import {DiffLinePart} from './DiffLinePart'
import type {SimpleDiffLine} from '../types'
import {tableDecorator, line} from './StoryHelpers'

type DiffLinePartProps = React.ComponentProps<typeof DiffLinePart>

const args = {
  line,
  isHighlighted: false,
  dragging: false,
  isLeftColumn: false,
  isSplit: false,
} satisfies DiffLinePartProps

const meta = {
  title: 'Diffs/DiffLinePart',
  component: DiffLinePart,
  decorators: [tableDecorator],
} satisfies Meta<typeof DiffLinePart>

export default meta

export const Addition = {args}

export const Context = {args: argsWithDiffLine(args, {type: 'CONTEXT'})}

export const Deletion = {args: argsWithDiffLine(args, {type: 'DELETION'})}

export const Hunk = {args: argsWithDiffLine(args, {type: 'HUNK'})}

export const InjectedContext = {args: argsWithDiffLine(args, {type: 'INJECTED_CONTEXT'})}

export const Empty = {args: argsWithDiffLine(args, {type: 'EMPTY'})}

function argsWithDiffLine(diffArgs: DiffLinePartProps, partialDiffLine: Partial<SimpleDiffLine>) {
  return {...diffArgs, line: {...diffArgs.line, ...partialDiffLine}}
}
