import type {FC, PropsWithChildren} from 'react'
import type {StoryContext} from './types'
import {setClientEnvForSsr} from '@github-ui/client-env'

export const withEnabledFeatures = (Story: FC<PropsWithChildren<StoryContext>>, context: StoryContext) => {
  let featureFlags: string[] = []
  const {parameters} = context
  if (parameters.enabledFeatures && Array.isArray(parameters.enabledFeatures)) {
    featureFlags = parameters.enabledFeatures
  }
  setClientEnvForSsr({locale: 'en', featureFlags})
  return Story(context)
}
