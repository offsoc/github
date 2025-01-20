import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import type {FC} from 'react'

import IndexPage from './IndexPage'
// Temporarily we will include an inbox copy v1 for a big refactor and behind a feature flag
// This will be removed once we finish refactoring our components and adding list primitive and bulk actions
// context: https://github.com/github/notifications-experience/issues/283
import IndexPageV1 from '../notifications-inbox-v1/routes-v1/IndexPage'

const InboxRoutePage: FC = () => {
  const {notifications_inbox_listview} = useFeatureFlags()
  return notifications_inbox_listview ? <IndexPage /> : <IndexPageV1 />
}

export default InboxRoutePage
