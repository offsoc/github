import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import type React from 'react'

import SeverityLabel from '../../../common/components/severity-label'
import type {Severity} from '../../types'
import RepositoryLabel from '../repository-label'

interface Props {
  alertTitle: string
  alertHref: string
  alertTypeIcon: React.ElementType
  alertSeverity?: Severity
  repositoryName: string
  repositoryHref: string
  repositoryTypeIcon: 'repo' | 'lock' | 'mirror' | 'repo-forked'
}

export function AlertBlankslate({
  alertTitle,
  alertHref,
  alertTypeIcon,
  alertSeverity,
  repositoryName,
  repositoryHref,
  repositoryTypeIcon,
}: Props): JSX.Element {
  return (
    <ListItem
      title={<ListItemTitle value={alertTitle} href={alertHref} />}
      metadata={
        <>
          <ListItemMetadata>
            {alertSeverity && <SeverityLabel severity={alertSeverity} />}
            <RepositoryLabel name={repositoryName} href={repositoryHref} icon={repositoryTypeIcon} />
          </ListItemMetadata>
        </>
      }
    >
      <ListItemLeadingContent>
        <ListItemLeadingVisual icon={alertTypeIcon} />
      </ListItemLeadingContent>

      <ListItemMainContent>
        <ListItemDescription>
          <span>Unable to load alert details.</span>
        </ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}
