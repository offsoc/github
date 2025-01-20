import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {CodescanIcon} from '@primer/octicons-react'
import {RelativeTime} from '@primer/react'
import {parseISO} from 'date-fns'

import SeverityLabel from '../../../common/components/severity-label'
import {AlertBlankslate} from '../blankslates'
import RepositoryLabel from '../repository-label'
import type {CodeScanningAlert as CodeScanningAlertModel} from './use-alerts-query'

export type CodeScanningAlertProps = CodeScanningAlertModel

export default function CodeScanningAlert({
  repositoryName,
  repositoryHref,
  repositoryTypeIcon,
  alertHref,
  alertTitle,
  alertTool,
  alertSeverity,
  alertLocation,
  alertResolved,
  alertResolution,
  alertUpdatedAt,
}: CodeScanningAlertProps): JSX.Element {
  const updatedAtAsDate = alertUpdatedAt ? parseISO(alertUpdatedAt) : undefined

  if (!alertTitle) {
    return (
      <AlertBlankslate
        alertTitle="Code scanning alert"
        alertTypeIcon={CodescanIcon}
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
            {/* TODO library? */}
            {alertSeverity && <SeverityLabel severity={alertSeverity} />}
            <RepositoryLabel name={repositoryName} href={repositoryHref} icon={repositoryTypeIcon} />
          </ListItemMetadata>
        </>
      }
    >
      <ListItemLeadingContent>
        <ListItemLeadingVisual icon={CodescanIcon} />
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
            Detected by {alertTool} in {alertLocation}
          </span>
        </ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}
