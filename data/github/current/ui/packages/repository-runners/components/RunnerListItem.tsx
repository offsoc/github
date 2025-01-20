import {ListItemActionBar} from '@github-ui/list-view/ListItemActionBar'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'
import {Label, ActionList} from '@primer/react'
import {MarkGithubIcon, ServerIcon} from '@primer/octicons-react'
import {testIdProps} from '@github-ui/test-id-props'
import {useClipboard} from '@github-ui/use-clipboard'

import {LinuxIcon} from './icons/LinuxIcon'
import {MacOSIcon} from './icons/MacOSIcon'
import {WindowsIcon} from './icons/WindowsIcon'

type RunnerListItemProps = {
  name: string
  os: string
  description: string
  labels: string[]
  source: string
  runnerType: 'larger_runner' | 'shared_runner' | 'repo_self_hosted' | 'repo_scale_set'
}

export function RunnerListItem({name, os, description, labels, source, runnerType}: RunnerListItemProps) {
  const {copyToClipboard} = useClipboard()
  const copyLabel = copyToClipboard({
    textToCopy: name,
    payload: {
      category: 'repository_runners',
      action: 'click_to_copy_runner_label',
      label: `ref_cta:copy_label;ref_loc:actions_runners;ref_label:${name};runner_type:${runnerType};source:${source}`,
    },
  })

  let icon = <ListItemLeadingVisual icon={MarkGithubIcon} color="fg.subtle" {...testIdProps('github-icon')} />

  if (os === 'linux') {
    icon = (
      <ListItemLeadingVisual
        icon={LinuxIcon}
        description="Linux icon"
        color="fg.subtle"
        {...testIdProps('linux-icon')}
      />
    )
  } else if (os === 'macos') {
    icon = (
      <ListItemLeadingVisual
        icon={MacOSIcon}
        description="MacOS icon"
        color="fg.subtle"
        {...testIdProps('macos-icon')}
      />
    )
  } else if (os === 'windows') {
    icon = (
      <ListItemLeadingVisual
        icon={WindowsIcon}
        description="Windows icon"
        color="fg.subtle"
        {...testIdProps('windows-icon')}
      />
    )
  } else if (os === 'arc') {
    icon = (
      <ListItemLeadingVisual
        icon={ServerIcon}
        description="Server icon"
        color="fg.subtle"
        {...testIdProps('arc-icon')}
      />
    )
  }

  return (
    <ListItem
      title={
        <ListItemTitle
          value={name}
          containerSx={{
            display: 'inline-flex',
            justifyContent: 'flex-start',
            flexShrink: 1,
            flexWrap: 'wrap',
            rowGap: 1,
            columnGap: 2,
            alignItems: 'center',
          }}
          headingSx={{fontWeight: '600'}}
        >
          <Label key={`${name}-${source}`} variant="accent">
            {source}
          </Label>
          {labels.map(label => (
            <Label key={`${name}-${label}`}>{label}</Label>
          ))}
        </ListItemTitle>
      }
      secondaryActions={
        <ListItemActionBar
          label="Runner actions"
          staticMenuActions={[
            {
              key: 'copy-label',
              render: () => (
                <ActionList.Item onSelect={copyLabel}>
                  Copy label <span className="sr-only">{name}</span>
                </ActionList.Item>
              ),
            },
          ]}
        />
      }
      {...testIdProps(`${name}-runner-list-item`)}
    >
      <ListItemLeadingContent>{icon}</ListItemLeadingContent>

      <ListItemMainContent>
        <ListItemDescription>{description}</ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}
