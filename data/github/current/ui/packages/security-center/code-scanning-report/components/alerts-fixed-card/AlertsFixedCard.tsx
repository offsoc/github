import DataCard from '@github-ui/data-card'
import {ShieldCheckIcon} from '@primer/octicons-react'
import {Box} from '@primer/react'

import {formatFriendly} from '../../../common/utils/number-formatter'
import useAlertsFixedQuery, {type UseAlertsFixedQueryParams} from './use-alerts-fixed-query'

interface AlertsFixedCardProps extends UseAlertsFixedQueryParams {}

export default function AlertsFixedCard(props: AlertsFixedCardProps): JSX.Element {
  const dataQuery = useAlertsFixedQuery(props)

  return (
    <DataCard cardTitle="Alerts fixed" loading={dataQuery.isPending} error={dataQuery.isError}>
      {dataQuery.isSuccess && (
        <>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
            <ShieldCheckIcon size="medium" className="fgColor-done" />
            <DataCard.Counter count={dataQuery.data.count} />
          </Box>
          <DataCard.Description>
            {`${formatFriendly(dataQuery.data.percentage)}% of alerts detected in pull requests were fixed`}
          </DataCard.Description>
        </>
      )}
    </DataCard>
  )
}
