import {EnterpriseCloudSummary, type EnterpriseCloudSummaryProps} from './EnterpriseCloudSummary'
import {NavigationContextProvider} from '../contexts/NavigationContext'

export interface EnterpriseOverviewProps {
  enterpriseContactUrl: string
  ghe: EnterpriseCloudSummaryProps
  isStafftools: boolean
  slug: string
}

export function EnterpriseOverview({ghe, ...props}: EnterpriseOverviewProps) {
  return (
    <NavigationContextProvider {...props}>
      <div className="mb-4" data-testid="licensing-enterprise-overview">
        <EnterpriseCloudSummary {...ghe} />
      </div>
    </NavigationContextProvider>
  )
}
