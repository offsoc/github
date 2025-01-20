import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItemTrailingBadge} from '@github-ui/list-view/ListItemTrailingBadge'
import {ListItem} from '@github-ui/list-view/ListItem'
import {RelativeTime} from '@primer/react'
import {AzureIcon} from '../AzureIcon'
import {ComputeService} from '../../classes/network-configuration'
import type {NetworkConfiguration} from '../../classes/network-configuration'
import pluralize from 'pluralize'

interface INetworkConfigurationListItemProps {
  networkConfig: NetworkConfiguration
}

export function StaffToolsNetworkConfigurationListItem(props: INetworkConfigurationListItemProps) {
  const runnerGroupsCount = props.networkConfig.runnerGroups?.length ?? 0
  const badges = []
  if (props.networkConfig.computeService !== ComputeService.Actions) {
    badges.push(<ListItemTrailingBadge title="Actions Disabled" variant="attention" />)
  }
  if (props.networkConfig.computeService !== ComputeService.Codespaces) {
    badges.push(<ListItemTrailingBadge title="Codespaces Disabled" variant="attention" />)
  }
  return (
    <ListItem title={<ListItemTitle value={props.networkConfig.name} trailingBadges={badges} />}>
      <ListItemLeadingContent>
        <ListItemLeadingVisual icon={AzureIcon} description="Azure Icon" />
      </ListItemLeadingContent>
      <ListItemMainContent>
        <ListItemDescription>
          {props.networkConfig.service}
          {' · '}
          Created <RelativeTime date={new Date(props.networkConfig.createdOn)} tense="past" />
          {' · '}
          {runnerGroupsCount} runner {pluralize('groups', runnerGroupsCount)}
        </ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}
