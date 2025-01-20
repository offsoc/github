import {Box, FormControl, TextInput} from '@primer/react'
import {IssueTypeSelector} from './IssueTypeSelector'
import {LABELS} from './constants/labels'
import {useEmojiSuggestions} from '@github-ui/markdown-editor/suggestions/use-emoji-suggestions'
import {useMemo, Suspense} from 'react'
import {emojiList} from '@github-ui/comment-box/emojis'
import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {useAutocompleteTriggersAndSuggestions} from '@github-ui/inline-autocomplete/hooks/use-autocomplete-triggers-and-suggestions'

type CreateIssueFormTitleProps = {
  title: string
  titleInputRef: React.RefObject<HTMLInputElement>
  handleTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  canIssueType: boolean
  titleValidationResult?: string | null
  repo: string
  owner: string
  emojiTone?: number
}

export const CreateIssueFormTitle = ({
  title,
  titleValidationResult,
  titleInputRef,
  handleTitleChange,
  canIssueType,
  repo,
  owner,
  emojiTone,
}: CreateIssueFormTitleProps) => {
  const emptyArray: [] = [] // constant reference to avoid re-running effects
  const {trigger, calculateSuggestions} = useEmojiSuggestions(emojiList ?? emptyArray, {tone: emojiTone})
  const triggersAndSuggestions = useMemo(
    () => [{trigger, suggestionsCalculator: calculateSuggestions}],
    [calculateSuggestions, trigger],
  )
  const {triggers, suggestions, setSuggestionEvent, onHideSuggestions} =
    useAutocompleteTriggersAndSuggestions(triggersAndSuggestions)

  const textInput = (
    <TextInput
      ref={titleInputRef}
      aria-label={LABELS.issueCreateTitleLabel}
      placeholder={LABELS.issueCreateTitlePlaceholder}
      value={title}
      onBlur={handleTitleChange}
      onChange={handleTitleChange}
      data-hpc
    />
  )

  return (
    <Box sx={{display: 'flex', alignItems: 'center'}}>
      <FormControl sx={{display: 'flex', flexDirection: 'column', alignItems: 'stretch', flex: 1}} required>
        <FormControl.Label
          sx={{'> span > span:last-of-type': {color: 'var(--fgColor-danger, var(--color-danger-fg))'}}}
        >
          {LABELS.issueCreateTitleLabel}
        </FormControl.Label>
        <Box sx={{display: 'flex', flexDirection: 'column', flex: 1, mr: 2}}>
          <Suspense fallback={textInput}>
            <InlineAutocomplete
              triggers={triggers}
              suggestions={suggestions}
              onShowSuggestions={setSuggestionEvent}
              onHideSuggestions={onHideSuggestions}
            >
              {textInput}
            </InlineAutocomplete>
          </Suspense>
          {titleValidationResult && (
            <FormControl.Validation variant="error">{titleValidationResult}</FormControl.Validation>
          )}
        </Box>
      </FormControl>
      <IssueTypeSelector canIssueType={canIssueType} repo={repo} owner={owner} />
    </Box>
  )
}
