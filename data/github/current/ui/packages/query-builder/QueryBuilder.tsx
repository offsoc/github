/*
Note: This component is considered EXPERIMENTAL currently.
In the future this should move out of `react-shared` and become part of primer.
The underlying PVC query-builder is considered experimental and is being worked on - be advised.
*/

import {QueryBuilderElement} from '@github-ui/query-builder-element'
import {testIdProps} from '@github-ui/test-id-props'
import {
  AppsIcon,
  ArchiveIcon,
  BookmarkIcon,
  CalendarIcon,
  CircleSlashIcon,
  CodeIcon,
  CommentDiscussionIcon,
  CommentIcon,
  DotFillIcon,
  FileIcon,
  FilterIcon,
  GitBranchIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  HistoryIcon,
  IssueClosedIcon,
  IssueDraftIcon,
  IssueOpenedIcon,
  IterationsIcon,
  MentionIcon,
  MilestoneIcon,
  NoEntryIcon,
  OrganizationIcon,
  PencilIcon,
  PeopleIcon,
  PersonIcon,
  PlusCircleIcon,
  QuestionIcon,
  RepoIcon,
  SearchIcon,
  SingleSelectIcon,
  SmileyIcon,
  SortDescIcon,
  TableIcon,
  TagIcon,
  TrashIcon,
  XCircleFillIcon,
} from '@primer/octicons-react'
import {Box, IconButton, Octicon, type SxProp} from '@primer/react'
import type React from 'react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {renderToString} from 'react-dom/server'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'query-builder': {
        children?: React.ReactNode
        ref: React.RefObject<QueryBuilderElement>
      }
    }
  }
}

export type QueryBuilderProps = {
  id: string
  onRequestProvider: (event: Event) => void
  inputRef?: React.RefObject<HTMLInputElement>
  placeholder: string | undefined
  inputValue: string | undefined
  label: string
  visuallyHideLabel?: boolean
  clearIconInitiallyVisible?: boolean
  onKeyPress?: React.KeyboardEventHandler<Element>
  onKeyDown?: React.KeyboardEventHandler<Element>
  onChange: React.ChangeEventHandler<HTMLInputElement>
  renderSingularItemNames?: boolean
  sxString?: string
  'data-testid'?: string | undefined
  sx?: SxProp | null
}

