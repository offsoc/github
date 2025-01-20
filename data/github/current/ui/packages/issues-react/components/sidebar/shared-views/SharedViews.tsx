import type {PreloadedQuery} from 'react-relay'
import {usePreloadedQuery} from 'react-relay/hooks'

import type {SavedViewsQuery} from '../__generated__/SavedViewsQuery.graphql'
import {SavedViewsGraphqlQuery} from '../SavedViews'
import {SharedViewTreeList} from './SharedViewTreeList'

type SharedViewsProps = {
  shareViewsRef: PreloadedQuery<SavedViewsQuery>
}

export const SharedViews = ({shareViewsRef}: SharedViewsProps) => {
  const preloadedData = usePreloadedQuery<SavedViewsQuery>(SavedViewsGraphqlQuery, shareViewsRef)

  return preloadedData.viewer.dashboard ? <SharedViewTreeList sharedViewKey={preloadedData.viewer.dashboard} /> : null
}
