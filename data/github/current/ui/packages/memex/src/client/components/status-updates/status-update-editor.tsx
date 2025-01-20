import {CommentBox} from '@github-ui/comment-box/CommentBox'
import {CommentBoxButton} from '@github-ui/comment-box/CommentBoxButton'
import {testIdProps} from '@github-ui/test-id-props'
import {CalendarIcon, RocketIcon, XIcon} from '@primer/octicons-react'
import {Box, Flash, IconButton} from '@primer/react'
import {useCallback, useEffect, useRef, useState} from 'react'

import type {MemexStatus} from '../../api/memex/contracts'
import {StatusUpdateCreate, StatusUpdateUpdate} from '../../api/stats/contracts'
import {getInitialState} from '../../helpers/initial-state'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {ApiError} from '../../platform/api-error'
import {StatusUpdateActionTypes} from '../../state-providers/status-updates/hooks/use-status-updates-editor-reducer'
import {type StatusUpdate, useStatusUpdates} from '../../state-providers/status-updates/status-updates-context'
import {
  NEW_STATUS_UPDATE_ID,
  useStatusUpdatesEditorState,
} from '../../state-providers/status-updates/status-updates-editor-state-context'
import {StatusUpdatesResources} from '../../strings'
import useToasts from '../toasts/use-toasts'
import {StatusPicker} from './status-picker'
import {StatusUpdateDatePicker} from './status-update-date-picker'

type StatusUpdateProps = {
  statusUpdate: StatusUpdate
}

type StatusUpdateFields = {
  status?: string | null
  startDate?: string | null
  targetDate?: string | null
  body?: string | null
}

const extractStatusFields = (statusUpdate: MemexStatus): StatusUpdateFields => {
  return {
    status: statusUpdate.statusValue.statusId,
    startDate: statusUpdate.statusValue.startDate,
    targetDate: statusUpdate.statusValue.targetDate,
    body: statusUpdate.body.trim() ? statusUpdate.body : null,
  }
}

const getModifiedFields = (
  updatedFields: StatusUpdateFields,
  previousFields: StatusUpdateFields,
): Array<keyof StatusUpdateFields> => {
  const fields: Array<keyof StatusUpdateFields> = ['status', 'startDate', 'targetDate', 'body']
  const modifiedFields: Array<keyof StatusUpdateFields> = []

  for (const field of fields) {
    if (previousFields[field] !== updatedFields[field]) {
      modifiedFields.push(field)
    }
  }

  return modifiedFields
}

