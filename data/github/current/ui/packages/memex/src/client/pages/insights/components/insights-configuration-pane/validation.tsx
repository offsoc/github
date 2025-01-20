// Reimplementation of Primer's _InputValidation component
// (used by FormControl.Validation https://primer.style/react/FormControl#with-validation)
// to enable validation messaging for DropdownMenus, which is
// not natively supported (https://primer.style/react/FormControl#formcontrol)

import {AlertFillIcon, CheckCircleFillIcon, type IconProps} from '@primer/octicons-react'
import {Box, type SxProp, Text} from '@primer/react'
import type {ComponentType, PropsWithChildren} from 'react'

type Props = {
  validationStatus?: 'success' | 'warning' | 'error'
} & SxProp

const validationIconMap: Record<
  NonNullable<Props['validationStatus']>,
  ComponentType<React.PropsWithChildren<IconProps>>
> = {
  success: CheckCircleFillIcon,
  error: AlertFillIcon,
  warning: AlertFillIcon,
}

const validationColorMap: Record<NonNullable<Props['validationStatus']>, string> = {
  success: 'success.fg',
  error: 'danger.fg',
  warning: 'attention.fg',
}

export const Validation: React.FC<PropsWithChildren<Props>> = ({children, validationStatus, sx}) => {
  const IconComponent = validationStatus ? validationIconMap[validationStatus] : undefined
  const fgColor = validationStatus ? validationColorMap[validationStatus] : undefined

  return (
    <Text
      sx={{
        marginTop: 2,
        alignItems: 'center',
        color: fgColor,
        display: 'flex',
        a: {
          color: 'currentColor',
          textDecoration: 'underline',
        },
        ...sx,
        fontSize: 0,
      }}
    >
      {IconComponent && (
        <Box as="span" sx={{display: 'flex', mr: 1}}>
          <IconComponent size={12} fill="currentColor" />
        </Box>
      )}
      <span>{children}</span>
    </Text>
  )
}
