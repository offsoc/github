import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import type {TextExpanderProps} from '../TextExpander'
import {TextExpander} from '../TextExpander'

const defaultArgs: TextExpanderProps = {
  suggestionsUrlIssue: '/issues/suggestions',
  suggestionsUrlMention: '/mention/suggestions',
  suggestionsUrlEmoji: '/emoji/suggestions',
  value: '',
  setValue: () => {},
  textareaProps: {
    'aria-label': 'TextExpander demo',
    placeholder: 'Type something...',
  },
}

test('Renders the TextExpander', () => {
  const value = 'Hello React!'
  render(<TextExpander {...defaultArgs} value={value} />)
  expect(screen.getByText(value)).toBeInTheDocument()
})
