import {useCallback, useRef} from 'react'

import {omit} from '../../../../utils/omit'
import {apiApplyTemplate} from '../../../api/memex/api-apply-template'
import {DefaultOmitPropertiesForView} from '../../../api/view/contracts'
import type {SelectedTemplate} from '../../../components/template-dialog/hooks/use-template-link'
import useToasts from '../../../components/toasts/use-toasts'
import {getViewTypeParamFromViewType} from '../../../helpers/view-type'
import {useApiRequest} from '../../../hooks/use-api-request'
import {useUpdateViewWithoutSettingStates} from '../../../hooks/use-view-apis'
import {useViews} from '../../../hooks/use-views'
import {useSingleDataRefresh} from '../../../state-providers/data-refresh/use-single-data-refresh'
import {useUpdateMemexTitle} from '../../../state-providers/memex/use-update-memex-title'
import {BulkCopyResources} from '../../../strings'

export function useApplyTemplate() {
  const handleDataRefresh = useSingleDataRefresh()
  const {addToast} = useToasts()
  const copyingDraftsAsync = useRef(false)

  const {viewsMap} = useViews()
  const updateView = useUpdateViewWithoutSettingStates()

  const {updateTitle} = useUpdateMemexTitle()
  const applyTemplateRequest = useApiRequest({
    request: async (templateToApply: string) => {
      const res = await apiApplyTemplate({template: templateToApply})
      if (res.copyingDraftsAsync) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({message: BulkCopyResources.copyingDraftsMessage, type: 'default', keepAlive: false})
        copyingDraftsAsync.current = true
      }
    },
    rollback: (rollbackAction?: () => void) => {
      rollbackAction?.()
    },
    showErrorToast: true,
  })

  const applyTemplate = useCallback(
    async function ({template, title, rollback}: {title: string; template: SelectedTemplate; rollback?: () => void}) {
      const actions = [updateTitle(title)]
      if (template.type === 'layout') {
        const view = viewsMap[1]
        if (!view) return
        actions.push(
          updateView.perform({
            viewNumber: view.number,
            view: omit(
              {
                ...view.serverViewState,
                layout: getViewTypeParamFromViewType(template.viewType),
              },
              DefaultOmitPropertiesForView,
            ),
          }),
        )
      } else {
        const templateToApply =
          template.type === 'custom' ? String(template.template.projectNumber) : template.template.id
        actions.push(applyTemplateRequest.perform(templateToApply, rollback))
      }

      await Promise.all(actions)

      // Refresh the project with all new data
      await handleDataRefresh()
    },
    [applyTemplateRequest, handleDataRefresh, updateTitle, updateView, viewsMap],
  )

  const isApplyingTemplate = applyTemplateRequest.status.current.status === 'loading'

  return {applyTemplate, isApplyingTemplate, copyingDraftsAsync}
}
