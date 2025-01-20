import {debounce} from '@github/mini-throttle'
import {AllShortcutsEnabled} from '../../components/AllShortcutsEnabled'
import {useReposAnalytics} from '../../hooks/use-repos-analytics'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {SearchIcon, XCircleFillIcon} from '@primer/octicons-react'
import {Box, type SxProp, TextInput} from '@primer/react'
import React from 'react'

type Props = {
  ariaActiveDescendant?: string
  ariaControls?: string
  ariaExpanded?: boolean
  ariaHasPopup?: boolean
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  onPreload(): void
  onSearch(query: string): void
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  query: string
} & SxProp

export const FilesSearchBox = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      ariaActiveDescendant,
      ariaControls,
      ariaExpanded,
      ariaHasPopup,
      onBlur,
      onFocus,
      onKeyDown,
      onPreload,
      onSearch,
      query,
      sx = {},
    },
    ref,
  ) => {
    const {sendRepoClickEvent} = useReposAnalytics()
    const [textValue, setTextValue] = React.useState(query)
    const debouncedOnSearch = React.useRef(debounce((newQuery: string) => onSearch(newQuery), 250))

    React.useEffect(() => {
      setTextValue(query)
    }, [query])

    const clearAction = query ? (
      <TextInput.Action
        onClick={() => {
          sendRepoClickEvent('FILE_TREE.CANCEL_SEARCH')
          onSearch('')
        }}
        icon={XCircleFillIcon}
        aria-label="Clear"
        className="fgColor-muted"
      />
    ) : undefined

    return (
      <>
        <TextInput
          // support for the search param can be removed once the tree is globally avaialble.
          // We want to focus the search box only if user navigates with ?search=1
          autoFocus={isSearchUrl()}
          ref={ref}
          value={textValue}
          onKeyDown={onKeyDown}
          onChange={e => {
            setTextValue(e.target.value)
            onPreload()
            debouncedOnSearch.current(e.target.value)
          }}
          sx={{display: 'flex', ...sx}}
          aria-label="Go to file"
          aria-activedescendant={ariaActiveDescendant}
          role={ariaHasPopup ? 'combobox' : undefined}
          aria-controls={ariaControls}
          aria-expanded={ariaExpanded}
          aria-haspopup={ariaHasPopup ? 'dialog' : undefined}
          autoCorrect="off"
          spellCheck="false"
          placeholder="Go to file"
          leadingVisual={SearchIcon}
          trailingAction={clearAction}
          trailingVisual={
            clearAction
              ? undefined
              : () => (
                  <AllShortcutsEnabled>
                    <Box sx={{mr: '-6px'}}>
                      <kbd>t</kbd>
                    </Box>
                  </AllShortcutsEnabled>
                )
          }
          onFocus={e => {
            onPreload()
            e.target.select()
            onFocus?.(e)
          }}
          onBlur={onBlur}
          onClick={() => sendRepoClickEvent('FILE_TREE.SEARCH_BOX')}
        />
      </>
    )
  },
)

/**
 * Whether the URL contains ?search=1 which indicates user is searching for a file
 */
export function isSearchUrl() {
  const params = new URLSearchParams(ssrSafeLocation.search)
  return params.get('search') === '1'
}

FilesSearchBox.displayName = 'FilesSearchBox'
