import {useState, useId} from 'react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {Box, Heading, Text, ToggleSwitch} from '@primer/react'

interface ToggleBoxProps {
  title?: string
  subtitle?: string
  checked?: boolean
  sx?: BetterSystemStyleObject
  onChange?: (value: boolean) => void
  labelId?: string
}

function ToggleBox(props: ToggleBoxProps) {
  const [checked, setChecked] = useState<boolean>(props.checked || false)

  const onToggle = (value: boolean) => {
    setChecked(value)
    props.onChange && props.onChange(value)
  }

  // hooks cannot be called conditionally, so we create a generated id in case it's not provided
  const generatedId = useId()
  const labelId = props.labelId || generatedId

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexBasis: '100%',
        ...props.sx,
      }}
    >
      {props.title && (
        <Box sx={{display: 'flex', mt: 0, justifyContent: 'space-between'}}>
          <Heading as="h3" sx={{fontSize: 1, fontWeight: 'bold', m: 0}} id={labelId}>
            {props.title}
          </Heading>
        </Box>
      )}
      {props.subtitle && (
        <Text as="p" sx={{color: 'fg.muted', mt: 0, mb: 2, flexGrow: 2}}>
          {props.subtitle}
        </Text>
      )}
      <ToggleSwitch
        checked={checked}
        aria-labelledby={labelId}
        size="small"
        statusLabelPosition="end"
        sx={{mr: 'auto'}}
        onClick={() => onToggle(!checked)}
      />
    </Box>
  )
}

export default ToggleBox
