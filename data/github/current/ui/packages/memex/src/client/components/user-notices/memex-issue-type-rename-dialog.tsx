import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {usePrefersReducedMotion} from '@github-ui/use-prefers-reduced-motion'
import {Box, FormControl, Link, TextInput} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useCallback, useId, useState} from 'react'

import {SettingsFieldCustomTypeRenameUI, SettingsFieldRename} from '../../api/stats/contracts'
import {replaceShortCodesWithEmojis} from '../../helpers/emojis'
import {useThemedMediaUrl} from '../../helpers/media-urls'
import {useEmojiAutocomplete} from '../../hooks/common/use-emoji-autocomplete'
import {usePostStats} from '../../hooks/common/use-post-stats'
import type {ColumnModel} from '../../models/column-model'
import {useAllColumns} from '../../state-providers/columns/use-all-columns'
import {useReservedColumnNames} from '../../state-providers/columns/use-reserved-column-names'
import {useSetColumnName} from '../../state-providers/columns/use-set-column-name'
import {UserNoticeResources} from '../../strings'
import {validateColumnTitle} from '../../validations/validate-column-title'

const DIALOG_PADDING = 20
const VIDEO_WIDTH = 440

const dialogSx = {
  width: `${VIDEO_WIDTH * 2 + DIALOG_PADDING * 4}px`,
}

const dialogBodySx = {
  padding: 0,
  display: 'flex',
}

const contentBoxSx = {
  py: `${DIALOG_PADDING}px`,
  pl: `${DIALOG_PADDING}px`,
  pr: 0,
}

const videoBoxSx = {
  // Hide the video on small screen sizes
  width: [0, 0, `${VIDEO_WIDTH + DIALOG_PADDING * 2}px`],
  height: [0, 0, 'auto'],
  display: ['none', 'flex'],
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${DIALOG_PADDING}px`,
  position: 'relative',
}

const videoBorderBoxsx = {
  borderRadius: '6px',
  overflow: 'hidden',
  zIndex: 1,
  display: 'flex',
}

type MemexIssueTypeRenameDialogProps = {
  onConfirm: () => void
  onCancel: () => void
  column: ColumnModel
}

export const MemexIssueTypeRenameDialog = ({onCancel, onConfirm, column}: MemexIssueTypeRenameDialogProps) => {
  const autocompleteProps = useEmojiAutocomplete()
  const {postStats} = usePostStats()
  const {reservedColumnNames} = useReservedColumnNames()
  const {allColumns} = useAllColumns()
  const {updateName} = useSetColumnName()
  const [showValidationResult, setShowValidationResult] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const videoDescriptionId = useId()

  const [name, setName] = useState(UserNoticeResources.IssueTypeRenameDialog.defaultInputString)
  const mediaUrl = useThemedMediaUrl('issueTypes', 'demo')

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(replaceShortCodesWithEmojis(e.currentTarget.value))
    },
    [setName],
  )

  const validation = validateColumnTitle({allColumns, reservedColumnNames}, name)

  const onUpdateColumnName = useCallback(async () => {
    if (!validation.isValid) return setShowValidationResult(true)

    // Update column name
    await updateName(column, name)

    postStats({
      name: SettingsFieldRename,
      ui: SettingsFieldCustomTypeRenameUI,
      context: `new name: ${name}, original name: ${column.name}`,
      memexProjectColumnId: column.id,
    })

    onConfirm()
  }, [updateName, name, validation, setShowValidationResult, onConfirm, column, postStats])

  const showError = showValidationResult && !validation.isValid

  return (
    <Dialog
      onClose={onCancel}
      title={UserNoticeResources.IssueTypeRenameDialog.title}
      footerButtons={[
        {buttonType: 'default', content: UserNoticeResources.IssueTypeRenameDialog.actionSecondary, onClick: onCancel},
        {
          buttonType: 'primary',
          content: UserNoticeResources.IssueTypeRenameDialog.actionPrimary,
          onClick: onUpdateColumnName,
        },
      ]}
      sx={dialogSx}
      renderBody={() => {
        return (
          <Dialog.Body sx={dialogBodySx}>
            <Box sx={contentBoxSx}>
              <p>
                {UserNoticeResources.IssueTypeRenameDialog.description(column.name)}&nbsp;
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={UserNoticeResources.IssueTypeRenameDialog.learnMoreLink}
                >
                  {UserNoticeResources.IssueTypeRenameDialog.learnMoreText}
                </Link>
              </p>
              <FormControl sx={{mt: 2}}>
                <FormControl.Label>{UserNoticeResources.IssueTypeRenameDialog.fieldLabel}</FormControl.Label>
                <InlineAutocomplete {...autocompleteProps} fullWidth>
                  <TextInput
                    value={name}
                    onChange={handleNameChange}
                    aria-invalid={showError}
                    validationStatus={showError && !validation.isValid ? 'error' : undefined}
                  />
                </InlineAutocomplete>
                {showError && <FormControl.Validation variant="error">{validation.message}</FormControl.Validation>}
              </FormControl>
            </Box>
            <Box sx={videoBoxSx}>
              <Box sx={videoBorderBoxsx}>
                <video
                  aria-describedby={videoDescriptionId}
                  controls
                  playsInline
                  autoPlay={!prefersReducedMotion}
                  muted
                  loop
                  style={{width: `${VIDEO_WIDTH}px`, height: 'auto'}}
                >
                  <source src={mediaUrl} type="video/mp4" />
                </video>
                <Box id={videoDescriptionId} className="sr-only" sx={{display: 'none'}}>
                  {UserNoticeResources.IssueTypeRenameDialog.videoDescription}
                </Box>
              </Box>
            </Box>
          </Dialog.Body>
        )
      }}
    />
  )
}
