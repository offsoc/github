import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import type {PortalTooltipProps} from '@github-ui/portal-tooltip/portalled'
import {useAnalytics} from '@github-ui/use-analytics'

import {useIsLoggingInformationProvided, useLoggingInfo} from '../contexts/CommitsLoggingContext'
import {shortSha} from '../utils/short-sha'

export function CopySHA({sha, direction = 's'}: {sha: string; direction?: PortalTooltipProps['direction']}) {
  const {sendAnalyticsEvent} = useAnalytics()
  const {loggingPrefix, loggingPayload} = useLoggingInfo()
  const shouldLog = useIsLoggingInformationProvided()
  const loggingFunction = () => {
    if (shouldLog) {
      sendAnalyticsEvent(`${loggingPrefix}click`, 'COPY_SHA_CLICKED', loggingPayload)
    }
  }
  return (
    // this is a click trapping wrapper - hitting enter on the keyboard counts as a click as well
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={loggingFunction}>
      <CopyToClipboardButton
        textToCopy={sha}
        ariaLabel={`Copy full SHA for ${shortSha(sha)}`}
        tooltipProps={{direction, anchorSide: 'outside-bottom'}}
        size="small"
        avoidStyledComponent={true}
        hasPortalTooltip={true}
      />
    </div>
  )
}
