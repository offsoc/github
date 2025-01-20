import type {Meta} from '@storybook/react'
import {DiffFileTree} from './DiffFileTree'

type DiffLinePartProps = React.ComponentProps<typeof DiffFileTree>

const args = {
  diffs: [
    {
      path: 'src/Components/Component.tsx',
      pathDigest: 'test-digest',
      changeType: 'ADDED',
    },
    {
      path: 'src/Components/Tree.tsx',
      pathDigest: 'test-digest',
      changeType: 'RENAMED',
    },
    {
      path: 'README.md',
      pathDigest: 'test-digest',
      changeType: 'MODIFIED',
    },
    {
      path: 'file.rb',
      pathDigest: 'test-digest',
      changeType: 'DELETED',
    },
  ],
} satisfies DiffLinePartProps

const meta = {
  title: 'Diffs/DiffFileTree',
  component: DiffFileTree,
} satisfies Meta<typeof DiffFileTree>

export default meta

export const FileTree = {args}
