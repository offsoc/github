import {DragAndDrop} from '@github-ui/drag-and-drop'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {Box, Button, TextInput, type SxProp} from '@primer/react'
import {ArrowSwitchIcon} from '@primer/octicons-react'
import type {CSSProperties} from 'react'

export interface SponsorsListingFeaturedItem {
  id: string
  title: string
  avatarUrl: string
  description?: string | null
  featureableId: string
  profileName?: string | null
}

interface SponsorsMeetTheTeamItemProps {
  item: SponsorsListingFeaturedItem
  index: number
  isDragOverlay?: boolean
}

const containerStyle: CSSProperties = {
  border: '1px solid',
  padding: '16px 4px',
  borderRadius: '4px',
  marginBottom: '8px',
  display: 'flex',
}

const itemStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}

const boxSx: SxProp['sx'] = {
  alignItems: 'center',
  display: 'flex',
  width: '100%',
}

export function SponsorsMeetTheTeamItem({item, index, isDragOverlay}: SponsorsMeetTheTeamItemProps) {
  return (
    <DragAndDrop.Item
      index={index}
      id={item.id}
      key={item.featureableId}
      title={item.title}
      containerStyle={containerStyle}
      style={itemStyles}
      isDragOverlay={isDragOverlay}
    >
      <Box sx={boxSx} data-testid={`sponsors-featured-user-${item.title}`}>
        <GitHubAvatar size={50} sx={{mr: 3}} src={item.avatarUrl} />
        <div className="flex-auto position-relative">
          <p>
            <strong>{item.profileName} </strong>
            <span className="color-fg-muted">{item.title}</span>
          </p>
          <input
            id={`featured_item_${item.id}`}
            name="sponsors_listing[featured_users][][id]"
            type="hidden"
            value={item.id}
          />
          <input
            id={`featured_user_${item.title}`}
            name="sponsors_listing[featured_users][][featureable_id]"
            type="hidden"
            value={item.featureableId}
          />
          <TextInput
            id={`featured_user_${item.title}`}
            name="sponsors_listing[featured_users][][description]"
            defaultValue={item.description || ''}
            aria-label={`${item.title} description`}
            placeholder="Add a description (optional)"
            sx={{width: '100%'}}
          />
        </div>
      </Box>
      <DragAndDrop.MoveModalTrigger
        Component={Button}
        icon={ArrowSwitchIcon}
        variant="invisible"
        aria-label={`move ${item.title} advanced`}
      />
    </DragAndDrop.Item>
  )
}
