import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {KeyIcon} from '@primer/octicons-react'
import {Box, Label, RelativeTime, Text, Truncate} from '@primer/react'
import {parseISO} from 'date-fns'

import SeverityLabel from '../../../common/components/severity-label'
import {AlertBlankslate} from '../blankslates'
import RepositoryLabel from '../repository-label'
import type {SecretScanningAlert as SecretScanningAlertModel} from './use-alerts-query'

export type SecretScanningAlertProps = SecretScanningAlertModel

export default function SecretScanningAlert({
  repositoryName,
  repositoryHref,
  repositoryTypeIcon,
  alertHref,
  alertTitle,
  alertSeverity,
  alertRawSecret,
  alertActive,
  alertIsCustomPattern,
  alertLocation,
  alertResolved,
  alertResolution,
  alertUpdatedAt,
}: SecretScanningAlertProps): JSX.Element {
  const updatedAtAsDate = alertUpdatedAt ? parseISO(alertUpdatedAt) : undefined

  if (!alertTitle) {
    return (
      <AlertBlankslate
        alertTitle="Secret scanning alert"
        alertTypeIcon={KeyIcon}
        {...{repositoryName, repositoryHref, repositoryTypeIcon, alertHref, alertSeverity}}
      />
    )
  }

  return (
    <ListItem
      title={
        <ListItemTitle
          value={alertTitle}
          href={alertHref}
          containerSx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}
        >
          <Box sx={{display: 'inline', ml: 2, bg: 'canvas.subtle', borderRadius: 2}}>
            <Truncate inline={true} title={alertRawSecret} maxWidth={225}>
              <Text sx={{fontFamily: 'mono', fontSize: 1, px: 1}}>{alertRawSecret}</Text>
            </Truncate>
          </Box>
        </ListItemTitle>
      }
      metadata={
        <>
          <ListItemMetadata>
            {alertActive && <Label>Active</Label>}
            <SeverityLabel severity={alertSeverity} />
            <RepositoryLabel name={repositoryName} href={repositoryHref} icon={repositoryTypeIcon} />
          </ListItemMetadata>
        </>
      }
    >
      <ListItemLeadingContent>
        <ListItemLeadingVisual icon={KeyIcon} />
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
            Detected {alertIsCustomPattern ? 'custom pattern' : 'secret'} in {alertLocation}
          </span>
        </ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}
