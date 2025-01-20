import type {Action} from '@github-ui/action-bar'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {noop} from '@github-ui/noop'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {
  type Icon,
  IssueOpenedIcon,
  MilestoneIcon,
  PeopleIcon,
  ProjectSymlinkIcon,
  RocketIcon,
  TagIcon,
} from '@primer/octicons-react'
import {ActionList, Button} from '@primer/react'
import {Suspense, useCallback, useMemo, useState} from 'react'

import type {AppPayload} from '../../../types/app-payload'
import {AddToProjectsAction} from './AddToProjectsAction'
import {ApplyAssigneesAction} from './ApplyAssigneesAction'
import {ApplyIssueTypeAction} from './ApplyIssueTypeAction'
import {ApplyLabelsAction} from './ApplyLabelsAction'
import {ApplyMilestoneAction} from './ApplyMilestoneAction'
import type {ListItemsHeaderProps} from './ListItemsHeader'
import {VALUES} from '../../../constants/values'
import {BUTTON_LABELS} from '../../../constants/buttons'
import {LABELS} from '../../../constants/labels'
import {useQueryEditContext, useQueryContext} from '../../../contexts/QueryContext'
import {MarkAs} from '../actions/MarkAs'
import type {IssueNodeType, ItemNodeType} from '../ListItems'
import {useListViewMultiPageSelection} from '@github-ui/list-view/ListViewMultiPageSelectionContext'
import {useListViewSelection} from '@github-ui/list-view/ListViewSelectionContext'

function ListItemsHeaderBulkFallback() {
  const renderFake = useCallback((isOverflowing: boolean, LeadingVisual: Icon, anchorText: string) => {
    if (isOverflowing) {
      return (
        <ActionList.Item disabled={true}>
          <ActionList.LeadingVisual>
            <LeadingVisual />
          </ActionList.LeadingVisual>
          {anchorText}
        </ActionList.Item>
      )
    }

    return (
      <Button disabled={true} leadingVisual={LeadingVisual}>
        {anchorText}
      </Button>
    )
  }, [])

  // This array should be in sync with the actions array populating the actual component
  const actions = useMemo(
    () => [
      {
        key: 'mark-as',
        render: (isOverflowMenu: boolean) => renderFake(isOverflowMenu, VALUES.issueIcons.CLOSED.icon, 'Mark as'),
      },
      {
        key: 'apply-labels',
        render: (isOverflowMenu: boolean) => renderFake(isOverflowMenu, TagIcon, 'Label'),
      },
      {
        key: 'apply-assignees',
        render: (isOverflowMenu: boolean) => renderFake(isOverflowMenu, PeopleIcon, 'Assign'),
      },
      {
        key: 'add-to-projects',
        render: (isOverflowMenu: boolean) => renderFake(isOverflowMenu, ProjectSymlinkIcon, 'Project'),
      },
      {
        key: 'apply-milestone',
        render: (isOverflowMenu: boolean) => renderFake(isOverflowMenu, MilestoneIcon, 'Milestone'),
      },
      {
        key: 'apply-issue-type',
        render: (isOverflowMenu: boolean) => renderFake(isOverflowMenu, IssueOpenedIcon, BUTTON_LABELS.setIssueType),
      },
    ],
    [renderFake],
  )

  return (
    <ListViewMetadata onToggleSelectAll={noop} actionsLabel={LABELS.bulkActions} actions={actions} density={'normal'} />
  )
}

