import type {Meta} from '@storybook/react'
import {TextExpander, type TextExpanderProps} from './TextExpander'
import {useState} from 'react'

const meta = {
  title: 'Recipes/TextExpander',
  component: TextExpander,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    suggestionsUrlIssue: {control: {type: 'text'}},
    suggestionsUrlMention: {control: {type: 'text'}},
    suggestionsUrlEmoji: {control: {type: 'text'}},
    value: {control: {type: 'text'}},
    setValue: {control: {disable: true}},
    sx: {control: {type: 'object'}},
    textareaProps: {control: {type: 'object'}},
  },
} satisfies Meta<typeof TextExpander>

export default meta

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

export const TextExpanderExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: TextExpanderProps) => <TextExpanderDemo {...args} />,
}

const TextExpanderDemo = (props: TextExpanderProps) => {
  const [value, setValue] = useState('')
  return <TextExpander {...props} value={value} setValue={setValue} />
}
