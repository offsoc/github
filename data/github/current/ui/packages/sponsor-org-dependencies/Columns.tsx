import {GitHubAvatar} from '@github-ui/github-avatar'
import {testIdProps} from '@github-ui/test-id-props'
import {HeartFillIcon, HeartIcon} from '@primer/octicons-react'
import {Box, Button, Link, Text} from '@primer/react'
import type {Column} from '@primer/react/drafts'
import DependenciesDialogBox from './DependenciesDialogBox'
import type {SponsorableData} from './types'

export const maintainerColumn: Column<SponsorableData> = {
  id: 'sponsorableName',
  header: 'Maintainer',
  field: 'sponsorableName',
  renderCell: (item: SponsorableData) => {
    return (
      <Link href={`/sponsors/${item.sponsorableName}`}>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <GitHubAvatar src={item.sponsorableAvatarUrl} square={item.sponsorableIsOrg} size={26} />
          <Text sx={{ml: 2, fontSize: '1.2em'}}>{`${item.sponsorableName}`}</Text>
        </Box>
      </Link>
    )
  },
}

export const dependenciesColumn = (
  orgName: string,
  handleLinkClick: (sponsorableName: string) => void,
  handleClose: (sponsorableName: string) => void,
  openPopups: {[key: string]: boolean},
  selectedSponsorable: string,
): Column<SponsorableData> => {
  return {
    id: 'sponsorableDependencies',
    header: 'Your dependencies they maintain or own',
    field: 'dependenciesArray',
    renderCell: (item: SponsorableData) => {
      return (
        <div>
          <span>
            {item?.dependenciesArray[0] ? (
              <>
                <Text sx={{color: 'fg.muted'}}>{item.dependenciesArray[0].name}</Text>
                {item?.dependenciesArray[1] && (
                  <>
                    <Text sx={{color: 'fg.muted'}}>{`, ${item.dependenciesArray[1].name}`}</Text>
                  </>
                )}
              </>
            ) : null}
          </span>
          {item.dependencyCount > 2 && (
            <>
              <Link
                onClick={() => handleLinkClick(item.sponsorableName)}
                style={{cursor: 'pointer'}}
                {...testIdProps('show-more-link')}
              >
                <span className="ml-1">{item.dependencyCount > 2 ? `+${item.dependencyCount - 2} more` : ''}</span>
              </Link>
              <DependenciesDialogBox
                isOpen={openPopups[item.sponsorableName] || false}
                setIsOpen={() => handleClose(item.sponsorableName)}
                dependencyCount={item.dependencyCount}
                orgName={orgName}
                sponsorableName={selectedSponsorable}
              />
            </>
          )}
        </div>
      )
    },
  }
}

export const recentActivityColumn: Column<SponsorableData> = {
  id: 'recentActivity',
  header: 'Recent activity',
  field: 'recentActivity',
  renderCell: (item: SponsorableData) => {
    return (
      item.recentActivity && (
        <Text sx={{color: 'fg.muted'}} {...testIdProps('recent-activity')}>
          {item.recentActivity}
        </Text>
      )
    )
  },
}

export const sponsorColumn = (orgName: string): Column<SponsorableData> => {
  return {
    id: 'sponsor',
    header: () => <span className="sr-only">Actions</span>,
    width: 'auto',
    renderCell: (item: SponsorableData) => {
      const link = `/sponsors/${item.sponsorableName}?sponsor=${orgName}`
      return (
        <Button
          as="a"
          size="small"
          href={link}
          leadingVisual={item.viewerIsSponsor ? HeartFillIcon : HeartIcon}
          aria-label={item.viewerIsSponsor ? 'Sponsoring' : 'Sponsor'}
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
        />
      )
    },
  }
}
