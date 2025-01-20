import {testIdProps} from '@github-ui/test-id-props'
import {Box, Button} from '@primer/react'

import {Resources} from '../../strings'

type FilterInputActionsProps = {
  /**
   * Optional handler for the reset changes button. If this callback is not provided,
   * then the button will not be shown.
   */
  onResetChanges?: React.MouseEventHandler<HTMLButtonElement>

  /**
   * Optional handler for the save changes button. If this callback is not provided,
   * then the button will not be shown.
   */
  onSaveChanges?: React.MouseEventHandler<HTMLButtonElement>

  /**
   * Text to display on the save changes button
   */
  saveButtonText?: string

  hideSaveButton?: boolean
  hideResetChangesButton?: boolean
}

const inputActionContainerStyles = {
  display: 'flex',
  height: '100%',
  gap: 2,
  marginTop: '2px',
}

const filterInputContainerSx = {display: 'flex', gap: 2, flexShrink: 0}
export function FilterInputActions({
  onResetChanges,
  onSaveChanges,
  saveButtonText,
  hideSaveButton,
  hideResetChangesButton,
  children,
}: React.PropsWithChildren<FilterInputActionsProps>) {
  if (hideSaveButton && hideResetChangesButton) return null
  return (
    <Box sx={filterInputContainerSx}>
      {children}
      <Box sx={inputActionContainerStyles} {...testIdProps('filter-state-actions')}>
        {hideResetChangesButton ? null : (
          <Button
            onClick={onResetChanges}
            size="small"
            disabled={!onResetChanges}
            {...testIdProps('filter-actions-reset-changes-button')}
          >
            {Resources.discardChanges}
          </Button>
        )}

        {hideSaveButton ? null : (
          <Button
            variant="primary"
            size="small"
            onClick={onSaveChanges}
            disabled={!onSaveChanges}
            {...testIdProps('filter-actions-save-changes-button')}
          >
            {saveButtonText ?? Resources.saveChanges}
          </Button>
        )}
      </Box>
    </Box>
  )
}
