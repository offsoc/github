import {Text} from '@primer/react'
import {DismissBannerButton} from './DismissBannerButton'

interface ErrorMessageProps {
  onDismiss: () => void
}

export const ErrorMessage = ({onDismiss}: ErrorMessageProps) => {
  return (
    <>
      <Text sx={{color: 'fg.default'}}>
        <Text sx={{fontWeight: 500}}>Copilot</Text> had trouble creating a review for this pull request
      </Text>
      <DismissBannerButton isError iconButton={false} onDismiss={onDismiss} />
    </>
  )
}
