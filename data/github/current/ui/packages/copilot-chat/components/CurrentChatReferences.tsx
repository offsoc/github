import {testIdProps} from '@github-ui/test-id-props'
import {BookIcon, PaperclipIcon, RepoIcon, XIcon} from '@primer/octicons-react'
import {
  AnchoredOverlay,
  Box,
  Button,
  Heading,
  IconButton,
  Link,
  Octicon,
  Popover,
  Text,
  Token,
  Tooltip,
} from '@primer/react'
import {useCallback, useEffect, useState} from 'react'

import {referenceName} from '../utils/copilot-chat-helpers'
import type {DocsetReference} from '../utils/copilot-chat-types'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'
import {COPILOT_CHAT_MENU_PORTAL_ROOT} from './PortalContainerUtils'

const INVISIBLE_REFERENCES: ReadonlySet<string> = new Set(['repository'])

export const CurrentChatReferences = () => {
  const {currentReferences, mode, renderKnowledgeBaseAttachedToChatPopover} = useChatState()
  const visibleReferences = currentReferences.filter(ref => !INVISIBLE_REFERENCES.has(ref.type))
  const manager = useChatManager()
  const removeReference = useCallback((index: number) => manager.removeReference(index), [manager])
  const [overlayOpen, setOverlayOpen] = useState(false)

  const firstVisibleReference = visibleReferences[0]

  const [docsetReference, setDocsetReference] = useState<DocsetReference | undefined>(
    firstVisibleReference?.type === 'docset' ? firstVisibleReference : undefined,
  )

  useEffect(() => {
    if (firstVisibleReference?.type === 'docset') {
      setDocsetReference(firstVisibleReference)
    }
  }, [firstVisibleReference])

  // Remove knowledge base references if the knowledge base no longer exists on the server.
  // See: https://github.com/github/copilot-core-productivity/issues/1285
  useEffect(() => {
    const fetchDocset = async () => {
      if (docsetReference) {
        // want to get the latest info, this could be stale
        const res = await manager.fetchKnowledgeBases()
        if (res.ok) {
          const knowledgeBase = res.payload.find(kb => kb.id === docsetReference.id)
          if (!knowledgeBase) {
            // Immediately remove from the list of references
            setDocsetReference(undefined)
            // Make sure the reference is removed from local storage
            removeReference(0)
          }
        }
      }
    }
    void fetchDocset()
    // This should only run once when the reference first loads. Knowledge bases don't change often enough to need to
    // re-query the server everytime something changes.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Consider this a short term hack.
   * The docset reference we get as part of currentReferences is not the full docset object. We need to supplement
   * it with information from the API.
   */
  useEffect(() => {
    const fetchDocset = async () => {
      if (docsetReference && docsetReference.repos === undefined) {
        const res = await manager.fetchKnowledgeBases()
        if (res.ok) {
          const docset = res.payload.find(d => d.id === docsetReference.id)
          if (docset) {
            setDocsetReference({type: 'docset', ...docset})
          }
        }
      }
    }
    void fetchDocset()
  }, [docsetReference, manager, manager.service, removeReference])

  if (visibleReferences.length === 0) return null
  return (
    <Box sx={{mt: 'auto', position: 'relative'}}>
      <Popover
        open={docsetReference && renderKnowledgeBaseAttachedToChatPopover}
        sx={{bottom: '75px', left: '50%', transform: 'translateX(-50%)'}}
        caret="bottom"
      >
        <Popover.Content sx={{mt: 2, width: '300px'}} className="color-shadow-medium">
          <Heading as="h4" sx={{fontSize: 2, mb: 2}}>
            Copilot will now use content within the knowledge base to answer your questions
          </Heading>
          <p>Remove the knowledge base to switch back to your original context.</p>

          <Button
            onClick={() => {
              void manager.dismissKnowledgeBaseAttachedToChatPopover()
            }}
          >
            Got it
          </Button>
        </Popover.Content>
      </Popover>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
          display: 'flex',
          gap: 2,
          p: 2,
          pl: 3,
          mx: mode === 'assistive' ? 3 : 0,
          mb: 3,
        }}
      >
        <Octicon icon={docsetReference ? BookIcon : PaperclipIcon} sx={{color: 'fg.muted'}} />

        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', gap: docsetReference ? 1 : 2}}>
          <Text sx={{fontWeight: 'bold', fontSize: 0, display: 'block', lineHeight: 1.25}}>
            {docsetReference
              ? `Chatting with ${referenceName(docsetReference)}`
              : `Chatting with ${visibleReferences.length} attachment${visibleReferences.length > 1 ? 's' : ''}`}
          </Text>

          {docsetReference ? (
            <Box sx={{fontSize: 0, lineHeight: 1.25}} {...testIdProps('docset-reference')}>
              {docsetReference.repos ? (
                <>
                  <Text sx={{color: 'fg.muted'}}>Knowledge base with</Text>{' '}
                  <AnchoredOverlay
                    open={overlayOpen}
                    onOpen={() => setOverlayOpen(true)}
                    onClose={() => setOverlayOpen(false)}
                    renderAnchor={props => (
                      <Link {...props} as="button" sx={{color: 'fg.default', fontWeight: 'bold'}}>
                        {`${docsetReference.repos?.length} ${
                          docsetReference.repos?.length === 1 ? 'repository' : 'repositories'
                        }`}
                      </Link>
                    )}
                    side="outside-top"
                    overlayProps={{portalContainerName: COPILOT_CHAT_MENU_PORTAL_ROOT}}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '320px',
                        maxWidth: '100vw',
                        maxHeight: '100vw',
                        overflow: 'auto',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          py: 2,
                          pr: 2,
                          alignItems: 'center',
                          borderBottom: '1px solid var(--borderColor-default, var(--color-border-default))',
                        }}
                      >
                        <Text sx={{pl: 3, flex: 1, fontWeight: 'bold'}}>{docsetReference.name}</Text>
                        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                        <IconButton
                          unsafeDisableTooltip={true}
                          icon={XIcon}
                          onClick={() => setOverlayOpen(false)}
                          aria-label="Close docset overlay"
                          variant="invisible"
                        />
                      </Box>
                      <Box sx={{display: 'flex', flex: 1, flexDirection: 'column', px: 3, pt: 2, pb: 3, gap: 2}}>
                        <div>{docsetReference.description}</div>
                        <Box sx={{color: 'fg.muted'}}>Repository content in the knowledge base</Box>
                        {docsetReference.repos &&
                          docsetReference.repos.map(repo => (
                            <Box key={repo} sx={{display: 'flex', alignItems: 'center'}}>
                              <Octicon icon={RepoIcon} sx={{color: 'fg.muted'}} />
                              <Text sx={{pl: 2}}>{repo}</Text>
                            </Box>
                          ))}
                      </Box>
                    </Box>
                  </AnchoredOverlay>
                </>
              ) : (
                <Text sx={{color: 'fg.muted'}}>Loading repositories...</Text>
              )}
            </Box>
          ) : (
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
              {visibleReferences.length > 0 &&
                visibleReferences.map((inputRef, i) => (
                  <Token
                    key={referenceName(inputRef)}
                    text={referenceName(inputRef)}
                    onRemove={() => removeReference(i)}
                  />
                ))}
            </Box>
          )}
        </Box>

        {docsetReference && (
          <Tooltip aria-label="Remove knowledge reference" direction="nw">
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              icon={XIcon}
              aria-label="Remove knowledge reference"
              size="small"
              variant="invisible"
              onClick={() => removeReference(0)}
            />
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}
