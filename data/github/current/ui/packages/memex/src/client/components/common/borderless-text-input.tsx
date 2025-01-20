import {Box, type SxProp} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef, useMemo} from 'react'

type StyledBorderLessTextInputProps = React.InputHTMLAttributes<HTMLInputElement> & SxProp

const borderlessTextInputStyles: BetterSystemStyleObject = {
  color: 'fg.default',
  fontFamily: 'inherit',
  border: 0,
  padding: 0,
  boxShadow: 'none',
  backgroundColor: 'transparent',
  display: 'block',
  width: '100%',
  '&::-webkit-datetime-edit': {
    display: 'flex',
    alignItems: 'center',
  },
  '&:focus-within': {
    border: 0,
    boxShadow: 'none',
    outline: 'none',
  },
  '&::placeholder': {
    color: 'fg.muted',
  },
  '&.is-disabled': {
    cursor: 'not-allowed',
  },
}

const defaultSx = {}
function getStyles(sx: SxProp['sx'] = defaultSx) {
  return {
    ...borderlessTextInputStyles,
    ...sx,
  }
}

export const BorderlessTextInput = forwardRef<HTMLInputElement, StyledBorderLessTextInputProps>(
  function BorderlessTextInput(props, forwardedRef) {
    const mergedSx = useMemo(() => getStyles(props.sx), [props.sx])
    // A solution to make this component work without the interference of the wrapper of Primer's `TextInput`
    return <Box as="input" {...props} sx={mergedSx} ref={forwardedRef} />
  },
)

BorderlessTextInput.displayName = 'BorderlessTextInput'
