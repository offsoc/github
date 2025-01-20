import type {Icon} from '@primer/octicons-react'
import type {RefObject} from 'react'

import type {InputContextRef} from './context/InputContext'
import type {FilterQuery} from './filter-query'
/**
 * Typescript Helpers
 */

export const INDETERMINANT = '#INDETERMINANT#'
export const NOT_SHOWN = 10
export const FILTER_PRIORITY_DISPLAY_THRESHOLD = 5

export type OptionalKey<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property]
}

export enum FilterValueType {
  Key = 'key',
  Value = 'value',
  NoValue = '',
}

export type KeywordValueType = 'keyword'

export enum AvatarType {
  User = 'user',
  Org = 'org',
  Team = 'team',
}

export interface Avatar {
  type: AvatarType
  url: string
}

export interface ValueRowProps {
  leadingVisual?: JSX.Element | null
  trailingVisual?: JSX.Element
  text: string
  description?: string
  descriptionVariant?: 'inline' | 'block'
  disabled?: boolean
}

//#region Filter Settings
export type FilterVariant = 'full' | 'button' | 'input'

export type FilterSettings = {
  aliasMatching?: boolean
  disableAdvancedTextFilter?: boolean
  groupAndKeywordSupport?: boolean
}

export type FilterConfig = {
  filterDelimiter: string
  valueDelimiter: string
  variant: FilterVariant
} & FilterSettings

export type CaretPositionCallback = (selectionStart: number, selectionEnd?: number | null) => void

export type FilterContext = {
  config: FilterConfig
  id?: string
  inputContextRef: RefObject<InputContextRef>
}

export type QueryContext = Record<string, string>

//#endregion

//#region Filter Providers
/**
 * Filter Providers
 */

export enum FilterProviderType {
  Select = 'select',
  User = 'user',
  Text = 'text',
  Date = 'date',
  Number = 'number',
  Boolean = 'boolean',
  RawText = 'rawText',
  Unknown = 'unknown',
}

export enum ProviderSupportStatus {
  Unsupported = 'unsupported',
  Supported = 'supported',
  Deprecated = 'deprecated',
}

export type SuppliedFilterProviderOptions = {
  priority?: number
  support?: {
    status?: ProviderSupportStatus
    message?: string
  }
  filterTypes?: {
    inclusive?: boolean
    exclusive?: boolean
    valueless?: boolean
    multiKey?: boolean
    multiValue?: boolean
  }
}

export type FilterProviderOptions = Required<SuppliedFilterProviderOptions>

export interface FilterKey {
  /** @property {string} key - The first part of the FilterBlock, such as `assignees`, `state`, etc. */
  key: string
  /** @property {string[]} [aliases] - An optional list of aliases for the `key` */
  aliases?: string[]
  /**
   * @property {string} [displayName] - An optional field for formatted displays, such as the Advanced Filter Dialog
   * or Suggestions List. This is usually a capitalized value
   */
  displayName?: string
  /** @property {string} [description] - An optional field to describe what this filter is for. Should be a short sentence. */
  description?: string
  /**
   * @property {number} priority - A numeric from 1 to 10 priority compared with other filters. Note: Any value
   * above 5 will not be shown in the suggestions list.
   */
  priority: number
  /** @property {Icon} icon - An Octicon icon that shows in lists with the `displayName` to make the filter identifiable */
  icon: Icon
  /**
   * @property {FilterProviderOptions} [options] - An `FilterProviderOptions` object specifying what filter types are
   * allowed (`inclusive`, `exclusive`, etc.) as well as `ProviderSupportStatus` (`unsupported`, `supported`, `deprecated`)
   * */
  options?: FilterProviderOptions
}

export interface FilterValueValidator<T = unknown> {
  validateValue: (
    filterQuery: FilterQuery,
    value: IndexedBlockValueItem,
    data: T | null,
  ) => Partial<IndexedBlockValueItem> | false | null | undefined
}

export interface FilterProvider extends WithRequiredProperty<FilterKey, 'options'> {
  /**
   * @property {FilterProviderType} type - Specifies the type of filter from the `FilterProviderType` list, such as
   * `Select`, `User`, `Date`, etc.
   */
  type: FilterProviderType
  /**
   * @property {FilterValueData[]} [filterValues] - An optional list of fixed or static values. If your Filter
   * Provider requires fetching from the server based on user input, you should not use this field.
   */
  filterValues?: FilterValueData[]

