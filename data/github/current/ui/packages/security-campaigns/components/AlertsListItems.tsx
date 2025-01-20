import React from 'react'

import type {SecurityCampaignAlert} from '../types/security-campaign-alert'
import {RowsLoading} from './RowsLoading'
import {AlertsListError} from './AlertsListError'
import {Blankslate} from '@primer/react/drafts'
import {ShieldCheckIcon} from '@primer/octicons-react'

export type AlertsListItemsProps = {
  alerts: SecurityCampaignAlert[]
  query: string
  isLoading: boolean
  isError: boolean
  renderAlert: (alert: SecurityCampaignAlert) => React.ReactNode
}

export function AlertsListItems({alerts, query, isLoading, isError, renderAlert}: AlertsListItemsProps) {
  if (isLoading) {
    return <RowsLoading rowCount={5} />
  }

  if (isError) {
    return <AlertsListError />
  }

  if (alerts.length === 0) {
    if (query.trim() === 'is:open') {
      return (
        <Blankslate spacious>
          <Blankslate.Heading>All alerts have been closed</Blankslate.Heading>
        </Blankslate>
      )
    } else {
      return (
        <Blankslate spacious>
          <Blankslate.Visual>
            <ShieldCheckIcon size="medium" />
          </Blankslate.Visual>
          <Blankslate.Heading>No alerts found</Blankslate.Heading>
        </Blankslate>
      )
    }
  }

  return alerts.map(alert => (
    <React.Fragment key={`${alert.repository.ownerLogin}/${alert.repository.name}/${alert.number}`}>
      {renderAlert(alert)}
    </React.Fragment>
  ))
}
