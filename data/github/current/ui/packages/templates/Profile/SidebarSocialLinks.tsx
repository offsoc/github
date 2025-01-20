import {Box, ActionList} from '@primer/react'
import {LinkIcon, ThumbsupIcon, OrganizationIcon} from '@primer/octicons-react'

function SidebarSocialLinks() {
  return (
    <Box
      sx={{
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: 'border.default',
        py: 3,
        mt: [2, 2, 0],
      }}
    >
      <ActionList variant="full" sx={{px: 0}}>
        <ActionList.Item>
          <ActionList.LeadingVisual>
            <OrganizationIcon />
          </ActionList.LeadingVisual>
          GitHub
        </ActionList.Item>
        <ActionList.Item>
          <ActionList.LeadingVisual>
            <LinkIcon />
          </ActionList.LeadingVisual>
          github.com
        </ActionList.Item>
        <ActionList.Item>
          <ActionList.LeadingVisual>
            <ThumbsupIcon />
          </ActionList.LeadingVisual>
          GitHub
        </ActionList.Item>
      </ActionList>
    </Box>
  )
}

export default SidebarSocialLinks
