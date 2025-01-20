import {ActionList, ActionMenu} from '@primer/react'
import {graphql, type PreloadedQuery, useFragment, usePreloadedQuery, useRelayEnvironment} from 'react-relay'

import {LABELS} from '../../../constants/labels'
import {Section} from '@github-ui/issue-metadata/Section'
import {ParentIssue} from './ParentIssue'
import {RepositoryAndIssuePicker} from '@github-ui/sub-issues/RepositoryAndIssuePicker'
import type React from 'react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {setParentMutation} from '../../../mutations/set-parent-mutation'
import {SectionHeader} from '@github-ui/issue-metadata/SectionHeader'
import {ReadonlySectionHeader} from '@github-ui/issue-metadata/ReadonlySectionHeader'
import type {IssuePickerItem} from '@github-ui/item-picker/IssuePicker'
import {commitRemoveSubIssueMutation} from '@github-ui/sub-issues/commitRemoveSubIssueMutation'
import type {RelationshipsSectionFragment$key} from './__generated__/RelationshipsSectionFragment.graphql'
import type {RelationshipsSectionQuery} from './__generated__/RelationshipsSectionQuery.graphql'
import {GlobalCommands, CommandActionListItem} from '@github-ui/ui-commands'
import {useAlert} from '@github-ui/sub-issues/useAlert'
import {SubIssueAlertDialog} from '@github-ui/sub-issues/SubIssueAlertDialog'
import {useCanEditSubIssues} from '@github-ui/sub-issues/useCanEditSubIssues'

export const RelationshipsSectionGraphqlQuery = graphql`
  query RelationshipsSectionQuery($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        ...RelationshipsSectionFragment
      }
    }
  }
`

const RelationshipsSectionFragment = graphql`
  fragment RelationshipsSectionFragment on Issue {
    id
    repository {
      nameWithOwner
      owner {
        login
      }
    }
    parent {
      id
      ...ParentIssueFragment
    }
    ...useCanEditSubIssues
  }
`

type RelationshipsSectionProps = {
  queryRef: PreloadedQuery<RelationshipsSectionQuery>
  onLinkClick?: (event: MouseEvent) => void
  insideSidePanel?: boolean
}

type RelationshipsSectionInternalProps = Omit<RelationshipsSectionProps, 'queryRef'> & {
  issue: RelationshipsSectionFragment$key
  insideSidePanel?: boolean
}

export function RelationshipsSectionFallback() {
  return (
    <Section
      sectionHeader={<ReadonlySectionHeader title={LABELS.sectionTitles.relationships} />}
      emptyText={LABELS.emptySections.relationships}
    />
  )
}

export function RelationshipsSection({queryRef, ...rest}: RelationshipsSectionProps) {
  const preloadedData = usePreloadedQuery<RelationshipsSectionQuery>(RelationshipsSectionGraphqlQuery, queryRef)
  return preloadedData.repository && preloadedData.repository.issue ? (
    <RelationshipsSectionInternal issue={preloadedData.repository.issue} {...rest} />
  ) : null
}

