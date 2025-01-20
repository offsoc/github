import {GitHubAvatar} from '@github-ui/github-avatar'
import {SafeHTMLText} from '@github-ui/safe-html'
import {ActionList, Box, Octicon} from '@primer/react'
import {useCallback} from 'react'

import {useInput, useSuggestions} from '../context'
import type {ARIAFilterSuggestion} from '../types'
import {getFilterValue} from '../utils'
import styles from './SuggestionItem.module.css'

type SuggestionItemProps = {
  /** The index of the suggestion item, used for identifying which is active */
  suggestionId: number
  /** Whether or not the item should be displayed as active */
  active?: boolean
} & ARIAFilterSuggestion

export const SuggestionItem = (suggestion: SuggestionItemProps) => {
  const {suggestionId, active, icon, iconColor, value, avatar, displayName, ariaLabel} = suggestion
  const {suggestionSelected, activeSuggestionRef} = useSuggestions()
  const {inputRef} = useInput()

  const onSuggestionSelectHandler = useCallback(() => {
    suggestionSelected(suggestion)
    inputRef.current?.focus()
  }, [inputRef, suggestion, suggestionSelected])

  const setActiveSuggestionRef = useCallback(
    (node: HTMLLIElement) => {
      if (active && node) {
        activeSuggestionRef.current = node
        node.scrollIntoView({block: 'nearest'})
      } else {
        activeSuggestionRef.current = null
      }
    },
    [active, activeSuggestionRef],
  )

  return (
    <ActionList.Item
      id={`suggestion-${suggestionId}`}
      onSelect={onSuggestionSelectHandler}
      active={active}
      role="option"
      aria-label={ariaLabel}
      aria-selected={active}
      tabIndex={-1}
      aria-labelledby={undefined}
      ref={setActiveSuggestionRef}
      className={styles.item}
    >
      {(icon || iconColor || avatar) && (
        <ActionList.LeadingVisual>
          <Box sx={{minWidth: '20px', display: 'flex', alignContent: 'center', justifyContent: 'center'}}>
            {icon ? (
              <Octicon icon={icon} sx={{fill: iconColor ?? 'currentcolor'}} />
            ) : iconColor ? (
              <Box sx={{backgroundColor: iconColor, borderRadius: 9, width: '10px', height: '10px'}} />
            ) : null}
            {avatar && (
              <GitHubAvatar
                src={avatar.url}
                alt={getFilterValue(value) ?? 'User Avatar'}
                square={false}
                sx={{minWidth: '20px'}}
              />
            )}
          </Box>
        </ActionList.LeadingVisual>
      )}
      {/* We set the inner HTML dangerously here because we can receive HTML back from the server for Labels */}
      <SafeHTMLText
        sx={{
          fontWeight: suggestion.description ? 600 : 400,
          '> img': {width: '16px', height: '16px', verticalAlign: 'text-bottom'},
        }}
        unverifiedHTML={displayName ?? getFilterValue(value) ?? ''}
      />
      {suggestion.description && suggestion.inlineDescription !== undefined && (
        <ActionList.Description variant={suggestion.inlineDescription ? 'inline' : 'block'} sx={{fontWeight: 400}}>
          {suggestion.description}
        </ActionList.Description>
      )}
    </ActionList.Item>
  )
}
