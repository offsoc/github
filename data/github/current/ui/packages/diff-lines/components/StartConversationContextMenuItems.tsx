import {PlusCircleIcon, PlusIcon} from '@primer/octicons-react'
import {ActionList} from '@primer/react'
import type React from 'react'
import {useCallback, useMemo} from 'react'

import {useDiffContext} from '../contexts/DiffContext'
import {useDiffLineContext} from '../contexts/DiffLineContext'
import {useSelectedDiffRowRangeContext} from '../contexts/SelectedDiffRowRangeContext'
import {isContextDiffLine, isEmptyDiffLine} from '../helpers/line-helpers'
import type {LineRange, DiffLine} from '../types'
import {KeyboardKey} from '@github-ui/keyboard-key'
import {CommandActionListItem} from '@github-ui/ui-commands'

const ORIENTATION_MAP = {
  left: 'L',
  right: 'R',
}

const START_CONVERSATION = 'Start conversation'
const SUGGEST_CHANGE = 'Suggest change'

type ContextMenuActions = typeof START_CONVERSATION | typeof SUGGEST_CHANGE

function generateSingleLineText(baseAction: ContextMenuActions, diffLine: DiffLine, isLeftSide?: boolean) {
  const side = isLeftSide && !isContextDiffLine(diffLine) ? ORIENTATION_MAP.left : ORIENTATION_MAP.right
  return `${baseAction} on line ${side}${diffLine.blobLineNumber}`
}

function generateModifiedRangeText(
  firstLine: DiffLine,
  lastLine: DiffLine,
  originalLinesAreEmpty: boolean,
  isSplit: boolean | undefined,
  allLinesAreContextLines: boolean,
) {
  const hasOneLineOnModifiedSide = firstLine.right === lastLine.right
  if (hasOneLineOnModifiedSide) {
    return originalLinesAreEmpty || (isSplit && allLinesAreContextLines)
      ? ` on line R${firstLine.right}`
      : `, modified line R${lastLine.right}`
  } else {
    return originalLinesAreEmpty || (isSplit && allLinesAreContextLines)
      ? ` on lines R${firstLine.right}-R${lastLine.right}`
      : `, modified lines R${firstLine.right}-R${lastLine.right}`
  }
}

function generateOriginalRangeText(firstLine: DiffLine, lastLine: DiffLine, modifiedLinesAreEmpty: boolean) {
  const hasOneLineOnOriginalSide = firstLine.left === lastLine.left
  if (hasOneLineOnOriginalSide) {
    return modifiedLinesAreEmpty ? ` on line L${firstLine.left}` : `, original line L${firstLine.left}`
  } else {
    return modifiedLinesAreEmpty
      ? ` on lines L${firstLine.left}-L${lastLine.right}`
      : `, original lines L${firstLine.left}-L${lastLine.left}`
  }
}

/**
 * Renders context-specific context menu conversation selection options for diffline cell(s) based on split and unified views, the number of lines selected and the orientation of those selected lines.
 *
 * @param handleStartConversationWithSuggestedChange a function invoked when starting a conversation with suggested change
 * @param handleStartConversation a function invoked when starting a conversation
 */
