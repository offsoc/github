import {debounce} from '@github/mini-throttle'
import {PlaygroundChatInput} from './PlaygroundChatInput'
import {PlaygroundChatMessage} from './PlaygroundChatMessage'
import {useEffect, useCallback, useRef, useState} from 'react'
import {SidebarSelectionOptions, usePlaygroundManager, usePlaygroundState} from '../../../utils/playground-manager'
import {Box, Button, IconButton, SegmentedControl} from '@primer/react'

import {
  getSavedPlaygroundMessages,
  setPlaygroundMessages,
  type StoredChatMessages,
} from '../../../utils/playground-local-storage'
import type {PlaygroundMessage} from '../../../utils/model-client'
import {ModelLegalTerms} from './GettingStartedDialog/ModelLegalTerms'
import {SidebarExpandIcon, SlidersIcon, SyncIcon, InfoIcon, HistoryIcon} from '@primer/octicons-react'
import {PlaygroundCodeLanguage} from './PlaygroundCodeLanguage'
import PlayGroundChatEmptyState from './PlaygroundChatEmptyState'
import {PlaygroundCodeSDK} from './PlaygroundCodeSDK'
import {useNavigate} from '@github-ui/use-navigate'
import {useLocation} from 'react-router-dom'
import {ModelUrlHelper} from '../../../utils/model-url-helper'
import {PlaygroundCodeSnippet} from './PlaygroundCodeSnippet'
import {PlaygroundJSON} from './PlaygroundJSON'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'

enum PlaygroundContentOption {
  CHAT = 0,
  CODE = 1,
  JSON = 2,
}

