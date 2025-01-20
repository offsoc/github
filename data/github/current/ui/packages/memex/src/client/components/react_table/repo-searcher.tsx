import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {Box, type TextInputProps} from '@primer/react'
import debounce, {type DebouncedFunc} from 'lodash-es/debounce'
import {useCallback, useEffect, useId, useRef, useState} from 'react'
import type {SpaceProps, TypographyProps} from 'styled-system'

import {apiSearchRepositories} from '../../api/repository/api-search-repositories'
import type {RepositoryItem, SuggestedRepository} from '../../api/repository/contracts'
import type {GroupingMetadataWithSource} from '../../features/grouping/types'
import type {FuzzyFilterPositionData} from '../../helpers/suggester'
import {useTextExpander} from '../../hooks/common/use-text-expander'
import {FocusType, NavigationDirection} from '../../navigation/types'
import {useRepositories} from '../../state-providers/repositories/use-repositories'
import {Resources} from '../../strings'
import {OmnibarPlaceholder} from '../omnibar/omnibar-placeholder'
import {BaseCell} from './cells/base-cell'
import {moveTableFocus, useStableTableNavigation} from './navigation'
import {RepoList} from './repo-list'

export interface RepoSearcherProps {
  text: string
  setText: (newText: string) => void
  onItemSelected: (item: RepositoryItem | string) => Promise<void>
  onRepositorySelected: (repository: SuggestedRepository) => void
  inputRef: React.RefObject<HTMLInputElement>
  renderInput: (props: TextInputProps & TypographyProps & SpaceProps) => React.ReactNode

  /** The default placeholder to show when the omnibar does not have focus */
  defaultPlaceholder: React.ReactNode
  /** Initial value for the focused state, used to avoid inconsistencies between focused state from the parent and here */
  isFocused?: boolean
  /** Whether the repo searcher is disabled*/
  isDisabled?: boolean

  /** Grouped-by metadata, such as repo or issue type **/
  groupingMetadata?: GroupingMetadataWithSource
}

