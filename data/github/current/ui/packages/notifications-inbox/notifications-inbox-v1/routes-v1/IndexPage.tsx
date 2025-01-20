import type {FC} from 'react'
import {Route, Routes} from 'react-router-dom'

import {InboxDetailPage} from '../pages-v1/InboxDetailPage'
import {InboxPage} from '../pages-v1/InboxPage'
import {NotificationContextProvider, QueryContextProvider} from '../contexts-v1'
import {AnalyticsWrapper} from '../pages-v1/AnalyticsWrapper'

const IndexPage: FC = () => {
  return (
    <QueryContextProvider>
      <NotificationContextProvider>
        <Routes>
          <Route
            path="inbox/:notificationId"
            element={
              <AnalyticsWrapper category="v1-detail">
                <InboxDetailPage />
              </AnalyticsWrapper>
            }
          />
          <Route
            path="inbox/views/:viewId"
            element={
              <AnalyticsWrapper category="v1-view-index">
                <InboxPage />
              </AnalyticsWrapper>
            }
          />
          <Route
            path="inbox"
            element={
              <AnalyticsWrapper category="v1-index">
                <InboxPage />
              </AnalyticsWrapper>
            }
          />
        </Routes>
      </NotificationContextProvider>
    </QueryContextProvider>
  )
}

export default IndexPage
