import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {PerformancePane} from './PerformancePane'

export function ApiInsights() {
  return (
    <ErrorBoundary>
      <PerformancePane />
    </ErrorBoundary>
  )
}
