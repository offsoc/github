import type {Meta, StoryObj} from '@storybook/react'
import {expect, userEvent, waitFor, within} from '@storybook/test'
import type {OperationDescriptor} from 'relay-runtime'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {Filter, type FilterProps} from '../Filter'
import {handlers} from '../mocks/handlers'
import {TypeFilterProvider} from '../providers'
import {getSuggestions} from './utils/interaction-test-helpers'
import {buildProjectIssuesTypes, buildRepositoryWithIssueTypes, buildViewerIssuesTypes} from './utils/mock-data'
import {setupMockFilterProviders} from './utils/mock-providers'

type Story = StoryObj<typeof Filter>

export default {
  title: 'Recipes/Filter/Interactions/Type Filter',
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

const setupRelayEnvironment = () => {
  const relayEnvironment = createMockEnvironment()
  relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
    MockPayloadGenerator.generate(operation, {
      User: () => buildViewerIssuesTypes(),
      Organization: () => buildProjectIssuesTypes(),
      Repository: () =>
        buildRepositoryWithIssueTypes({
          name: 'issues-react',
          owner: 'github',
        }),
    }),
  )

  return relayEnvironment
}

export const RepoScopeShouldSuggestAllPossibleTypes: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new TypeFilterProvider({}, true, setupRelayEnvironment(), 'github/issues-react', true)],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'type:')
    await expect(getSuggestions(canvas)).toHaveLength(4)
  },
}

export const RepoScopeShouldSuggestTypeValuesIfNoInput: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new TypeFilterProvider({}, true, setupRelayEnvironment(), 'github/issues-react', true)],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'type:')
    await expect(getSuggestions(canvas)).toHaveLength(4)
  },
}

export const RepoScopeShouldSuggestTypeValueBasedOnUserInput: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new TypeFilterProvider({}, true, setupRelayEnvironment(), 'github/issues-react', true)],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'type:Bu')
    await expect(getSuggestions(canvas)).toEqual(['Bug'])
  },
}

export const RepoScopeShouldFilterAndSelectSuggestion: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new TypeFilterProvider({}, true, setupRelayEnvironment(), 'github/issues-react', true)],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'is:issue state:open type:Fea')
    await expect(getSuggestions(canvas)).toEqual(['Feature'])
    await waitFor(() => canvas.getByRole('option', {name: /Feature/i}).click())
    await expect(input).toHaveValue('is:issue state:open type:Feature')
  },
}

export const RepoScopeShouldNotShowSuggestionsInInputMatchesNoTypes: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new TypeFilterProvider({}, true, setupRelayEnvironment(), 'github/issues-react', true)],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'type:sdfadsfasdf')
    await expect(canvas.queryByRole('option')).not.toBeInTheDocument()
  },
}

export const RepoScopeShouldNotSuggestionIssueAndPullRequestIfNotInLegacyMode: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new TypeFilterProvider({}, false, setupRelayEnvironment(), 'github/issues-react', true)],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'type:')
    await expect(getSuggestions(canvas)).toEqual(['Bug', 'Feature'])
  },
}

export const RepoScopeShouldNotSuggestIssueTypesIfRelayEnvironmentIsMissing: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new TypeFilterProvider({}, false, undefined, 'github/issues-react', true)],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'type:')
    await expect(canvas.queryByRole('option')).not.toBeInTheDocument()
  },
}

export const IssuesDashboardShouldSuggestTypeValuesIfNoInput: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new TypeFilterProvider({}, true, setupRelayEnvironment())],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'type:')
    await expect(getSuggestions(canvas)).toHaveLength(7)
  },
}

export const IssuesDashboardShouldSuggestTypeValuesBasedOnUserInput: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new TypeFilterProvider({}, true, setupRelayEnvironment())],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'type:Bu')
    await expect(getSuggestions(canvas)).toEqual(['Bug'])
  },
}

export const FilterAndSelectSuggestion: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new TypeFilterProvider({}, false, setupRelayEnvironment(), undefined, true, {login: 'github', projectNumber: 1}),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'type:Bat')
    await expect(getSuggestions(canvas)).toEqual(['Batch'])
    await waitFor(() => canvas.getByRole('option', {name: /Batch/i}).click())
    await expect(input).toHaveValue('type:Batch')
  },
}

export const ClearButtonShouldClearFilterWhenClicked: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new TypeFilterProvider({}, true, setupRelayEnvironment())],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'foo')
    await waitFor(() => canvas.getByRole('button', {name: /Clear Filter/i}).click())
    await waitFor(() => expect(input).toHaveValue(''))
  },
}

export const ClearButtonShouldClearFilterWithEnterKey: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [new TypeFilterProvider({}, true, setupRelayEnvironment())],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'foo')
    canvas.getByRole('button', {name: /Clear Filter/i}).focus()

    await userEvent.keyboard('{Enter}')

    await expect(input).toHaveValue('')
  },
}

export const ProjectScopeShouldSuggestIssueTypes: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new TypeFilterProvider({}, false, setupRelayEnvironment(), undefined, true, {login: 'github', projectNumber: 1}),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'type:')
    await expect(getSuggestions(canvas)).toHaveLength(5)
  },
}

export const ProjectScopeShouldSuggestTypeValuesIfNoInput: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new TypeFilterProvider({}, false, setupRelayEnvironment(), undefined, true, {login: 'github', projectNumber: 1}),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'type:')
    await expect(getSuggestions(canvas)).toHaveLength(5)
  },
}

export const ProjectScopeShouldSuggestTypeValueBasedOnUserInput: Story = {
  ...Default,
  args: {
    ...defaultArgs,
    providers: [
      new TypeFilterProvider({}, false, setupRelayEnvironment(), undefined, true, {login: 'github', projectNumber: 1}),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'type:Must')
    await expect(getSuggestions(canvas)).toEqual(['Must-have'])
  },
}