export function StartConversationContextMenuItems({
  handleStartConversationWithSuggestedChange,
  handleStartConversation,
}: {
  handleStartConversationWithSuggestedChange: () => void
  handleStartConversation: () => void
}) {
  const {selectedDiffRowRange, selectedDiffLines, replaceSelectedDiffRowRange} = useSelectedDiffRowRangeContext()
  const {commentingEnabled} = useDiffContext()
  const {diffLine, isLeftSide, isSplit, diffContext} = useDiffLineContext()
  const line = diffLine as DiffLine

  // Get the relevant lines for the selected diff row range
  const firstOriginalLine = useMemo(() => selectedDiffLines.leftLines[0], [selectedDiffLines.leftLines])
  const lastOriginalLine = useMemo(
    () => selectedDiffLines.leftLines[selectedDiffLines.leftLines.length - 1],
    [selectedDiffLines.leftLines],
  )
  const allOriginalLinesNotDeletions = useMemo(
    () => selectedDiffLines.leftLines.every(leftLine => !isEmptyDiffLine(leftLine) && leftLine.type !== 'DELETION'),
    [selectedDiffLines.leftLines],
  )
  const firstModifiedLine = useMemo(() => selectedDiffLines.rightLines[0], [selectedDiffLines.rightLines])
  const lastModifiedLine = useMemo(
    () => selectedDiffLines.rightLines[selectedDiffLines.rightLines.length - 1],
    [selectedDiffLines.rightLines],
  )
  const modifiedLinesAreEmpty = useMemo(() => selectedDiffLines.rightLines.length === 0, [selectedDiffLines.rightLines])
  const originalLinesAreEmpty = useMemo(() => selectedDiffLines.leftLines.length === 0, [selectedDiffLines.leftLines])
  const allLinesAreContextLines = useMemo(() => {
    if (
      selectedDiffLines.leftLines.find(
        leftLine => !isEmptyDiffLine(leftLine) && !isContextDiffLine(leftLine) && leftLine.type !== 'INJECTED_CONTEXT',
      )
    )
      return false
    if (
      selectedDiffLines.rightLines.find(
        rightLine =>
          !isEmptyDiffLine(rightLine) && !isContextDiffLine(rightLine) && rightLine.type !== 'INJECTED_CONTEXT',
      )
    )
      return false

    return true
  }, [selectedDiffLines.leftLines, selectedDiffLines.rightLines])

  // Handlers for starting conversations based on selected lines
  const handleStartOriginalLinesConversationSelection = useCallback(
    (e: React.KeyboardEvent | React.MouseEvent, opts?: {withSuggestedChange?: boolean}) => {
      if (
        !selectedDiffRowRange ||
        !lastOriginalLine ||
        !firstOriginalLine ||
        isEmptyDiffLine(lastOriginalLine) ||
        isEmptyDiffLine(firstOriginalLine) ||
        !firstOriginalLine.left ||
        !lastOriginalLine.left
      ) {
        return
      }

      const newSelectedLineRange = {
        diffAnchor: selectedDiffRowRange.diffAnchor,
        endLineNumber: lastOriginalLine.left,
        endOrientation: 'left',
        startLineNumber: firstOriginalLine.left,
        startOrientation: 'left',
        firstSelectedLineNumber: firstOriginalLine.left,
        firstSelectedOrientation: 'left',
      } as LineRange

      replaceSelectedDiffRowRange(newSelectedLineRange)
      if (opts?.withSuggestedChange) {
        handleStartConversationWithSuggestedChange()
      } else {
        handleStartConversation()
      }
    },
    [
      selectedDiffRowRange,
      lastOriginalLine,
      firstOriginalLine,
      replaceSelectedDiffRowRange,
      handleStartConversationWithSuggestedChange,
      handleStartConversation,
    ],
  )

  const handleStartModifiedLinesConversationSelection = useCallback(
    (e: React.KeyboardEvent | React.MouseEvent, opts?: {withSuggestedChange?: boolean}) => {
      if (
        !selectedDiffRowRange ||
        !lastModifiedLine ||
        !firstModifiedLine ||
        isEmptyDiffLine(lastModifiedLine) ||
        isEmptyDiffLine(firstModifiedLine) ||
        !firstModifiedLine.right ||
        !lastModifiedLine.right
      ) {
        return
      }

      const newSelectedLineRange = {
        diffAnchor: selectedDiffRowRange.diffAnchor,
        endLineNumber: lastModifiedLine.right,
        endOrientation: 'right',
        startLineNumber: firstModifiedLine.right,
        startOrientation: 'right',
        firstSelectedLineNumber: firstModifiedLine.right,
        firstSelectedOrientation: 'right',
      } as LineRange

      replaceSelectedDiffRowRange(newSelectedLineRange)
      if (opts?.withSuggestedChange) {
        handleStartConversationWithSuggestedChange()
      } else {
        handleStartConversation()
      }
    },
    [
      selectedDiffRowRange,
      lastModifiedLine,
      firstModifiedLine,
      replaceSelectedDiffRowRange,
      handleStartConversationWithSuggestedChange,
      handleStartConversation,
    ],
  )
  const canSuggestChanges = line.type !== 'DELETION' && (diffContext === 'pr' || diffContext === undefined)
  const hasMultipleLinesSelected: boolean = useMemo(() => {
    if (!selectedDiffRowRange) return false
    if (selectedDiffRowRange.startOrientation !== selectedDiffRowRange.endOrientation) return true
    if (selectedDiffRowRange.startLineNumber !== selectedDiffRowRange.endLineNumber) return true
    return false
  }, [selectedDiffRowRange])

  // Fail safe in case this is called without correctly setting showStartConversation in Context menu
  if (!commentingEnabled) return null

  let originalRangeText
  let modifiedRangeText
  let unifiedRangeText
  let showOriginalLineOption: boolean = false
  let showModifiedLineOption: boolean = false

  // multi-line selection
  if (selectedDiffRowRange && hasMultipleLinesSelected) {
    const selectedDiffRowRangeStartOrientation = ORIENTATION_MAP[selectedDiffRowRange.startOrientation]
    const selectedDiffRowRangeEndOrientation = ORIENTATION_MAP[selectedDiffRowRange.endOrientation]

    unifiedRangeText = ` on lines ${selectedDiffRowRangeStartOrientation}${selectedDiffRowRange.startLineNumber}-${selectedDiffRowRangeEndOrientation}${selectedDiffRowRange.endLineNumber}`

    if (
      !isEmptyDiffLine(firstOriginalLine) &&
      !isEmptyDiffLine(lastOriginalLine) &&
      firstOriginalLine &&
      lastOriginalLine
    ) {
      showOriginalLineOption = true
      originalRangeText = generateOriginalRangeText(firstOriginalLine, lastOriginalLine, modifiedLinesAreEmpty)
    }

    if (
      !isEmptyDiffLine(firstModifiedLine) &&
      !isEmptyDiffLine(lastModifiedLine) &&
      firstModifiedLine &&
      lastModifiedLine
    ) {
      showModifiedLineOption = true
      modifiedRangeText = generateModifiedRangeText(
        firstModifiedLine,
        lastModifiedLine,
        originalLinesAreEmpty,
        isSplit,
        allLinesAreContextLines,
      )
    }

    return (
      <>
        {isSplit ? (
          <>
            {allLinesAreContextLines ? (
              <>
                <ActionList.Item onSelect={handleStartModifiedLinesConversationSelection}>
                  <ActionList.LeadingVisual>
                    <PlusIcon />
                  </ActionList.LeadingVisual>
                  {START_CONVERSATION + modifiedRangeText}
                  <ActionList.TrailingVisual>
                    <KeyboardKey keys="Alt+n" />
                  </ActionList.TrailingVisual>
                </ActionList.Item>
                <ActionList.Item
                  onSelect={e => handleStartModifiedLinesConversationSelection(e, {withSuggestedChange: true})}
                >
                  <ActionList.LeadingVisual>
                    <PlusCircleIcon />
                  </ActionList.LeadingVisual>
                  {SUGGEST_CHANGE + modifiedRangeText}
                </ActionList.Item>
              </>
            ) : (
              <>
                {showOriginalLineOption ? (
                  <>
                    <ActionList.Item onSelect={handleStartOriginalLinesConversationSelection}>
                      <ActionList.LeadingVisual>
                        <PlusIcon />
                      </ActionList.LeadingVisual>
                      {START_CONVERSATION + originalRangeText}
                      <ActionList.TrailingVisual>
                        <KeyboardKey keys={modifiedLinesAreEmpty ? 'Alt+n' : 'Alt+Shift+N'} />
                      </ActionList.TrailingVisual>
                    </ActionList.Item>
                    {allOriginalLinesNotDeletions && (
                      <ActionList.Item
                        onSelect={e => handleStartOriginalLinesConversationSelection(e, {withSuggestedChange: true})}
                      >
                        <ActionList.LeadingVisual>
                          <PlusCircleIcon />
                        </ActionList.LeadingVisual>
                        {SUGGEST_CHANGE + originalRangeText}
                      </ActionList.Item>
                    )}
                  </>
                ) : null}
                {showModifiedLineOption ? (
                  <>
                    <ActionList.Item onSelect={handleStartModifiedLinesConversationSelection}>
                      <ActionList.LeadingVisual>
                        <PlusIcon />
                      </ActionList.LeadingVisual>
                      {START_CONVERSATION + modifiedRangeText}
                      <ActionList.TrailingVisual>
                        <KeyboardKey keys="Alt+n" />
                      </ActionList.TrailingVisual>
                    </ActionList.Item>
                    <ActionList.Item
                      onSelect={e => handleStartModifiedLinesConversationSelection(e, {withSuggestedChange: true})}
                    >
                      <ActionList.LeadingVisual>
                        <PlusCircleIcon />
                      </ActionList.LeadingVisual>
                      {SUGGEST_CHANGE + modifiedRangeText}
                    </ActionList.Item>
                  </>
                ) : null}
              </>
            )}
          </>
        ) : (
          <>
            <CommandActionListItem
              commandId="pull-requests-diff-view:start-conversation-current"
              leadingVisual={<PlusIcon />}
            >
              {START_CONVERSATION + unifiedRangeText}
            </CommandActionListItem>
            {canSuggestChanges && allOriginalLinesNotDeletions && (
              <ActionList.Item onSelect={handleStartConversationWithSuggestedChange}>
                <ActionList.LeadingVisual>
                  <PlusCircleIcon />
                </ActionList.LeadingVisual>
                {SUGGEST_CHANGE + unifiedRangeText}
              </ActionList.Item>
            )}
          </>
        )}
      </>
    )
  }

  // Single Line selection
  return (
    <>
      <CommandActionListItem
        commandId="pull-requests-diff-view:start-conversation-current"
        leadingVisual={<PlusIcon />}
      >
        {generateSingleLineText(START_CONVERSATION, line, isLeftSide)}
      </CommandActionListItem>
      {canSuggestChanges && (
        <ActionList.Item onSelect={handleStartConversationWithSuggestedChange}>
          <ActionList.LeadingVisual>
            <PlusCircleIcon />
          </ActionList.LeadingVisual>
          {generateSingleLineText(SUGGEST_CHANGE, line, isLeftSide)}
        </ActionList.Item>
      )}
    </>
  )
}
