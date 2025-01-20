import {ActionList, IconButton} from '@primer/react'
import {RepoIcon, XIcon} from '@primer/octicons-react'
import {Link} from '@github-ui/react-core/link'
import {TreeListItem} from './TreeListItem'
import type {GroupTree} from '../types'
import {ListItemActionBar} from '@github-ui/list-view/ListItemActionBar'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'
import {repositoryPath} from '@github-ui/paths'
import {RecursiveGroupProvider, type RecursiveGroupContextProps} from '../contexts/RecursiveGroupContext'
import {useMaxDepth} from '../contexts/MaxDepthContext'
import {useOrganization} from '../contexts/OrganizationContext'

type InnerRecursiveGroupProps = {
  tree: GroupTree
  depth?: number
  showTopLevelRepos?: boolean
  onRemoveRepository?: (id: number) => void
}

type RecursiveGroupProps = RecursiveGroupContextProps & InnerRecursiveGroupProps

export function RecursiveGroup({
  tree,
  depth = 0,
  collapse,
  hideGroupActions = false,
  showTopLevelRepos = false,
  onRemoveRepository,
  onRemoveGroup,
}: RecursiveGroupProps) {
  return (
    <RecursiveGroupProvider collapse={collapse} hideGroupActions={hideGroupActions} onRemoveGroup={onRemoveGroup}>
      <InnerRecursiveGroup
        tree={tree}
        depth={depth}
        showTopLevelRepos={showTopLevelRepos}
        onRemoveRepository={onRemoveRepository}
      />
    </RecursiveGroupProvider>
  )
}

export function InnerRecursiveGroup({
  tree,
  depth = 0,
  showTopLevelRepos = false,
  onRemoveRepository,
}: InnerRecursiveGroupProps) {
  const organization = useOrganization()
  const maxDepth = useMaxDepth()
  if (depth >= maxDepth) {
    throw new Error(`Group rendered at depth ${depth}, max depth is ${maxDepth}`)
  }
  if (!tree) {
    return null
  }
  const nodes = tree.nodes || []
  if (nodes.length === 0 && tree.repos?.length === 0) {
    return null
  }

  const keys = Object.keys(nodes)

  return (
    <>
      {keys.map(key => {
        //@ts-expect-error ts doesn't like hashes :shrug:
        const node = nodes[key]
        return (
          <TreeListItem key={key} id={node.id} group_path={key} depth={depth} total_count={node.total_count}>
            <InnerRecursiveGroup tree={node} depth={depth + 1} />
          </TreeListItem>
        )
      })}
      {showTopLevelRepos &&
        tree.repos?.map(repo => (
          <ListItem
            key={repo.id}
            title={
              <ListItemTitle
                value={repo.name}
                href="#"
                linkProps={{
                  as: Link,
                  to: repositoryPath({owner: organization.name, repo: repo.name}),
                }}
              />
            }
            sx={{
              borderLeft: '1px solid var(--borderColor-default)',
              borderRight: '1px solid var(--borderColor-default)',
              '&:last-child': {
                borderBottom: '1px solid var(--borderColor-default)',
              },
            }}
            secondaryActions={
              onRemoveRepository ? (
                <ListItemActionBar
                  actions={[
                    {
                      key: 'remove-repository',
                      render: isOverflowMenu =>
                        isOverflowMenu ? (
                          <ActionList.Item onSelect={() => onRemoveRepository(repo.id)}>
                            <ActionList.LeadingVisual>
                              <XIcon />
                            </ActionList.LeadingVisual>
                            Remove {repo.name}
                          </ActionList.Item>
                        ) : (
                          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
                          <IconButton
                            variant="invisible"
                            icon={XIcon}
                            aria-label={`Remove ${repo.name}`}
                            onClick={() => onRemoveRepository(repo.id)}
                            unsafeDisableTooltip={true}
                          />
                        ),
                    },
                  ]}
                />
              ) : undefined
            }
          >
            <ListItemLeadingContent
              sx={{
                pl: `calc(48px + var(--base-size-16) * ${depth})`,
              }}
            >
              <ListItemLeadingVisual
                color="var(--treeViewItem-leadingVisual-iconColor-rest, var(--color-icon-directory))"
                icon={RepoIcon}
              />
            </ListItemLeadingContent>
          </ListItem>
        ))}
    </>
  )
}
