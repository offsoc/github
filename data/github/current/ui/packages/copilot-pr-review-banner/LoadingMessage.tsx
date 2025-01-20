import {useEffect} from 'react'
import {Text} from '@primer/react'
import {useAnalytics} from './AnalyticsContext'

export const LoadingMessage = () => {
  const {markLoadingMessageAsShown} = useAnalytics()

  useEffect(() => markLoadingMessageAsShown(), [markLoadingMessageAsShown])

  return (
    <Text sx={{color: 'fg.muted'}}>
      <Text sx={{color: 'fg.default', fontWeight: 500}}>Copilot</Text> is analyzing the changes in this pull request…
    </Text>
  )
}
