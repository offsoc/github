import {setTitle} from '@github-ui/document-metadata'
import {useEffect, useMemo} from 'react'
import {useLocation} from 'react-router-dom'

import {findRouteBestMatchByPath, routesMap} from '../routes'
import {useProjectDetails} from '../state-providers/memex/use-project-details'
import {useCustomFieldsSettings} from '../state-providers/settings/use-custom-fields-settings'
import {RouteTitleResources} from '../strings'
import {useSidePanel} from './use-side-panel'
import {useViews} from './use-views'

/**
 * This hook monitors the title of our memex and updates the document title
 */
export const useBindMemexToDocument = () => {
  const {pathname} = useLocation()
  const {currentView} = useViews()
  const {title} = useProjectDetails()
  const {sidePanelState} = useSidePanel()
  const routeMatch = findRouteBestMatchByPath(pathname)
  const {currentColumnTitle} = useCustomFieldsSettings()

  const documentTitle = useMemo(() => {
    if (sidePanelState && 'item' in sidePanelState) {
      return RouteTitleResources.item(title, sidePanelState.item.getRawTitle())
    }

    switch (routeMatch) {
      case routesMap.PROJECT_ROUTE:
      case routesMap.PROJECT_VIEW_ROUTE:
        return RouteTitleResources.view(title, currentView?.name)

      case routesMap.PROJECT_ARCHIVE_ROUTE:
        return RouteTitleResources.archive(title)

      case routesMap.PROJECT_SETTINGS_FIELD_ROUTE:
        return RouteTitleResources.settings(title, currentColumnTitle)

      case routesMap.PROJECT_SETTINGS_ROUTE:
      case routesMap.PROJECT_SETTINGS_ACCESS_ROUTE:
        return RouteTitleResources.settings(title)

      case routesMap.PROJECT_WORKFLOWS_ROUTE:
      case routesMap.PROJECT_WORKFLOW_CLIENT_ID_ROUTE:
        return RouteTitleResources.workflows(title)

      case routesMap.PROJECT_INSIGHTS_ROUTE:
      case routesMap.PROJECT_INSIGHTS_NUMBER_ROUTE:
        return RouteTitleResources.insights(title)
    }

    return title
  }, [sidePanelState, routeMatch, title, currentView?.name, currentColumnTitle])

  // document title
  useEffect(() => {
    setTitle(documentTitle)
  }, [documentTitle])

  // breadcrumb title
  useEffect(() => {
    document.dispatchEvent(new CustomEvent('context-region-label:update', {detail: {label: title}}))
  }, [title])
}
