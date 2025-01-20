import type {Meta, StoryObj} from '@storybook/react'
import {expect, userEvent, waitFor, within} from '@storybook/test'

import {moveCursor} from './__tests__/utils/interaction-test-helpers'
import {Filter, type FilterProps} from './Filter'
import styles from './filterRules.module.css'
import {handlers} from './mocks/handlers'
import {
  ArchivedFilterProvider,
  AssigneeFilterProvider,
  AuthorFilterProvider,
  ClosedFilterProvider,
  CommenterFilterProvider,
  CommentsFilterProvider,
  CreatedFilterProvider,
  DraftFilterProvider,
  InBodyFilterProvider,
  InCommentsFilterProvider,
  InteractionsFilterProvider,
  InTitleFilterProvider,
  InvolvesFilterProvider,
  IsFilterProvider,
  LabelFilterProvider,
  LanguageFilterProvider,
  LinkedFilterProvider,
  MentionsFilterProvider,
  MergedFilterProvider,
  MilestoneFilterProvider,
  OrgFilterProvider,
  ProjectFilterProvider,
  ReactionsFilterProvider,
  ReasonFilterProvider,
  RepositoryFilterProvider,
  ReviewedByFilterProvider,
  ReviewFilterProvider,
  ReviewRequestedFilterProvider,
  SortFilterProvider,
  StateFilterProvider,
  StatusFilterProvider,
  TypeFilterProvider,
  UpdatedFilterProvider,
  UserFilterProvider,
  UserReviewRequestedFilterProvider,
} from './providers'
import {TeamFilterProvider, TeamReviewRequestedFilterProvider} from './providers/team'
import type {FilterProvider} from './types'
import {ProviderSupportStatus} from './types'

const meta = {
  title: 'Recipes/Filter/Rules',
  component: Filter,
  tags: ['!autodocs'],
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
    msw: {
      handlers,
    },
  },
  argTypes: {
    onChange: {action: 'onChange'},
    onParse: {action: 'onParse'},
    onSubmit: {action: 'onSubmit'},
    onValidation: {action: 'onValidation'},
  },
} satisfies Meta<typeof Filter>

export default meta

const defaultUserObject = {
  currentUserLogin: 'monalisa',
  currentUserAvatarUrl: 'https://avatars.githubusercontent.com/u/90914?v=4',
}

const defaultProviders: FilterProvider[] = [
  new AssigneeFilterProvider(defaultUserObject, {priority: 1, filterTypes: {exclusive: true}}),
  new AuthorFilterProvider(defaultUserObject, {filterTypes: {multiKey: false}}),
  new CommenterFilterProvider(defaultUserObject),
  new InvolvesFilterProvider(defaultUserObject),
  new MentionsFilterProvider(defaultUserObject),
  new ReviewedByFilterProvider(defaultUserObject),
  new ReviewRequestedFilterProvider(defaultUserObject),
  new UserFilterProvider(defaultUserObject),
  new UserReviewRequestedFilterProvider(defaultUserObject),
  new ArchivedFilterProvider(),
  new ClosedFilterProvider(),
  new CommentsFilterProvider(),
  new CreatedFilterProvider(),
  new DraftFilterProvider(),
  new InteractionsFilterProvider(),
  new IsFilterProvider(['issue', 'pr', 'open']),
  new LinkedFilterProvider(['pr']),
  new MergedFilterProvider(),
  new StateFilterProvider('mixed', {
    filterTypes: {
      inclusive: true,
      exclusive: true,
      valueless: false,
      multiKey: false,
      multiValue: true,
    },
  }),
  new ReactionsFilterProvider(),
  new ReasonFilterProvider({filterTypes: {inclusive: false}}),
  new ReviewFilterProvider(),
  new StatusFilterProvider({filterTypes: {multiKey: true, multiValue: true, valueless: true}}),
  new TypeFilterProvider(),
  new LanguageFilterProvider({support: {status: ProviderSupportStatus.Deprecated}}),
  new UpdatedFilterProvider(),
  new ProjectFilterProvider(),
  new LabelFilterProvider({priority: 1, filterTypes: {exclusive: true}}),
  new TeamFilterProvider(),
  new TeamReviewRequestedFilterProvider(undefined, {support: {status: ProviderSupportStatus.Unsupported}}),
  new InBodyFilterProvider(),
  new InCommentsFilterProvider(),
  new InTitleFilterProvider(),
  new OrgFilterProvider(),
  new SortFilterProvider(['created', 'updated', 'reactions', 'comments', 'author-date', 'committer-date']),
  new MilestoneFilterProvider(),
  new RepositoryFilterProvider(),
]

const defaultArgs: Partial<FilterProps> = {
  id: 'filter-sb',
  providers: defaultProviders,
  settings: {aliasMatching: false, groupAndKeywordSupport: true},
}

type RuleProps = FilterProps & {title?: string; description?: string}
type Story = StoryObj<RuleProps>

type RuleBlockProps = {title?: string; description?: string}

