import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {Box, Label, Link} from '@primer/react'
import {useCallback} from 'react'

import usePullRequestPageAppPayload from '../../hooks/use-pull-request-page-app-payload'

export function AlphaBadgeAndActions({
  pullRequestNumber,
  repoNameWithOwner,
}: {
  pullRequestNumber: number
  repoNameWithOwner: string
}) {
  const optOut = useCallback(async () => {
    const body = {id: pullRequestNumber}
    await verifiedFetchJSON(`/${repoNameWithOwner}/toggle_prx`, {method: 'POST', body})
    const newLocation = new URL(`/${repoNameWithOwner}/pull/${pullRequestNumber}?prx=false`, window.location.origin)
    window.location.href = newLocation.toString()
  }, [pullRequestNumber, repoNameWithOwner])

  const {feedbackUrl} = usePullRequestPageAppPayload()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        justifyContent: 'flex-start',
        fontSize: 0,
      }}
    >
      <Label sx={{mr: 1}} variant="success">
        Alpha
      </Label>
      {feedbackUrl && (
        <>
          <Link href={feedbackUrl} target="_blank">
            Send feedback
          </Link>
          <span>·</span>
        </>
      )}
      <Link as="button" type="button" onClick={() => void optOut()}>
        Opt out
      </Link>
    </Box>
  )
}
