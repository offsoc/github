import type {Meta, StoryObj} from '@storybook/react'
import {expect, userEvent, waitFor, within} from '@storybook/test'

import {Filter, type FilterProps} from '../Filter'
import {handlers} from '../mocks/handlers'
import {IsFilterProvider, MilestoneFilterProvider, StateFilterProvider, StatusFilterProvider} from '../providers'
import {ProviderSupportStatus} from '../types'
import {getActiveSuggestion, getSuggestions} from './utils/interaction-test-helpers'
import {setupMockFilterProviders} from './utils/mock-providers'

type Story = StoryObj<typeof Filter>

export default {
  title: 'Recipes/Filter/Interactions/Suggestions',
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

export const Default = {args: defaultArgs}

export const ShowSuggestions: Story = {
  ...Default,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    input.click()

    await userEvent.type(input, 'author:')

    await waitFor(() => {
      canvas.getByRole('option', {name: /Signed-in user/i}).click()
    })
    await expect(input).toHaveValue('author:@me')
  },
}

export const AriaActiveDescendantOnExpectedItem: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider('mixed')],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 's')
    await expect(input).not.toHaveAttribute('aria-activedescendant')
    await userEvent.keyboard('{ArrowDown}')
    await expect(input).toHaveAttribute('aria-activedescendant', 'suggestion-0')
  },
}

export const NavigatesAndSelectsSuggestionUsingArrowKeys: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider(), new StatusFilterProvider()],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'sta')
    await expect(getActiveSuggestion(canvas)).toBeUndefined()
    await waitFor(() => expect(getSuggestions(canvas)).toEqual(['State', 'Status']))

    await userEvent.keyboard('{ArrowDown}')
    await expect(getActiveSuggestion(canvas)).toHaveTextContent(/State/i)
    await userEvent.keyboard('{ArrowDown}')
    await expect(getActiveSuggestion(canvas)).toHaveTextContent(/Status/i)
    await userEvent.keyboard('{ArrowDown}')
    // Arrow down at the end clears the active suggestion
    await expect(getActiveSuggestion(canvas)).toBeUndefined()

    await userEvent.keyboard('{ArrowUp}')
    await expect(getActiveSuggestion(canvas)).toHaveTextContent(/Status/i)
    await userEvent.keyboard('{ArrowUp}')
    await expect(getActiveSuggestion(canvas)).toHaveTextContent(/State/i)
    await userEvent.keyboard('{ArrowUp}')
    // Arrow up at the end clears the active suggestion
    await expect(getActiveSuggestion(canvas)).toBeUndefined()
    // Arrow up at the top cycles to the bottom
    await userEvent.keyboard('{ArrowUp}')
    await expect(getActiveSuggestion(canvas)).toHaveTextContent(/Status/i)

    await userEvent.keyboard('{Enter}')
    await expect(input).toHaveValue('status:')
  },
}

export const FiltersByPriority: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new StateFilterProvider('mixed', {
        priority: 10, // default is 3
      }),
      new MilestoneFilterProvider({
        priority: 3, // default is 10
      }),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    await userEvent.type(canvas.getByRole('combobox'), ' ')

    await expect(getSuggestions(canvas)).toEqual(['No', 'Milestone', 'Exclude'])
  },
}

export const IncludeSuggestions: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new StateFilterProvider('mixed', {
        support: {status: ProviderSupportStatus.Supported},
        filterTypes: {
          inclusive: true,
          exclusive: true,
          valueless: false,
          multiKey: false,
          multiValue: true,
        },
      }),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    await userEvent.type(canvas.getByRole('combobox'), 'sta')

    await expect(getSuggestions(canvas)).toEqual(['State'])
  },
}

export const ExcludeSuggestions: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new StateFilterProvider('mixed', {
        support: {status: ProviderSupportStatus.Supported},
        filterTypes: {
          inclusive: true,
          exclusive: true,
          valueless: false,
          multiKey: false,
          multiValue: true,
        },
      }),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    await userEvent.type(canvas.getByRole('combobox'), '-sta')

    await expect(canvas.findByTestId('suggestions-heading')).resolves.toHaveTextContent('Exclude')

    await expect(getSuggestions(canvas)).toEqual(['State'])
  },
}

export const LegacyStateIsFilterWithMixedState: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new IsFilterProvider(['issue', 'pr', 'open', 'closed', 'draft', 'merged']),
      new StateFilterProvider('mixed', {}),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    await userEvent.type(canvas.getByRole('combobox'), ' ')

    await expect(getSuggestions(canvas)).toEqual(['Is', 'State', 'Exclude'])

    canvas.getByRole('option', {name: /Is/i}).click()

    await waitFor(() => {
      void expect(getSuggestions(canvas)).toEqual(['Issue', 'Pull Request', 'Open', 'Closed', 'Draft', 'Merged'])
    })
  },
}

export const ExcludeSuggestionsWithFilters: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new IsFilterProvider(['issue', 'pr', 'open', 'closed', 'draft', 'merged']),
      new StateFilterProvider('mixed', {
        support: {status: ProviderSupportStatus.Supported},
        filterTypes: {
          inclusive: true,
          exclusive: true, // to make sure we are only rendering providers that are exclusive
          valueless: false,
          multiKey: false,
          multiValue: true,
        },
      }),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    await userEvent.type(canvas.getByRole('combobox'), '-')

    await expect(getSuggestions(canvas)).toEqual(['Is', 'State'])
    await expect(canvas.findByTestId('suggestions-heading')).resolves.toHaveTextContent('Exclude')
  },
}

