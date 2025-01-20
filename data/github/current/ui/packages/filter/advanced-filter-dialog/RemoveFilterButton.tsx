import {testIdProps} from '@github-ui/test-id-props'
import {XIcon} from '@primer/octicons-react'
import {IconButton, merge, type SxProp} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

type RemoveFilterButtonProps = {
  onClick: () => void
  ariaLabel: string
  testId?: string
} & SxProp

export const RemoveFilterButton = ({ariaLabel, onClick, sx, testId = ''}: RemoveFilterButtonProps) => {
  return (
    <IconButton
      icon={XIcon}
      size="small"
      variant="invisible"
      aria-label={ariaLabel}
      onClick={onClick}
      sx={merge<BetterSystemStyleObject>({display: 'flex', alignItems: 'center', justifyContent: 'center'}, {...sx})}
      {...testIdProps(testId)}
    />
  )
}
