import DataCard from '@github-ui/data-card'
import {useMemo} from 'react'

import useAlertsFixedWithAutofixQuery, {
  type UseAlertsFixedWithAutofixQueryParams,
} from './use-alerts-fixed-with-autofix-query'

interface AlertsFixedWithAutofixCardProps extends UseAlertsFixedWithAutofixQueryParams {}

export default function AlertsFixedWithAutofixCard(props: AlertsFixedWithAutofixCardProps): JSX.Element {
  const dataQuery = useAlertsFixedWithAutofixQuery(props)

  const percentageAccepted = useMemo(() => {
    if (!dataQuery.isSuccess) return 0
    if (dataQuery.data.suggested === 0) return 0

    return (100 * dataQuery.data.accepted) / dataQuery.data.suggested
  }, [dataQuery])

  return (
    <DataCard cardTitle="Alerts fixed with autofix suggestions" loading={dataQuery.isPending} error={dataQuery.isError}>
      {dataQuery.isSuccess && (
        <>
          <DataCard.Counter count={dataQuery.data.accepted} total={dataQuery.data.suggested} />
          <DataCard.ProgressBar
            sx={{gap: '0.2em', background: 'transparent'}}
            aria-label={`${percentageAccepted} of autofix suggestions were accepted`}
            data={[
              {
                progress: percentageAccepted,
                color: 'success.emphasis',
              },
              {
                progress: 100 - percentageAccepted,
                color: 'accent.emphasis',
              },
            ]}
          />
          <DataCard.Description>
            Total alerts fixed with an accepted autofix out of all with a suggested autofix
          </DataCard.Description>
        </>
      )}
    </DataCard>
  )
}
