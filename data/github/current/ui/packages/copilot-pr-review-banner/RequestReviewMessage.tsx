import {Button, Text} from '@primer/react'

interface RequestReviewMessageProps {
  onRequestReview: () => void
}

export const RequestReviewMessage = ({onRequestReview}: RequestReviewMessageProps) => (
  <>
    <Text sx={{color: 'fg.default'}}>
      <Text sx={{fontWeight: 500}}>Copilot</Text> can help you review this pull request
    </Text>
    <Button variant="invisible" size="small" sx={{marginLeft: 1}} onClick={onRequestReview}>
      <Text sx={{fontWeight: 500}}>Ask Copilot to review</Text>
    </Button>
  </>
)
