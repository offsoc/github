import {GearIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, IconButton} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import type {DiffViewSettingsButton_pullRequest$key} from './__generated__/DiffViewSettingsButton_pullRequest.graphql'
import type {DiffViewSettingsButton_user$key} from './__generated__/DiffViewSettingsButton_user.graphql'
import DiffViewToggle from './DiffViewToggle'
import HideWhitespace from './HideWhitespace'

export default function DiffViewSettingsButton({
  pullRequest,
  user,
}: {
  pullRequest: DiffViewSettingsButton_pullRequest$key
  user: DiffViewSettingsButton_user$key
}) {
  const userData = useFragment(
    graphql`
      fragment DiffViewSettingsButton_user on User {
        ...DiffViewToggle_user
      }
    `,
    user,
  )
  const pullRequestData = useFragment(
    graphql`
      fragment DiffViewSettingsButton_pullRequest on PullRequest {
        ...HideWhitespace_pullRequest
      }
    `,
    pullRequest,
  )

  return (
    <>
      <ActionMenu>
        <ActionMenu.Anchor>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            aria-label="Diff view settings"
            icon={GearIcon}
            size="small"
            sx={{ml: 2}}
            unsafeDisableTooltip={true}
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            <DiffViewToggle user={userData} />
            <ActionList.Divider />
            <HideWhitespace pullRequest={pullRequestData} />
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </>
  )
}