  /**
   * This function takes a filter block and computes suggestions to provide the user with, if any.
   * @param {FilterQuery} filterQuery - The filter query to use to provide context.
   * @param {AnyBlock | MutableFilterBlock} filterBlock - The filter block to use to compute suggestions with. You can
   * use the `value` to filter down suggestions. Note: `value` could hold multiple values.
   * @param {FilterConfig} [config] - An optional `FilterConfig` supplied by the Filter Context
   * @param {number | null} [caretIndex] - Where the caret is. Using this, you can determine which value (if there are
   * multiple) needs suggestions
   * @returns {BlockValueItem[] | Promise<BlockValueItem[]>} - Returns a fully qualified `BlockValueItem`, including
   * setting its validity. Note: If your function requires fetching from the server, it should be an async function
   * that returns a promise.
   */
  getSuggestions: (
    filterQuery: FilterQuery,
    filterBlock: AnyBlock | MutableFilterBlock,
    config: FilterConfig,
    caretIndex?: number | null,
  ) => Promise<ARIAFilterSuggestion[] | null> | ARIAFilterSuggestion[] | null
  /**
   * This function is meant to take in a single string value to validate.
   * @param {string} filterValue - The string value to validate
   * @param {FilterConfig} [config] - An optional `FilterConfig` supplied by the Filter Context
   * @returns {BlockValueItem[] | Promise<BlockValueItem[]>} - Returns a fully qualified `BlockValueItem`, including
   * setting its validity. Note: If your function requires fetching from the server, it should be an async function
   * that returns a promise.
   */
  validateFilterBlockValues: (
    filterQuery: FilterQuery,
    block: FilterBlock,
    values: IndexedBlockValueItem[],
    config: FilterConfig,
  ) => IndexedBlockValueItem[] | Promise<IndexedBlockValueItem[]>
  /**
   * This function allows for customization for how results show in select fields and lists
   * @param {FilterValueData} value - The value data object that will be mapped to the `ValueRowProps`. This has
   * fields like `name`, `icon`, etc.
   * @returns {ValueRowProps} - The structured object that is consumed by select fields and lists for displaying of items
   */
  getValueRowProps: (value: FilterValueData) => ValueRowProps
  findPrefetchedSuggestions?: (value: string | null) => ARIAFilterSuggestion[]
  isCompleteResultSetQuery?: (value: string | null) => boolean
}

export type DelimiterLocator = {
  index: number
  blockId: number
  delimiterId: number
}

export enum KEY_ONLY_FILTERS {
  Base = 'base',
  Head = 'head',
  InBody = 'inBody',
  InComments = 'inComments',
  InTitle = 'inTitle',
  Type = 'type',
  Language = 'language',
  Milestone = 'milestone',
  Sha = 'sha',
}

export enum STATIC_VALUE_FILTERS {
  Archived = 'archived',
  Closed = 'closed',
  Comments = 'comments',
  Created = 'created',
  Draft = 'draft',
  Interactions = 'interactions',
  Is = 'is',
  Linked = 'linked',
  MemexState = 'memexState',
  Merged = 'merged',
  PRState = 'prState',
  Reactions = 'reactions',
  Reason = 'reason',
  Review = 'review',
  Sort = 'sort',
  State = 'state',
  Status = 'status',
  Type = 'type',
  Updated = 'updated',
}

export enum DYNAMIC_VALUE_FILTERS {
  Language = 'language',
  Label = 'label',
  Milestone = 'milestone',
  No = 'no',
  Org = 'org',
  Project = 'project',
  Repo = 'repo',
  Team = 'team',
  TeamReviewRequested = 'teamReviewRequested',
}

export type VALUE_FILTERS = STATIC_VALUE_FILTERS | DYNAMIC_VALUE_FILTERS

export enum SubmitEvent {
  SuggestionSelected = 'suggestion-selected',
  DialogSubmit = 'dialog-submit',
  ExplicitSubmit = 'explicit-submit',
}

//#endregion

//#region Filter Parser
/**
 * Filter Parser
 */

