import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {Box, Link} from '@primer/react'
import {useCallback} from 'react'

import {BUTTON_LABELS} from '../../constants/buttons'
import type {AppPayload} from '../../types/app-payload'

export function CallToActionItem() {
  const optOut = useCallback(async () => {
    await verifiedFetch('/issues?new_issues_experience=false', {method: 'POST'})
    window.location.reload()
  }, [])

  const {feedback_url: feedbackUrl, proxima, render_opt_out} = useAppPayload<AppPayload>()

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
      {feedbackUrl?.length > 0 && !proxima && (
        <Link href={feedbackUrl} target="_blank">
          {BUTTON_LABELS.sendFeedback}
        </Link>
      )}
      <span>/</span>
      {render_opt_out && (
        <Link as="button" type="button" onClick={optOut}>
          {BUTTON_LABELS.optOut}
        </Link>
      )}
    </Box>
  )
}
