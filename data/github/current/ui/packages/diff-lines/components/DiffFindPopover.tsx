import {useShortcut} from '@github-ui/code-view-shared/hooks/shortcuts'
import {ChevronDownIcon, ChevronUpIcon, SearchIcon, XIcon} from '@primer/octicons-react'
import {IconButton, Label, Octicon, TextInput} from '@primer/react'
import {memo, useEffect, useRef, useState, type MutableRefObject} from 'react'
import type {DiffMatchContent} from '../helpers/find-in-diff'
import type {FocusedSearchResult} from '../hooks/use-diff-search-results'
import {clsx} from 'clsx'
import styles from './DiffFindPopover.module.css'
import {GlobalCommands, ScopedCommands} from '@github-ui/ui-commands'

export interface DiffFindPopoverProps {
  inputContainer: React.RefObject<HTMLInputElement>
  currentPathDigestIndex: MutableRefObject<number>
  stickied?: boolean
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  focusedSearchResult: FocusedSearchResult | undefined
  currentIndex: number
  setCurrentIndex: (idx: number) => void
  setFocusedSearchResult: (idx: FocusedSearchResult | undefined) => void
  searchResults: Map<string, DiffMatchContent[]>
  onClose: () => void
  scrollDiffCellIntoView: (diffToFocus: FocusedSearchResult | undefined) => void
}

/**
 * Using this component:
 *
 * In order to use the DiffFindPopover component, you need to pass a few things into your usage of the DiffLines
 * component. First, in DiffFindOpenContext.tsx there is DiffFindOpenProvider which you need to supply
 * searchTerm and setSearchTerm to. The provider will allow you to consume whether or not this popover should be
 * rendered at any given time, and it keeps track of the search term between open/closed states.
 *
 * To get the search results, you must pass all of your DiffEntries, the search term, the web worker path, and a
 * piece of state which will be set whenever context lines are expanded to trigger a re-search into the
 * useDiffSearchResults hook. This hook will give you the search results and the currently focused search result
 * to then pass into the DiffLines component. The DiffLines component itself expects the focusedSearchResult to be
 * the index of the currently focused search result within the current path digest, or undefined if the currently
 * focused result is not within the current path digest. This prevents unnecessary rerenders.
 */
