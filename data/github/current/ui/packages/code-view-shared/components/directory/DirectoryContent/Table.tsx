import {Box, type BoxProps, type SxProp} from '@primer/react'
import type React from 'react'

/**
 * Table Frame component
 * @param as - Use `ul` only when all children are `li` items, otherwise add a nested `ul` at your convenience.
 */
export function Table({children, sx, ...props}: React.PropsWithChildren<Pick<BoxProps, 'aria-labelledby'> & SxProp>) {
  return (
    <Box
      as="table"
      sx={{
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: '6px',
        tableLayout: 'fixed',
        overflow: 'hidden',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}

export const HeaderRow: React.FC<{children: React.ReactNode} & SxProp> = ({children, sx}) => {
  return (
    <Box as="thead" sx={{height: '40px', ...sx}}>
      <Box
        as="tr"
        sx={{
          p: 3,
          color: 'fg.muted',
          fontSize: 0,
          textAlign: 'left',
          height: '40px',
          th: {
            pl: 3,
            backgroundColor: 'canvas.subtle',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

interface RowClickProps {
  onClick?: React.MouseEventHandler<HTMLTableRowElement>
  index?: number
  id?: string
}

export const Row: React.FC<React.PropsWithChildren<RowClickProps>> = ({children, onClick, index, id}) => {
  return (
    <Box
      as="tr"
      sx={{
        fontSize: 1,
        height: '40px',
        td: {
          pl: 3,
          textAlign: 'left',
          borderTopStyle: 'solid',
          borderTopWidth: 1,
          borderTopColor: 'border.default',
        },
        '&:hover': {
          bg: 'canvas.subtle',
        },
      }}
      onClick={onClick}
      data-index={index}
      id={id}
    >
      {children}
    </Box>
  )
}

export const TableFooter: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <Box
      as="tfoot"
      sx={{
        backgroundColor: 'canvas.subtle',
        borderTopColor: 'border.default',
        p: 3,
      }}
    >
      {children}
    </Box>
  )
}
