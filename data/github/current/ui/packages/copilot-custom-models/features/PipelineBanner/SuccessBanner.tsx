import {RocketIcon} from '@primer/octicons-react'
import {Box, CircleBadge, Text} from '@primer/react'
import {BorderBox} from '../../components/BorderBox'
import {usePipelineDetails} from '../PipelineDetails'

export function SuccessBanner() {
  const {org} = usePipelineDetails()

  return (
    <BorderBox
      sx={{
        backgroundColor: 'transparent',
        columnGap: '16px',
        display: 'grid',
        gridTemplateAreas: `'visual message'`,
        gridTemplateColumns: 'min-content 1fr',
        gridTemplateRows: 'min-content',
      }}
    >
      <Box
        sx={{
          alignSelf: 'start',
          display: 'grid',
          gridArea: 'visual',
          paddingBlock: 'var(--base-size-8)',
        }}
      >
        <CircleBadge size={32} sx={{backgroundColor: 'var(--bgColor-done-muted, var(--color-done-subtle))'}}>
          <CircleBadge.Icon icon={RocketIcon} sx={{color: 'var(--fgColor-done, var(--color-done-fg))'}} />
        </CircleBadge>
      </Box>
      <Box
        sx={{
          alignSelf: 'center',
          display: 'flex',
          flexDirection: 'column',
          fontSize: 1,
          gap: '4px',
          gridArea: 'message',
          lineHeight: '1.5',
        }}
      >
        <Text sx={{fontSize: '16px', fontWeight: 'semibold', lineHeight: '24px'}}>
          {org} model has been deployed to {org}
        </Text>
        <Text sx={{color: 'var(--fgColor-muted, var(--color-fg-muted))', wordBreak: 'break-word'}}>
          Congratulations! Your first custom model has been successfully trained and deployed. Your team can now start
          using it in your IDE. You can come back anytime to retrain your model.
        </Text>
      </Box>
    </BorderBox>
  )
}