export const StatusUpdateEditor = ({statusUpdate}: StatusUpdateProps) => {
  const {hasWritePermissions} = ViewerPrivileges()
  const {memexStatusItems, statusOptions, addStatusUpdate, updateStatusUpdate} = useStatusUpdates()
  const {projectData} = getInitialState()
  const {statusUpdateDraftsDispatch} = useStatusUpdatesEditorState()
  const {postStats} = usePostStats()

  const [formError, setFormError] = useState('')
  const {addToast} = useToasts()
  const flashButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (formError && flashButtonRef.current) {
      flashButtonRef.current.focus()
    }
  }, [formError])

  const handleSave = useCallback(async () => {
    if (!hasWritePermissions) return
    setFormError('')
    try {
      const statsContext = {
        id: statusUpdate.id,
        status: statusUpdate.status?.name,
        hasStartDate: !!statusUpdate.startDate,
        hasTargetDate: !!statusUpdate.targetDate,
        hasBody: !!statusUpdate.body.trim(),
        modifiedFields: {},
      }

      if (statusUpdate.id === NEW_STATUS_UPDATE_ID) {
        await addStatusUpdate(statusUpdate)
        postStats({
          name: StatusUpdateCreate,
          context: JSON.stringify(statsContext),
        })
      } else {
        const updatedStatus = await updateStatusUpdate(statusUpdate)

        const updatedStatusFields = extractStatusFields(updatedStatus)
        const previousStatusUpdate = memexStatusItems.find(item => item.id === statusUpdate.id)
        const previousStatusFields = previousStatusUpdate ? extractStatusFields(previousStatusUpdate) : {}

        statsContext['modifiedFields'] = getModifiedFields(updatedStatusFields, previousStatusFields)

        postStats({
          name: StatusUpdateUpdate,
          context: JSON.stringify(statsContext),
        })
      }
      statusUpdateDraftsDispatch({type: StatusUpdateActionTypes.CLEAR_STATUS_UPDATE, payload: {id: statusUpdate.id}})
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setFormError(error.message)
      } else {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Unable to save. Something went wrong.',
        })
      }
    }
  }, [
    addStatusUpdate,
    addToast,
    hasWritePermissions,
    postStats,
    statusUpdate,
    statusUpdateDraftsDispatch,
    updateStatusUpdate,
    memexStatusItems,
  ])

  const handleCancel = useCallback(() => {
    statusUpdateDraftsDispatch({type: StatusUpdateActionTypes.CLEAR_STATUS_UPDATE, payload: {id: statusUpdate.id}})
  }, [statusUpdate.id, statusUpdateDraftsDispatch])

  const handleBodyChanged = useCallback(
    (body: StatusUpdate['body']) => {
      statusUpdateDraftsDispatch({
        type: StatusUpdateActionTypes.UPDATE_BODY,
        payload: {
          id: statusUpdate.id,
          body,
        },
      })
    },
    [statusUpdate.id, statusUpdateDraftsDispatch],
  )

  const handleStatusChanged = useCallback(
    (status: StatusUpdate['status']) => {
      statusUpdateDraftsDispatch({
        type: StatusUpdateActionTypes.UPDATE_STATUS,
        payload: {
          id: statusUpdate.id,
          status,
        },
      })
    },
    [statusUpdate.id, statusUpdateDraftsDispatch],
  )

  const handleStartDateChanged = useCallback(
    (startDate: StatusUpdate['startDate']) => {
      statusUpdateDraftsDispatch({
        type: StatusUpdateActionTypes.UPDATE_START_DATE,
        payload: {
          id: statusUpdate.id,
          date: startDate,
        },
      })
    },
    [statusUpdate.id, statusUpdateDraftsDispatch],
  )

  const handleTargetDateChanged = useCallback(
    (targetDate: StatusUpdate['targetDate']) => {
      statusUpdateDraftsDispatch({
        type: StatusUpdateActionTypes.UPDATE_TARGET_DATE,
        payload: {
          id: statusUpdate.id,
          date: targetDate,
        },
      })
    },
    [statusUpdate.id, statusUpdateDraftsDispatch],
  )

  const handleFlashButtonClick = () => {
    setFormError('')
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
      {formError && (
        <Flash
          variant="danger"
          sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
          aria-live="polite"
        >
          <span>Unable to save: {formError}</span>
          <IconButton
            icon={XIcon}
            aria-label="Dismiss flash message"
            ref={flashButtonRef}
            variant="invisible"
            onClick={handleFlashButtonClick}
          />
        </Flash>
      )}
      <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
        <StatusPicker defaultStatus={statusUpdate.status} onChange={handleStatusChanged} options={statusOptions} />
        <StatusUpdateDatePicker
          ariaLabel={StatusUpdatesResources.startDatePickerAriaLabel}
          defaultDate={statusUpdate.startDate}
          icon={CalendarIcon}
          label={StatusUpdatesResources.startDateFieldLabel}
          onChange={handleStartDateChanged}
          testId="status-updates-start-date-picker"
        />
        <StatusUpdateDatePicker
          ariaLabel={StatusUpdatesResources.targetDatePickerAriaLabel}
          defaultDate={statusUpdate.targetDate}
          icon={RocketIcon}
          label={StatusUpdatesResources.targetDateFieldLabel}
          onChange={handleTargetDateChanged}
          testId="status-updates-target-date-picker"
        />
      </Box>
      <Box sx={{width: '100%'}} {...testIdProps('status-updates-markdown-editor')}>
        <CommentBox
          value={statusUpdate.body}
          onChange={handleBodyChanged}
          subject={projectData ? {type: 'project', id: {databaseId: projectData.id}} : undefined}
        />
      </Box>
      <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 2}}>
        <CommentBoxButton size="medium" onClick={handleCancel} {...testIdProps('status-update-cancel-button')}>
          {StatusUpdatesResources.cancelUpdateButtonText}
        </CommentBoxButton>
        <CommentBoxButton
          size="medium"
          variant="primary"
          onClick={handleSave}
          {...testIdProps('status-update-save-button')}
        >
          {StatusUpdatesResources.saveUpdateButtonText}
        </CommentBoxButton>
      </Box>
    </Box>
  )
}