const RuleBlock = ({title, description}: RuleBlockProps) => {
  if (!title && !description) return null
  return (
    <div className={styles.ruleBlock}>
      {title && <h1 className={styles.ruleBlockTitle}>{title}</h1>}
      {description && <h2 className={styles.ruleBlockDescription}>{description}</h2>}
    </div>
  )
}

const defaultStory: Story = {
  args: defaultArgs,
  name: 'Default',
  render: (storyProps: RuleProps) => {
    const {title, description, ...props} = storyProps
    return (
      <>
        <RuleBlock title={title} description={description} />
        <Filter
          {...props}
          id="storybook-filter"
          context={{repo: 'github/github'}}
          label="Filter items"
          providers={defaultProviders}
          settings={props.settings}
        />
      </>
    )
  },
}

export const onInputFocusWithNoValue: Story = {
  ...defaultStory,
  args: {
    ...defaultStory.args,
    title: 'Show suggestions when input has no value',
    description: 'Should show suggestions when a user focuses on the filter input and it has no value',
  },
  name: 'Show suggestions when input has no value',
  parameters: {
    ...defaultStory.parameters,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(input)
    await expect(input).toHaveFocus()
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() => expect(canvas.getByRole('listbox', {name: 'Suggestions'})).toBeInTheDocument())
  },
}

export const onInputFocusWithValue: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: "Don't show suggestions when input has a value",
    description: "Shouldn't show suggestions when a user focuses on the filter input and it has a value",
    initialFilterValue: 'state:open',
  },
  name: "Don't show suggestions when input has a value",
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole<HTMLInputElement>('combobox')

    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(input)
    input.selectionStart = 10
    await expect(input).toHaveFocus()
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() => expect(canvas.queryByRole('listbox', {name: 'Suggestions'})).not.toBeInTheDocument())
  },
}

export const showSuggestionsWhenSpacePressed: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: 'Show suggestions when a space is added',
    description: "Should show suggestions when a user adds a space character to the filter's value",
  },
  name: 'Show suggestions when a space is added',
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
    await waitFor(() => expect(canvas.getByRole('listbox', {name: 'Suggestions'})).toBeInTheDocument())
    await userEvent.keyboard('{Backspace}')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
  },
}

export const showSuggestionsWhenInsideGroupBlock: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: 'Show suggestions when inside a group block',
    description:
      'When the caret is to the right of a (, the suggestions menu should appear, and selecting an item replaces the filter block',
    initialFilterValue: 'state:open AND (is:issue OR is:pr)',
  },
  name: 'Show suggestions when inside a group block',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole<HTMLInputElement>('combobox')
    await expect(input).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(input)
    input.selectionStart = 16
    await userEvent.keyboard('t')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('listbox', {name: 'Suggestions'})).toBeInTheDocument()

    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    await expect(input).toHaveValue('state:open AND (type:issue OR is:pr)')
  },
}

export const showSuggestionMenuWhenInsideSpaceBlocks: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: 'Show suggestions menu when inside space blocks',
    description:
      'When there are multiple spaces, and the cursor is in the middle, then a user types, the suggestions menu appears',
    initialFilterValue: 'state:open AND  (is:issue OR is:pr)',
  },
  name: 'Show suggestion menu when inside space blocks',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole<HTMLInputElement>('combobox')
    await expect(input).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(input)
    input.selectionStart = 15
    await userEvent.keyboard('t')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('listbox', {name: 'Suggestions'})).toBeInTheDocument()

    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    await expect(input).toHaveValue('state:open AND type: (is:issue OR is:pr)')
  },
}

export const DontShowSuggestionsWhenParenthesisIsInsideABlock: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: "Don't show suggestions when parenthesis is inside a block",
    initialFilterValue: 'state:open',
  },
  name: "Don't show suggestions when parenthesis is inside a block",
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole<HTMLInputElement>('combobox')

    await userEvent.click(input)
    moveCursor(canvas, 'st'.length)
    await userEvent.keyboard('(')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.keyboard('{Backspace}')

    moveCursor(canvas, 'state:open'.length)
    await userEvent.keyboard(' AND(')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.keyboard('{Backspace}')

    await userEvent.keyboard(' foo(')
    await expect(input).toHaveAttribute('aria-expanded', 'false')

    await userEvent.keyboard('(')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
  },
}

export const DontShowSuggestionsWhenParenthesisIsInsideValue: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: "Don't show suggestions when parenthesis is inside value of a filter block",
    initialFilterValue: 'state:open',
  },
  name: "Don't show suggestions when parenthesis is inside value of a filter block",
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole<HTMLInputElement>('combobox')

    await userEvent.click(input)

    moveCursor(canvas, 'state:'.length)
    await userEvent.keyboard('(')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.keyboard('{Backspace}')

    moveCursor(canvas, 'state:open'.length)
    await userEvent.keyboard(',closed')
    moveCursor(canvas, 'state:open,'.length)
    await userEvent.keyboard('(')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.keyboard('{Backspace}')

    moveCursor(canvas, 'state:open,closed'.length)
    await userEvent.keyboard('(')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
  },
}

