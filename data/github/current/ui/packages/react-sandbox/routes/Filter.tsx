import {Filter, ProviderSupportStatus, type FilterProvider, type FilterQuery} from '@github-ui/filter'
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
  InTitleFilterProvider,
  InteractionsFilterProvider,
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
  ReviewFilterProvider,
  ReviewRequestedFilterProvider,
  ReviewedByFilterProvider,
  SortFilterProvider,
  StateFilterProvider,
  StatusFilterProvider,
  TypeFilterProvider,
  UpdatedFilterProvider,
  UserFilterProvider,
  UserReviewRequestedFilterProvider,
} from '@github-ui/filter/providers'
import {useState} from 'react'

export function FilterPage() {
  const [filterValue, setFilterValue] = useState('')
  const [submittedValue, setSubmittedValue] = useState('')

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
    new InBodyFilterProvider(),
    new InCommentsFilterProvider(),
    new InTitleFilterProvider(),
    new OrgFilterProvider(),
    new SortFilterProvider(['created', 'updated', 'reactions', 'comments', 'author-date', 'committer-date']),
    new MilestoneFilterProvider(),
    new RepositoryFilterProvider(),
  ]

  return (
    <div data-hpc>
      <Filter
        id="sandbox-filter"
        context={{repo: 'monalisa/smile'}}
        label="Filter items"
        filterValue={filterValue}
        providers={defaultProviders}
        onChange={(value: string) => setFilterValue(value)}
        onSubmit={(request: FilterQuery) => setSubmittedValue(request.raw)}
      />

      <div>{submittedValue}</div>
    </div>
  )
}
