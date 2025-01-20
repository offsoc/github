/* eslint eslint-comments/no-use: off */
import {useState} from 'react'
import {Text, Link, ActionList} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import type {SecretScanningReviewerTeam, SecretScanningReviewerUser, AppPayload} from '../../delegated-bypass-types'
import {ownerAvatarPath} from '@github-ui/paths'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {GitHubAvatar} from '@github-ui/github-avatar'

type SecretScanningReviewersDialogProps = {
  approvers: [SecretScanningReviewerUser[], SecretScanningReviewerTeam[]]
}

export default function SecretScanningReviewersDialog({approvers}: SecretScanningReviewersDialogProps) {
  const [showApprovers, setShowApprovers] = useState(false)
  const {base_avatar_url: baseAvatarUrl} = useAppPayload<AppPayload>()
  const [users, teams] = approvers

  return (
    <>
      <Text sx={{ml: 1}}>
        Requests are sent to{' '}
        <Link onClick={() => setShowApprovers(true)} as="button" type="button" inline>
          all approvers.
        </Link>
      </Text>
      {showApprovers && (
        <Dialog
          title="Approvers"
          subtitle="Users and teams who can approve requests for bypass privileges."
          onClose={() => setShowApprovers(false)}
          width="medium"
        >
          <ActionList showDividers>
            {teams?.map(team => (
              <ActionList.LinkItem
                key={`team:${team.id}`}
                href={`${window.location.origin}/orgs/${team.org_name}/teams/${team.slug}`}
                target={'_blank'}
              >
                <ActionList.LeadingVisual>
                  <GitHubAvatar square src={`${baseAvatarUrl}/t/${team.id}`} />
                </ActionList.LeadingVisual>
                {team.name}
              </ActionList.LinkItem>
            ))}
            {users?.map(user => (
              <ActionList.LinkItem
                key={`user:${user.id}`}
                href={`${window.location.origin}/${user.display_login}`}
                target={'_blank'}
              >
                <ActionList.LeadingVisual>
                  <GitHubAvatar src={ownerAvatarPath({owner: user.display_login})} />
                </ActionList.LeadingVisual>
                {user.display_login}
              </ActionList.LinkItem>
            ))}
          </ActionList>
        </Dialog>
      )}
    </>
  )
}
