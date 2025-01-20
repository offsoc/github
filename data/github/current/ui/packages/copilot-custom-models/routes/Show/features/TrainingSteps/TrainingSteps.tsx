import {Box} from '@primer/react'
import {useMemo} from 'react'
import {Stage} from './Stage'
import {stageSortFn} from './utils'
import {usePipelineDetails} from '../../../../features/PipelineDetails'
import {useThemeColor} from './use-theme-color'

export function TrainingSteps() {
  const {
    cardPipeline: {stages: unsortedStages},
  } = usePipelineDetails()
  const stages = useMemo(() => unsortedStages.sort(stageSortFn), [unsortedStages])
  const getThemeColor = useThemeColor()

  if (!stages.length) return null

  return (
    <Box
      sx={{
        backgroundColor: getThemeColor('colors.canvas.inset'),
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        p: ['0px', '16px'],
      }}
    >
      {stages.map(stage => (
        <Stage key={`${stage.order}-${stage.name}`} stage={stage} />
      ))}
    </Box>
  )
}
