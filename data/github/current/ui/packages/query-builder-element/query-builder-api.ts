import type {SafeHTMLString} from '@github-ui/safe-html'

export type QueryBuilderAction = URLAction | QueryAction | RewriteQueryAction | CommandAction
export enum SearchScopeText {
  DIRECTORY = 'Search in this directory',
  ORG = 'Search in this organization',
  OWNER = 'Search in this owner',
  REPO = 'Search in this repository',
  GITHUB = 'Search all of GitHub',
  GENERAL = 'Submit search',
  COMMAND = 'Run command',
  COPILOT_CHAT = 'Start a new Copilot thread',
  COPILOT_SEARCH = 'Search with Copilot',
  EXPLORE = 'Learn More',
  DEFAULT = 'Jump to',
}

export const AutocompleteText = 'Autocomplete'

export type Provider = SearchProvider | FilterProvider

export interface Parser<IntermediateRepresentation> {
  // Note, the intermediate representation data will be available within
  // providers on the QueryEvent as QueryEvent.parsedMetadata
  parse(input: string, caretPosition: number | undefined): IntermediateRepresentation

  // Flattens the intermediate representation into a list of QueryElements that
  // can be styled by QueryBuilder
  flatten(input: IntermediateRepresentation): QueryElement[]
}

interface FilterItemData {
  filter: string
  value: string
  name?: string
  description?: string
  inlineDescription?: boolean
  priority?: number
  icon?: Icon
  avatar?: Avatar
  action?: QueryBuilderAction
}

export interface Avatar {
  type: 'user' | 'org' | 'team'
  url: string
}

/**
 * FilterItem represents a value that can be used in a filter. Some examples:
 * - filter is `repo:`, value is `github/github`
 * - filter is `author:`, value is `@keithamus`
 */
export class FilterItem extends Event {
  public name: string
  public filter: string
  public value: string
  public description: string
  public inlineDescription = false
  public action?: QueryBuilderAction
  public priority: number
  public icon?: Icon
  public avatar?: Avatar

  constructor({
    filter,
    value,
    name = '',
    description = '',
    inlineDescription = false,
    priority = Infinity,
    icon = undefined,
    avatar = undefined,
    action,
  }: FilterItemData) {
    super('filter-item')
    this.filter = filter
    this.value = value
    this.name = name
    this.description = description
    this.inlineDescription = inlineDescription
    this.priority = priority
    this.icon = icon
    this.avatar = avatar
    this.action = action
  }
}

/* URLAction represents the URL a SearchItem will navigate to when enacted on */
interface URLAction {
  url: string
}

/* QueryAction Represents the new Query String that a SearchItem will populate
 * the query-builder input with, when enacted on*/
interface QueryAction {
  query: string
}

interface RewriteQueryAction {
  // Replaces the entire query with the provided string
  replaceQueryWith: string
  // The position in the query to move the caret to
  moveCaretTo: number
}

interface CommandAction {
  commandName: string
  data: Record<string, unknown>
}

export interface CustomIcon {
  html: SafeHTMLString
}

export function isCustomIcon(icon: Icon): icon is CustomIcon {
  return icon instanceof Object
}

export enum Octicon {
  Apps = 'apps',
  Archived = 'archived',
  Book = 'book',
  Bookmark = 'bookmark',
  Branch = 'branch',
  Calendar = 'calendar',
  Circle = 'circle',
  Code = 'code',
  CodeReview = 'code-review',
  CodeSquare = 'code-square',
  Comment = 'comment',
  CommentDiscussion = 'comment-discussion',
  Copilot = 'copilot',
  CopilotError = 'copilot-error',
  Codespaces = 'codespaces',
  CreditCard = 'credit-card',
  Default = 'default',
  DeviceDesktop = 'device-desktop',
  DeviceMobile = 'device-mobile',
  Discussion = 'discussion',
  Draft = 'draft',
  FileCode = 'file-code',
  Filter = 'filter',
  Forbidden = 'forbidden',
  Gift = 'gift',
  Globe = 'globe',
  Heart = 'heart',
  History = 'history',
  Issue = 'issue',
  IssueOpened = 'issue-opened',
  IssueClosed = 'issueClosed',
  Iterations = 'iterations',
  Mention = 'mention',
  Merged = 'merged',
  Milestone = 'milestone',
  No = 'no',
  Not = 'not',
  Organization = 'organization',
  Package = 'package',
  Pencil = 'pencil',
  Person = 'person',
  Play = 'play',
  PlusCircle = 'plus-circle',
  Project = 'project',
  PullRequest = 'pullRequest',
  Question = 'question',
  Reaction = 'reaction',
  Repo = 'repo',
  Rocket = 'rocket',
  Search = 'search',
  Server = 'server',
  ShieldCheck = 'shield-check',
  SingleSelect = 'single-select',
  Sort = 'sort',
  Tag = 'tag',
  Team = 'team',
  Telescope = 'telescope',
  Trash = 'trash',
  Workflow = 'workflow',
}