export function ListItemsHeaderWithBulkActions({
  checkedItems,
  issueNodes,
  setCheckedItems,
  useBulkActions,
}: ListItemsHeaderProps) {
  const issueTypesFFEnabled = useFeatureFlag('issue_types')
  const {scoped_repository, current_user_settings} = useAppPayload<AppPayload>()

  const {addToast, addPersistedToast} = useToastContext()
  const {setBulkJobId, bulkJobId} = useQueryEditContext()

  const isIssueNode = (node: ItemNodeType): node is IssueNodeType => node.__typename === 'Issue'
  const issuesToActOn: IssueNodeType[] = Array.from(checkedItems.values())
    .filter(v => v != null)
    .filter(isIssueNode)

  const [isBulkActionRunning, setIsBulkActionRunning] = useState(bulkJobId !== null)
  const {activeSearchQuery, isQueryLoading} = useQueryContext()
  const {setMultiPageSelectionAllowed} = useListViewMultiPageSelection()

  const bulkActionCompleted = useCallback(
    (jobId?: string) => {
      setIsBulkActionRunning(false)
      if (jobId) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addPersistedToast({
          type: 'info',
          message: LABELS.updatingIssues,
          icon: <RocketIcon />,
          role: 'status',
        })
        setBulkJobId(jobId)
      }
    },
    [addPersistedToast, setBulkJobId],
  )

  const bulkActionError = useCallback(
    (error: Error) => {
      setIsBulkActionRunning(false)
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: `Could not update issues: ${error.message}`,
      })
    },
    [addToast],
  )

  const [useSearchQueryForBulk, setUseSearchQueryForBulk] = useState(false)
  const sharedActionProps = useMemo(
    () => ({
      useQueryForAction: useSearchQueryForBulk,
      onCompleted: bulkActionCompleted,
      onError: bulkActionError,
      disabled: isBulkActionRunning,
      issuesToActOn: useSearchQueryForBulk
        ? issueNodes.filter(node => node != null).map(node => node.id)
        : issuesToActOn.filter(node => node != null).map(node => node.id),
      query: activeSearchQuery,
      singleKeyShortcutsEnabled: current_user_settings?.use_single_key_shortcut || false,
    }),
    [
      useSearchQueryForBulk,
      bulkActionCompleted,
      bulkActionError,
      isBulkActionRunning,
      issueNodes,
      issuesToActOn,
      activeSearchQuery,
      current_user_settings?.use_single_key_shortcut,
    ],
  )
  const {setSelectedCount} = useListViewSelection()

  const onToggleSelectAll = useCallback(
    (isSelectAllChecked: boolean) => {
      if (isSelectAllChecked) {
        setCheckedItems(
          issueNodes.filter(node => node != null).reduce((map, node) => map.set(node.id, node), new Map()),
        )
      } else {
        setCheckedItems(new Map())
        if (useSearchQueryForBulk) {
          setUseSearchQueryForBulk(false)
          setSelectedCount(0)
          setMultiPageSelectionAllowed?.(false)
        }
      }
    },
    [issueNodes, setCheckedItems, setMultiPageSelectionAllowed, setSelectedCount, useSearchQueryForBulk],
  )

  const shouldRenderBulkActions = scoped_repository && useBulkActions

  const analyticsMetadata = useMemo(
    () => ({
      owner: scoped_repository?.owner ?? '',
      repositoryName: scoped_repository?.name ?? '',
    }),
    [scoped_repository?.name, scoped_repository?.owner],
  )

  // This array should be in sync with the actions array populating the fallback component
  const actions = useMemo<Action[] | undefined>(() => {
    if (!shouldRenderBulkActions) return
    const issueIds = issuesToActOn.map(i => i.id)
    const actionList = [
      {
        key: 'mark-as',
        render: (isOverflowMenu: boolean) => (
          <MarkAs {...sharedActionProps} nested={isOverflowMenu} repositoryId={scoped_repository.id} />
        ),
      },
      {
        key: 'apply-labels',
        render: (isOverflowMenu: boolean) => (
          <ApplyLabelsAction
            owner={scoped_repository.owner}
            repo={scoped_repository.name}
            nested={isOverflowMenu}
            issueIds={issueIds}
            {...sharedActionProps}
            repositoryId={scoped_repository?.id}
          />
        ),
      },
      {
        key: 'apply-assignees',
        render: (isOverflowMenu: boolean) => (
          <ApplyAssigneesAction
            nested={isOverflowMenu}
            issueIds={issueIds}
            {...sharedActionProps}
            repositoryId={scoped_repository?.id}
            owner={scoped_repository?.owner}
            repo={scoped_repository?.name}
          />
        ),
      },
      {
        key: 'add-to-projects',
        render: (isOverflowMenu: boolean) => (
          <AddToProjectsAction
            nested={isOverflowMenu}
            issueNodes={issuesToActOn}
            repositoryId={scoped_repository?.id}
            owner={scoped_repository?.owner}
            repo={scoped_repository?.name}
            {...sharedActionProps}
          />
        ),
      },
      {
        key: 'apply-milestone',
        render: (isOverflowMenu: boolean) => (
          <ApplyMilestoneAction
            owner={scoped_repository.owner}
            repo={scoped_repository.name}
            nested={isOverflowMenu}
            issueIds={issuesToActOn.map(i => i.id)}
            repositoryId={scoped_repository.id}
            {...sharedActionProps}
          />
        ),
      },
    ]

    if (issueTypesFFEnabled)
      actionList.push({
        key: 'apply-issue-type',
        render: (isOverflowMenu: boolean) => (
          <AnalyticsProvider appName="issue_types" category="issues_index" metadata={analyticsMetadata}>
            <ApplyIssueTypeAction
              owner={scoped_repository.owner}
              repo={scoped_repository.name}
              nested={isOverflowMenu}
              issueIds={issueIds}
              repositoryId={scoped_repository?.id}
              {...sharedActionProps}
            />
          </AnalyticsProvider>
        ),
      })

    return actionList
  }, [
    shouldRenderBulkActions,
    issueTypesFFEnabled,
    sharedActionProps,
    scoped_repository?.id,
    scoped_repository?.owner,
    scoped_repository?.name,
    issuesToActOn,
    analyticsMetadata,
  ])

  return (
    <Suspense fallback={<ListItemsHeaderBulkFallback />}>
      <ListViewMetadata
        onToggleSelectAll={onToggleSelectAll}
        actionsLabel={LABELS.bulkActions}
        actions={actions}
        density={'normal'}
        assistiveAnnouncement={isQueryLoading ? LABELS.loadingQueryResults : undefined}
      />
    </Suspense>
  )
}
