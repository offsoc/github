import {isFeatureEnabled} from '@github-ui/feature-flags'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {testIdProps} from '@github-ui/test-id-props'
import {ActionList, Box, themeGet} from '@primer/react'
import {type ReactNode, useMemo} from 'react'

import {useFilter, useInput, useSuggestions} from '../context'
import {getFilterValue, getUniqueReactKey} from '../utils'
import {SuggestionItem} from './SuggestionItem'

export const SuggestionsList = ({id}: {id: string}) => {
  const {id: filterContextId} = useFilter()
  id = id ?? filterContextId

  const {suggestionsListRef, activeSuggestion, isFetchingSuggestions, position, suggestionGroups, suggestionsVisible} =
    useSuggestions()
  const {suspendFocus} = useInput()

  const prefetchingEnabled = isFeatureEnabled('filter_prefetch_suggestions')

  const skeletonRow = (key: string, animationStyle: 'wave' | 'pulse' = 'wave') => {
    return (
      <Box
        key={key}
        sx={{display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', lineHeight: '20px', mx: 2}}
      >
        <LoadingSkeleton variant="elliptical" width="20px" height="20px" animationStyle={animationStyle} />
        <LoadingSkeleton variant="rounded" width="random" height="16px" animationStyle={animationStyle} />
      </Box>
    )
  }

  const loadingSkeletons = useMemo(
    () => (
      <div>
        {Array(8)
          .fill(1)
          .map((_, i) => skeletonRow(`loading-skeleton-${i}`))}
      </div>
    ),
    [],
  )

  // When prefetching, we will only show a single loading skeleton
  const prefetchedSkeletons = useMemo(() => skeletonRow(`prefetched-loading-skeleton`, 'pulse'), [])

  const showSuggestionsOverlay =
    (suggestionsVisible && suggestionGroups.some(s => s.suggestions.length > 0)) || isFetchingSuggestions

  const generatedSuggestions = useMemo(() => {
    let rowIndex = -1
    const renderedSuggestions: ReactNode[] = []
    suggestionGroups.map((suggestionGroup, groupIndex) => {
      if (suggestionGroup.suggestions.length > 0) {
        // This is a group
        renderedSuggestions.push(
          <ActionList.Group key={getUniqueReactKey('group', suggestionGroup.id)}>
            {suggestionGroup.title && (
              <ActionList.GroupHeading {...testIdProps('suggestions-heading')} aria-hidden="true">
                {suggestionGroup.title}
              </ActionList.GroupHeading>
            )}
            {suggestionGroup.suggestions.map(suggestion => {
              rowIndex++
              return (
                <SuggestionItem
                  {...suggestion}
                  suggestionId={rowIndex}
                  key={getUniqueReactKey(
                    'suggestion',
                    suggestion.id,
                    `${getFilterValue(suggestion.value)}-${suggestion.displayName}-${suggestion.description}`,
                  )}
                  active={rowIndex === activeSuggestion}
                />
              )
            })}
          </ActionList.Group>,
        )

        if (
          groupIndex++ < suggestionGroups.length - 1 &&
          (suggestionGroups[groupIndex++]?.suggestions ?? []).length > 0
        )
          renderedSuggestions.push(<ActionList.Divider key={getUniqueReactKey('divider', suggestionGroup.id)} />)
      }
    })

    return renderedSuggestions
  }, [activeSuggestion, suggestionGroups])

  return (
    <Box
      sx={{top: 5, left: 0, mt: 1, right: 0, zIndex: '999', position: 'absolute', backgroundColor: 'initial'}}
      {...testIdProps('backdrop-anchor')}
    >
      <Box
        id={`${id}-suggestions`}
        ref={suggestionsListRef}
        sx={{
          bg: 'canvas.overlay',
          borderRadius: '12px',
          boxShadow: 'overlay.shadow',
          display: 'flex',
          flexDirection: 'column',
          height: 'auto',
          left: ['0', '0', `${position ? position.left : 0}px`],
          maxHeight: `calc(100vh - 2rem)`,
          minWidth: '250px',
          position: 'absolute',
          overflow: 'hidden',
          visibility: showSuggestionsOverlay ? 'visible' : 'hidden',
          whiteSpace: 'normal',
          width: ['100%', 'min-content', 'min-content'],
          '@media (prefers-reduced-motion: no-preference)': {
            transition: 'opacity 0.2s ease',
            opacity: showSuggestionsOverlay ? 1 : 0,
          },
        }}
        onMouseDown={e => suspendFocus(e.currentTarget)}
      >
        <Box
          sx={{
            p: 0,
            flexGrow: 1,
            fontSize: themeGet('primer.text.body.size.large') ?? '14px',
          }}
        >
          <ActionList
            {...testIdProps('filter-results')}
            aria-label={isFetchingSuggestions ? 'Loading Suggestions' : 'Suggestions'}
            role="listbox"
            id={`${id}-results`}
            sx={{
              maxHeight: '20em',
              overflowX: 'hidden',
              overflowY: 'auto',
              listStyle: 'none',
              minHeight: '48px',
            }}
          >
            {!prefetchingEnabled && isFetchingSuggestions
              ? loadingSkeletons
              : suggestionGroups.some(s => s.suggestions.length > 0) && generatedSuggestions}
            {prefetchingEnabled &&
              isFetchingSuggestions &&
              (suggestionGroups.some(s => s.suggestions.length > 0) ? prefetchedSkeletons : loadingSkeletons)}
          </ActionList>
        </Box>
      </Box>
    </Box>
  )
}
