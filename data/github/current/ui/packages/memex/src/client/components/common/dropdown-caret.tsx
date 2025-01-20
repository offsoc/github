import {testIdProps} from '@github-ui/test-id-props'
import {TriangleDownIcon} from '@primer/octicons-react'
import {Button, type ButtonProps, Octicon} from '@primer/react'
import {forwardRef} from 'react'

/*
 * This component is used to render the dropdown caret icon consistently.
 */
export const DropdownCaret = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'children'>>(({...props}, ref) => (
  <Button
    {...props}
    sx={{
      border: 'none',
      boxShadow: 'none',
      minWidth: '16px',
      p: 0,
      ml: 'auto',
      bg: 'transparent',
      ':hover': {
        bg: 'transparent',
        boxShadow: 'none',
      },
    }}
    aria-label="Dropdown button"
    {...testIdProps('dropdown-button')}
    tabIndex={-1}
    ref={ref}
  >
    <Octicon
      icon={TriangleDownIcon}
      className="table-row-dropdown-caret"
      size="small"
      sx={{
        verticalAlign: 'middle',
        color: 'fg.muted',
        opacity: 0.3,
        '.is-focused &': {opacity: 1},
      }}
    />
  </Button>
))

DropdownCaret.displayName = 'DropdownCaret'
