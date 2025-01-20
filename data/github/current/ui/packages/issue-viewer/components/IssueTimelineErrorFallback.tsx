import {Blankslate} from '@primer/react/experimental'
import {AlertIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'

export function IssueTimelineErrorFallback(): JSX.Element {
  return (
    <Blankslate>
      <Blankslate.Visual>
        <AlertIcon size="medium" />
      </Blankslate.Visual>
      <Blankslate.Heading>Timeline cannot be loaded</Blankslate.Heading>
      <Blankslate.Description>
        The timeline is currenlty unavailable due to a system error. Try reloading the page, or if the problem persists,
        <Link inline={true} href="https://support.github.com/contact">
          contact support.
        </Link>
      </Blankslate.Description>
      <Blankslate.SecondaryAction href="https://www.githubstatus.com/">GitHub Status</Blankslate.SecondaryAction>
    </Blankslate>
  )
}
