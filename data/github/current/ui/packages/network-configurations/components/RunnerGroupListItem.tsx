import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItem} from '@github-ui/list-view/ListItem'
import {IconButton} from '@primer/react'
import {LinkExternalIcon} from '@primer/octicons-react'
import {NetworkConfigurationConsts} from '../constants/network-configuration-consts'
import {useNavigate} from '@github-ui/use-navigate'

interface IRunnerGroupListItemProps {
  runnerGroupPath: string
  id: string
  name: string
  allowPublic: boolean
  visibility: string
  selectedTargetsCount: number
}

export function RunnerGroupListItem(props: IRunnerGroupListItemProps) {
  const navigate = useNavigate()
  const publicRepo = props.allowPublic ? 'including' : 'excluding'
  const numberOfSelected = props.visibility === 'Selected' ? ` (${props.selectedTargetsCount})` : ''
  const runnerGroupItemUrl = NetworkConfigurationConsts.runnerGroupItemUrl(props.runnerGroupPath, props.id)
  return (
    <>
      <ListItem
        title={<ListItemTitle value={props.name} onClick={() => navigate(runnerGroupItemUrl)} />}
        metadata={
          <ListItemMetadata alignment="right">
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              icon={LinkExternalIcon}
              aria-label="Edit icon"
              size="medium"
              variant="invisible"
              sx={{color: 'fg.muted'}}
              onClick={() => navigate(runnerGroupItemUrl)}
            />
          </ListItemMetadata>
        }
        sx={{pl: 2}}
      >
        <ListItemMainContent>
          <ListItemDescription>
            {props.visibility} organization{numberOfSelected}, {publicRepo} public repositories
          </ListItemDescription>
        </ListItemMainContent>
      </ListItem>
    </>
  )
}
