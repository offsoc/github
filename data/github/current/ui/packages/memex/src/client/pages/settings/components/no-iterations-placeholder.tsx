import {Box, Text} from '@primer/react'

import {SettingsResources} from '../../../strings'

export function NoIterationsPlaceholder({isActiveTab}: {isActiveTab: boolean}) {
  return (
    <Box sx={{width: '100%', p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <Text as="h3" sx={{color: 'fg.default'}}>
        {isActiveTab ? SettingsResources.noIterationsTitle : SettingsResources.noCompletedIterationsTitle}
      </Text>
      <Text sx={{color: 'fg.muted'}}>
        {isActiveTab ? SettingsResources.noIterationsDescription : SettingsResources.noCompletedIterationsDescription}
      </Text>
    </Box>
  )
}
