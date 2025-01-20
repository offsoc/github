import {Box, useTheme} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {SystemTemplate} from '../../api/memex/contracts'
import {Link} from '../../router'
import {useTemplateLink} from './hooks/use-template-link'

export type FeaturedTemplateCardProps = {
  template: SystemTemplate
}

const cardContainerStyles: BetterSystemStyleObject = {
  display: 'flex',
  flexDirection: 'column',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'border.default',
  borderRadius: 2,
  '&:hover': {
    textDecoration: 'none',
  },
}

const imageContainerStyles: BetterSystemStyleObject = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
  backgroundColor: 'canvas.subtle',
  borderTopLeftRadius: 2,
  borderTopRightRadius: 2,
  pt: '12px',
  pl: '12px',
  pr: '12px',
  overflow: 'hidden', // Prevents the image box shadow from spilling out
}

const templateImageStyles: BetterSystemStyleObject = {
  width: '100%',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'border.default',
  borderBottom: 0,
  borderTopLeftRadius: 2,
  borderTopRightRadius: 2,
  boxShadow: 'shadow.large',
  // The aspect-ratio is the width / height of the image
  aspectRatio: '1440 / 750',
}

const templateInfoStyles: BetterSystemStyleObject = {
  p: 2,
  borderTopWidth: 1,
  borderTopStyle: 'solid',
  borderTopColor: 'border.default',
}

export function FeaturedTemplateCard({template}: FeaturedTemplateCardProps) {
  const {resolvedColorScheme} = useTheme()
  const to = useTemplateLink({type: 'system', template})
  const imageUrl = resolvedColorScheme === 'dark' ? template.imageUrl.dark : template.imageUrl.light

  return (
    <Box sx={cardContainerStyles} as={Link} to={to}>
      <Box sx={imageContainerStyles}>
        <Box as="img" src={imageUrl} alt="" sx={templateImageStyles} />
      </Box>
      <Box sx={templateInfoStyles}>
        <div>
          <Box as="span" sx={{color: 'fg.default', fontWeight: 'semibold'}}>
            {template.title}
          </Box>
          <Box as="span" sx={{color: 'fg.muted'}}>
            {' '}
            &bull; {'GitHub'}
          </Box>
          {template.shortDescription && (
            <Box as="p" sx={{color: 'fg.muted', m: 0}}>
              {template.shortDescription}
            </Box>
          )}
        </div>
      </Box>
    </Box>
  )
}
