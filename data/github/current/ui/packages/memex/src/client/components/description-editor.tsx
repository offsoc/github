import {CommentBox, type CommentBoxHandle} from '@github-ui/comment-box/CommentBox'
import {CommentBoxButton} from '@github-ui/comment-box/CommentBoxButton'
import {testIdProps} from '@github-ui/test-id-props'
import {BookIcon, PencilIcon} from '@primer/octicons-react'
import {Box, IconButton, Octicon, Text} from '@primer/react'
import {type MouseEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {flushSync} from 'react-dom'

import {getInitialState} from '../helpers/initial-state'
import {ViewerPrivileges} from '../helpers/viewer-privileges'
import {useMarkdownPreview} from '../hooks/use-markdown-preview'
import {useProjectDetails} from '../state-providers/memex/use-project-details'
import {useUpdateMemexDescription} from '../state-providers/memex/use-update-memex-description'
import {DescriptionEditorResources} from '../strings'
import {SanitizedMarkdownViewer} from './common/sanitized-markdown-viewer'
import {ErrorState, SuccessState} from './common/state-style-decorators'

const TIMEOUT_SUCCESS_HIDE = 1800
const MAX_LENGTH = 10000

export function DescriptionEditor({
  setProjectDescription,
  onSaveStats,
  editModeOff = false,
  setHasUnsavedChanges,
  hideLabel,
}: {
  setProjectDescription?: (description: string) => void
  onSaveStats?: (update: boolean) => void
  editModeOff?: boolean
  setHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void
  hideLabel?: boolean
}) {
  const {hasWritePermissions} = ViewerPrivileges()
  const {description, descriptionHtml, setDescriptionHtml} = useProjectDetails()
  const {updateDescription} = useUpdateMemexDescription()
  const {projectData} = getInitialState()

  const [disabled, setDisabled] = useState(false)
  const [localDescription, setLocalDescription] = useState(description)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isEdit, setIsEdit] = useState(editModeOff)
  const {isLoading, loadPreview} = useMarkdownPreview({project: projectData?.id, subject_type: 'Project'})

  const commentBoxRef = useRef<CommentBoxHandle>(null)
  const iconButtonWithTooltipRef = useRef<HTMLButtonElement>(null)

  const loadAndUpdatePreview = useCallback(
    async (nextDescription: string) => {
      if (description) {
        setDescriptionHtml(await loadPreview(nextDescription))
      } else {
        setDescriptionHtml('')
      }
    },
    [description, loadPreview, setDescriptionHtml],
  )

  const onChange = useCallback(
    (nextDescription: string) => {
      if (setHasUnsavedChanges) setHasUnsavedChanges(nextDescription !== description)
      setLocalDescription(nextDescription)
      setProjectDescription?.(nextDescription)
    },
    [description, setHasUnsavedChanges, setProjectDescription],
  )

  useEffect(() => {
    if (!descriptionHtml && description) {
      loadAndUpdatePreview(description)
    }
  }, [description, descriptionHtml, loadAndUpdatePreview])

  useEffect(() => {
    onChange(description)
  }, [description, onChange])

  const closeEditor = useCallback(() => {
    if (!editModeOff) {
      flushSync(() => {
        setIsEdit(false)
      })
      iconButtonWithTooltipRef.current?.focus()
    }
  }, [editModeOff])

  const onSave = useCallback(async () => {
    if ((!description && !localDescription) || description === localDescription) {
      closeEditor()
      return null
    }

    try {
      setDisabled(true)
      setIsError(false)

      onSaveStats?.(!!description)

      await updateDescription(localDescription)
      loadAndUpdatePreview(localDescription)

      setIsSuccess(true)
      closeEditor()
      setTimeout(() => {
        setIsSuccess(false)
      }, TIMEOUT_SUCCESS_HIDE)
    } catch (error) {
      setIsError(true)
    } finally {
      setDisabled(false)
    }
  }, [description, localDescription, closeEditor, onSaveStats, updateDescription, loadAndUpdatePreview])

  const onCancel = useCallback(() => {
    onChange(description)

    closeEditor()
  }, [onChange, description, closeEditor])

  const onEdit = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    if (!(e.target instanceof HTMLAnchorElement)) {
      flushSync(() => {
        setIsEdit(true)
      })

      commentBoxRef.current?.focus()
    }
  }, [])

  const actions = useMemo(() => {
    if (!hasWritePermissions || (!isEdit && !editModeOff)) {
      return
    }

    if (isSuccess && editModeOff) {
      return (
        <Box sx={{minHeight: '30px', display: 'flex', '& > svg': {ml: 'auto'}}}>
          <SuccessState /> <Text sx={{ml: 1}}>Saved</Text>
        </Box>
      )
    }

    if (localDescription === description && editModeOff) return

    return (
      <>
        <CommentBoxButton variant="invisible" sx={{color: 'fg.muted'}} onClick={onCancel}>
          {DescriptionEditorResources.cancelButton}
        </CommentBoxButton>
        <CommentBoxButton variant="primary" onClick={onSave}>
          {DescriptionEditorResources.saveButton}
        </CommentBoxButton>
      </>
    )
  }, [hasWritePermissions, isEdit, editModeOff, isSuccess, localDescription, description, onCancel, onSave])

  return (
    <>
      {editModeOff ? null : (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              color: 'fg.muted',
              fontSize: 1,
              width: '100%',
              fontWeight: 'normal',
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                minHeight: 32,
                gap: 2,
              }}
            >
              <Octicon icon={BookIcon} sx={{color: 'fg.subtle'}} />
              <Text as="h3" sx={{fontSize: 14, fontWeight: 'bold', color: 'fg.default'}}>
                {DescriptionEditorResources.readmeTitle}
              </Text>
            </Box>
            {!isEdit && hasWritePermissions && (
              <IconButton
                variant="invisible"
                onClick={onEdit}
                sx={{
                  color: 'fg.muted',
                }}
                icon={PencilIcon}
                aria-label="Edit README"
                tooltipDirection="sw"
                ref={iconButtonWithTooltipRef}
                {...testIdProps('pencil-editor-button')}
              />
            )}
          </Box>
          {!isEdit && !localDescription && (
            <Box
              sx={{
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                textAlign: 'start',
                fontSize: 12,
              }}
            >
              {DescriptionEditorResources.readmePlaceholder}
            </Box>
          )}
        </>
      )}
      {isEdit ? (
        <Box sx={{display: 'flex', flexDirection: 'column', mb: 4}}>
          <CommentBox
            value={localDescription}
            onChange={onChange}
            disabled={!hasWritePermissions || !isEdit || disabled}
            placeholder={DescriptionEditorResources.readmePlaceholder}
            maxLength={MAX_LENGTH}
            ref={commentBoxRef}
            label={DescriptionEditorResources.readmeTitle}
            showLabel={!hideLabel}
            onPrimaryAction={onSave}
            actions={setProjectDescription ? undefined : actions}
            subject={projectData ? {type: 'project', id: {databaseId: projectData.id}} : undefined}
            {...testIdProps('markdown-editor')}
          />
          {isError && <ErrorState caret="top-left" message={DescriptionEditorResources.errorMessage} />}
        </Box>
      ) : !hasWritePermissions || descriptionHtml || isLoading ? (
        <SanitizedMarkdownViewer unverifiedHTML={descriptionHtml} loading={isLoading} />
      ) : null}
    </>
  )
}
