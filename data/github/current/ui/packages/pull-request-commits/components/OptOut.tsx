import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {Label, Link} from '@primer/react'
import {useCallback} from 'react'

export function OptOut({pullRequestNumber, repoNameWithOwner}: {pullRequestNumber: number; repoNameWithOwner: string}) {
  const feedbackUrl = 'https://gh.io/new-commits-page-feedback'
  const optOut = useCallback(async () => {
    const body = {id: pullRequestNumber, feature_name: 'prx_commits'}
    const response = await verifiedFetchJSON(`/${repoNameWithOwner}/toggle_new_commits`, {method: 'POST', body})
    if (response) window.location.reload()
  }, [pullRequestNumber, repoNameWithOwner])

  return (
    <div className="d-flex mt-3">
      <Label className="mr-2" variant="success">
        Beta
      </Label>
      <Link as="button" type="button" onClick={() => void optOut()}>
        Opt out of the new Commits page
      </Link>
      <b className="mx-2">·</b>
      <Link href={feedbackUrl} target="_blank">
        Give feedback
      </Link>
    </div>
  )
}
