import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import React, {lazy, useCallback, useEffect, useState} from 'react'
import {usePlaygroundManager, usePlaygroundState} from '../../../utils/playground-manager'
import {Box, Button, IconButton} from '@primer/react'
import type {PlaygroundMessage} from '../../../utils/model-client'
import {PlaygroundChatInput} from './PlaygroundChatInput'
import {AlertIcon, PencilIcon} from '@primer/octicons-react'
import {PlaygroundAPIMessageAuthorValues} from '../../../../types'
import {ModelLegalTerms} from './GettingStartedDialog/ModelLegalTerms'
const CodeMirror = lazy(() => import('@github-ui/code-mirror'))

export type PlaygroundJSONProps = {
  setToolbarContent: React.Dispatch<React.SetStateAction<React.ReactNode>>
  setFullWidthToolbarContent: React.Dispatch<React.SetStateAction<React.ReactNode>>
}

function validateJSONAsPlaygroundMessages(input: string): PlaygroundMessage[] | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function isPlaygroundMessage(obj: any): obj is PlaygroundMessage {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj.timestamp === 'string' &&
      typeof obj.role === 'string' &&
      typeof obj.message === 'string' &&
      PlaygroundAPIMessageAuthorValues.includes(obj.role)
    )
  }

  try {
    const parsed = JSON.parse(input)
    if (Array.isArray(parsed) && parsed.every(isPlaygroundMessage)) {
      let parsedAndValidated = parsed
      // Make sure dates are parsed
      parsedAndValidated = parsedAndValidated.map(message => ({
        ...message,
        timestamp: new Date(message.timestamp),
      }))
      return parsedAndValidated
    }
    return null
  } catch (e) {
    return null
  }
}

export function PlaygroundJSON(props: PlaygroundJSONProps) {
  const state = usePlaygroundState()
  const [initialContent, setInitialContent] = useState<string>(JSON.stringify(state.messages, null, 2))
  const [content, setContent] = useState<string>(initialContent)
  const [isValidJSON, setIsValidJSON] = useState<boolean>(true)
  const [editMode, setEditMode] = useState<boolean>(false)

  const manager = usePlaygroundManager()

  const validateJSON = (input: string): boolean => {
    try {
      return validateJSONAsPlaygroundMessages(input) !== null
    } catch (e) {
      return false
    }
  }

  const onChange = (input: string) => {
    setContent(input)
    setIsValidJSON(validateJSON(input))
  }

  const renderToolbar = useCallback(() => {
    const applyInput = (input: string) => {
      if (!validateJSON(input)) {
        return
      }

      const parsed = validateJSONAsPlaygroundMessages(input)
      if (parsed) {
        manager.setMessages(parsed)
        setInitialContent(input)
        setEditMode(false)
      }
    }

    const resetInput = () => {
      setContent(initialContent)
      setIsValidJSON(true)
      setEditMode(false)
    }

    if (!editMode) {
      return (
        <>
          <IconButton
            sx={{display: ['flex', 'none', 'none']}}
            size="small"
            icon={PencilIcon}
            aria-label="Edit JSON"
            onClick={() => {
              manager.stopStreaming()
              setEditMode(true)
            }}
          />
          <Button
            sx={{display: ['none', 'flex', 'flex']}}
            onClick={() => {
              manager.stopStreaming()
              setEditMode(true)
            }}
            size="small"
          >
            Edit
          </Button>
        </>
      )
    } else {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
            gap: 2,
          }}
        >
          <>
            <span className="color-fg-danger">
              {!isValidJSON && (
                <>
                  <AlertIcon aria-hidden /> Invalid JSON or value
                </>
              )}
            </span>
          </>
          <>
            <Button onClick={() => resetInput()} size="small">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => applyInput(content)}
              size="small"
              disabled={content === initialContent || !isValidJSON}
            >
              Apply changes
            </Button>
          </>
        </Box>
      )
    }
  }, [content, editMode, initialContent, isValidJSON, manager])

  useEffect(() => {
    props.setFullWidthToolbarContent(editMode ? renderToolbar() : null)
    props.setToolbarContent(!editMode ? renderToolbar() : null)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, initialContent, isValidJSON, editMode])

  // Important if last session is restored by the user
  useEffect(() => {
    const _content = JSON.stringify(state.messages, null, 2)
    setInitialContent(_content)
    setContent(_content)
  }, [state])

  return (
    <div className="d-flex position-relative flex-column overflow-auto flex-1">
      <CopyToClipboardButton
        className="position-absolute"
        sx={{right: '8px', top: '8px', zIndex: 10}}
        textToCopy={initialContent}
        ariaLabel={'Copy to clipboard'}
      />

      <div className="height-full overflow-auto">
        <React.Suspense fallback={<></>}>
          <CodeMirror
            fileName={`document.json`}
            value={content}
            ariaLabelledBy={''}
            height="100%"
            spacing={{
              indentUnit: 2,
              indentWithTabs: false,
              lineWrapping: true,
            }}
            hideHelpUntilFocus={true}
            onChange={onChange}
            isReadOnly={!editMode || state.isLoading}
          />
        </React.Suspense>
      </div>

      {!editMode && (
        <div className="ml-3 mb-3">
          <PlaygroundChatInput />
          <div className="pt-3 pb-2 d-flex flex-justify-center">
            <ModelLegalTerms />
          </div>
        </div>
      )}
    </div>
  )
}
