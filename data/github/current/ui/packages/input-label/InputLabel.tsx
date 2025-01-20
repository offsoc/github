import {Box, Text, type SxProp} from '@primer/react'
import type React from 'react'

type BaseProps = SxProp & {
  disabled?: boolean
  required?: boolean
  visuallyHidden?: boolean
  id?: string
  children?: React.ReactNode
}

export type LabelProps = BaseProps & {
  htmlFor?: string
  as?: 'label'
}

export type LegendOrSpanProps = BaseProps & {
  as: 'legend' | 'span'
  htmlFor?: undefined
}

export type InputLabelProps = LabelProps | LegendOrSpanProps

/**
 * Primer-styled input label for forms; can also be rendered as a fieldset `legend`.
 * Copied from `primer/react/src/internal/components/InputLabel.tsx`.
 */
const InputLabel = ({children, disabled, required, visuallyHidden, sx, as = 'label', ...props}: InputLabelProps) => {
  return (
    <Text
      as={as as unknown as undefined}
      sx={{
        fontWeight: 'bold',
        fontSize: 1,
        display: 'block',
        color: disabled ? 'fg.muted' : 'fg.default',
        cursor: disabled ? 'not-allowed' : 'pointer',
        alignSelf: 'flex-start',
        ...sx,
      }}
      className={visuallyHidden ? 'sr-only' : undefined}
      {...props}
    >
      {required ? (
        <Box as="span" sx={{display: 'flex'}}>
          <Box sx={{mr: 1}}>{children}</Box>
          <span>*</span>
        </Box>
      ) : (
        children
      )}
    </Text>
  )
}

export default InputLabel
