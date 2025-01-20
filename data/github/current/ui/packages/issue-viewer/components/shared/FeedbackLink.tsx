import {Box, Label, Link} from '@primer/react'

type FeedbackLinkProps = {feedbackUrl: string; title?: string; linkText?: string; showLabel?: boolean}

function FeedbackLink({feedbackUrl, title = 'Beta', linkText = 'Feedback', showLabel = true}: FeedbackLinkProps) {
  return (
    <Box sx={{display: 'flex', ml: 2, mt: 4, alignItems: 'center'}}>
      {showLabel && (
        <Label size="small" variant="success">
          {title}
        </Label>
      )}
      <Link href={feedbackUrl} sx={{marginLeft: showLabel ? 2 : 0}} target="_blank">
        {linkText}
      </Link>
    </Box>
  )
}

export default FeedbackLink
