import {Box, FormControl, Link, TextInput} from '@primer/react'
import {useContext, type FormEvent} from 'react'
import {URLS} from '../../../helpers/constants'
import {DocsContext} from '../context'

export function RunnerMaxConcurrencyInput(props: {
  value: number
  min: number
  max: number
  gpuRunnerSelected: boolean
  onChange: (value: number) => void
}) {
  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const currentValue = parseInt(e.currentTarget.value)
    props.onChange(currentValue)
  }

  const baseDocsUrl = useContext(DocsContext)

  const error = getMaxRunnerConcurrencyError({
    value: props.value,
    min: props.min,
    max: props.max,
    gpuRunnerSelected: props.gpuRunnerSelected,
  })

  return (
    <Box
      as="div"
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderColor: 'border.default',
        borderRadius: 2,
        borderStyle: 'solid',
        borderWidth: 1,
        marginBottom: 2,
        width: '100%',
        padding: 3,
      }}
    >
      <FormControl>
        <TextInput
          aria-label="Maximum runner job concurrency"
          aria-invalid={!!error}
          type="number"
          inputMode="numeric"
          name="maximumConcurrentJobs"
          min={props.min}
          max={props.max}
          onChange={handleChange}
          value={props.value}
          validationStatus={error ? 'error' : undefined}
          data-testid="runner-max-concurrency-input"
        />
        <FormControl.Label>Maximum concurrency</FormControl.Label>
        <FormControl.Caption>
          Limits the{' '}
          <Link inline href={`${baseDocsUrl}${URLS.USAGE_LIMITS}`} underline>
            number of jobs
          </Link>{' '}
          that can run at the same time.
        </FormControl.Caption>
        <div data-testid="runner-max-concurrency-input-error">
          {error && <FormControl.Validation variant="error">{error}</FormControl.Validation>}
        </div>
      </FormControl>
    </Box>
  )
}

export function getMaxRunnerConcurrencyError(input: {
  value: number
  min: number
  max: number
  gpuRunnerSelected: boolean
}) {
  if (input.value === null || isNaN(input.value)) {
    return 'Must be a valid number'
  }

  if (input.value < input.min) {
    return `Must be at least ${input.min}`
  }

  if (input.value > input.max) {
    const extraInfo = input.gpuRunnerSelected ? ' for GPU-powered runners' : ''
    return `Must be at most ${input.max}${extraInfo}`
  }

  return null
}
