import {testIdProps} from '@github-ui/test-id-props'
import {Box, type BoxProps} from '@primer/react'
import {forwardRef} from 'react'

import {CELL_HEIGHT} from '../react_table/constants'

type Props = {
  horizontalScrollbarSize: number | null
  verticalScrollbarSize?: number | null
  scrollbarSize?: number | null
  disableBlur?: boolean
  isFixed?: boolean | null
  effectiveTableHeight?: number | null
}

const getStyles = ({
  verticalScrollbarSize,
  isFixed,
  horizontalScrollbarSize,
  effectiveTableHeight,
  disableBlur,
}: Pick<
  Props,
  'isFixed' | 'verticalScrollbarSize' | 'horizontalScrollbarSize' | 'effectiveTableHeight' | 'disableBlur'
>): BoxProps['sx'] => {
  const baseStyles: BoxProps['sx'] = {
    alignItems: 'center',
    pl: '8px',

    width: verticalScrollbarSize ? `calc(100% - ${verticalScrollbarSize}px)` : '100%',
    right: verticalScrollbarSize ? `${verticalScrollbarSize}px` : '',

    pointerEvents: 'none',
    '>:first-child': {
      pointerEvents: 'all',
    },
  }
  if (isFixed) {
    return {
      ...baseStyles,
      backdropFilter: disableBlur ? 'unset' : 'blur(12px)',
      pb: horizontalScrollbarSize ? 0 : `12px`,
      position: 'absolute',
      bottom: horizontalScrollbarSize ? `${horizontalScrollbarSize}px` : 0,
      pr: verticalScrollbarSize ? 0 : '8px',
    }
  }
  return {
    ...baseStyles,
    backgroundColor: 'canvas.default',
    pb: '1px',
    position: 'absolute',
    top: `${effectiveTableHeight}px`,
    height: `${CELL_HEIGHT}px`,
    borderBottom: '1px solid',
    borderBottomColor: 'border.default',
    boxShadow: 'shadow.medium',
  }
}

export const OmnibarContainer = forwardRef<HTMLDivElement, Props & BoxProps>(
  (
    {
      horizontalScrollbarSize,
      disableBlur,
      verticalScrollbarSize,
      isFixed,
      effectiveTableHeight,
      sx,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Box
        {...props}
        ref={ref}
        sx={{
          display: 'flex',
          zIndex: 10,
          ...getStyles({isFixed, verticalScrollbarSize, horizontalScrollbarSize, effectiveTableHeight, disableBlur}),
          ...sx,
        }}
        {...testIdProps(`omnibar-container`)}
      >
        {children}
      </Box>
    )
  },
)

OmnibarContainer.displayName = 'OmnibarContainer'
