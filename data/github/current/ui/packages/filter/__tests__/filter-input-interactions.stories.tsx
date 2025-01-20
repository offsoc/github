import type {Meta, StoryObj} from '@storybook/react'
import {expect, userEvent, waitFor, within} from '@storybook/test'

import {Filter, type FilterProps} from '../Filter'
import {handlers} from '../mocks/handlers'
import {LabelFilterProvider, StateFilterProvider, StatusFilterProvider} from '../providers'
import {getSuggestions, moveCursor} from './utils/interaction-test-helpers'
import {setupMockFilterProviders} from './utils/mock-providers'

type Story = StoryObj<typeof Filter>

export default {
  title: 'Recipes/Filter/Interactions/Filter Input',
  component: Filter,
  tags: ['!autodocs'],
  parameters: {
    msw: {
      handlers,
    },
  },
} satisfies Meta<typeof Filter>

const defaultArgs: Partial<FilterProps> = {
  id: 'filter-sb',
  context: {repo: 'github/github'},
  label: 'Filter suggestions',
  providers: setupMockFilterProviders(),
  settings: {aliasMatching: false},
}

async function isValueValid(canvas: ReturnType<typeof within>, value: string) {
  await waitFor(() => {
    void expect(within(canvas.getByTestId('styled-input-content')).getByText(value).classList).toContain(
      'valid-filter-value',
    )
  })
}

async function isValueInvalid(canvas: ReturnType<typeof within>, value: string) {
  await waitFor(() => {
    void expect(within(canvas.getByTestId('styled-input-content')).getByText(value).classList).toContain(
      'invalid-filter-value',
    )
  })
}

export const Default = {args: defaultArgs}

export const HighlightsValidValues: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider('mixed')],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'state:open')
    await isValueValid(canvas, 'open')
  },
}

export const HighlightsInvalidValues: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider('mixed')],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'state:ope ')
    await isValueInvalid(canvas, 'ope')
  },
}

export const ShouldMaintainCursorPositionWhenEditing: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider('mixed')],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'foo')
    moveCursor(canvas, 0)
    await userEvent.keyboard('bar')
    await expect(input).toHaveValue('barfoo')
  },
}

export const ShouldFilterAndSelectSuggestionsWhenFirstBlockIsEdited: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider(), new StatusFilterProvider()],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'status:closed abc')
    moveCursor(canvas, 'st'.length)
    await userEvent.keyboard('a')
    await expect(getSuggestions(canvas)).toHaveLength(2)
    await waitFor(() => {
      canvas.getByRole('option', {name: /State/i}).click()
    })
    await expect(input).toHaveValue('state:closed abc')
  },
}

export const ShouldFilterAndSelectSuggestionsWhenNotFirstBlockIsEdited: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider(), new StatusFilterProvider()],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'abc status:closed def')
    moveCursor(canvas, 'abc st'.length)
    await userEvent.keyboard('a')
    await expect(getSuggestions(canvas)).toHaveLength(2)
    await waitFor(() => {
      canvas.getByRole('option', {name: /State/i}).click()
    })
    await expect(input).toHaveValue('abc state:closed def')
  },
}

export const ShouldFilterWhenNestedBlockIsEdited: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider(), new StatusFilterProvider()],
    settings: {aliasMatching: false, groupAndKeywordSupport: true},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')
    const styledInput = canvas.getByTestId('styled-input-content')

    await userEvent.type(input, '(state:open) AND (state:closed)')
    moveCursor(canvas, '(state:open)'.length)
    await userEvent.keyboard('{Backspace}')
    await expect(input).toHaveValue('(state:open AND (state:closed)')
    await expect(styledInput.textContent).toEqual('(state:open AND (state:closed)')
    await userEvent.keyboard(') AND (state:merged)')
    await expect(input).toHaveValue('(state:open) AND (state:merged) AND (state:closed)')
    await expect(styledInput.textContent).toEqual('(state:open) AND (state:merged) AND (state:closed)')
  },
}

export const StyledInputMatchesValueWhenClosingParenTyped: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider(), new StatusFilterProvider()],
    settings: {aliasMatching: false, groupAndKeywordSupport: true},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')
    const styledInput = canvas.getByTestId('styled-input-content')

    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.type(input, 'state:open))')
    await expect(styledInput.textContent).toBe('state:open))')
  },
}

export const StyledInputMatchesValueWhenNestedClosingParenTyped: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider(), new StatusFilterProvider()],
    settings: {aliasMatching: false, groupAndKeywordSupport: true},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')
    const styledInput = canvas.getByTestId('styled-input-content')

    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.type(input, 'state:open AND (no:status AND ())')
    await expect(styledInput.textContent).toBe('state:open AND (no:status AND ())')
  },
}

export const ShowsUnbalancedParenthesesErrorMessage: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider()],
    settings: {aliasMatching: false, groupAndKeywordSupport: true},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, '(state:open')
    await userEvent.keyboard('{Shift>}{Tab}')
    await expect(canvas.getByTestId('validation-error-list')).toHaveTextContent('Unbalanced parentheses')

    await userEvent.keyboard('{Tab}')
    moveCursor(canvas, '(state:open'.length)
    await userEvent.type(input, ')')
    await userEvent.keyboard('{Shift>}{Tab}')
    await expect(canvas.queryByTestId('validation-error-list')).not.toBeInTheDocument()

    await userEvent.keyboard('{Tab}')
    moveCursor(canvas, '(state:open)'.length)
    await userEvent.type(input, ')')
    await userEvent.keyboard('{Shift>}{Tab}')
    await expect(canvas.getByTestId('validation-error-list')).toHaveTextContent('Unbalanced parentheses')
  },
}

export const ShouldFilterAndAsyncValidateOnLoad: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider(), new StatusFilterProvider(), new LabelFilterProvider()],
    settings: {aliasMatching: false, groupAndKeywordSupport: true},
    initialFilterValue: 'state:open (label:triage,"accessibility review" AND label:batch)',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')
    const styledInput = canvas.getByTestId('styled-input-content')

    await isValueValid(canvas, 'open')
    await isValueValid(canvas, 'triage')
    await isValueValid(canvas, '"accessibility review"')
    await isValueValid(canvas, 'batch')

    await userEvent.click(input)
    moveCursor(canvas, 'state:open (label:triage,"accessibility review" AND label:batch)'.length)
    await userEvent.keyboard(' OR label:a11y ')

    await expect(input).toHaveValue('state:open (label:triage,"accessibility review" AND label:batch) OR label:a11y ')
    await expect(styledInput.textContent).toEqual(
      'state:open (label:triage,"accessibility review" AND label:batch) OR label:a11y ',
    )

    await isValueValid(canvas, 'a11y')
  },
}
