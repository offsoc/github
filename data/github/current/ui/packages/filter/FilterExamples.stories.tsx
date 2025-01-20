import {Box, Button, Flash, FormControl, Text, TextInput} from '@primer/react'
import type {Meta} from '@storybook/react'
import {useState} from 'react'

import {Filter, type FilterProps, type FilterQuery} from './Filter'
import {FilterRevert} from './FilterRevert'
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
  OrgFilterProvider,
  ProjectFilterProvider,
  ReactionsFilterProvider,
  ReasonFilterProvider,
  ReviewedByFilterProvider,
  ReviewFilterProvider,
  ReviewRequestedFilterProvider,
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

const meta: Meta = {
  title: 'Recipes/Filter/Examples',
  component: Filter,
  tags: ['!autodocs'],
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
}

export default meta

const defaultUserObject = {
  currentUserLogin: 'monalisa',
  currentUserAvatarUrl: 'https://avatars.githubusercontent.com/u/90914?v=4',
}

const defaultProviders: FilterProvider[] = [
  new AssigneeFilterProvider(defaultUserObject),
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
  new IsFilterProvider(),
  new LinkedFilterProvider(),
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
  new ReasonFilterProvider(),
  new ReviewFilterProvider(),
  new StatusFilterProvider({
    filterTypes: {
      inclusive: true,
      exclusive: true,
      valueless: true,
      multiKey: true,
      multiValue: false,
    },
  }),
  new TypeFilterProvider(),
  new LanguageFilterProvider({support: {status: ProviderSupportStatus.Deprecated}}),
  new UpdatedFilterProvider(),
  new ProjectFilterProvider(),
  new LabelFilterProvider(),
  new TeamFilterProvider(),
  new TeamReviewRequestedFilterProvider(undefined, {support: {status: ProviderSupportStatus.Unsupported}}),
  new InBodyFilterProvider(),
  new InCommentsFilterProvider(),
  new InTitleFilterProvider(),
  new OrgFilterProvider(),
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

export const Default = (props: FilterProps) => {
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

export const NoContext = (props: FilterProps) => {
  const [filterValue, setFilterValue] = useState('')
  const [submittedValue, setSubmittedValue] = useState('')

  return (
    <div>
      <Box sx={{gap: 3, display: 'flex', flexDirection: 'column'}}>
        <Filter
          {...props}
          id="storybook-filter"
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
        <Flash variant="default">
          Note: This example doesn&apos;t have any repository or organization context, so any filter providers that rely
          on API responses will default to valid
        </Flash>
        <Items query={submittedValue} />
      </Box>
    </div>
  )
}

export const Compact = (props: FilterProps) => {
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

Compact.args = {...defaultArgs, filterButtonVariant: 'compact'}

export const WithRevert = (props: FilterProps) => {
  const startingValue = 'assignee:@me'
  const [filterValue, setFilterValue] = useState(startingValue)
  const [submittedValue, setSubmittedValue] = useState(startingValue)

  return (
    <div>
      <Box sx={{gap: 3, display: 'flex', flexDirection: 'column'}}>
        <Box sx={{gap: 1, display: 'flex', flexDirection: 'column'}}>
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
          {submittedValue !== startingValue && (
            <div>
              <FilterRevert
                href="#"
                sx={{mt: 1}}
                onClick={e => {
                  setFilterValue(startingValue)
                  setSubmittedValue(startingValue)
                  e.preventDefault()
                }}
              />
            </div>
          )}
        </Box>

        <Items query={submittedValue} />
      </Box>
    </div>
  )
}

export const ExternallyControlled = (props: FilterProps) => {
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
        <Button
          onClick={() => {
            setFilterValue('assignee:@me')
            setSubmittedValue('assignee:@me')
          }}
        >
          Set to `assignee:@me`
        </Button>
        <Items query={submittedValue} />
      </Box>
    </div>
  )
}

export const ButtonVariant = (props: FilterProps) => {
  const [filterValue, setFilterValue] = useState('')
  const [submittedValue, setSubmittedValue] = useState('')

  return (
    <div>
      <Box sx={{gap: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%'}}>
        <Box sx={{display: 'flex', width: '100%'}}>
          <Text sx={{flex: 1, fontWeight: 'bold', fontSize: 3}}>Issues</Text>
          <Filter
            variant="button"
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
        </Box>
        <Items query={submittedValue} />
      </Box>
    </div>
  )
}

ButtonVariant.args = {...defaultArgs, variant: 'button'}

export const InputVariant = (props: FilterProps) => {
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

InputVariant.args = {...defaultArgs, variant: 'input'}

export const NoOnSubmit = (props: FilterProps) => {
  const [filterValue, setFilterValue] = useState('')

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
          onSubmit={undefined}
          settings={props.settings}
        />
        <Items query={filterValue} />
      </Box>
    </div>
  )
}

export const NoOnSubmitInputVariant = (props: FilterProps) => {
  const [filterValue, setFilterValue] = useState('')

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
          onSubmit={undefined}
          settings={props.settings}
        />
        <Items query={filterValue} />
      </Box>
    </div>
  )
}

export const Form = (props: FilterProps) => {
  const [filterValue, setFilterValue] = useState('')
  const [nameValue, setNameValue] = useState('')

  return (
    <div>
      <Box
        as="form"
        onSubmit={e => {
          e.preventDefault()
          alert(`Submit data:\nName: ${nameValue}\nFilter: ${filterValue}`)
        }}
        sx={{
          borderRadius: 12,
          borderColor: 'border.default',
          borderWidth: 1,
          borderStyle: 'solid',
          boxShadow: 'shadow.small',
          display: 'flex',
          flexDirection: 'column',
          mx: 'auto',
          overflow: 'hidden',
          maxWidth: 400,
        }}
      >
        <Box sx={{p: 4, gap: 3, display: 'flex', flexDirection: 'column'}}>
          <Text as="h1" sx={{fontSize: 3}}>
            Create a saved view
          </Text>
          <div>
            <FormControl>
              <FormControl.Label>Name</FormControl.Label>
              <TextInput
                block
                placeholder="Your view name"
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
              />
            </FormControl>
          </div>
          <Box sx={{display: 'flex', gap: 1, flexDirection: 'column'}}>
            <label htmlFor="storybook-filter">Filter</label>
            <Filter
              {...props}
              id="storybook-filter"
              context={{repo: 'github/github'}}
              label="Filter items"
              placeholder="Filter"
              filterValue={filterValue}
              onSubmit={undefined}
              filterButtonVariant="compact"
              providers={defaultProviders}
              onChange={(value: string) => setFilterValue(value)}
              settings={props.settings}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            p: 3,
            justifyContent: 'flex-end',
            bg: 'canvas.subtle',
            borderTopColor: 'border.default',
            borderTopWidth: 1,
            borderTopStyle: 'solid',
          }}
        >
          <Button>Cancel</Button>
          <Button type="submit" variant="primary">
            Create
          </Button>
        </Box>
      </Box>
    </div>
  )
}

NoOnSubmitInputVariant.args = {...defaultArgs, variant: 'input'}
