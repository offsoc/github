import React from 'react'

import {Box, Spinner, Text} from '@primer/react'

const CodeMirrorBase = React.lazy(() => import('@github-ui/code-mirror'))

export function RestrictionEditor(props: {
  value?: string
  onChange?(value: string): void
  placeholder?: string
  labelId: string
  fieldStatus?: FormValidationStatus
}) {
  const {labelId, value, placeholder, fieldStatus, onChange} = props

  // CodeMirror requires an onChange callback provided, but we don't always want that (storybook)
  const onChangeProxy = React.useCallback((newValue: string) => onChange?.(newValue), [onChange])

  return (
    <React.Suspense fallback={Loading}>
      <Wrapper fieldStatus={fieldStatus}>
        <CodeMirrorBase
          fileName="document.yaml"
          spacing={{
            indentUnit: 2,
            indentWithTabs: false,
            lineWrapping: false,
          }}
          ariaLabelledBy={labelId}
          value={value}
          placeholder={placeholder}
          onChange={onChangeProxy}
          height="400px"
          hideHelpUntilFocus={true}
        />
      </Wrapper>
    </React.Suspense>
  )
}

const Loading = (
  <Box
    sx={{
      display: 'flex',
      placeContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '200px',
      border: '1px solid',
      borderColor: 'border.subtle',
      backgroundColor: 'canvas.subtle',
      borderRadius: 2,
    }}
  >
    <Spinner size="medium" />
    &nbsp;<Text sx={{color: 'fg.muted'}}>Loading...</Text>
  </Box>
)

// ---

type FormValidationStatus = 'error' | 'success' | 'warning'

// This tries to mimic `TextInputBaseWrapper` from primer, that is currently not exposed:
// @see: https://github.com/github/primer/issues/2705
function Wrapper(
  props: React.PropsWithChildren<{
    fieldStatus?: FormValidationStatus
  }>,
) {
  const {fieldStatus} = props
  let borderColor = 'border.default'
  switch (fieldStatus) {
    case 'error':
      borderColor = 'danger.emphasis'
      break
    case 'success':
      borderColor = 'success.emphasis'
      break
    case 'warning':
      borderColor = 'attention.emphasis'
  }

  return (
    <Box
      sx={{
        position: 'relative',
        zIndex: 0,
        width: '100%',

        borderRadius: 2,
        overflow: 'hidden',

        '&::before': {
          display: 'block',
          content: '""',
          position: 'absolute',
          zIndex: 1,
          inset: 0,
          borderRadius: 2,

          border: '1px solid',
          borderColor,
          boxShadow: 'primer.shadow.inset',

          pointerEvents: 'none',
        },

        '&:focus-within::before': {
          borderColor: 'accent.fg',
          boxShadow: 'rgb(9, 105, 218) 0px 0px 0px 1px inset',
        },
      }}
    >
      {props.children}
    </Box>
  )
}
