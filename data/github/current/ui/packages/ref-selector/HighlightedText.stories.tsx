import type {Meta} from '@storybook/react'
import {HighlightedText} from './HighlightedText'

type HighlightedTextProps = React.ComponentProps<typeof HighlightedText>

const args = {
  text: 'The highlighted text in this sentence is bolded.',
  search: 'highlighted text',
} satisfies HighlightedTextProps

const meta = {
  title: 'ReposComponents/RefSelector/HighlightedText',
  component: HighlightedText,
} satisfies Meta<typeof HighlightedText>

export default meta

export const Example = {args}
