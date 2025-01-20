import {useQueryClient} from '@tanstack/react-query'
import {useCallback, useMemo} from 'react'

import type {MemexServiceData} from '../../api/memex/contracts'
import useToasts from '../../components/toasts/use-toasts'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {Resources} from '../../strings'
import {getMemexServiceQueryData, setMemexServiceQueryData} from './query-client-api'

export function useUpdateMemexService() {
  const queryClient = useQueryClient()
  const {addToast} = useToasts()
  const {memex_table_without_limits} = useEnabledFeatures()
  const updateMemexService = useCallback(
    (newMemexServiceData: MemexServiceData | undefined) => {
      const currentMemexServiceData = getMemexServiceQueryData(queryClient)
      if (currentMemexServiceData && newMemexServiceData) {
        const killSwitchToggled = currentMemexServiceData.killSwitchEnabled !== newMemexServiceData.killSwitchEnabled

        if (killSwitchToggled) {
          if (!newMemexServiceData.killSwitchEnabled && !memex_table_without_limits) {
            setMemexServiceQueryData(queryClient, {...newMemexServiceData, killSwitchRecentlyDisabled: true})
          } else {
            setMemexServiceQueryData(queryClient, newMemexServiceData)
          }
          const message = newMemexServiceData.killSwitchEnabled
            ? Resources.killSwitchEnabledToastMessage
            : Resources.killSwitchDisabledToastMessage

          const type = newMemexServiceData.killSwitchEnabled ? 'warning' : 'default'
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            message,
            type,
          })
        }
      }
    },
    [addToast, memex_table_without_limits, queryClient],
  )

  return useMemo(() => ({updateMemexService}), [updateMemexService])
}
