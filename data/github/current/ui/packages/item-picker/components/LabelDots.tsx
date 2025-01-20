import {Box} from '@primer/react'

type LabelDotsProps = {MAX_DISPLAYED_LABELS?: number; labelColors: string[]}

export const LabelDots = ({MAX_DISPLAYED_LABELS = 5, labelColors}: LabelDotsProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        '> *:not(:last-child)': {
          mr: '-1px',
        },
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {labelColors.slice(0, MAX_DISPLAYED_LABELS).map((color, i) => (
        <Box
          key={`${i}-${color}`}
          sx={{
            width: 8,
            height: 8,
            borderRadius: 100,
            boxShadow: '0 0 0 2px var(--bgColor-muted, var(--color-canvas-subtle))',
            backgroundColor: `#${color}`,
          }}
        />
      ))}
    </Box>
  )
}