export interface Parser<IntermediateRepresentation> {
  filterProviders: FilterProvider[]
  // Note, the intermediate representation data will be available within
  // providers on the QueryEvent as QueryEvent.parsedMetadata
  parse(input: string, filterQuery: FilterQuery, caretIndex: number): IntermediateRepresentation
  replaceActiveBlockWithNoBlock(filterQuery: FilterQuery): [string, number]
  insertSuggestion(filterBarQuery: FilterQuery, suggestion: string, caretPosition: number): [string, number]
  getRaw(parsed: IntermediateRepresentation): string
  validateFilterQuery(filterBarQuery: FilterQuery): Promise<FilterQuery>
}

//#endregion

//#region Filter Data

export interface BaseFilterValue {
  value: string | (() => string)
}

export interface FilterValueData extends BaseFilterValue {
  displayName?: string
  description?: string
  id?: string
  inlineDescription?: boolean
  icon?: Icon
  avatar?: Avatar
  iconColor?: string
  aliases?: string[]
}

export type FilterSuggestion = {
  type?: FilterValueType | KeywordValueType
  priority: number
} & FilterValueData

export type ARIAFilterSuggestion = {
  ariaLabel: string
} & FilterSuggestion

export type FilterSuggestionGroup = {
  id: string
  title?: string
  suggestions: ARIAFilterSuggestion[]
}

//#endregion

//#region Blocks
/**
 * Blocks and related types
 */

export enum ValidationTypes {
  EmptyValue = 'empty-value',
  InvalidValue = 'invalid-value',
  MultiValueUnsupported = 'multi-value-unsupported',
  FilterProviderDeprecated = 'filter-provider-deprecated',
  FilterProviderUnsupported = 'filter-provider-unsupported',
  UnbalancedQuotations = 'unbalanced-quotations',
  UnbalancedParentheses = 'unbalanced-parentheses',
  MaxNestedGroups = 'max-nested-groups',
}

export enum BlockType {
  Filter = 'filter',
  Text = 'text',
  Space = 'space',
  Keyword = 'keyword',
  Group = 'group',
  UnmatchedOpenParen = 'unmatched-open-paren',
  UnmatchedCloseParen = 'unmatched-close-paren',
}

interface BaseBlock {
  id: number
  type: BlockType
  raw: string
}

export type Validation = {
  type: ValidationTypes
  message: string
}

interface ValidatableBlock {
  valid?: boolean
  validations?: Validation[]
}

export interface TextBlock extends BaseBlock, ValidatableBlock {
  type: BlockType.Text
}

export interface SpaceBlock extends BaseBlock {
  type: BlockType.Space
}

export interface KeywordBlock extends BaseBlock {
  type: BlockType.Keyword
}

export type AnyBlock =
  | FilterBlock
  | TextBlock
  | SpaceBlock
  | GroupBlock
  | KeywordBlock
  | UnmatchedOpenParenBlock
  | UnmatchedCloseParenBlock

export interface FilterBlock extends BaseBlock {
  type: BlockType.Filter
  key: BlockKey
  provider: FilterProvider
  operator: FilterOperator
  valid?: boolean
  validationMessage?: string
  value: BlockValue
}

export type BlockKey = {
  value: string
} & ValidatableBlock

export type BlockValue = {
  values: BlockValueItem[]
  raw: string
}

export type BlockValueItem = FilterValueData & ValidatableBlock

export interface GroupBlock extends BaseBlock, ValidatableBlock {
  type: BlockType.Group
  blocks: AnyBlock[]
}

export interface UnmatchedOpenParenBlock extends BaseBlock {
  type: BlockType.UnmatchedOpenParen
  valid?: boolean
  validations?: Validation[]
}

export interface UnmatchedCloseParenBlock extends BaseBlock {
  type: BlockType.UnmatchedCloseParen
  valid?: boolean
  validations?: Validation[]
}

interface BlockIndices {
  startIndex: number
  endIndex: number
  hasCaret: boolean
}

export type IndexedAnyBlock =
  | IndexedFilterBlock
  | IndexedTextBlock
  | IndexedGroupBlock
  | IndexedSpaceBlock
  | IndexedKeywordBlock
  | IndexedUnmatchedOpenParenBlock
  | IndexedUnmatchedCloseParenBlock

export interface IndexedSpaceBlock extends SpaceBlock, BlockIndices {}

