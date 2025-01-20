import {type FormEvent, useCallback} from 'react'
import {Button, IconButton, merge, type SxProp, Text} from '@primer/react'
import {XIcon} from '@primer/octicons-react'
import {useAnalytics} from './AnalyticsContext'

interface DismissBannerButtonProps {
  iconButton: boolean
  isError: boolean
  onDismiss: () => void
}

const errorSx: SxProp['sx'] = {color: 'danger.fg'}

export const DismissBannerButton = ({iconButton, isError, onDismiss}: DismissBannerButtonProps) => {
  const {makeAnalyticsRequest} = useAnalytics()

  const handleDismiss = useCallback(
    (event: FormEvent<HTMLButtonElement>, clickedButton: string) => {
      event.preventDefault()
      onDismiss()

      const formData = new FormData()
      formData.append('button', clickedButton)
      formData.append('error', isError ? 'true' : 'false')
      makeAnalyticsRequest('DELETE', formData)
    },
    [isError, makeAnalyticsRequest, onDismiss],
  )

  if (iconButton) {
    return (
      // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
      <IconButton
        unsafeDisableTooltip={true}
        onClick={e => handleDismiss(e, 'X')}
        icon={XIcon}
        aria-label="Dismiss"
        variant="invisible"
        size="small"
      />
    )
  }

  let textSx: SxProp['sx'] = {p: 0}
  if (isError) textSx = merge<SxProp['sx']>(textSx, errorSx)

  return (
    <Button onClick={e => handleDismiss(e, 'DISMISS')} variant="invisible" size="small" sx={{marginLeft: 1}}>
      <Text sx={textSx}>Dismiss</Text>
    </Button>
  )
}
