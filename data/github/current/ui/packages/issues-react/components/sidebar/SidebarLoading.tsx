import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box, NavList} from '@primer/react'

import {LABELS} from '../../constants/labels'
import {VALUES} from '../../constants/values'
import useKnownViews from '../../hooks/use-known-views'
import {AppTitle} from './AppTitle'
import {CallToActionItem} from './CallToActionItem'
import {iconToPrimerIcon} from './IconHelper'
import {SavedViewItem} from './SavedViewItem'
import {SidebarRow} from './SidebarRow'

export function SidebarLoading() {
  const {knownViews} = useKnownViews()

  const savedViewsItems = knownViews
    .filter(view => !view.hidden)
    .map((item, index) => {
      if (item.url) {
        return (
          <SidebarRow
            key={item.id}
            icon={iconToPrimerIcon(item.icon)!}
            id={item.id}
            path={item.url}
            title={item.name}
            tooltip=""
          />
        )
      }

      return (
        <SavedViewItem
          isTree={false}
          key={item.id}
          id={item.id}
          icon={item.icon}
          color={VALUES.defaultViewColor}
          title={item.name}
          query={item.query}
          tooltip=""
          position={index + 1}
        />
      )
    })

  return (
    <Box
      as="nav"
      aria-labelledby="sidebar-title"
      sx={{display: 'flex', flexDirection: 'column', minHeight: '100%', px: 4, py: 3}}
    >
      <Box sx={{display: 'flex', gap: 3, flexDirection: 'column', alignItems: 'flex-start', mb: 2}}>
        <AppTitle />
      </Box>
      <NavList aria-label={LABELS.defaultViews} sx={{mb: 2, mx: -3}}>
        {savedViewsItems}
      </NavList>
      <NavList sx={{mx: -3}}>
        {[...Array(VALUES.viewLoadingSize)].map((_, index) => (
          <NavList.Item key={index}>
            <NavList.LeadingVisual>
              <LoadingSkeleton variant="elliptical" height="md" width="md" />
            </NavList.LeadingVisual>
            <LoadingSkeleton variant="rounded" height="sm" width={'random'} />
          </NavList.Item>
        ))}
      </NavList>
      <Box sx={{mt: 'auto'}}>
        <Box sx={{mt: 4, borderTop: '1px solid', borderTopColor: 'border.muted', pt: 3}}>
          <CallToActionItem />
        </Box>
      </Box>
    </Box>
  )
}
