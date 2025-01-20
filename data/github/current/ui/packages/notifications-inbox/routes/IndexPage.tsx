import type {FC} from 'react'
import {Route, Routes} from 'react-router-dom'

import {InboxDetailPage} from '../pages/InboxDetailPage'
import {InboxPage} from '../pages/InboxPage'
import {NotificationContextProvider, QueryContextProvider} from '../contexts'
import {AnalyticsWrapper} from '../pages/AnalyticsWrapper'

const IndexPage: FC = () => {
  return (
    <QueryContextProvider>
      <NotificationContextProvider>
        <Routes>
          <Route
            path="inbox/:notificationId"
            element={
              <AnalyticsWrapper category="detail">
                <InboxDetailPage />
              </AnalyticsWrapper>
            }
          />
          <Route
            path="inbox/views/:viewId"
            element={
              <AnalyticsWrapper category="view-index">
                <InboxPage />
              </AnalyticsWrapper>
            }
          />
          <Route
            path="inbox"
            element={
              <AnalyticsWrapper category="index">
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
