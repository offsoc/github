import type {Icon} from '@primer/octicons-react'
import {Box, Octicon} from '@primer/react'
import styles from './MergeabilityIcon.module.css'
import {clsx} from 'clsx'

type MergeabilityIconProps = {
  icon: Icon
  ariaLabel: string
  iconBackgroundColor: string
}

export function MergeabilityIcon({icon, ariaLabel, iconBackgroundColor}: MergeabilityIconProps) {
  return (
    <Box
      className={clsx(
        `d-flex flex-justify-center flex-items-center mr-2 rounded-2 height-2 width-2 position-absolute`,
        styles.mergeabilityIcon,
      )}
      sx={{backgroundColor: iconBackgroundColor}}
    >
      <Octicon className="fgColor-onEmphasis" icon={icon} size={24} aria-label={ariaLabel} />
    </Box>
  )
}
