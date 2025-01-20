import type {Meta} from '@storybook/react'
import CodeMirror, {type CodeMirrorProps} from './CodeMirror'
import {noop} from '@github-ui/noop'

const args = {
  spacing: {
    indentUnit: 2,
    indentWithTabs: false,
    lineWrapping: true,
  },
  onChange: noop,
  value: 'Markdown _content_ is `supported`',
  fileName: 'filename.md',
  placeholder: 'Placeholder text',
  ariaLabelledBy: 'CodeMirror editor',
} satisfies CodeMirrorProps

const meta = {
  title: 'Utilities/CodeMirror',
  component: CodeMirror,
} satisfies Meta<typeof CodeMirror>

export default meta

export const Example = {args}
