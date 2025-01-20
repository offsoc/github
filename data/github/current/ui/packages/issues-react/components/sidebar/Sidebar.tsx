import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import {SingleSignOnBanner} from '@github-ui/single-sign-on-banner'
import {useSso} from '@github-ui/use-sso'
import {Box, NavList, TreeView} from '@primer/react'
import {Suspense, useMemo} from 'react'
import type {PreloadedQuery} from 'react-relay/hooks'

import {LABELS} from '../../constants/labels'
import {VALUES} from '../../constants/values'
import {useNavigationContext} from '../../contexts/NavigationContext'
import useKnownViews from '../../hooks/use-known-views'
import {useViewsNav} from '../../hooks/viewsNav'
import type {SavedViewsQuery} from './__generated__/SavedViewsQuery.graphql'
import {AppTitle} from './AppTitle'
import {CallToActionItem} from './CallToActionItem'
import {iconToPrimerIcon} from './IconHelper'
import {SavedViewItem} from './SavedViewItem'
import {SavedViews} from './SavedViews'
import {SharedViews} from './shared-views/SharedViews'
import {EditSelectedTeams} from './shared-views/EditSelectedTeams'
import {SidebarLoading} from './SidebarLoading'
import {SidebarRow} from './SidebarRow'

type SidebarProps = {
  customViewsRef: PreloadedQuery<SavedViewsQuery> | undefined | null
}

export const Sidebar = ({customViewsRef}: SidebarProps) => {
  if (!customViewsRef) return <SidebarLoading />
  return (
    <Suspense fallback={<SidebarLoading />}>
      <SidebarInternal customViewsRef={customViewsRef} />
    </Suspense>
  )
}

type SidebarInternalProps = {
  customViewsRef: PreloadedQuery<SavedViewsQuery>
}

function SidebarInternal({customViewsRef}: SidebarInternalProps) {
  const {knownViews, knownViewRoutes} = useKnownViews()
  const {isNavigationOpen} = useNavigationContext()
  const {issues_react_dashboard_saved_views} = useFeatureFlags()
  const {ssoOrgs} = useSso()

  const orgNames = ssoOrgs.map(o => o['login']).filter(n => n !== undefined)
  const viewKeys = useMemo(() => knownViews.map((_item, index) => (index + 1).toString()), [knownViews])
  useViewsNav(knownViewRoutes, viewKeys)

  const savedViewItems = knownViews
    .filter(view => !view.hidden)
    .map((item, index) => {
      if (item.url) {
        return (
          <SidebarRow
            key={item.id}
            title={item.name}
            icon={iconToPrimerIcon(item.icon)!}
            id={item.id}
            path={item.url}
            tooltip={item.name}
          />
        )
      }

      return (
        <SavedViewItem
          isTree={false}
          key={item.id}
          id={item.id}
          position={index + 1}
          tooltip={item.name}
          icon={item.icon}
          color={VALUES.defaultViewColor}
          title={item.name}
          query={item.query}
        />
      )
    })

  return (
    <Box
      as={isNavigationOpen ? 'div' : 'nav'}
      aria-labelledby="sidebar-title"
      sx={{display: 'flex', flexDirection: 'column', minHeight: '100%', px: 4, py: 3}}
    >
      <Box sx={{display: 'flex', gap: 3, flexDirection: 'column', alignItems: 'flex-start', mb: 2}}>
        <AppTitle />
        <SingleSignOnBanner protectedOrgs={orgNames} />
      </Box>
      <NavList aria-label={LABELS.defaultViews} sx={{mb: 2, mx: -3}}>
        {savedViewItems}
      </NavList>
      {issues_react_dashboard_saved_views && (
        <>
          {/* Custom heading and margin until https://github.com/github/primer/issues/1448 is resolved */}
          <Box sx={{fontWeight: 'bold', fontSize: 0, color: 'fg.muted', mb: 1}}>{LABELS.viewsTitle}</Box>
          <Box sx={{mx: 0}}>
            <TreeView aria-label={LABELS.viewsTitle}>
              <SavedViews savedViewsRef={customViewsRef} />
              <SharedViews shareViewsRef={customViewsRef} />
            </TreeView>
          </Box>
          <EditSelectedTeams shareViewsRef={customViewsRef} />
        </>
      )}
      <Box sx={{mt: 'auto'}}>
        <Box sx={{mt: 4, borderTop: '1px solid', borderTopColor: 'border.muted', pt: 3}}>
          <CallToActionItem />
        </Box>
      </Box>
    </Box>
  )
}
