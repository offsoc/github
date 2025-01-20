import {useRefetchOnAliveUpdate} from './use-refetch-on-alive-update'
import {useCommitsPageData} from '../page-data/loaders/use-commits-page-data'

export function useCommitsLiveUpdates(channel: string): void {
  const {refetch} = useCommitsPageData()
  useRefetchOnAliveUpdate(channel, refetch, {git_updated: true})
}
