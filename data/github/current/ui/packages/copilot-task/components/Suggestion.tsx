import {GitHubAvatar} from '@github-ui/github-avatar'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {SafeHTMLBox} from '@github-ui/safe-html'
import {ArrowRightIcon, PersonIcon, ThreeBarsIcon} from '@primer/octicons-react'
import {ActionList, Button, CircleOcticon, IconButton, Octicon, Text} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import type React from 'react'

import {useFilesContext} from '../contexts/FilesContext'
import type {CodeEditorPayload, FocusedTaskData, Suggester} from '../utilities/copilot-task-types'
import {getPayloadsForSuggestion, problemWithSuggestion} from '../utilities/suggestion-helpers'

const getTitle = (suggestion: FocusedTaskData) => {
  const displayHandle = suggesterName(suggestion.suggester)
  if (suggestion.suggestions.length === 1 && suggestion.suggestions[0]) {
    const filePath = suggestion.suggestions[0].filePath
    return `${displayHandle} suggested changes on ${filePath}`
  } else {
    return `${displayHandle} suggested changes on ${suggestion.suggestions.length} files`
  }
}

const suggesterName = (suggester?: Suggester) => {
  return suggester?.displayLogin || 'User'
}

const SuggesterAvatarWrapper = ({suggester}: {suggester?: Suggester}) => {
  return (
    <span className="pr-2">
      <SuggesterAvatar suggester={suggester} />
    </span>
  )
}

const SuggesterAvatar = ({suggester}: {suggester?: Suggester}) => {
  if (suggester) {
    return (
      <GitHubAvatar
        src={suggester.avatarUrl}
        size={24}
        sx={{
          flexShrink: 0,
        }}
      />
    )
  } else {
    return <CircleOcticon icon={PersonIcon} />
  }
}

export interface SuggestionProps {
  allSuggestions: Record<string, FocusedTaskData>
  currentTask: FocusedTaskData | undefined
  setCurrentTask: React.Dispatch<React.SetStateAction<FocusedTaskData | undefined>>
  notifyEdited: (_ignored: object) => void
}

export const SuggestionHeader = ({
  suggestion,
  setCurrentTask,
}: {
  suggestion: FocusedTaskData | undefined
  setCurrentTask: React.Dispatch<React.SetStateAction<FocusedTaskData | undefined>>
}) => {
  if (suggestion) {
    return (
      <>
        <IconButton
          aria-label="View all suggestions"
          icon={ThreeBarsIcon}
          variant="invisible"
          onClick={() => setCurrentTask(undefined)}
        />

        <Text sx={{display: 'inline'}} className="f4 pl-3">
          <SuggesterAvatarWrapper suggester={suggestion.suggester} />
          <span className="text-semibold">{getTitle(suggestion)}</span>
        </Text>
      </>
    )
  } else {
    return <div className="f4 text-semibold">Suggestions</div>
  }
}

const Suggestion = ({allSuggestions, currentTask, setCurrentTask, notifyEdited}: SuggestionProps) => {
  const payload = useRoutePayload<CodeEditorPayload>()
  const {focusedTask} = payload
  const emptyText = 'No suggestions available'
  const {applySuggestionsToContent, getAppliedSuggestions, getFileStatuses} = useFilesContext()

  const problem = problemWithSuggestion(getAppliedSuggestions(), getFileStatuses(), focusedTask)
  const canApply = !problem
  const applyTooltip = canApply ? 'Apply this suggestion' : problem

  const findAndSetCurrentTask = (taskSourceId: string) => {
    const task = allSuggestions[taskSourceId]
    setCurrentTask(task)
  }

  const suggestionsMap = Object.entries(allSuggestions)
  return (
    <>
      {currentTask ? (
        <>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <div className="mb-2">
              <SuggesterAvatarWrapper suggester={currentTask.suggester} />
              <span className="f4 text-semibold">{suggesterName(currentTask.suggester)}</span>
            </div>
            <div>
              <SafeHTMLBox
                className="markdown-body"
                html={currentTask.html}
                sx={{
                  mt: 1,
                  fontSize: 1,
                }}
              />
            </div>
          </div>
          <Tooltip text={applyTooltip} type="label">
            <Button
              aria-disabled={!canApply}
              inactive={!canApply}
              variant="primary"
              style={{marginLeft: 'auto', marginTop: '8px'}}
              onClick={async () => {
                if (canApply) {
                  const payloads = await getPayloadsForSuggestion(payload)
                  applySuggestionsToContent(payloads)
                  notifyEdited({})
                }
              }}
            >
              Apply
            </Button>
          </Tooltip>
        </>
      ) : (
        <div>
          {suggestionsMap.length ? (
            <ActionList>
              {suggestionsMap.map(([sourceId, suggestion]) => (
                <ActionList.Item key={sourceId} onSelect={() => findAndSetCurrentTask(sourceId)}>
                  <ActionList.LeadingVisual>
                    <SuggesterAvatarWrapper suggester={suggestion.suggester} />
                  </ActionList.LeadingVisual>
                  {getTitle(suggestion)}
                  <ActionList.TrailingVisual>
                    <Octicon icon={ArrowRightIcon} />
                  </ActionList.TrailingVisual>
                </ActionList.Item>
              ))}
            </ActionList>
          ) : (
            <>{emptyText}</>
          )}
        </div>
      )}
    </>
  )
}

export default Suggestion