export enum PrefixColor {
  Entity = '--color-prettylights-syntax-entity',
  Constant = '--color-prettylights-syntax-constant',
  Keyword = '--color-prettylights-syntax-keyword',
  Variable = '--color-prettylights-syntax-variable',
  String = '--color-prettylights-syntax-string',
}

export type Icon = Octicon | CustomIcon

interface SearchItemData {
  id?: string
  priority: number
  value: string
  action: QueryBuilderAction
  description?: string
  icon?: Icon
  scope?: keyof typeof SearchScopeText
  prefixText?: string
  prefixColor?: PrefixColor

  // If set, the item will only be rendered if no other providers
  // sent items.
  isFallbackSuggestion?: boolean
  isUpdate?: boolean
}

/* SearchItem represents a result that appears in the results list, and has an action for a user to enact on */
export class SearchItem extends Event {
  public id?: string
  public priority: number
  public value: string
  public action: QueryBuilderAction
  public description: string
  public icon?: Icon
  public scope: keyof typeof SearchScopeText
  public prefixText?: string
  public prefixColor?: PrefixColor
  public isFallbackSuggestion: boolean

  constructor({
    id,
    priority,
    value,
    action,
    description = '',
    icon = undefined,
    scope = 'DEFAULT',
    prefixText,
    prefixColor,
    isFallbackSuggestion,
    isUpdate,
  }: SearchItemData) {
    super(isUpdate ? 'update-item' : 'search-item')
    this.id = id
    this.priority = priority
    this.value = value
    this.prefixText = prefixText
    this.prefixColor = prefixColor
    this.action = action
    this.description = description
    this.icon = icon
    this.scope = scope
    this.isFallbackSuggestion = isFallbackSuggestion || false
  }
}

export interface SearchProvider extends EventTarget {
  priority: number
  icon?: Icon
  name: string // plural group name (i.e. "repositories" or "teams") - will be the visual header
  description?: string
  singularItemName: string // singular name for an item (i.e. "repository" or "team") to construct a meaningful aria-label, doesn't appear visually
  value: string // visual name of the filter (i.e. "is:")
  type: 'search'
}

export interface FilterProvider extends EventTarget {
  priority: number
  icon?: Icon
  name: string // plural group name (i.e. "repositories" or "teams") - will be the visual header
  description?: string
  singularItemName: string // singular name for an item (i.e. "repository" or "team") to construct a meaningful aria-label, doesn't appear visually
  value: string // visual name of the filter (i.e. "is:")
  type: 'filter'
  // When set, if a filter provider emits filter items, always render them in the UI. If not set,
  // filter items will only be rendered if the querybuilder thinks a filter item is being written
  // by the user, which may be incorrect if using a custom parser.
  manuallyDetermineFilterEligibility?: boolean
}

export type QueryElement = QueryFilterElement | QueryTextElement

export interface QueryFilterElement {
  type: 'filter'
  filter: string
  value: string
  style?: TextElementStyle
}

export interface QueryTextElement {
  type: 'text'
  value: string
  style?: TextElementStyle
}

export enum TextElementStyle {
  Normal = 'normal',
  Entity = 'entity',
  Constant = 'constant',
  FilterValue = 'filter-value',
}

export class FetchDataEvent extends Event {
  constructor(public fetchPromise: Promise<unknown>) {
    super('fetch-data')
  }
}

export class QueryEvent extends Event {
  constructor(
    public parsedQuery: QueryElement[],
    public rawQuery: string,
    public parsedMetadata: unknown,
  ) {
    super('query')
  }

  override toString() {
    return this.rawQuery
  }
}

class QueryBuilderProvider extends Event {
  constructor(public provider: SearchProvider) {
    super('query-builder-provider', {bubbles: true})
  }
}

declare global {
  interface Document {
    addEventListener(type: 'query-builder-provider', handler: (event: QueryBuilderProvider) => void): void
  }
}
