import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {DependabotIcon} from '@primer/octicons-react'
import {RelativeTime} from '@primer/react'
import {parseISO} from 'date-fns'

import SeverityLabel from '../../../common/components/severity-label'
import {AlertBlankslate} from '../blankslates'
import RepositoryLabel from '../repository-label'
import type {DependabotAlert as DependabotAlertModel} from './use-alerts-query'

export type DependabotAlertProps = DependabotAlertModel

export default function DependabotAlert({
  repositoryName,
  repositoryHref,
  repositoryTypeIcon,
  alertHref,
  alertTitle,
  alertSeverity,
  // alertDependencyScope,
  alertPackageName,
  alertEcosystem,
  alertLocation,
  alertResolved,
  alertResolution,
  alertUpdatedAt,
}: DependabotAlertProps): JSX.Element {
  const updatedAtAsDate = alertUpdatedAt ? parseISO(alertUpdatedAt) : undefined

  if (!alertTitle) {
    return (
      <AlertBlankslate
        alertTitle="Dependabot alert"
        alertTypeIcon={DependabotIcon}
        {...{repositoryName, repositoryHref, repositoryTypeIcon, alertHref, alertSeverity}}
      />
    )
  }

  return (
    <ListItem
      title={<ListItemTitle value={alertTitle} href={alertHref} />}
      metadata={
        <>
          <ListItemMetadata>
            {/* TODO has vulnerable calls */}
            {/* TODO direct vs transitive */}
            <SeverityLabel severity={alertSeverity} />
            <RepositoryLabel name={repositoryName} href={repositoryHref} icon={repositoryTypeIcon} />
          </ListItemMetadata>
        </>
      }
    >
      <ListItemLeadingContent>
        <ListItemLeadingVisual icon={DependabotIcon} />
      </ListItemLeadingContent>

      <ListItemMainContent>
        <ListItemDescription sx={{display: 'block'}}>
          {alertResolved ? (
            <>
              <span>Closed as {alertResolution}</span> <RelativeTime date={updatedAtAsDate} />
            </>
          ) : (
            <>
              <span>Opened</span> <RelativeTime date={updatedAtAsDate} />
            </>
          )}
          <span> &bull; </span>
          <span>
            Detected in {alertPackageName} ({alertEcosystem})
          </span>
          <span> &bull; </span>
          <span>{alertLocation}</span>
        </ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}
