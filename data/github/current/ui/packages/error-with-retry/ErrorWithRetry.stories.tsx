import type {Meta} from '@storybook/react'
import {ErrorWithRetry, type ErrorWithRetryProps} from './ErrorWithRetry'

const meta = {
  title: 'IssuesComponents/ErrorWithRetry',
  component: ErrorWithRetry,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    message: {control: 'text', defaultValue: 'Could not load user'},
  },
} satisfies Meta<typeof ErrorWithRetry>

export default meta

const defaultArgs: Partial<ErrorWithRetryProps> = {
  message: 'Could not load user',
  retry: () => alert('Retry'),
}

export const ErrorWithRetryExample = {
  args: {
    ...defaultArgs,
  },
}
