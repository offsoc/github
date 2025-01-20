import {Box, Octicon, Text} from '@primer/react'
import {OrganizationIcon, type Icon} from '@primer/octicons-react'
import {testIdProps} from '@github-ui/test-id-props'
import {BorderBox} from './BorderBox'

interface HierarchicalOrgCardProps {
  title: string
  description?: string
  icon?: Icon
  borderStyle?: 'solid' | 'dashed'
}

export function HierarchicalOrgCard({title, description, icon, borderStyle = 'solid'}: HierarchicalOrgCardProps) {
  const titleOnly = description ? false : true
  return (
    <Box
      sx={{
        paddingY: 3,
        display: 'flex',
        position: 'relative',
        paddingLeft: '23px',
        marginLeft: '23px',
        '&::after, &::before': {
          position: 'absolute',
          left: 0,
          display: 'block',
          content: '""',
          backgroundColor: 'border.default',
        },
        '&::after': {
          top: '50%',
          width: '23px',
          height: '1px',
        },
        '&::before': {
          top: 0,
          height: '100%',
          width: '1px',
        },
        '&:last-child::before': {
          height: '50%',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 'calc(50% - 4px)',
          left: '-4px',
          zIndex: 1,
          width: '9px',
          height: '9px',
          backgroundColor: 'canvas.default',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: '50%',
        }}
      />
      <BorderBox sx={{alignItems: 'center', gap: 2, p: 3, width: '100%', borderStyle}}>
        <BorderBox
          {...testIdProps('org-card-icon')}
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
            color: 'fg.muted',
            width: '40px',
            height: '40px',
          }}
        >
          <Octicon icon={icon || OrganizationIcon} size={16} />
        </BorderBox>
        <div>
          <Text
            {...testIdProps('org-card-title')}
            sx={{display: 'block', fontWeight: 'bold', fontSize: '14px', color: titleOnly ? 'fg.muted' : 'fg.default'}}
          >
            {title}
          </Text>
          <Text {...testIdProps('org-card-description')} sx={{display: 'block', fontSize: '12px', color: 'fg.muted'}}>
            {description}
          </Text>
        </div>
      </BorderBox>
    </Box>
  )
}
