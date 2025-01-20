import {testIdProps} from '@github-ui/test-id-props'
import {UndoIcon} from '@primer/octicons-react'
import type {SxProp} from '@primer/react'
import {Link, Octicon} from '@primer/react'

type FilterRevertProps = {
  onClick?: (event: React.SyntheticEvent) => void
  href?: string
  as?: 'a' | 'button'
} & SxProp

export const FilterRevert = ({sx, as, onClick, href}: FilterRevertProps) => {
  return (
    <Link
      {...testIdProps('filter-revert-query')}
      as={as || 'a'}
      href={href}
      onClick={onClick}
      sx={{
        fontWeight: 'semibold',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx,
      }}
    >
      <Octicon icon={UndoIcon} sx={{mr: 2}} />
      Revert filter changes
    </Link>
  )
}
