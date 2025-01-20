/* eslint eslint-comments/no-use: off */
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'

import {LABELS} from '../../notifications/constants/labels'
import {Error} from './ListError'

/// Extend the ErrorBoundary component to render a custom error message
class NotificationsErrorBoundary extends ErrorBoundary {
  override render() {
    if (!this.state.error) return this.props.children
    return <Error title={LABELS.failedToLoadInbox} message={LABELS.errorLoading} />
  }
}

export default NotificationsErrorBoundary
