import {Box, Heading, Link, Pagehead, Text} from '@primer/react'

type Props = {
  title: string
  description?: string
  feedbackLink: {
    text: string
    url: string
  }
}

function Header({title, description, feedbackLink}: Props): JSX.Element {
  return (
    <Pagehead sx={{mb: 0, p: 0, border: 0}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Heading as="h2" sx={{fontSize: 4, fontWeight: 'normal'}}>
          {title}
        </Heading>
        <Box sx={{mt: 1}}>
          {feedbackLink.url && (
            <Link href={feedbackLink.url} sx={{fontSize: '12px', mb: 1}}>
              {feedbackLink.text}
            </Link>
          )}
        </Box>
      </Box>
      {description && <Text sx={{color: 'fg.muted'}}>{description}</Text>}
    </Pagehead>
  )
}

Header.displayName = 'PageLayout.Header'

export default Header