export const DiffFindPopover = memo(function DiffFindPopover({
  inputContainer,
  currentPathDigestIndex,
  stickied,
  searchTerm,
  searchResults,
  setSearchTerm,
  focusedSearchResult,
  currentIndex,
  setCurrentIndex,
  setFocusedSearchResult,
  onClose,
  scrollDiffCellIntoView,
}: DiffFindPopoverProps) {
  const {findInFileShortcut} = useShortcut()
  const [escapeToBrowserOnNextKeyPress, setEscapeToBrowserOnNextKeyPress] = useState(true)
  const currentKeyArray = useRef<string[]>([])
  const totalResultSize = useRef(0)
  const clearSearch = () => {
    setSearchTerm('')
    setFocusedSearchResult(undefined)
    currentPathDigestIndex.current = 0
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      setEscapeToBrowserOnNextKeyPress(false)
      setSearchTerm(event.target.value)
      setCurrentIndex(0)
    } else {
      setEscapeToBrowserOnNextKeyPress(true)
      clearSearch()
    }
  }

  const jumpToResult = (direction: number) => {
    if (focusedSearchResult === undefined || focusedSearchResult.pathDigest === '') {
      currentPathDigestIndex.current = 0
      const initialResult = {
        pathDigest: currentKeyArray.current[0] ?? '',
        indexWithinDigest: 0,
      }
      setFocusedSearchResult(initialResult)
      return
    }
    const tempFocusedResult = focusedSearchResult
    if (direction === 1) {
      setCurrentIndex(currentIndex === totalResultSize.current - 1 ? 0 : currentIndex + 1)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (focusedSearchResult.indexWithinDigest === searchResults.get(focusedSearchResult.pathDigest)!.length - 1) {
        currentPathDigestIndex.current = currentPathDigestIndex.current + 1
        if (currentPathDigestIndex.current === currentKeyArray.current.length) {
          currentPathDigestIndex.current = 0
        }
        tempFocusedResult.pathDigest = currentKeyArray.current[currentPathDigestIndex.current] ?? ''
        tempFocusedResult.indexWithinDigest = 0
        //move on to the next path digest or wrap around if at the end
      } else {
        //not at the end of the current path digest

        tempFocusedResult.indexWithinDigest = tempFocusedResult.indexWithinDigest + 1
      }
    } else {
      setCurrentIndex(currentIndex === 0 ? totalResultSize.current - 1 : currentIndex - 1)
      if (focusedSearchResult.indexWithinDigest === 0) {
        currentPathDigestIndex.current = currentPathDigestIndex.current - 1
        if (currentPathDigestIndex.current === -1) {
          currentPathDigestIndex.current = currentKeyArray.current.length - 1
        }
        tempFocusedResult.pathDigest = currentKeyArray.current[currentPathDigestIndex.current] ?? ''
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tempFocusedResult.indexWithinDigest = searchResults.get(tempFocusedResult.pathDigest)!.length - 1
        //move on to the next path digest or wrap around if at the end
      } else {
        //can stay within the same current path digest
        tempFocusedResult.indexWithinDigest = tempFocusedResult.indexWithinDigest - 1
      }
    }
    setFocusedSearchResult(tempFocusedResult)
  }
  useEffect(() => {
    inputContainer.current?.focus()
    inputContainer.current?.select()
  }, [inputContainer])

  useEffect(() => {
    currentKeyArray.current = Array.from(searchResults.keys())
    currentPathDigestIndex.current = 0
    const initialResult = {
      pathDigest: currentKeyArray.current[0] ?? '',
      indexWithinDigest: 0,
    }
    setFocusedSearchResult(initialResult)
    let incSize = 0
    for (const result of searchResults.values()) {
      incSize += result.length
    }
    totalResultSize.current = incSize
  }, [currentPathDigestIndex, searchResults, searchResults.size, setFocusedSearchResult])

  useEffect(() => {
    if (searchResults.size > 0 && focusedSearchResult !== undefined) {
      scrollDiffCellIntoView(focusedSearchResult)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults, focusedSearchResult, currentIndex])

  return (
    <div className={clsx(styles.defaultStyles, stickied && styles.stickyStyles, !stickied && styles.notStickyStyles)}>
      <GlobalCommands
        commands={{
          'pull-requests-diff-view:jump-to-next-result-alternate': () => jumpToResult(1),
          'pull-requests-diff-view:jump-to-previous-result-alternate': () => jumpToResult(-1),
          'pull-requests-diff-view:close-find': onClose,
        }}
      />
      <ScopedCommands
        commands={{
          'pull-requests-diff-view:jump-to-next-result': () => jumpToResult(1),
          'pull-requests-diff-view:jump-to-previous-result': () => jumpToResult(-1),
        }}
      >
        <div className="py-2 pl-3 pr-2 d-flex flex-justify-center flex-items-center flex-row f6 borderColor-default border-bottom">
          <div className="d-flex flex-row flex-items-baseline">
            <h5 className="fgColor-default pr-2 text-bold">Find</h5>
            <span
              className={clsx(
                'find-text-help-tooltip',
                'fgColor-subtle',
                escapeToBrowserOnNextKeyPress && styles.visibilityVisible,
                !escapeToBrowserOnNextKeyPress && styles.visibilityHidden,
              )}
            >
              Press <Label>{findInFileShortcut.text}</Label> again to open the browser&apos;s find menu
            </span>
          </div>
          <div className="flex-1" />
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            variant="invisible"
            size="small"
            onClick={onClose}
            icon={XIcon}
            className="fgColor-subtle"
            aria-label="Close find in file"
          />
        </div>
        <div className="pl-2 pr-2 pt-2 pb-2">
          <TextInput
            ref={inputContainer}
            className="pl-1 border-0 box-shadow-none"
            validationStatus={totalResultSize.current > 1000 ? 'error' : undefined}
            type="text"
            leadingVisual={() => <Octicon icon={SearchIcon} aria-hidden="true" />}
            autoComplete="off"
            name="Find in file input"
            placeholder="Search this diff"
            value={searchTerm}
            block
            onChange={onChange}
            trailingAction={
              <div className="d-flex flex-row flex-justify-center flex-items-center">
                <span className="text-small fgColor-subtle m-2 text-center">
                  {searchResults.size === 0 || focusedSearchResult === undefined ? 0 : currentIndex + 1}/
                  {totalResultSize.current}
                </span>
                {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                <IconButton
                  unsafeDisableTooltip={true}
                  size="small"
                  variant="invisible"
                  onClick={() => {
                    jumpToResult(-1)
                  }}
                  icon={ChevronUpIcon}
                  aria-label="Up"
                  data-testid="up-search"
                  className="fgColor-subtle"
                />
                {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                <IconButton
                  unsafeDisableTooltip={true}
                  size="small"
                  variant="invisible"
                  onClick={() => {
                    jumpToResult(1)
                  }}
                  icon={ChevronDownIcon}
                  aria-label="Down"
                  data-testid="down-search"
                  className="fgColor-subtle"
                />
              </div>
            }
            onKeyDown={(keyboardEvent: React.KeyboardEvent) => {
              if (
                (keyboardEvent.metaKey || keyboardEvent.ctrlKey) &&
                (keyboardEvent.key === 'f' || keyboardEvent.key === 'F')
              ) {
                if (escapeToBrowserOnNextKeyPress) {
                  // The user wants to use the browser's find in page functionality.
                  // So just close this pane and get it out of their way.
                  onClose()
                } else {
                  setEscapeToBrowserOnNextKeyPress(true)
                  keyboardEvent.preventDefault()
                  inputContainer.current?.focus()
                  inputContainer.current?.select()
                }
              }
            }}
          />
        </div>
      </ScopedCommands>
    </div>
  )
})
