import {StopwatchIcon} from '@primer/octicons-react'
import {Box, Text} from '@primer/react'

type TimeBoundFilterWarningProps = {
  field: string
  unit: 'hours'
  value: number
}

export const TimeBoundFilterWarning = ({field, unit, value}: TimeBoundFilterWarningProps) => {
  return (
    <Text
      as="p"
      sx={{
        fontSize: 0,
        color: 'fg.muted',
        display: 'flex',
        alignItems: 'center',
        mt: 2,
        mb: 0,
        width: '100%',
      }}
    >
      <Box as="span" sx={{display: 'flex', mr: 1}} aria-hidden="true">
        <StopwatchIcon size={14} />
      </Box>
      <span>
        Using the {field} operator means that your workflow will run every {value} {unit}
      </span>
    </Text>
  )
}
