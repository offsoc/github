import {Box, Label} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {IterationLabelType} from '../../../helpers/iterations'
import {Resources} from '../../../strings'

interface IterationLabelProps {
  labelType: IterationLabelType
  /** Style overrides for the label container. */
  sx?: BetterSystemStyleObject
}

const DefaultStyle: BetterSystemStyleObject = {
  borderColor: 'border.default',
  pt: '1px',
  color: 'fg.muted',
}

const SelectedStyle: BetterSystemStyleObject = {
  ...DefaultStyle,
  borderColor: 'accent.emphasis',
  color: 'accent.fg',
}

const BreakStyle: BetterSystemStyleObject = {
  ...DefaultStyle,
  color: 'fg.subtle',
}

/**
 * Standalone label to highlight an iteration as the current one.
 */
export function CurrentIterationLabel({sx}: {sx: BetterSystemStyleObject}) {
  return <Label sx={{...SelectedStyle, ...sx}}>{Resources.iterationLabel.current}</Label>
}

/**
 * Generic label for use in the iteration field settings table. This is specifically sized
 * and padded to work in the table. For a standalone label for the current iteration, use
 * `CurrentIterationLabel`.
 */
export function IterationRowLabel({labelType, sx}: IterationLabelProps) {
  const text = Resources.iterationLabel[labelType]
  const style = labelType === 'current' ? SelectedStyle : labelType === 'break' ? BreakStyle : DefaultStyle

  return (
    <Box
      sx={{
        mr: 3,
        width: '5.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 1,
        ...(sx ?? {}),
      }}
    >
      <Label sx={{mt: 0.75, textDecoration: 'inherit', ...style}} as="span">
        {text}
      </Label>
    </Box>
  )
}
