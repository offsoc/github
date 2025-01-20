import {GitHubAvatar} from '@github-ui/github-avatar'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {ActionList, ActionMenu} from '@primer/react'

import useSso from './hooks/useSso'
import {ssoUrl} from './utils/urls'

export default function SingleSignOnDropdownMenu() {
  const {ssoOrgs, baseAvatarUrl} = useSso()
  return (
    <ActionMenu.Overlay width="medium">
      <ActionList>
        {ssoOrgs.map(org => (
          <ActionList.LinkItem
            key={org.id}
            href={ssoUrl(
              org.login!,
              encodeURIComponent(ssrSafeWindow === undefined ? '' : ssrSafeWindow.location.href),
            )}
          >
            <ActionList.LeadingVisual>
              <GitHubAvatar square src={`${baseAvatarUrl}/u/${org.id}`} />
            </ActionList.LeadingVisual>
            {org.name}
          </ActionList.LinkItem>
        ))}
      </ActionList>
    </ActionMenu.Overlay>
  )
}