export function PlaygroundChat() {
  const playgroundState = usePlaygroundState()
  const {messages, isLoading, showParameters, iceBreakerCheckPending} = playgroundState

  const lastIndex = messages.length - 1
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const scrolledToBottomRef = useRef(true)
  const manager = usePlaygroundManager()
  const model = manager.model
  const modelInputSchema = manager.modelInputSchema
  const [history, setHistory] = useState<PlaygroundMessage[]>([])

  const navigate = useNavigate()

  const [toolbarContent, setToolbarContent] = useState<React.ReactNode | null>(null)
  const [fullWidthToolbarContent, setFullWidthToolbarContent] = useState<React.ReactNode | null>(null)

  const lastPathComponent = useLocation().pathname.split('/').pop()?.toLowerCase()

  const jsonFeatureFlag = useFeatureFlag('project_neutron_json')

  const [selectedOption, setSelectedOption] = useState<number>(() => {
    if (lastPathComponent === ModelUrlHelper.chatSuffix) {
      return PlaygroundContentOption.CHAT
    }
    if (lastPathComponent === ModelUrlHelper.codeSuffix) {
      return PlaygroundContentOption.CODE
    }
    if (lastPathComponent === ModelUrlHelper.jsonSuffix) {
      return PlaygroundContentOption.JSON
    }

    return PlaygroundContentOption.CHAT
  })
  const canRestoreHistory = history.length > 0 && !messages.length

  const scrollToBottom = useCallback(() => {
    const forceScroll = false // Might be needed later

    function isScrollable(element: HTMLElement): boolean {
      if (!element.scrollTo) return false // This happens in the jest tests on CI
      return window.getComputedStyle(element).overflowY === 'auto'
    }

    if (!messagesContainerRef.current) return // This is not expected
    if (!scrolledToBottomRef.current && !forceScroll) return // The user has scrolled up, let's not scroll them back down

    // Depending on the screen size and the mode, we might either have a scroll
    // container around the messages, or we might use the window scroll.
    if (isScrollable(messagesContainerRef.current)) {
      messagesContainerRef.current.scrollTo(0, messagesContainerRef.current.scrollHeight)
    } else {
      window.scrollTo(0, document.body.scrollHeight)
    }
  }, [])

  useEffect(() => {
    const savedMessages = getSavedPlaygroundMessages()
    const chatHistory = savedMessages && savedMessages.modelName === manager.model.name ? savedMessages.messages : []
    setHistory(chatHistory)
    // Get messages and preferred language from the local storage only once on load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.target as HTMLElement
    // This calculation can be finnicky with fractional pixels. If we're within 1px of the bottom, we are close enough.
    scrolledToBottomRef.current = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceSetPlaygroundMessages = useCallback(
    debounce((newMessages: StoredChatMessages) => {
      setPlaygroundMessages(newMessages)
    }, 200),
    [],
  )

  useEffect(() => {
    if (messages.length > 0) {
      const chatMessages = {
        modelName: manager.model.name,
        messages,
      }
      debounceSetPlaygroundMessages(chatMessages)
    }
  }, [manager.model.name, messages, debounceSetPlaygroundMessages])

  const handleClearHistory = () => {
    manager.resetHistory(true)
    setHistory([])
  }

  const handleRestoreHistory = () => {
    manager.setMessages(history)
  }

  const RestoreHistoryButton = () => {
    return (
      <Box className="position-sticky d-flex flex-justify-end" sx={{top: '1rem', marginBottom: '-2rem', zIndex: 1}}>
        <IconButton
          data-testid="restore-history-button"
          icon={HistoryIcon}
          size="small"
          onClick={handleRestoreHistory}
          sx={{display: ['flex', 'none', 'none']}}
          aria-label="Restore last session"
        />
        <Button size="small" onClick={handleRestoreHistory} sx={{display: ['none', 'flex', 'flex']}}>
          Restore last session
        </Button>
      </Box>
    )
  }

  const handleOptionChange = (option: PlaygroundContentOption) => {
    setSelectedOption(option)
    switch (option) {
      case PlaygroundContentOption.CHAT:
        navigate(ModelUrlHelper.playgroundUrl(model))
        break
      case PlaygroundContentOption.CODE:
        navigate(ModelUrlHelper.playgroundCodeUrl(model))
        break
      case PlaygroundContentOption.JSON:
        navigate(ModelUrlHelper.playgroundJsonUrl(model))
        break
    }
  }

  const smallSizeForSegmentControl = {
    height: '28px',
    fontSize: 1,
  }

  const handleRegenerate = useCallback(
    (index: number) => {
      if (index > messages.length) return
      const isLastResponse = index + 1 === messages.length
      if (!isLastResponse) return
      const text = messages && messages[index - 1]?.message
      if (!text) return
      // Remove the latest message and response
      const filteredMessages = messages.slice(0, -2)
      const newPlaygroundState = {...playgroundState, messages: filteredMessages}
      manager.sendMessage(newPlaygroundState, text)
    },
    [manager, messages, playgroundState],
  )

  const renderToolbar = (option: PlaygroundContentOption) => {
    switch (option) {
      case PlaygroundContentOption.CHAT:
        return (
          <>
            {canRestoreHistory ? <RestoreHistoryButton /> : null}
            <IconButton
              icon={SyncIcon}
              size="small"
              aria-label="Reset chat history"
              disabled={messages.length === 0}
              onClick={handleClearHistory}
            />
          </>
        )
      case PlaygroundContentOption.CODE: {
        return (
          <>
            <PlaygroundCodeLanguage />
            <PlaygroundCodeSDK />
          </>
        )
      }
      case PlaygroundContentOption.JSON: {
        return (
          <>
            {canRestoreHistory ? <RestoreHistoryButton /> : null}
            {toolbarContent}
          </>
        )
      }
    }
  }

  const renderOption = (option: PlaygroundContentOption) => {
    switch (option) {
      case PlaygroundContentOption.CHAT:
        return (
          <div className="pl-3 pb-2 overflow-auto flex-1 d-flex flex-column">
            <div
              className="flex-1 d-flex flex-column flex-justify-between pr-3 overflow-auto"
              ref={messagesContainerRef}
              onScroll={handleScroll}
            >
              <div className="flex-1 position-relative pt-3">
                {messages.length > 0
                  ? messages.map((message, index) => (
                      <PlaygroundChatMessage
                        message={message}
                        index={index}
                        key={`${index}-${message.timestamp}`}
                        isLoading={index === lastIndex && isLoading}
                        isError={message.role === 'error'}
                        lastIndex={index === lastIndex}
                        handleRegenerate={handleRegenerate}
                      />
                    ))
                  : !iceBreakerCheckPending && (
                      <PlayGroundChatEmptyState
                        model={model}
                        modelInputSchema={modelInputSchema}
                        submitMessage={content => {
                          manager.sendMessage(playgroundState, content)
                        }}
                      />
                    )}
              </div>
            </div>
            <PlaygroundChatInput />
            <div className="pt-3 pb-2 d-flex flex-justify-center">
              <ModelLegalTerms />
            </div>
          </div>
        )
      case PlaygroundContentOption.CODE: {
        return <PlaygroundCodeSnippet model={model} />
      }
      case PlaygroundContentOption.JSON: {
        return jsonFeatureFlag ? (
          <PlaygroundJSON
            setFullWidthToolbarContent={setFullWidthToolbarContent}
            setToolbarContent={setToolbarContent}
          />
        ) : null
      }
    }
  }

  return (
    <div className="flex-1 d-flex flex-column min-width-0 height-full">
      {fullWidthToolbarContent ? (
        <Box
          sx={{
            backgroundColor: 'canvas.subtle',
            gap: 2,
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            borderBottomColor: 'border.default',
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
          }}
        >
          {fullWidthToolbarContent}
        </Box>
      ) : (
        <Box
          sx={{
            backgroundColor: 'canvas.subtle',
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            borderBottomColor: 'border.default',
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
          }}
        >
          <SegmentedControl
            aria-label={selectedOption === PlaygroundContentOption.CHAT ? 'Show playground chat' : 'Show code sample'}
            sx={smallSizeForSegmentControl}
            size="small"
            onChange={handleOptionChange}
          >
            <SegmentedControl.Button
              sx={smallSizeForSegmentControl}
              selected={selectedOption === PlaygroundContentOption.CHAT}
            >
              Chat
            </SegmentedControl.Button>
            <SegmentedControl.Button
              sx={smallSizeForSegmentControl}
              selected={selectedOption === PlaygroundContentOption.CODE}
            >
              Code
            </SegmentedControl.Button>
            {jsonFeatureFlag && (
              <SegmentedControl.Button
                sx={smallSizeForSegmentControl}
                selected={selectedOption === PlaygroundContentOption.JSON}
              >
                Raw
              </SegmentedControl.Button>
            )}
          </SegmentedControl>

          <Box sx={{display: 'flex', gap: 2}}>
            {renderToolbar(selectedOption)}
            {!showParameters && (
              <IconButton
                icon={SidebarExpandIcon}
                size="small"
                aria-label="Show parameters setting"
                onClick={() => {
                  manager.setShowParameters(true)
                }}
              />
            )}

            <Box sx={{display: ['flex', 'flex', 'none'], gap: 2}}>
              <IconButton
                icon={InfoIcon}
                size="small"
                aria-label="Show model info"
                onClick={() => {
                  manager.setTab(SidebarSelectionOptions.DETAILS)
                  manager.setShowParametersOnMobile(true)
                }}
              />
              <IconButton
                icon={SlidersIcon}
                size="small"
                aria-label="Show parameters setting"
                onClick={() => {
                  manager.setTab(SidebarSelectionOptions.PARAMETERS)
                  manager.setShowParametersOnMobile(true)
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {renderOption(selectedOption)}
    </div>
  )
}
