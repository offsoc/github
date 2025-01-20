import type {Meta} from '@storybook/react'
import {FileFilterShared, NO_FILE_EXTENSION} from './FileFilter'

type FileFilterSharedProps = React.ComponentProps<typeof FileFilterShared>

const args = {
  fileExtensions: new Set(['.ts', '.tsx', '.rb', NO_FILE_EXTENSION]),
} satisfies FileFilterSharedProps

const meta = {
  title: 'Diffs/FileFilter',
  component: FileFilterShared,
} satisfies Meta<typeof FileFilterShared>

export default meta

export const FileFilter = {args}
