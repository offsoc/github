import {Box, Text} from '@primer/react'
import type {Meta} from '@storybook/react'
import {useState} from 'react'

import {Filter, type FilterProps, type FilterQuery} from './Filter'
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
import type {FilterProvider, SubmitEvent} from './types'
import {ProviderSupportStatus} from './types'

const meta = {
  title: 'Recipes/Filter',
  component: Filter,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
    msw: {
      handlers,
    },
  },
  argTypes: {
    settings: {
      control: {type: 'object'},
      table: {
        defaultValue: {summary: '{aliasMatching: false}'},
      },
    },
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
  settings: {aliasMatching: false},
}

const Items = ({query}: {query: string}) => {
  return (
    <Box
      sx={{
        bg: 'canvas.subtle',
        px: [3, 5, 10],
        py: 10,
        borderRadius: 2,
        width: '100%',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'border.default',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {query ? (
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
          <Text sx={{fontSize: 1, color: 'fg.muted', mb: 2, textAlign: 'center'}}>Filter the items using query</Text>
          <Text
            sx={{
              fontFamily: 'mono',
              textAlign: 'center',
              overflowWrap: 'break-word',
              display: 'block',
              width: '100%',
            }}
          >
            {query}
          </Text>
        </Box>
      ) : (
        <Text sx={{fontSize: 1, display: 'block', color: 'fg.muted', textAlign: 'center'}}>
          Show a default list of items when no query is entered
        </Text>
      )}
    </Box>
  )
}

export const Playground = (props: FilterProps) => {
  const [filterValue, setFilterValue] = useState('')
  const [submittedValue, setSubmittedValue] = useState('')

  return (
    <div>
      <Box sx={{gap: 3, display: 'flex', flexDirection: 'column'}}>
        <Filter
          {...props}
          id="storybook-filter"
          context={{repo: 'github/github'}}
          label="Filter items"
          filterValue={filterValue}
          providers={defaultProviders}
          onChange={(value: string) => setFilterValue(value)}
          settings={props.settings}
          onSubmit={(request: FilterQuery, eventType: SubmitEvent) => {
            setSubmittedValue(request.raw)
            props.onSubmit?.(request, eventType)
          }}
        />
        <Items query={submittedValue} />
      </Box>
    </div>
  )
}

export const PopulatedPlayground = (props: FilterProps) => {
  const [filterValue, setFilterValue] = useState('assignee:@me label:"🐛 bug" test is:issue')
  const [submittedValue, setSubmittedValue] = useState('')

  return (
    <div>
      <Box sx={{gap: 3, display: 'flex', flexDirection: 'column'}}>
        <Filter
          {...props}
          id="storybook-filter"
          context={{repo: 'github/github'}}
          label="Filter items"
          filterValue={filterValue}
          providers={defaultProviders}
          onChange={(value: string) => setFilterValue(value)}
          settings={props.settings}
          onSubmit={(request: FilterQuery, eventType: SubmitEvent) => {
            setSubmittedValue(request.raw)
            props.onSubmit?.(request, eventType)
          }}
        />
        <Items query={submittedValue} />
      </Box>
    </div>
  )
}

Playground.args = defaultArgs
