import {useRefetchOnAliveUpdate} from './use-refetch-on-alive-update'
import {useHeaderPageData} from '../page-data/loaders/use-header-page-data'

export function useHeaderLiveUpdates(channel: string): void {
  const {refetch} = useHeaderPageData()
  useRefetchOnAliveUpdate(channel, refetch, {git_updated: false})
}
