import type {FC} from 'react'
import {Route, Routes} from 'react-router-dom'

import {InboxDetailPage} from './InboxDetailPage'
import {InboxPage} from './InboxPage'
import {NotificationContextProvider, QueryContextProvider} from '../contexts'

const IndexPage: FC = () => {
  return (
    <QueryContextProvider>
      <NotificationContextProvider>
        <Routes>
          <Route path="inbox/:notificationId" element={<InboxDetailPage />} />
          <Route path="inbox/views/:viewId" element={<InboxPage />} />
          <Route path="inbox" element={<InboxPage />} />
        </Routes>
      </NotificationContextProvider>
    </QueryContextProvider>
  )
}

export default IndexPage