export function QueryBuilder({
  id,
  inputRef,
  placeholder,
  inputValue,
  label,
  visuallyHideLabel,
  clearIconInitiallyVisible = false,
  onKeyPress,
  onKeyDown,
  onChange,
  onRequestProvider,
  renderSingularItemNames,
  sxString,
  'data-testid': dataTestId,
  sx,
}: QueryBuilderProps) {
  const queryBuilderRef = useRef<QueryBuilderElement>(null)

  id = `query-builder-${id}`
  const labelId = `${id}-label`
  const inputId = `${id}-input`

  useEffect(() => {
    if (!(queryBuilderRef.current instanceof QueryBuilderElement)) {
      return
    }

    const currentRef = queryBuilderRef.current
    if (currentRef) {
      currentRef.addEventListener('query-builder:request-provider', onRequestProvider)
      currentRef.readyForRequestProviders()
      currentRef.id = `query-builder-${id}`
      currentRef.setAttribute('data-filter-key', ':') // todo: this should be the default in query builder
      currentRef.className = 'QueryBuilder'
      currentRef.renderSingularItemNames = renderSingularItemNames || true
      if (sxString != null) currentRef.setAttribute('style', sxString)
    }

    return () => {
      currentRef?.removeEventListener('query-builder:request-provider', onRequestProvider)
    }
  }, [id, onRequestProvider, sxString, renderSingularItemNames])

  const leadingVisual = (
    <Box
      sx={{
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyItems: 'flex-start',
      }}
    >
      <Octicon icon={SearchIcon} aria-label="Search" sx={{ml: '12px', mr: 1, color: 'fg.muted'}} />
    </Box>
  )

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const queryBuilder = queryBuilderRef.current
    queryBuilder?.inputSubmit()
  }

  const [currentValue, setCurrentValue] = useState(inputValue)

  const onChangeWithState = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentValue(inputRef?.current?.value)
      onChange(e)
    },
    [inputRef, onChange],
  )

  // Updating inner state when input value is changed from outside this component
  useEffect(() => {
    async function updateInputValue() {
      setCurrentValue(inputValue)
      await queryBuilderRef?.current?.parseQuery(undefined, false)
    }
    if (inputValue !== currentValue) updateInputValue()
  }, [currentValue, inputValue, queryBuilderRef])

  return (
    <form
      acceptCharset="UTF-8"
      action="/search"
      method="get"
      style={{flex: 1, minWidth: 0, ...sx}}
      onSubmit={e => onSubmit(e)}
      {...testIdProps('query-builder-form')}
    >
      <query-builder ref={queryBuilderRef} defer-request-providers data-catalyst="true" data-filter-key=":">
        <div className="FormControl FormControl--fullWidth" style={{gap: 0}}>
          <label
            id={labelId}
            htmlFor={inputId}
            className={`FormControl-label ${
              visuallyHideLabel === undefined || visuallyHideLabel === true ? 'sr-only' : ''
            }`}
          >
            {label}
          </label>
          <div
            className="QueryBuilder-StyledInput width-fit"
            data-target="query-builder.styledInput"
            style={{minHeight: '30px'}}
          >
            {leadingVisual ? (
              <span id={`${id}-leadingvisual-wrap`}>{leadingVisual}</span>
            ) : (
              <div className="QueryBuilder-spacer" />
            )}
            <div
              data-target="query-builder.styledInputContainer"
              className="QueryBuilder-StyledInputContainer"
              tabIndex={-1}
              {...testIdProps('filter-styled-input')}
            >
              <div
                aria-hidden="true"
                className="QueryBuilder-StyledInputContent"
                data-target="query-builder.styledInputContent"
              />
              <div className="QueryBuilder-InputWrapper" style={{height: '30px'}}>
                <div aria-hidden="true" className="QueryBuilder-Sizer" data-target="query-builder.sizer" />
                <input
                  id={inputId}
                  data-testid={dataTestId}
                  placeholder={placeholder}
                  ref={inputRef}
                  value={inputValue}
                  onKeyPress={onKeyPress}
                  onKeyDown={onKeyDown}
                  onChange={onChangeWithState}
                  name={`${id}-inputname`}
                  autoComplete="off"
                  spellCheck="false"
                  className="FormControl-input QueryBuilder-Input FormControl-medium"
                  data-target={'query-builder.input'}
                  data-action="input:query-builder#inputChange blur:query-builder#inputBlur keydown:query-builder#inputKeydown focus:query-builder#inputFocus"
                  style={{height: '30px'}}
                  aria-labelledby={labelId}
                />
              </div>
            </div>
            {/* Adds visually hidden "clear" text - required for the aria-label to read the clear button text appropriately */}
            <span className="sr-only" id={`${id}-clear`}>
              Clear
            </span>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              type={'button'}
              id={`${id}-clear-button`}
              aria-labelledby={`${id}-clear ${labelId}`}
              data-target={'query-builder.clearButton'}
              data-action={
                'click:query-builder#clear focus:query-builder#clearButtonFocus blur:query-builder#clearButtonBlur'
              }
              align-items={'center'}
              border-radius={1}
              size={'small'}
              sx={{mr: '1px', px: 2, py: 0, display: 'flex', color: 'muted', borderRadius: '0 4px 4px 0'}}
              hidden={clearIconInitiallyVisible}
              variant="invisible"
              {...testIdProps('clear-filters-query-builder')}
              icon={XCircleFillIcon}
            />
          </div>
          {iconsTemplate}
          <div className="position-relative">
            <div className="Overlay-backdrop--anchor right-0 left-0" style={{marginTop: '4px'}}>
              <div
                className="Overlay Overlay-whenNarrow Overlay--height-auto"
                hidden
                data-target="query-builder.overlay"
              >
                <div className="Overlay-body Overlay-body--paddingNone">
                  <ul
                    role="listbox"
                    className="ActionListWrap QueryBuilder-ListWrap"
                    aria-label="Suggestions"
                    data-action="combobox-commit:query-builder#comboboxCommit mousedown:query-builder#resultsMousedown"
                    data-target="query-builder.resultsList"
                    data-persist-list={false}
                    id={`${id}-results`}
                    {...testIdProps('query-builder-results')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          data-target="query-builder.screenReaderFeedback"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </query-builder>
    </form>
  )
}

const templatesToRender = {
  apps: AppsIcon,
  archived: ArchiveIcon,
  bookmark: BookmarkIcon,
  branch: GitBranchIcon,
  calendar: CalendarIcon,
  circle: DotFillIcon,
  code: CodeIcon,
  comment: CommentIcon,
  default: FilterIcon,
  discussion: CommentDiscussionIcon,
  draft: IssueDraftIcon,
  'file-code': FileIcon,
  filter: FilterIcon,
  forbidden: NoEntryIcon,
  history: HistoryIcon,
  issue: IssueOpenedIcon,
  issueClosed: IssueClosedIcon,
  iterations: IterationsIcon,
  mention: MentionIcon,
  merged: GitMergeIcon,
  milestone: MilestoneIcon,
  no: CircleSlashIcon,
  not: NoEntryIcon,
  organization: OrganizationIcon,
  pencil: PencilIcon,
  person: PersonIcon,
  'plus-circle': PlusCircleIcon,
  project: TableIcon,
  pullRequest: GitPullRequestIcon,
  question: QuestionIcon,
  reaction: SmileyIcon,
  repo: RepoIcon,
  search: SearchIcon,
  'single-select': SingleSelectIcon,
  sort: SortDescIcon,
  tag: TagIcon,
  team: PeopleIcon,
  trash: TrashIcon,
}

const iconsTemplate = (
  <>
    {Object.entries(templatesToRender).map(([key, value]) => {
      const id = `${key}-icon`
      const html = renderToString(<Octicon icon={value} aria-hidden={false} />)

      // The inner html is needed here because react isn't hanlding <template> elements properly
      // Note that we are setting fixed values, no user provided data
      // eslint-disable-next-line react/no-danger
      return <template key={id} id={id} dangerouslySetInnerHTML={{__html: html}} />
    })}
  </>
)
