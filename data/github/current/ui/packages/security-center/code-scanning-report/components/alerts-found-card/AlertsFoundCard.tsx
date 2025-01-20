import DataCard from '@github-ui/data-card'
import {ShieldIcon} from '@primer/octicons-react'
import {Box} from '@primer/react'

import useAlertsFoundQuery, {type UseAlertsFoundQueryParams} from './use-alerts-found-query'

interface AlertsFoundCardProps extends UseAlertsFoundQueryParams {}

export default function AlertsFoundCard(props: AlertsFoundCardProps): JSX.Element {
  const dataQuery = useAlertsFoundQuery(props)

  return (
    <DataCard cardTitle="Alerts found" loading={dataQuery.isPending} error={dataQuery.isError}>
      {dataQuery.isSuccess && (
        <>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
            <ShieldIcon size="medium" className="fgColor-success" />
            <DataCard.Counter count={dataQuery.data.count} />
          </Box>
          <DataCard.Description>
            Total CodeQL alerts created in pull requests merged to the default branch
          </DataCard.Description>
        </>
      )}
    </DataCard>
  )
}
