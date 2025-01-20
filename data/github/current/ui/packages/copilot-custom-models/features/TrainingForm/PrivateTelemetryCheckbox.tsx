import {useState} from 'react'
import {Box, Checkbox, FormControl} from '@primer/react'

interface Props {
  canCollectPrivateTelemetry: boolean
  defaultValue: boolean
}

export function PrivateTelemetryCheckbox({canCollectPrivateTelemetry, defaultValue}: Props) {
  const [collectPrivateTelemetry, setCollectPrivateTelemetry] = useState(defaultValue)

  return (
    <Box sx={{borderTop: '1px solid var(--borderColor-default, var(--color-border-default))', p: '16px'}}>
      <FormControl disabled={!canCollectPrivateTelemetry} id="private_telemetry">
        <Checkbox
          aria-label="Include data from prompts and suggestions"
          checked={collectPrivateTelemetry}
          name="private_telemetry"
          onChange={() => setCollectPrivateTelemetry(!collectPrivateTelemetry)}
          value={collectPrivateTelemetry ? 'on' : 'off'}
        />
        <FormControl.Label>Include data from prompts and suggestions</FormControl.Label>
        <FormControl.Caption>
          Train the model on data collected from developer&apos;s prompts and suggestions for fine-tuning your model. It
          is strongly recommended to include this data to improve model performance.
        </FormControl.Caption>
      </FormControl>
    </Box>
  )
}
