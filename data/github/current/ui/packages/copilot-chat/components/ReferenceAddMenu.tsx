import {IconButtonWithTooltip} from '@github-ui/icon-button-with-tooltip'
import {BookIcon, CodeIcon, CodeSquareIcon, FileCodeIcon, FileIcon, PlusIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu} from '@primer/react'
import {useCallback, useEffect, useRef, useState} from 'react'

import {isRepository, parseReferencesFromLocation, referenceName} from '../utils/copilot-chat-helpers'
import type {CopilotChatReference} from '../utils/copilot-chat-types'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'
import {ActionMenuOverlay} from './PortalContainerUtils'
import {ReferenceSearchDialog} from './ReferenceSearchDialog'

interface Props {
  isLoading?: boolean
}

export function ReferenceAddMenu(props: Props) {
  const state = useChatState()
  const manager = useChatManager()
  const [open, setOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchRefType, setSearchRefType] = useState<'file' | 'symbol' | 'docset'>('file')
  const [suggestions, setSuggestions] = useState<CopilotChatReference[]>([])
  const anchorRef = useRef<HTMLButtonElement>(null)

  const currentSelections = state.currentReferences.reduce((acc: string[], ref: CopilotChatReference) => {
    if (ref.type === 'file' || ref.type === 'snippet') acc.push(`${ref.type}:${ref.path}`)
    return acc
  }, [])

  const openFileSearchDialog = useCallback(() => {
    setSearchRefType('file')
    setIsDialogOpen(true)
  }, [])

  const openSymbolSearchDialog = useCallback(() => {
    setSearchRefType('symbol')
    setIsDialogOpen(true)
  }, [])

  const openDocsetSearchDialog = useCallback(() => {
    setSearchRefType('docset')
    setIsDialogOpen(true)
  }, [])

  const handleSuggestionSelection = useCallback(
    (suggestion: CopilotChatReference) => {
      manager.addReference(suggestion, 'addMenu')
    },
    [manager],
  )

  const {currentTopic} = state
  const currentRepo = currentTopic && isRepository(currentTopic) ? currentTopic : undefined
  useEffect(() => {
    if (!currentRepo) return
    const refs = parseReferencesFromLocation(window.location, currentRepo)
    setSuggestions(refs)
  }, [currentRepo])

  return (
    <>
      {currentRepo ? (
        <ReferenceSearchDialog
          isOpen={isDialogOpen}
          onDismiss={() => setIsDialogOpen(false)}
          returnFocusRef={anchorRef}
          refType={searchRefType}
          repo={currentRepo}
        />
      ) : null}

      <ActionMenu open={open} onOpenChange={() => setOpen(prev => !prev)} anchorRef={anchorRef}>
        <ActionMenu.Anchor>
          <IconButtonWithTooltip
            icon={PlusIcon}
            size="small"
            variant="invisible"
            aria-label="Add reference"
            aria-disabled={!currentRepo || props.isLoading}
            label="Add reference"
            tooltipDirection="ne"
          />
        </ActionMenu.Anchor>
        <ActionMenuOverlay width="medium" anchorSide="outside-top">
          <ActionList>
            <ActionList.Item onSelect={openFileSearchDialog}>
              <ActionList.LeadingVisual>
                <FileIcon />
              </ActionList.LeadingVisual>
              File
            </ActionList.Item>
            <ActionList.Item onSelect={openSymbolSearchDialog}>
              <ActionList.LeadingVisual>
                <CodeSquareIcon />
              </ActionList.LeadingVisual>
              Symbol
            </ActionList.Item>
            <ActionList.Item onSelect={openDocsetSearchDialog}>
              <ActionList.LeadingVisual>
                <BookIcon />
              </ActionList.LeadingVisual>
              Docs
            </ActionList.Item>
          </ActionList>

          {suggestions.length > 0 && (
            <ActionList>
              <ActionList.Group>
                <ActionList.GroupHeading>Suggestions</ActionList.GroupHeading>
                {suggestions.map((suggestion, index) => {
                  const selected =
                    (suggestion.type === 'file' || suggestion.type === 'snippet') &&
                    currentSelections.includes(`${suggestion.type}:${suggestion.path}`)

                  return (
                    <ActionList.Item
                      key={index}
                      active={selected}
                      disabled={selected}
                      onSelect={() => handleSuggestionSelection(suggestion)}
                    >
                      <ActionList.LeadingVisual>
                        {suggestion.type === 'file' ? <FileCodeIcon /> : <CodeIcon />}
                      </ActionList.LeadingVisual>
                      {suggestion.type === 'file'
                        ? `Current file (${referenceName(suggestion)})`
                        : suggestion.type === 'snippet'
                          ? `Current selection (${referenceName(suggestion)})`
                          : 'Current reference'}
                    </ActionList.Item>
                  )
                })}
              </ActionList.Group>
            </ActionList>
          )}
        </ActionMenuOverlay>
      </ActionMenu>
    </>
  )
}
