import {noop} from '@github-ui/noop'
import type {Meta} from '@storybook/react'
import type {ComponentProps} from 'react'

import {ApplySuggestionDialog as ApplySuggestionDialogComponent} from './ApplySuggestionDialog'

type ApplySuggestionDialogProps = ComponentProps<typeof ApplySuggestionDialogComponent>

const args = {
  authorLogins: ['monalisa'],
  batchSize: 1,
  onClose: noop,
  onCommit: noop,
} satisfies ApplySuggestionDialogProps

const meta: Meta<typeof ApplySuggestionDialogComponent> = {
  title: 'Conversations/ApplySuggestionDialog',
  component: ApplySuggestionDialogComponent,
}

export default meta

export const ApplySuggestionDialog = {args}
