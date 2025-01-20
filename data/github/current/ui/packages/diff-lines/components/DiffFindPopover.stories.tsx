import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta, StoryObj} from '@storybook/react'
import {DiffFindPopover, type DiffFindPopoverProps} from './DiffFindPopover'
import {noop} from '@github-ui/noop'
import {createRef, type MutableRefObject} from 'react'
import type {DiffMatchContent} from '../diff-lines'

const meta = {
  title: 'Apps/Diff Lines/Shared/DiffFindPopover',
  component: DiffFindPopover,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof DiffFindPopover>

export default meta

const defaultArgs: Partial<DiffFindPopoverProps> = {
  inputContainer: createRef(),
  currentPathDigestIndex: createRef() as MutableRefObject<number>,
  stickied: false,
  searchTerm: 'hi',
  setSearchTerm: noop,
  focusedSearchResult: undefined,
  currentIndex: 0,
  setCurrentIndex: noop,
  setFocusedSearchResult: noop,
  searchResults: new Map<string, DiffMatchContent[]>(),
  onClose: noop,
  scrollDiffCellIntoView: noop,
}

type Story = StoryObj<typeof DiffFindPopover>

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
  render: (args: DiffFindPopoverProps) => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <DiffFindPopover {...args} />
    </Wrapper>
  ),
}
