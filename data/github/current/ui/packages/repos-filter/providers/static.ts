import {
  type FilterKey,
  FilterProviderType,
  type FilterSuggestion,
  ProviderSupportStatus,
  type SuppliedFilterProviderOptions,
} from '@github-ui/filter'
import {StaticFilterProvider} from '@github-ui/filter/providers'
import {
  ArchiveIcon,
  CalendarIcon,
  CodeIcon,
  EyeIcon,
  FileCodeIcon,
  FileIcon,
  HeartIcon,
  IssueOpenedIcon,
  MirrorIcon,
  RepoForkedIcon,
  RepoTemplateIcon,
  SortAscIcon,
  StarIcon,
  TelescopeIcon,
  TypographyIcon,
} from '@primer/octicons-react'

const single: SuppliedFilterProviderOptions = {filterTypes: {multiKey: false, multiValue: false, valueless: false}}
const comma: SuppliedFilterProviderOptions = {filterTypes: {multiKey: false, multiValue: true, valueless: false}}
const multiKey: SuppliedFilterProviderOptions = {filterTypes: {multiKey: true, multiValue: false, valueless: false}}
const multiComma: SuppliedFilterProviderOptions = {filterTypes: {multiKey: true, multiValue: true, valueless: false}}

export function getAllStaticProviders() {
  return [
    new ValuesFilterProvider(REPOS_STATIC_FILTER_KEYS.has, REPOS_STATIC_FILTER_VALUES.has, single),
    new ValuesFilterProvider(REPOS_STATIC_FILTER_KEYS.is, REPOS_STATIC_FILTER_VALUES.is, {
      ...comma,
      support: {
        status: ProviderSupportStatus.Deprecated,
        message: 'Filter "is:" is deprecated, use "visibility:" or "sponsorable:" instead',
      },
    }),
    new ValuesFilterProvider(REPOS_STATIC_FILTER_KEYS.license, REPOS_STATIC_FILTER_VALUES.license, comma),
    new ValuesFilterProvider(REPOS_STATIC_FILTER_KEYS.sort, REPOS_STATIC_FILTER_VALUES.sort, multiKey),
    new ValuesFilterProvider(REPOS_STATIC_FILTER_KEYS.topic, REPOS_STATIC_FILTER_VALUES.topic, multiComma),
    new ValuesFilterProvider(REPOS_STATIC_FILTER_KEYS.visibility, REPOS_STATIC_FILTER_VALUES.visibility, comma),

    new BooleanFilterProvider(REPOS_STATIC_FILTER_KEYS.fork),
    new BooleanFilterProvider(REPOS_STATIC_FILTER_KEYS.archived),
    new BooleanFilterProvider(REPOS_STATIC_FILTER_KEYS.mirror),
    new BooleanFilterProvider(REPOS_STATIC_FILTER_KEYS.sponsorable),
    new BooleanFilterProvider(REPOS_STATIC_FILTER_KEYS.template),
  ]
}

const NOT_SHOWN = 10

const REPOS_STATIC_FILTER_KEYS = {
  archived: {displayName: 'Archived', key: 'archived', description: '', priority: NOT_SHOWN, icon: ArchiveIcon},
  fork: {displayName: 'Fork', key: 'fork', description: '', priority: 3, icon: RepoForkedIcon},
  has: {displayName: 'Has', key: 'has', description: '', priority: NOT_SHOWN, icon: FileIcon},
  is: {displayName: 'Is', key: 'is', description: '', priority: NOT_SHOWN, icon: EyeIcon},
  license: {displayName: 'License', key: 'license', description: '', priority: 4, icon: FileCodeIcon},
  mirror: {displayName: 'Mirror', key: 'mirror', description: '', priority: 3, icon: MirrorIcon},
  sort: {displayName: 'Sort', key: 'sort', description: 'Order of results', priority: NOT_SHOWN, icon: SortAscIcon},
  sponsorable: {
    displayName: 'Sponsorable',
    key: 'sponsorable',
    description: '',
    priority: NOT_SHOWN,
    icon: HeartIcon,
  },
  template: {displayName: 'Template', key: 'template', description: '', priority: NOT_SHOWN, icon: RepoTemplateIcon},
  topic: {displayName: 'Topic', key: 'topic', priority: NOT_SHOWN, icon: TelescopeIcon},
  visibility: {displayName: 'Visibility', key: 'visibility', description: '', priority: 3, icon: EyeIcon},
}