export function RelationshipsSectionInternal({issue, onLinkClick, insideSidePanel}: RelationshipsSectionInternalProps) {
  const fragmentIssue = useFragment(RelationshipsSectionFragment, issue)
  const {parent, repository, id} = fragmentIssue

  const environment = useRelayEnvironment()
  const {alert, resetAlert, showServerAlert} = useAlert()
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [pickerType, setPickerType] = useState<'Issue' | 'Repository' | null>(null)
  const canEditSubIssues = useCanEditSubIssues(fragmentIssue)

  useEffect(() => {
    if (menuOpen) {
      setPickerType(null)
    }
  }, [menuOpen])

  /**
   * When the issue-viewer is rendered within the side-panel, two issue-viewers are rendered at a time. This results
   * in `<GlobalCommands>` activating both pickers at once. To remedy this, we check if the side-panel is open and
   * whether or not the current issue-viewer is within the side-panel.
   *
   * If insideSidePanel is false, the issue-viewer is not inside the open side-panel.
   * If insideSidePanel is undefined, the side panel is not open.
   */
  const shouldAcceptCommand = insideSidePanel || insideSidePanel === undefined

  const onIssueSelection = useCallback(
    (selectedIssue: IssuePickerItem[]) => {
      if (!selectedIssue[0]) {
        // No selected issue means that an issue was deselected, so we remove the parent if there is one
        if (parent) {
          commitRemoveSubIssueMutation({
            environment,
            input: {
              issueId: parent.id,
              subIssueId: id,
            },
          })
        }
      } else {
        setParentMutation({
          environment,
          input: {
            subIssueId: id,
            issueId: selectedIssue[0].id,
            replaceParent: true,
          },
          onError: error => {
            showServerAlert(error)
          },
        })
      }
    },
    [environment, id, parent, showServerAlert],
  )

  const onPickerTypeChange = useCallback((t: 'Issue' | 'Repository' | null) => setPickerType(t), [setPickerType])

  const sectionHeaderRef = useRef<HTMLButtonElement | null>(null)
  return (
    <Section
      emptyText={parent ? undefined : LABELS.emptySections.relationships}
      sectionHeader={
        <>
          {shouldAcceptCommand && (
            <GlobalCommands
              commands={{
                'issue-viewer:edit-parent': () => {
                  // Close relationship type menu in case it's open
                  setMenuOpen(false)
                  setPickerType('Issue')
                },
              }}
            />
          )}
          {/* We render the section header separate of both the picker and the action menu that will anchor to it.
              we set up a ref for those other elements to use to anchor to instead */}
          <SectionHeader
            ref={sectionHeaderRef}
            buttonProps={{
              onClick: () => setMenuOpen(o => !o),
            }}
            readonly={!canEditSubIssues}
            title={LABELS.sectionTitles.relationships}
          />
          <RepositoryAndIssuePicker
            onPickerTypeChange={onPickerTypeChange}
            selectedIssueIds={parent ? [parent.id] : []}
            hiddenIssueIds={[id]}
            onIssueSelection={onIssueSelection}
            organization={repository.owner.login}
            defaultRepositoryNameWithOwner={repository.nameWithOwner}
            pickerType={pickerType}
            // As currently designed, the ItemPicker requires an element to render as the anchor. This gets eventually
            // passed down to the SelectPanel which will handle rendering this element. In reality though, we don't want
            // this component to be responsible for rendering an element, we just want it to attach to the ref to an
            // existing anchor, so we do that here and return an empty element to "render"
            anchorElement={props => {
              const {ref} = props as {
                ref: React.MutableRefObject<HTMLButtonElement | null>
              }
              if (ref) {
                ref.current = sectionHeaderRef.current
              }
              // We don't actually want to render any element, as we are relying on the rendered section header above
              return <></>
            }}
          />
          <ActionMenu open={menuOpen} onOpenChange={open => setMenuOpen(open)} anchorRef={sectionHeaderRef}>
            <ActionMenu.Overlay width="small">
              <ActionList>
                <ActionList.Group>
                  <CommandActionListItem commandId="issue-viewer:edit-parent">
                    {parent ? 'Change or remove parent' : 'Add parent'}
                  </CommandActionListItem>
                </ActionList.Group>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </>
      }
    >
      {alert && (
        <SubIssueAlertDialog title={alert.title} onClose={resetAlert}>
          {alert.body}
        </SubIssueAlertDialog>
      )}
      {parent && (
        <ActionList sx={{py: 0, px: 0, width: '100%'}} variant={'full'}>
          <ActionList.Group>
            <ActionList.GroupHeading sx={{fontWeight: 'normal'}} as="h4">
              {LABELS.relationNames.parentIssue}
            </ActionList.GroupHeading>
            <ParentIssue onLinkClick={onLinkClick} issueKey={parent} />
          </ActionList.Group>
        </ActionList>
      )}
    </Section>
  )
}
