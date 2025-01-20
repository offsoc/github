import {useMemo} from 'react'
import {Box, Label, Link, RelativeTime, Text} from '@primer/react'
import {
  AlertIcon,
  CircleSlashIcon,
  NoteIcon,
  ShieldCheckIcon,
  ShieldIcon,
  ShieldSlashIcon,
} from '@primer/octicons-react'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItem} from '@github-ui/list-view/ListItem'
import {codeScanningAlertPath} from '@github-ui/paths'
import {type SecurityCampaignAlert, SecuritySeverity, RuleSeverity} from '../types/security-campaign-alert'
import {RepositoryLabel} from '@github-ui/security-campaigns-shared/components/RepositoryLabel'
import {AlertLinksButton} from './AlertLinksButton'

export type AlertListItemProps = {
  alert: SecurityCampaignAlert
  isSelected?: boolean
  onSelect?: (isSelected: boolean) => void
  showSuggestedFixLabel?: boolean
  showSeverityLabel?: boolean
  showRepository?: boolean
}

export function AlertListItem({
  alert,
  isSelected,
  onSelect,
  showSuggestedFixLabel,
  showSeverityLabel,
  showRepository,
}: AlertListItemProps) {
  const icon = useMemo(() => {
    if (alert.isFixed) {
      return {
        icon: ShieldCheckIcon,
        description: 'Status: Fixed.',
        color: 'done.fg',
      }
    }
    if (alert.isDismissed) {
      return {
        icon: ShieldSlashIcon,
        description: 'Status: Dismissed.',
        color: 'fg.muted',
      }
    }
    return {
      icon: ShieldIcon,
      description: 'Status: Open.',
      color: 'fg.muted',
    }
  }, [alert])

  const severityLabel = useMemo(() => {
    switch (alert.securitySeverity) {
      case SecuritySeverity.Low:
        return {
          variant: 'secondary' as const,
          label: 'Low',
        }
      case SecuritySeverity.Medium:
        return {
          variant: 'attention' as const,
          label: 'Medium',
        }
      case SecuritySeverity.High:
        return {
          variant: 'severe' as const,
          label: 'High',
        }
      case SecuritySeverity.Critical:
        return {
          variant: 'danger' as const,
          label: 'Critical',
        }
    }

    switch (alert.ruleSeverity) {
      case RuleSeverity.Note:
        return {
          variant: 'secondary' as const,
          label: 'Note',
          icon: NoteIcon,
          iconColor: 'default' as const,
        }
      case RuleSeverity.Warning:
        return {
          variant: 'secondary' as const,
          label: 'Warning',
          icon: AlertIcon,
          iconColor: 'attention' as const,
        }
      case RuleSeverity.Error:
        return {
          variant: 'secondary' as const,
          label: 'Error',
          icon: CircleSlashIcon,
          iconColor: 'danger' as const,
        }
    }

    return undefined
  }, [alert])

  return (
    <ListItem
      isSelected={isSelected}
      onSelect={onSelect}
      title={
        <ListItemTitle
          href={codeScanningAlertPath({
            owner: alert.repository.ownerLogin,
            repo: alert.repository.name,
            alertNumber: alert.number,
          })}
          value={alert.title}
          headingSx={{
            maxWidth: '100%',
            whiteSpace: 'nowrap',
          }}
          containerSx={{display: 'flex', alignItems: 'flex-start', gap: 1, maxWidth: '100%'}}
        />
      }
      metadata={
        <ListItemMetadata alignment="right">
          {showSuggestedFixLabel && alert.hasSuggestedFix && <Label variant="default">Autofix</Label>}
          {showSeverityLabel && severityLabel && (
            <Label variant={severityLabel.variant}>
              {severityLabel.icon && (
                <Box as="span" sx={{pr: 1, color: `${severityLabel.iconColor}.fg`}}>
                  <severityLabel.icon />
                </Box>
              )}
              {severityLabel.label}
            </Label>
          )}
          <AlertLinksButton
            linkedPullRequests={alert.linkedPullRequests}
            linkedBranches={alert.linkedBranches ?? []}
            repository={alert.repository}
          />
          {showRepository && (
            <Link muted href={alert.campaignPath}>
              <RepositoryLabel name={alert.repository.name} typeIcon={alert.repository.typeIcon} />
            </Link>
          )}
        </ListItemMetadata>
      }
    >
      <ListItemLeadingContent>
        <ListItemLeadingVisual {...icon} />
      </ListItemLeadingContent>
      <ListItemMainContent>
        <ListItemDescription>
          <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
            <Text flex-wrap="nowrap" sx={{mr: 1}}>
              #{alert.number} &middot; detected by {alert.toolName}{' '}
            </Text>
            <RelativeTime datetime={alert.createdAt} format="relative" tense="past" />
            <Text sx={{ml: 1, flexWrap: 'nowrap'}}>
              {' '}
              in {alert.truncatedPath}:{alert.startLine}
            </Text>
          </Box>
        </ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}
