import type {Meta} from '@storybook/react'
import {FlashError} from './FlashError'

type FlashErrorProps = Parameters<typeof FlashError>[0]

const ruleErrors = ['Rule errors', 'More rule errors']
const errorMessageUsingPrefix = 'Error message using prefix'
const errorMessageNotUsingPrefix = 'Error message not using prefix'

const args = {
  prefix: 'Prefix',
  helpUrl: 'helpUrl',
} satisfies FlashErrorProps

const meta = {
  title: 'ReposComponents/FlashError',
  component: FlashError,
} satisfies Meta<typeof FlashError>

export default meta

export const WithPrefix = {
  args: {
    ...args,
    errorMessageUsingPrefix,
  },
}

export const WithPrefixAndRuleErrors = {
  args: {
    ...args,
    errorMessageUsingPrefix,
    ruleErrors,
  },
}

export const WithoutPrefix = {
  args: {
    ...args,
    errorMessageNotUsingPrefix,
  },
}

export const WithoutPrefixWithRuleErrors = {
  args: {
    ...args,
    errorMessageNotUsingPrefix,
    ruleErrors,
  },
}

export const RendersNullWithoutErrorMessage = {args}
