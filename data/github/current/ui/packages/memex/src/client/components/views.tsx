import {memo} from 'react'

import {SidePanelProvider} from '../hooks/use-side-panel'
import {NotificationSubscriptionsProvider} from '../state-providers/notification-subscriptions/notification-subscriptions-provider'
import {CustomFieldSettingsProvider} from '../state-providers/settings/use-custom-fields-settings'
import {MemexStatusItemsProvider} from '../state-providers/status-updates/status-updates-provider'
import {AggregationSettingsProvider} from './aggregation-settings'
import {DefaultSearchConfig, SearchProvider} from './filter-bar/search-context'
import {HorizontalGroupedByProvider} from './horizontal-grouped-by'
import {RoadmapSettingsProvider} from './roadmap/roadmap-settings'
import {SliceByProvider} from './slice-by'
import {SortedByProvider} from './sorted-by'
import {UserSettingsProvider} from './user-settings'
import {VerticalGroupedByProvider} from './vertical-grouped-by'
import {ViewProvider} from './view'
import {ViewTypeProvider} from './view-type'
import {VisibleFieldsProvider} from './visible-fields'

export const ViewsProvider = memo<{
  children?: React.ReactNode
}>(function ViewsProvider({children}) {
  return (
    <ViewProvider>
      <ViewTypeProvider>
        <SearchProvider config={DefaultSearchConfig}>
          <VisibleFieldsProvider>
            <SliceByProvider>
              <HorizontalGroupedByProvider>
                <VerticalGroupedByProvider>
                  <SortedByProvider>
                    <AggregationSettingsProvider>
                      <NotificationSubscriptionsProvider>
                        <UserSettingsProvider>
                          <RoadmapSettingsProvider>
                            <SidePanelProvider>
                              <CustomFieldSettingsProvider>
                                <MemexStatusItemsProvider>{children}</MemexStatusItemsProvider>
                              </CustomFieldSettingsProvider>
                            </SidePanelProvider>
                          </RoadmapSettingsProvider>
                        </UserSettingsProvider>
                      </NotificationSubscriptionsProvider>
                    </AggregationSettingsProvider>
                  </SortedByProvider>
                </VerticalGroupedByProvider>
              </HorizontalGroupedByProvider>
            </SliceByProvider>
          </VisibleFieldsProvider>
        </SearchProvider>
      </ViewTypeProvider>
    </ViewProvider>
  )
})
