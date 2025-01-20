import {ShieldLockIcon} from '@primer/octicons-react'
import {IconButton, Link} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import {graphql, useFragment} from 'react-relay'

import type {CodeownersBadge_pathOwnership$key} from './__generated__/CodeownersBadge_pathOwnership.graphql'
import type {CodeownersBadge_viewer$key} from './__generated__/CodeownersBadge_viewer.graphql'

interface CodeownersBadgeProps {
  pathOwnership: CodeownersBadge_pathOwnership$key
  viewer: CodeownersBadge_viewer$key
}

export default function CodeownersBadge({pathOwnership, viewer}: CodeownersBadgeProps) {
  const {login: viewerName} = useFragment(
    graphql`
      fragment CodeownersBadge_viewer on User {
        login
      }
    `,
    viewer,
  )
  const {pathOwners, ruleUrl, isOwnedByViewer, ruleLineNumber} = useFragment(
    graphql`
      fragment CodeownersBadge_pathOwnership on PathOwnership {
        pathOwners {
          name
        }
        ruleLineNumber
        ruleUrl
        isOwnedByViewer
      }
    `,
    pathOwnership,
  )

  if (pathOwners.length === 0 || !ruleUrl) return null

  const ownersMinusViewer = pathOwners.filter(({name}) => name !== viewerName).map(({name}) => name)
  let tooltipText = 'Owned by '
  if (isOwnedByViewer) tooltipText += 'you'
  if (isOwnedByViewer && ownersMinusViewer.length > 0) tooltipText += ' along with '
  if (ownersMinusViewer.length > 0) tooltipText += `@${ownersMinusViewer.join(', @')}`
  if (ruleLineNumber) tooltipText += ` (from CODEOWNERS line ${ruleLineNumber})`

  return (
    <Tooltip direction="s" id="codeowner-tooltip" text={tooltipText} type="label">
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        aria-labelledby="codeowner-tooltip"
        as={Link}
        href={ruleUrl}
        icon={ShieldLockIcon}
        muted={true}
        unsafeDisableTooltip={true}
        variant="invisible"
      />
    </Tooltip>
  )
}