export const DontShowSuggestionsWhenParenthesisIsInsideQuotes: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: "Don't show suggestions when parenthesis is inside quotes",
    initialFilterValue: 'state:"open',
  },
  name: "Don't show suggestions when parenthesis is inside quotes",
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole<HTMLInputElement>('combobox')
    await userEvent.click(input)

    moveCursor(canvas, 'state:"open'.length)
    await userEvent.keyboard('(')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.keyboard('{Backspace}')

    await userEvent.keyboard('","bloop (')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
  },
}

export const ShowSuggestionsWhenParenthesisIsAfterSpace: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: 'Show suggestions when parenthesis is after space',
    initialFilterValue: 'state:open',
  },
  name: 'Show suggestions when parenthesis is after space',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole<HTMLInputElement>('combobox')
    await userEvent.click(input)

    moveCursor(canvas, 'state:open'.length)
    await userEvent.keyboard(' (')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('(')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
  },
}

export const ShowSuggestionsWhenMultipleParentheses: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: 'Show suggestions when there are multiple parentheses',
  },
  name: 'Show suggestions when there are multiple parentheses',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole<HTMLInputElement>('combobox')
    await userEvent.click(input)

    await userEvent.keyboard('(')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('(')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
  },
}

export const DoesNotValidateUnmatchedClosingParenAsValue: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: 'Does not validate unmatched closing paren as value',
    description:
      "When a closing paren is typed immediately after a filter value, we don't want to treat it as part of the value. The value should be highlighted when valid, but the closing paren should not be highlighted and instead styled like the default text.",
    providers: [new StateFilterProvider()],
    settings: {aliasMatching: false, groupAndKeywordSupport: true},
  },
  name: 'Does not validate unmatched closing paren as value',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')
    const styledInput = canvas.getByTestId('styled-input-content')

    await userEvent.type(input, 'state:open) ')
    await expect(styledInput.querySelector('[data-type="filter-value"]')?.textContent).toEqual('open')
    await expect(canvas.queryByTestId('filter-sb-validation-message')).not.toBeInTheDocument()
    await expect(canvas.queryByTestId('validation-error-list')).not.toBeInTheDocument()
  },
}

export const ValidatesFilterValueWithClosingParenAsText: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: 'Validates filter value with closing paren and additional text',
    description:
      'When a closing paren is typed as part of a filter value, and then there is additional text after that, the entire string will be validated.',
    providers: [new StateFilterProvider()],
    settings: {aliasMatching: false, groupAndKeywordSupport: true},
  },
  name: 'Validates filter value with closing paren and additional text',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'state:open)foo ')
    await expect(canvas.getByTestId('validation-error-list')).toHaveTextContent('Invalid value open)foo for state')
  },
}

export const ValidatesFilterValueAsPartOfValueWhenInQuotes: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: 'Validates filter value when close paren is part of a quoted value',
    description:
      'When a closing paren is typed as part of a filter value that is quoted, the quoted value will be validated',
    providers: [new StateFilterProvider()],
    settings: {aliasMatching: false, groupAndKeywordSupport: true},
  },
  name: 'Validates filter value when close paren is part of a quoted value',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')
    const styledInput = canvas.getByTestId('styled-input-content')

    await userEvent.type(input, 'state:"open)" ')
    await expect(styledInput.querySelector('[data-type="filter-value"]')?.textContent).toEqual('"open)"')
    await expect(canvas.getByTestId('validation-error-list')).toHaveTextContent('Invalid value "open)" for state')
  },
}

export const WrapsValuesWithUnmatchedParensInQuotes: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: 'Should wrap values with an unmatched parenthesis in quotes when suggestion selected',
    description:
      'When a value contains an unmatched parenthesis, it should be wrapped in quotes to avoid it being treated as the start/end of a group after it is selected from the suggestions list',
    providers: [new LabelFilterProvider()],
    settings: {aliasMatching: false, groupAndKeywordSupport: true},
  },
  name: 'Should wrap values with parentheses in quotes',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, '(label:cool')
    await waitFor(() => {
      canvas.getByRole('option', {name: '(cool, Label'}).click()
    })

    await expect(input).toHaveValue('(label:"(cool"')
  },
}

export const WrapsValuesWithParensInQuotes: Story = {
  ...defaultStory,
  args: {
    ...defaultArgs,
    title: 'Should wrap values with an unmatched parenthesis in quotes when suggestion selected',
    description:
      'When a value contains an unmatched parenthesis, it should be wrapped in quotes to avoid it being treated as the start/end of a group after it is selected from the suggestions list',
    providers: [new LabelFilterProvider()],
    settings: {aliasMatching: false, groupAndKeywordSupport: true},
  },
  name: 'Should wrap values with parentheses in quotes',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'label:a11')
    await waitFor(() => {
      canvas.getByRole('option', {name: 'a11y (sev 1), Label'}).click()
    })

    await expect(input).toHaveValue('label:"a11y (sev 1)"')
  },
}