const VISIBILITY_FILTER_VALUES = [
  {value: 'public', displayName: 'Public', priority: 1},
  {value: 'private', displayName: 'Private', priority: 2},
  {value: 'internal', displayName: 'Internal', priority: 3},
]

export const TRUE_FALSE_FILTER_VALUES = [
  {value: 'true', displayName: 'True', priority: 1},
  {value: 'false', displayName: 'False', priority: 1},
]

const REPOS_STATIC_FILTER_VALUES = {
  has: [{value: 'funding-file', displayName: 'Funding file', priority: 1}],
  is: [...VISIBILITY_FILTER_VALUES, {value: 'sponsorable', displayName: 'Sponsorable', priority: 4}],
  license: [
    {value: '0bsd', displayName: 'BSD Zero Clause License', priority: 1},
    {value: 'mit', displayName: 'MIT License', priority: 2},
    {value: 'apache-2.0', displayName: 'Apache License 2.0', priority: 3},
    {value: 'cc', displayName: 'Creative Commons', priority: 4},
    {value: 'gpl', displayName: 'GNU General Public License', priority: 5},
    {value: 'lgpl', displayName: 'GNU Lesser General Public License', priority: 6},
  ],
  sort: [
    {value: 'updated', displayName: 'Recently pushed', icon: CalendarIcon, priority: 1},
    {value: 'name-asc', displayName: 'Name', icon: TypographyIcon, priority: 2},
    {value: 'language-asc', displayName: 'Language', icon: CodeIcon, priority: 3},
    {value: 'license-asc', displayName: 'License', icon: FileCodeIcon, priority: 3},
    {value: 'topics', displayName: 'Topics', icon: TelescopeIcon, priority: 3},
    {value: 'size', displayName: 'Size', icon: FileIcon, priority: 3},
    {value: 'stars', displayName: 'Total stars', icon: StarIcon, priority: 3},
    {value: 'forks', displayName: 'Total forks', icon: RepoForkedIcon, priority: 3},
    {value: 'updated-asc', displayName: 'Recently pushed (descending)', icon: CalendarIcon, priority: NOT_SHOWN},
    {value: 'name', displayName: 'Name (descending)', icon: TypographyIcon, priority: NOT_SHOWN},
    {value: 'language', displayName: 'Language (descending)', icon: CodeIcon, priority: NOT_SHOWN},
    {value: 'license', displayName: 'License (descending)', icon: FileCodeIcon, priority: NOT_SHOWN},
    {value: 'topics-asc', displayName: 'Topics (ascending)', icon: TelescopeIcon, priority: NOT_SHOWN},
    {value: 'size-asc', displayName: 'Size (ascending)', icon: FileIcon, priority: NOT_SHOWN},
    {value: 'stars-asc', displayName: 'Total stars (ascending)', icon: StarIcon, priority: NOT_SHOWN},
    {value: 'forks-asc', displayName: 'Total forks (ascending)', icon: RepoForkedIcon, priority: NOT_SHOWN},
    {
      value: 'help-wanted-issues-asc',
      displayName: 'Help-wanted issues (ascending)',
      icon: IssueOpenedIcon,
      priority: 5,
    },
    {value: 'help-wanted-issues', displayName: 'Help-wanted issues (descending)', icon: IssueOpenedIcon, priority: 5},
  ],
  topic: [],
  visibility: VISIBILITY_FILTER_VALUES,
}

class ValuesFilterProvider extends StaticFilterProvider {
  constructor(filter: FilterKey, values: FilterSuggestion[], options?: SuppliedFilterProviderOptions) {
    super(filter, values, options)
    this.type = values.length === 0 ? FilterProviderType.RawText : FilterProviderType.Select
  }
}

class BooleanFilterProvider extends StaticFilterProvider {
  constructor(filter: FilterKey) {
    super(filter, TRUE_FALSE_FILTER_VALUES, single)
    this.type = FilterProviderType.Boolean
  }
}
