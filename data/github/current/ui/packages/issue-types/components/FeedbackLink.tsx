import {Box, Label, Link} from '@primer/react'

function FeedbackLink() {
  return (
    <Box sx={{display: 'flex', alignItems: 'center'}}>
      <Label size="small" variant="success">
        Beta
      </Label>

      <Link href="https://gh.io/issue-react-types-feedback" sx={{marginLeft: 2}} target="_blank">
        Give feedback
      </Link>
    </Box>
  )
}

export default FeedbackLink