export const ExcludeSuggestionsIfProvidersExistSupportingExclusion: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new IsFilterProvider(['issue', 'pr', 'open', 'closed', 'draft', 'merged']),
      new StateFilterProvider('mixed', {
        support: {status: ProviderSupportStatus.Supported},
        filterTypes: {
          inclusive: true,
          exclusive: true,
          valueless: false,
          multiKey: false,
          multiValue: true,
        },
      }),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, ' ')

    await expect(getSuggestions(canvas)).toEqual(['Is', 'State', 'Exclude'])

    canvas.getByRole('option', {name: /Exclude/i}).click()

    await waitFor(() => {
      void expect(getSuggestions(canvas)).toEqual(['Is', 'State'])
    })

    canvas.getByRole('option', {name: /State/i}).click()

    await waitFor(() => {
      void expect(input).toHaveValue(' -state:')
    })
  },
}

export const ExcludeModifierForFilterProviderCreatedWithPartialOptionsList: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new IsFilterProvider(['issue', 'pr', 'open', 'closed', 'draft', 'merged'], {filterTypes: {exclusive: true}}),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, ' ')

    await waitFor(() => expect(getSuggestions(canvas)).toEqual(['Is', 'Exclude']))

    await waitFor(() => canvas.getByRole('option', {name: /Exclude/i}).click())
    await expect(input).toHaveValue(' -')

    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(input).toHaveValue(' -is:'))
  },
}

export const InsertExcludeKeyModifierWhenSelectingExcludeSuggestion: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new IsFilterProvider(['issue', 'pr', 'open', 'closed', 'draft', 'merged']),
      new StateFilterProvider('mixed', {
        support: {status: ProviderSupportStatus.Supported},
        filterTypes: {
          inclusive: true,
          exclusive: true,
          valueless: false,
          multiKey: false,
          multiValue: true,
        },
      }),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, ' ')

    await waitFor(() => expect(getSuggestions(canvas)).toEqual(['Is', 'State', 'Exclude']))

    await waitFor(() => canvas.getByRole('option', {name: /Exclude/i}).click())
    await expect(input).toHaveValue(' -')
  },
}

export const InsertExcludeKeySuggestionWithPartialMatchesBeginningWithADash: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new IsFilterProvider(['issue', 'pr', 'open', 'closed', 'draft', 'merged']),
      new StateFilterProvider('mixed', {
        support: {status: ProviderSupportStatus.Supported},
        filterTypes: {
          inclusive: true,
          exclusive: true,
          valueless: false,
          multiKey: false,
          multiValue: true,
        },
      }),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, '-sta')
    await expect(canvas.findByTestId('suggestions-heading')).resolves.toHaveTextContent('Exclude')

    await waitFor(() => expect(getSuggestions(canvas)).toEqual(['State']))

    await waitFor(() => canvas.getByRole('option', {name: /state/i}).click())
    await expect(input).toHaveValue('-state:')
  },
}

export const ClosesSuggestionsListWhenEscapePressed: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider()],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 's')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Escape}')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
  },
}

export const ShowSuggestionsWhenSpaceCharacterPressed: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider()],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.type(input, 's')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    await expect(input).toHaveValue('state:')

    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    await expect(input).toHaveValue('state:open')

    await userEvent.keyboard(' ')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Backspace}')
    await expect(input).toHaveAttribute('aria-expanded', 'false')

    // Some languages, such as Japanese, have a full-width space as opposed to the English half-space character
    await userEvent.keyboard('　')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
  },
}

export const ShowsSuggestionsWhenInputFocusedWithNoValue: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider()],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(input)
    await expect(input).toHaveFocus()
    await expect(input).toHaveAttribute('aria-expanded', 'true')
  },
}

export const DoesNotShowSuggestionsWhenInputFocusedWithPrePopulatedValue: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider()],
    filterValue: 'state:open',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(input)
    await expect(input).toHaveFocus()
    await expect(input).toHaveAttribute('aria-expanded', 'false')
  },
}

export const ShowSuggestionsAfterOpeningParenthesisTyped: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider(), new StatusFilterProvider()],
    settings: {aliasMatching: false, groupAndKeywordSupport: true},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.type(input, '(')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('listbox', {name: 'Suggestions'})).toBeInTheDocument()
  },
}

export const DoesNotShowSuggestionsIfOpeningParenthesisTypedInQuotedValue: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider(), new StatusFilterProvider()],
    settings: {aliasMatching: false, groupAndKeywordSupport: true},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.type(input, 'state:"open (')
    await expect(canvas.queryByRole('listbox', {name: 'Suggestions'})).not.toBeInTheDocument()
    await expect(input).toHaveAttribute('aria-expanded', 'false')
  },
}

export const ShowSuggestionsIfOpenParenTypedInsideNestedGroup: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new StateFilterProvider(),
      new StatusFilterProvider(),
      new IsFilterProvider(),
      new MilestoneFilterProvider(),
    ],
    settings: {aliasMatching: false, groupAndKeywordSupport: true},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.type(input, 'state:open AND (no:status AND )')
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}(')

    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('listbox', {name: 'Suggestions'})).toBeInTheDocument()
  },
}
