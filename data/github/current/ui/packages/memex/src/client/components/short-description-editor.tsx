import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {testIdProps} from '@github-ui/test-id-props'
import {NoteIcon, PencilIcon} from '@primer/octicons-react'
import {Box, Button, FormControl, IconButton, Octicon, Text, Textarea} from '@primer/react'
import {useCallback, useEffect, useRef, useState} from 'react'

import {ViewerPrivileges} from '../helpers/viewer-privileges'
import {useEmojiAutocomplete} from '../hooks/common/use-emoji-autocomplete'
import {useProjectDetails} from '../state-providers/memex/use-project-details'
import {useUpdateMemexShortDescription} from '../state-providers/memex/use-update-memex-short-description'
import {DescriptionEditorResources} from '../strings'
import {ErrorState, SuccessState} from './common/state-style-decorators'
import {SanitizedHtml} from './dom/sanitized-html'

const MAX_LENGTH = 300
const TIMEOUT_SUCCESS_HIDE = 1800

interface ShortDescriptionEditorProps {
  setProjectShortDescription?: (shortDescription: string) => void
  onSaveStats?: (update: boolean) => void
  /**
   * Control whether this renders as a preview with an edit button (`false`) or as a plain textarea that autosaves
   * (`true`).
   */
  editModeOff?: boolean
  setHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void
  hideLabel?: boolean
}

export const ShortDescriptionEditor = ({
  setProjectShortDescription,
  onSaveStats,
  editModeOff = false,
  setHasUnsavedChanges,
  hideLabel,
}: ShortDescriptionEditorProps) => {
  const {hasWritePermissions} = ViewerPrivileges()
  const {shortDescription, shortDescriptionHtml} = useProjectDetails()
  const {updateShortDescription} = useUpdateMemexShortDescription()
  const [localShortDescription, setLocalShortDescription] = useState(shortDescription)
  const [isError, setIsError] = useState(false)
  const [isEdit, setIsEdit] = useState(editModeOff)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const ref = useRef<HTMLTextAreaElement | null>(null)
  const iconButtonWithTooltipRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setLocalShortDescription(shortDescription)
    if (setHasUnsavedChanges) setHasUnsavedChanges(false)
  }, [shortDescription, setHasUnsavedChanges])

  const onSave = useCallback(async () => {
    try {
      setIsDisabled(true)
      setIsError(false)
      onSaveStats?.(!!shortDescription)
      await updateShortDescription(localShortDescription)
      if (!editModeOff) setIsEdit(false)
      if (setHasUnsavedChanges) setHasUnsavedChanges(false)
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
      }, TIMEOUT_SUCCESS_HIDE)
    } catch (error) {
      setIsError(true)
    } finally {
      setIsDisabled(false)
    }
  }, [onSaveStats, shortDescription, editModeOff, setHasUnsavedChanges, localShortDescription, updateShortDescription])

  const onCancel = useCallback(() => {
    setLocalShortDescription(shortDescription)
    if (!editModeOff) setIsEdit(false)
    if (setHasUnsavedChanges) setHasUnsavedChanges(false)
  }, [setHasUnsavedChanges, shortDescription, editModeOff])

  const onEdit = useCallback(() => setIsEdit(true), [])

  useEffect(() => {
    if (isEdit && ref.current && !editModeOff) {
      ref.current.focus()
      ref.current.selectionStart = ref.current.selectionEnd = ref.current.value.length
    }
  }, [isEdit, editModeOff])

  const onChange = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      const singleLineValue = e.currentTarget.value.replace(/\s+/gs, ' ')
      if (setHasUnsavedChanges) setHasUnsavedChanges(singleLineValue !== shortDescription)
      setLocalShortDescription(singleLineValue)
      setProjectShortDescription?.(singleLineValue)
    },
    [setHasUnsavedChanges, shortDescription, setProjectShortDescription],
  )

  const autocompleteProps = useEmojiAutocomplete()

  return (
    <>
      {!editModeOff && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            color: 'fg.muted',
            fontSize: 1,
            width: '100%',
            fontWeight: 'normal',
            mt: 3,
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
            <Octicon icon={NoteIcon} sx={{color: 'fg.subtle'}} />
            <Text as="h3" sx={{fontSize: 14, fontWeight: 'bold', color: 'fg.default'}}>
              {DescriptionEditorResources.shortDescriptionTitle}
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
              aria-label="Edit short description"
              ref={iconButtonWithTooltipRef}
              tooltipDirection="sw"
              {...testIdProps('description-editor-edit')}
            />
          )}
        </Box>
      )}
      {isEdit ? (
        <>
          <FormControl>
            <FormControl.Label visuallyHidden={hideLabel}>
              {DescriptionEditorResources.shortDescriptionTitle}
            </FormControl.Label>
            <InlineAutocomplete {...autocompleteProps} style={{width: editModeOff ? 415 : '100%'}}>
              <Textarea
                ref={ref}
                placeholder={DescriptionEditorResources.shortDescriptionPlaceholder}
                onChange={onChange}
                maxLength={MAX_LENGTH}
                value={localShortDescription}
                {...testIdProps('description-editor')}
              />
            </InlineAutocomplete>
          </FormControl>

          {!setProjectShortDescription && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row-reverse',
                mt: 2,
                width: editModeOff ? 415 : '100%',
                minHeight: '30px',
              }}
              {...testIdProps('readme-editor-buttons')}
            >
              {isSuccess && editModeOff ? (
                <>
                  <Text sx={{ml: 1}}>Saved</Text> <SuccessState />
                </>
              ) : localShortDescription !== shortDescription || !editModeOff ? (
                <>
                  <Button variant="primary" size="small" sx={{ml: 2}} onClick={onSave} disabled={isDisabled}>
                    {DescriptionEditorResources.saveButton}
                  </Button>
                  <Button
                    variant="invisible"
                    size="small"
                    sx={{color: 'fg.muted'}}
                    onClick={onCancel}
                    disabled={isDisabled}
                  >
                    {DescriptionEditorResources.cancelButton}
                  </Button>
                </>
              ) : null}
            </Box>
          )}

          {isError && <ErrorState caret="top-left" message={DescriptionEditorResources.errorMessage} />}
        </>
      ) : (
        <Box sx={{display: 'flex', flexDirection: 'column', mb: 4}}>
          {shortDescriptionHtml ? (
            <SanitizedHtml>{shortDescriptionHtml}</SanitizedHtml>
          ) : (
            <Box
              sx={{
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                textAlign: 'start',
                fontSize: 12,
              }}
            >
              {DescriptionEditorResources.shortDescriptionPlaceholder}
            </Box>
          )}
        </Box>
      )}
    </>
  )
}