export const RepoSearcher: React.FC<RepoSearcherProps> = ({
  onRepositorySelected,
  text,
  setText,
  onItemSelected,
  inputRef,
  renderInput,
  defaultPlaceholder,
  isFocused,
  isDisabled,
  groupingMetadata,
}) => {
  const {suggestRepositories: fetchRepositorySuggestions} = useRepositories()
  const [refreshing, setRefreshing] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<SuggestedRepository> | undefined>()
  const [searchResults, setSearchResults] = useState<Array<SuggestedRepository> | undefined>()
  const [positionDataMap, setPositionDataMap] = useState(new WeakMap<SuggestedRepository, FuzzyFilterPositionData>())
  const debouncedSearch = useRef<DebouncedFunc<() => Promise<void>> | undefined>()
  const isFirstRender = useRef(true)
  const [inputHasFocus, setInputHasFocus] = useState(!!isFocused)
  const groupedByIssueType =
    groupingMetadata?.sourceObject.dataType === 'issueType' && groupingMetadata.sourceObject.kind === 'group'
  const milestoneGroupingTitle =
    groupingMetadata?.sourceObject.dataType === 'milestone' && groupingMetadata.sourceObject.kind === 'group'
      ? groupingMetadata.value
      : undefined

  const displaySearchResults = useCallback(
    (repos: Array<SuggestedRepository>) => {
      // This allows us to display text for each result, but disables highlighting of matched
      // terms within the result text.
      const dummyPositionData = repos.reduce((map, repo) => {
        map.set(repo, {chunks: [{startIndex: 0, endIndex: repo.name.length, highlight: false}]})
        return map
      }, new WeakMap<SuggestedRepository, FuzzyFilterPositionData>())

      setSearchResults(repos)
      setPositionDataMap(dummyPositionData)
      setRefreshing(false)
    },
    [setSearchResults, setPositionDataMap],
  )

  const inputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value)
    },
    [setText],
  )

  const searchRepositories = useCallback(
    async (query: string) => {
      const results = query
        ? await apiSearchRepositories({
            query,
            onlyWithIssueTypes: groupedByIssueType,
            milestone: milestoneGroupingTitle,
          })
        : undefined

      // Now that we've received results from the server, only show the new results if the
      // user hasn't since cleared the input of a real query.
      if (inputRef.current?.value !== '#') {
        displaySearchResults(results?.repositories ?? suggestions ?? [])
      }
    },
    [displaySearchResults, suggestions, inputRef, groupedByIssueType, milestoneGroupingTitle],
  )

  const enqueueRepositorySearch = useCallback(
    (textExpanderText: string) => {
      if (debouncedSearch.current) {
        debouncedSearch.current.cancel()
      }

      debouncedSearch.current = debounce(() => searchRepositories(textExpanderText), 200)

      setRefreshing(true)
      debouncedSearch.current()
    },
    [debouncedSearch, searchRepositories, setRefreshing],
  )

  const onSelectedItemChange = (item: SuggestedRepository) => {
    onRepositorySelected(item)
  }

  const textExpanderOnChange = (textExpanderText: string) => {
    if (!textExpanderText && suggestions) {
      displaySearchResults(suggestions)
    }

    if (textExpanderText) {
      enqueueRepositorySearch(textExpanderText)
    }
  }

  const {getInputProps, getListProps, getItemProps, isOpen} = useTextExpander(
    {
      textExpanderOnChange,
      items: searchResults || [],
      onSelectedItemChange,
      inputValue: text,
    },
    inputRef,
  )

  const {navigationDispatch} = useStableTableNavigation()
  const inputOnKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLInputElement) {
        const inputEl = event.target
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        switch (event.key) {
          case 'Enter':
            setText('') // reset the text so hitting enter twice does not trigger 2 submits
            event.preventDefault()
            onItemSelected(text)
            break

          case 'Tab':
            if (!event.shiftKey && !isOpen && text.length > 0) {
              event.preventDefault()
              await onItemSelected(text)
              setText('')
              requestAnimationFrame(() => {
                setInputHasFocus(false)
                // Focus the row that was just added, the second column
                navigationDispatch(
                  moveTableFocus({
                    x: NavigationDirection.Second,
                    y: NavigationDirection.Last,
                    focusType: FocusType.Focus,
                  }),
                )
              })
            }
            break

          case 'Escape':
            if (isOpen) {
              setText('')
              event.stopPropagation()
            }
            break

          case 'ArrowLeft':
            if (inputEl.selectionStart !== 0 || inputEl.selectionEnd !== 0) {
              event.nativeEvent['preventFocusChange'] = true
            }
            break

          case 'ArrowRight':
            if (inputEl.selectionStart !== inputEl.value.length || inputEl.selectionEnd !== inputEl.value.length) {
              event.nativeEvent['preventFocusChange'] = true
            }
            break
          case 'ArrowDown':
          case 'ArrowUp':
            if (isOpen) {
              // Do not propagate arrow key presses when open, as
              // they're used for cell navigation.
              event.stopPropagation()
            }
            break
        }
      }
    },
    [isOpen, text, setText, onItemSelected, navigationDispatch],
  )

  const inputCompositionProps = useIgnoreKeyboardActionsWhileComposing(inputOnKeyDown)

  useEffect(() => {
    const loadSuggestions = async () => {
      if (suggestions === undefined) {
        setRefreshing(true)

        const newSuggestions = await fetchRepositorySuggestions({
          onlyWithIssueTypes: groupedByIssueType,
          milestone: milestoneGroupingTitle,
        })
        setSuggestions(newSuggestions)
        if (inputRef?.current?.value === '#') {
          displaySearchResults(newSuggestions)
        }
      }
    }

    if (isFirstRender.current) {
      isFirstRender.current = false
      loadSuggestions()
    }
  }, [
    suggestions,
    setSuggestions,
    fetchRepositorySuggestions,
    inputRef,
    displaySearchResults,
    groupedByIssueType,
    milestoneGroupingTitle,
  ])

  const inputOnFocus: React.FocusEventHandler = useCallback(() => {
    if (isDisabled) return
    setInputHasFocus(true)
  }, [isDisabled])

  const inputOnBlur: React.FocusEventHandler = useCallback(() => {
    if (isDisabled) return
    setInputHasFocus(false)
  }, [isDisabled])

  const omnibarDescriptionId = useId()
  const input = isDisabled ? (
    <BaseCell aria-disabled="true" sx={{cursor: 'not-allowed', pl: '20px'}}>
      {defaultPlaceholder}
    </BaseCell>
  ) : (
    renderInput({
      ...getInputProps({onChange: inputOnChange, onFocus: inputOnFocus, onBlur: inputOnBlur}),
      pl: '12px',
      fontSize: 1,
      lineHeight: 1.5,
      'aria-label': Resources.newItemPlaceholderAriaLabel,
      'aria-describedby': omnibarDescriptionId,
      'aria-keyshortcuts': 'Control+Space',
      autoComplete: 'off',
      value: text,
      ...inputCompositionProps,
    })
  )

  return (
    <Box
      sx={{
        width: '100%',
        cursor: 'text',
        display: 'flex',
        position: 'relative',
      }}
    >
      <OmnibarPlaceholder
        descriptionId={omnibarDescriptionId}
        focusedPlaceholder={Resources.newItemPlaceholder}
        inputHasFocus={inputHasFocus}
        unfocusedPlaceholder={defaultPlaceholder}
        value={inputRef.current?.value}
      />
      {input}
      <RepoList
        {...getListProps()}
        inputRef={inputRef}
        isOpen={isOpen}
        loading={refreshing}
        positionDataMap={positionDataMap}
        getItemProps={getItemProps}
        repositories={searchResults || []}
      />
    </Box>
  )
}