export interface IndexedKeywordBlock extends KeywordBlock, BlockIndices {}

export interface IndexedFilterBlock extends FilterBlock, BlockIndices {
  key: IndexedBlockKey
  value: IndexedBlockValue
}

export interface IndexedTextBlock extends TextBlock, BlockIndices {}

export interface IndexedGroupBlock extends GroupBlock, BlockIndices {
  blocks: IndexedAnyBlock[]
}

export interface IndexedUnmatchedOpenParenBlock extends UnmatchedOpenParenBlock, BlockIndices {}

export interface IndexedUnmatchedCloseParenBlock extends UnmatchedCloseParenBlock, BlockIndices {}

export interface IndexedBlockKey extends BlockKey, BlockIndices {}

export interface IndexedBlockValue extends BlockValue, BlockIndices {
  values: IndexedBlockValueItem[]
}

export interface IndexedBlockValueItem extends BlockValueItem, BlockIndices {}

export type MutableFilterBlock = Partial<FilterBlock> & {
  id: number
  raw: string
  type: BlockType.Filter
}

//#endregion

//#region Filter Operators
/**
 * Filter Operators
 */

export enum FilterOperator {
  IsOneOf = 'IsOneOf',
  IsNotOneOf = 'IsNotOneOf',
  Is = 'Is',
  IsNot = 'IsNot',
  GreaterThan = 'GreaterThan',
  LessThan = 'LessThan',
  GreaterThanOrEqualTo = 'GreaterThanOrEqualTo',
  LessThanOrEqualTo = 'LessThanOrEqualTo',
  EqualTo = 'EqualTo',
  Before = 'Before',
  After = 'After',
  BeforeAndIncluding = 'BeforeAndIncluding',
  AfterAndIncluding = 'AfterAndIncluding',
  Between = 'Between',
}

export const FilterOperators: Record<FilterOperator, string> = {
  IsOneOf: 'is one of',
  IsNotOneOf: 'is not one of',
  Is: 'is',
  IsNot: 'is not',
  GreaterThan: 'greater than',
  LessThan: 'less than',
  GreaterThanOrEqualTo: 'greater than or equal to',
  LessThanOrEqualTo: 'less than or equal to',
  EqualTo: 'equal to',
  Before: 'before',
  After: 'after',
  BeforeAndIncluding: 'before and including',
  AfterAndIncluding: 'after and including',
  Between: 'between',
}

export type SimpleFilterOperator = FilterOperator[]

export type ComplexFilterOperator = {
  single: FilterOperator[]
  multi: FilterOperator[]
}

export const ValueOperators: FilterOperator[] = [
  FilterOperator.GreaterThan,
  FilterOperator.LessThan,
  FilterOperator.GreaterThanOrEqualTo,
  FilterOperator.LessThanOrEqualTo,
  FilterOperator.Before,
  FilterOperator.After,
  FilterOperator.Between,
]

export const FilterTypeOperators: Record<FilterProviderType, SimpleFilterOperator | ComplexFilterOperator> = {
  select: {
    single: [FilterOperator.Is, FilterOperator.IsNot],
    multi: [FilterOperator.IsOneOf, FilterOperator.IsNotOneOf],
  },
  user: {
    single: [FilterOperator.Is, FilterOperator.IsNot],
    multi: [FilterOperator.IsOneOf, FilterOperator.IsNotOneOf],
  },
  text: {
    single: [FilterOperator.Is, FilterOperator.IsNot],
    multi: [FilterOperator.IsOneOf, FilterOperator.IsNotOneOf],
  },
  date: [
    FilterOperator.Before,
    FilterOperator.After,
    FilterOperator.BeforeAndIncluding,
    FilterOperator.AfterAndIncluding,
    FilterOperator.Between,
    FilterOperator.IsOneOf,
    FilterOperator.IsNotOneOf,
  ],
  number: [
    FilterOperator.EqualTo,
    FilterOperator.GreaterThan,
    FilterOperator.GreaterThanOrEqualTo,
    FilterOperator.LessThan,
    FilterOperator.LessThanOrEqualTo,
    FilterOperator.Between,
  ],
  boolean: [FilterOperator.Is, FilterOperator.IsNot],
  rawText: [FilterOperator.Is],
  unknown: [FilterOperator.Is, FilterOperator.IsNot],
}
//#endregion
