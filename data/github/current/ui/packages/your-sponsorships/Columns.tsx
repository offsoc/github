import {GitHubAvatar} from '@github-ui/github-avatar'
import {testIdProps} from '@github-ui/test-id-props'
import {EyeClosedIcon, EyeIcon, HeartFillIcon, HeartIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, Link, Octicon, Text, Token} from '@primer/react'
import type {Column} from '@primer/react/drafts'
import {PrivacyLevel, type SponsorshipData} from './your-sponsorships-types'
import type {SponsorshipUpdate} from './update-sponsorship'

export const SponsorableColumn: Column<SponsorshipData> = {
  header: 'Name',
  field: 'sponsorableLogin',
  width: 'grow',
  renderCell: (row: SponsorshipData) => {
    return (
      <>
        <Link href={`/sponsors/${row.sponsorableLogin}`}>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <GitHubAvatar src={row.sponsorableAvatarUrl} square={row.sponsorableIsOrg} size={26} />
            <Text sx={{ml: 2, fontSize: '1.2em'}}>{`@${row.sponsorableLogin}`}</Text>
          </Box>
        </Link>
        {row.pendingChange && <Token sx={{ml: 2}} text={row.pendingChange} />}
      </>
    )
  },
}

export const VisibilityColumn: Column<SponsorshipData> = {
  header: 'Visibility',
  field: 'privacyLevel',
  width: 'auto',
  renderCell: row => {
    return (
      <Box sx={{textTransform: 'capitalize'}}>
        {row.privacyLevel === PrivacyLevel.PUBLIC ? (
          <Octicon icon={EyeIcon} sx={{mr: 1}} className={'color-fg-muted'} />
        ) : (
          <Octicon icon={EyeClosedIcon} sx={{mr: 1}} className={'color-fg-muted'} />
        )}
        {row.privacyLevel}
      </Box>
    )
  },
}

export const StartDateColumn: Column<SponsorshipData> = {
  header: 'Start date',
  field: 'startDate',
  width: 'auto',
}

export const AmountColumn: Column<SponsorshipData> = {
  header: 'Amount',
  field: 'amount',
  width: 'auto',
}

export const ManageButtonColumn = (
  sponsorLogin: string,
  updateSponsorship: (sponsorshipUpate: SponsorshipUpdate) => void,
): Column<SponsorshipData> => {
  return {
    header: () => <span className="sr-only">Actions</span>,
    field: 'id',
    width: 'auto',
    renderCell: (row: SponsorshipData) => {
      // If the user has cancelled a sponsorship and has a pendingChange, the only way to undo that change is via the manageLink.
      // So manageLink will send the user to the main sponsorship management page if there's a pendingChange or if the sponsorship is not active.
      // Otherwise, manageLink will send the user to the specific tier management page
      let manageLink = `/sponsors/${row.sponsorableLogin}?sponsor=${sponsorLogin}`
      if (!row.pendingChange && row.active) {
        manageLink = `/sponsors/${row.sponsorableLogin}/sponsorships?sponsor=${sponsorLogin}&tier_id=${row.subscribableId}`
      }
      const oppositePrivacyLevel = row.privacyLevel === PrivacyLevel.PUBLIC ? PrivacyLevel.PRIVATE : PrivacyLevel.PUBLIC
      const subscribed = row.subscribedToNewsletterUpdates === undefined ? false : row.subscribedToNewsletterUpdates

      return (
        <ActionMenu>
          <ActionMenu.Button size="small" {...testIdProps('manage-button')}>
            Manage
          </ActionMenu.Button>
          <ActionMenu.Overlay width="medium">
            <ActionList>
              {row.active ? (
                <>
                  <ActionList.LinkItem
                    href={row.patreonLink || manageLink}
                    {...testIdProps('manage-sponsorship-button')}
                  >
                    Manage Sponsorship
                  </ActionList.LinkItem>
                  <ActionList.Divider />
                  <ActionList.Item
                    onSelect={() => {
                      updateSponsorship({
                        sponsorableLogin: row.sponsorableLogin,
                        privacyLevel: oppositePrivacyLevel,
                        subscribedToNewsletterUpdates: subscribed,
                      })
                    }}
                    {...testIdProps('privacy-button')}
                  >
                    {row.privacyLevel === PrivacyLevel.PUBLIC ? 'Make Private' : 'Make Public'}
                  </ActionList.Item>
                  <ActionList.Item
                    onSelect={() => {
                      updateSponsorship({
                        sponsorableLogin: row.sponsorableLogin,
                        privacyLevel: row.privacyLevel || PrivacyLevel.PRIVATE,
                        subscribedToNewsletterUpdates: !row.subscribedToNewsletterUpdates,
                      })
                    }}
                    {...testIdProps('subscribe-button')}
                  >
                    {row.subscribedToNewsletterUpdates ? 'Unsubscribe from emails' : 'Subscribe to email updates'}
                  </ActionList.Item>
                </>
              ) : (
                <>
                  <ActionList.LinkItem
                    href={row.patreonLink || manageLink}
                    {...testIdProps('manage-past-sponsorship-button')}
                  >
                    Re-sponsor
                  </ActionList.LinkItem>
                  <ActionList.Divider />
                  <ActionList.Item
                    onSelect={() => {
                      updateSponsorship({
                        sponsorableLogin: row.sponsorableLogin,
                        privacyLevel: oppositePrivacyLevel,
                      })
                    }}
                    {...testIdProps('privacy-button-past')}
                  >
                    {row.privacyLevel === PrivacyLevel.PUBLIC ? 'Make Private' : 'Make Public'}
                  </ActionList.Item>
                </>
              )}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      )
    },
  }
}

export const SponsorButtonColumn: Column<SponsorshipData> = {
  header: () => <span className="sr-only">Actions</span>,
  field: 'id',
  width: 'auto',
  renderCell: (row: SponsorshipData) => {
    const link = `/sponsors/${row.sponsorableLogin}`
    return (
      <Button
        as="a"
        size="small"
        href={link}
        leadingVisual={row.viewerIsSponsor ? HeartFillIcon : HeartIcon}
        sx={{
          '.octicon-heart, .octicon-heart-fill': {
            color: 'sponsors.fg',
          },
          ':hover .octicon-heart, :hover .octicon-heart-fill': {
            transform: 'scale(1.1)',
          },
          width: '100%',
        }}
        {...testIdProps('sponsor-button')}
      >
        {row.viewerIsSponsor ? 'Sponsoring' : 'Sponsor'}
      </Button>
    )
  },
}
