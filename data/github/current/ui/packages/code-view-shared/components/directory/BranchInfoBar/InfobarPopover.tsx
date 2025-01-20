import type {Icon as PrimerIcon} from '@primer/octicons-react'
import {Box, CircleOcticon, Heading} from '@primer/react'
import type React from 'react'

/**
 * This collection of components creates a consistent UI for the branch info bar.
 * Once can compose the layout in the following way:
 *
 * <PopoverContainer>
 *  <PopoverIcon>
 *   <Icon />
 *  </PopoverIcon>
 *  <PopoverContent
 *    icon={<PopoverIcon icon={AlertIcon} bg="neutral.emphasis" />}
 *    header={<Text>Popup header</Text>}
 *    content={<Text>Content of the popup</Text>}
 *  />
 *  <PopoverActionContainer>
 *   <Button>Discard</Button>
 *   <Button as={Link} className={clsx(LinkButtonCSS['code-view-link-button'], 'flex-1')}>Update</Button>
 *  </PopoverActionContainer>
 * </PopoverContainer>
 *
 */
export function PopoverContainer({children}: {children: React.ReactNode}) {
  return (
    <Box className={'popover-container-width'} sx={{borderRadius: 6, minWidth: 250}}>
      {children}
    </Box>
  )
}

interface PopoverContentProps {
  icon: React.ReactNode
  header: React.ReactNode
  content: React.ReactNode
}

export function PopoverContent({icon, header, content}: PopoverContentProps) {
  return (
    <div className="d-flex p-3">
      <div className="mr-2">{icon}</div>
      <div>
        <Heading as="h2" className="f5 mb-1">
          {header}
        </Heading>
        <span className="fgColor-muted f6">{content}</span>
      </div>
    </div>
  )
}

interface PopoverIconProps {
  bg: string
  icon: PrimerIcon
}
export function PopoverIcon({icon: IconComponent, bg}: PopoverIconProps) {
  return <CircleOcticon sx={{bg, color: 'fg.onEmphasis'}} size={30} icon={() => <IconComponent size={16} />} />
}

export function PopoverActions({children}: {children: React.ReactNode}) {
  return <div className="d-flex flex-wrap flex-justify-between p-3 gap-3 border-top borderColor-muted">{children}</div>
}
