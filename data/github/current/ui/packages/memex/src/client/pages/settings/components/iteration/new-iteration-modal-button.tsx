import {testIdProps} from '@github-ui/test-id-props'
import {FocusKeys} from '@primer/behaviors'
import {PlusIcon, TriangleDownIcon} from '@primer/octicons-react'
import {AnchoredOverlay, Box, Button, ButtonGroup} from '@primer/react'
import {isBefore} from 'date-fns'
import {useEffect, useState} from 'react'

import {NewIterationOptions} from '../../../../components/fields/iteration/new-iteration-options'
import type {IterationDuration} from '../../../../helpers/iterations'

export interface NewIterationModalButtonProps {
  /** Called when the user creates a new iteration. */
  onCreate: (startDate: Date, duration: IterationDuration) => void
  defaultDuration: IterationDuration
  /** This is both the minimum allowed start date and the default start date. */
  minimumStartDate: Date
}

/**
 * Renders as a button that the user can click to add new iterations. Either the user can
 * click the main button and add an iteration with default properties, or they can expand
 * the modal to add an iteration with custom properties.
 */
export function NewIterationModalButton({onCreate, defaultDuration, minimumStartDate}: NewIterationModalButtonProps) {
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [inputValid, setInputValid] = useState(true)
  const [selectedDuration, setSelectedDuration] = useState(defaultDuration)
  const [selectedStartDate, setSelectedStartDate] = useState(minimumStartDate)

  // This shouldn't really be necessary because we reset state on open and the min start
  // date shouldn't change while the modal is still open, but it's good to check just in case
  useEffect(
    () =>
      setSelectedStartDate(currentSelectedDate =>
        isBefore(currentSelectedDate, minimumStartDate) ? minimumStartDate : currentSelectedDate,
      ),
    [minimumStartDate],
  )

  const resetInputState = () => {
    setSelectedDuration(defaultDuration)
    setSelectedStartDate(minimumStartDate)
    setInputValid(true)
  }

  const closeOverlay = () => {
    setOverlayOpen(false)
  }

  const openOverlay = () => {
    // It's important to reset the input state on open (as opposed to close) because the
    // defaults will often change during the time the modal is closed
    resetInputState()
    setOverlayOpen(true)
  }

  const onSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    closeOverlay()
    onCreate(selectedStartDate, selectedDuration)
  }

  return (
    <ButtonGroup sx={{display: 'flex'}}>
      <Button
        size="small"
        onClick={() => onCreate(minimumStartDate, defaultDuration)}
        leadingVisual={PlusIcon}
        sx={{display: 'flex', alignItems: 'center'}}
        {...testIdProps('add-default-iteration-button')}
      >
        Add iteration
      </Button>
      <AnchoredOverlay
        renderAnchor={props => (
          <Button
            trailingVisual={TriangleDownIcon}
            size="small"
            sx={{lineHeight: '22px'}}
            {...testIdProps('add-custom-iteration-button')}
            {...props}
          >
            More options
          </Button>
        )}
        width="medium"
        open={overlayOpen}
        onOpen={openOverlay}
        onClose={closeOverlay}
        focusZoneSettings={{bindKeys: FocusKeys.Tab}}
        align="end"
        overlayProps={{
          ...testIdProps('custom-iteration-modal'),
          'aria-label': 'Add new iteration configuration',
          role: 'dialog',
          sx: {overflow: 'visible'},
        }}
      >
        <form onSubmit={onSave}>
          <Box sx={{p: 3, borderBottom: '1px solid', borderColor: 'border.muted'}}>
            <NewIterationOptions
              startDate={selectedStartDate}
              onStartDateChange={setSelectedStartDate}
              duration={selectedDuration}
              onDurationChange={setSelectedDuration}
              onValidChange={setInputValid}
              minStartDate={minimumStartDate}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 3,
              pt: 2,
              pb: 2,
              gap: 2,
            }}
          >
            <Button size="small" onClick={closeOverlay} {...testIdProps('cancel-add-custom-iteration')} type="button">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="small"
              type="submit"
              disabled={!inputValid}
              {...testIdProps('save-add-custom-iteration')}
            >
              Add
            </Button>
          </Box>
        </form>
      </AnchoredOverlay>
    </ButtonGroup>
  )
}
