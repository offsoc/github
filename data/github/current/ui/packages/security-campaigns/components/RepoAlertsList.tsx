import {useCallback, useMemo, useRef, useState} from 'react'
import {ActionList, AnchoredOverlay, Button} from '@primer/react'
import type {ActionBarProps} from '@github-ui/action-bar'
import {AlertsListItems} from './AlertsListItems'
import {AlertsList, defaultQuery} from './AlertsList'
import {AlertListItem} from './AlertListItem'
import {CreateBranchDialog, type BranchNextStep, type BranchType} from './CreateBranchDialog'
import {BranchNextStepLocal} from './BranchNextStepLocal'
import {BranchNextStepDesktop} from './BranchNextStepDesktop'
import {BranchNextStepFlashes} from './BranchNextStepFlashes'
import {CloseAlertOverlay} from './CloseAlertOverlay'
import {useRepoAlertsQuery} from '../hooks/use-repo-alerts-query'
import type {Repository} from '@github-ui/security-campaigns-shared/types/repository'
import type {GetAlertsCursor} from '../types/get-alerts-request'
import pluralize from 'pluralize'
import {GitBranchIcon} from '@primer/octicons-react'
import {useNavigate} from '@github-ui/use-navigate'

export type RepoAlertsListProps = {
  alertsPath: string
  repository: Repository
  createBranchPath?: string
  closeAlertsPath?: string
}

export function RepoAlertsList({alertsPath, repository, createBranchPath, closeAlertsPath}: RepoAlertsListProps) {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set<number>())
  const onSelect = useCallback(
    (id: number, selected: boolean) => {
      setSelectedItems(prev => {
        const newSelectedItems = new Set<number>(prev)
        if (selected) {
          newSelectedItems.add(id)
        } else {
          newSelectedItems.delete(id)
        }
        return newSelectedItems
      })
    },
    [setSelectedItems],
  )

  const chooseBranchTypeAnchorRef = useRef(null)
  const [showChooseBranchType, setShowChooseBranchType] = useState(false)
  const [selectedBranchType, setSelectedBranchType] = useState<BranchType>('new')

  const [showCreateBranchDialog, setShowCreateBranchDialog] = useState(false)
  const [branchNextStep, setBranchNextStep] = useState<BranchNextStep>('none')
  const [newBranchName, setNewBranchName] = useState<string | null>(null)
  const [errorMessages, setErrorMessages] = useState<string[]>([])

  const handleChooseBranchType = (branchType: BranchType) => {
    setSelectedBranchType(branchType)
    setShowCreateBranchDialog(true)
  }

  const navigate = useNavigate()

  const handleCloseBranch = (
    nextStep: BranchNextStep,
    branchName: string | null,
    pullRequestPath: string | null,
    newErrorMessages?: string[],
  ) => {
    if (nextStep === 'pr' && pullRequestPath) {
      navigate(pullRequestPath)
    } else {
      setShowCreateBranchDialog(false)
      setNewBranchName(branchName)
      setBranchNextStep(nextStep)
      setErrorMessages(newErrorMessages ?? [])
    }
  }

  const [showCloseAlertOverlay, setShowCloseAlertOverlay] = useState(false)

  const handleCloseAs = () => {
    setShowCloseAlertOverlay(true)
  }

  const handleBranchNextStepDialogClose = () => {
    setBranchNextStep('none')
    setSelectedItems(new Set())
  }

  const [query, setQuery] = useState<string>(defaultQuery)
  const [cursor, setCursor] = useState<GetAlertsCursor | null>(null)
  const alertsQuery = useRepoAlertsQuery(alertsPath, {query, cursor})
  const alerts = useMemo(() => alertsQuery.data?.alerts ?? [], [alertsQuery.data])

  const onStateFilterChange = (state: 'open' | 'closed') => {
    setQuery(`is:${state}`)
  }

  const onToggleSelectAll = useCallback(
    (isSelectAllChecked: boolean) => {
      setSelectedItems(new Set<number>(isSelectAllChecked ? alerts.map(alert => alert.number) : []))
    },
    [setSelectedItems, alerts],
  )

  const selectedCount = selectedItems.size
  const closedSelectedAlertsCount = alerts.filter(
    alert => selectedItems.has(alert.number) && (alert.isDismissed || alert.isFixed),
  ).length
  const allSelectedAlertsAreClosed = selectedCount === closedSelectedAlertsCount
  const someSelectedAlertsAreClosed = closedSelectedAlertsCount > 0

  const selectedItemsWithSuggestedFixes = alerts
    .filter(alert => selectedItems.has(alert.number) && alert.hasSuggestedFix)
    .map(alert => alert.number)

  const handleCreateBranch = useCallback(() => {
    if (selectedItemsWithSuggestedFixes.length > 0) {
      setShowChooseBranchType(true)
    } else {
      setSelectedBranchType('new')
      setShowChooseBranchType(false)
      setShowCreateBranchDialog(true)
    }
  }, [selectedItemsWithSuggestedFixes.length])

  const actions = useMemo<ActionBarProps['actions']>(() => {
    if (selectedCount === 0) return []

    const visibleActions: ActionBarProps['actions'] = [
      {
        key: 'closeAlerts',
        render: isOverflowMenu => {
          return isOverflowMenu ? (
            <ActionList.Item
              aria-haspopup="true"
              aria-expanded={showCloseAlertOverlay}
              disabled={allSelectedAlertsAreClosed}
              onSelect={handleCloseAs}
            >
              Close alerts
            </ActionList.Item>
          ) : (
            <Button
              aria-haspopup="true"
              aria-expanded={showCloseAlertOverlay}
              disabled={allSelectedAlertsAreClosed}
              onClick={handleCloseAs}
            >
              Close alerts
            </Button>
          )
        },
      },
    ]

    if (createBranchPath) {
      visibleActions.push({
        key: 'createBranch',
        render: isOverflowMenu => {
          const createBranchText =
            selectedItemsWithSuggestedFixes.length > 0
              ? `Commit ${pluralize('autofix', selectedItemsWithSuggestedFixes.length)}`
              : 'Create new branch'
          return isOverflowMenu ? (
            <ActionList.Item
              ref={chooseBranchTypeAnchorRef}
              aria-haspopup={selectedItemsWithSuggestedFixes.length > 0}
              aria-expanded={showChooseBranchType}
              disabled={allSelectedAlertsAreClosed}
              onSelect={handleCreateBranch}
            >
              <ActionList.LeadingVisual>
                <GitBranchIcon />
              </ActionList.LeadingVisual>
              {createBranchText}
            </ActionList.Item>
          ) : (
            <Button
              leadingVisual={GitBranchIcon}
              ref={chooseBranchTypeAnchorRef}
              aria-haspopup={selectedItemsWithSuggestedFixes.length > 0}
              aria-expanded={showChooseBranchType}
              disabled={allSelectedAlertsAreClosed}
              onClick={handleCreateBranch}
            >
              {createBranchText}
            </Button>
          )
        },
      })
    }

    return visibleActions
  }, [
    selectedItemsWithSuggestedFixes.length,
    allSelectedAlertsAreClosed,
    createBranchPath,
    handleCreateBranch,
    selectedCount,
    showChooseBranchType,
    showCloseAlertOverlay,
  ])

  return (
    <>
      <AlertsList
        onToggleSelectAll={onToggleSelectAll}
        openCount={alertsQuery.data?.openCount}
        closedCount={alertsQuery.data?.closedCount}
        prevCursor={alertsQuery.data?.prevCursor}
        nextCursor={alertsQuery.data?.nextCursor}
        isLoading={alertsQuery.isLoading}
        isError={alertsQuery.isError}
        query={query}
        onStateFilterChange={onStateFilterChange}
        onCursorChange={setCursor}
        setSelectedItems={setSelectedItems}
        isSelectable
        actions={actions}
      >
        <AlertsListItems
          alerts={alerts}
          query={query}
          isLoading={alertsQuery.isLoading}
          isError={alertsQuery.isError}
          renderAlert={alert => (
            <AlertListItem
              alert={alert}
              onSelect={isSelected => onSelect(alert.number, isSelected)}
              isSelected={selectedItems.has(alert.number)}
              showSuggestedFixLabel
              showSeverityLabel
            />
          )}
        />
      </AlertsList>
      {closeAlertsPath && showCloseAlertOverlay && (
        <CloseAlertOverlay
          setOpen={setShowCloseAlertOverlay}
          closeAlertsPath={closeAlertsPath}
          alertNumbers={Array.from(selectedItems)}
        />
      )}
      <AnchoredOverlay
        anchorRef={chooseBranchTypeAnchorRef}
        renderAnchor={null}
        open={showChooseBranchType}
        onOpen={() => setShowChooseBranchType(true)}
        onClose={() => setShowChooseBranchType(false)}
        focusZoneSettings={{disabled: true}}
        align="end"
      >
        <ActionList>
          <ActionList.Item onSelect={() => handleChooseBranchType('new')}>Commit to new branch</ActionList.Item>
          <ActionList.Item onSelect={() => handleChooseBranchType('existing')}>Commit to branch</ActionList.Item>
        </ActionList>
      </AnchoredOverlay>
      {createBranchPath && showCreateBranchDialog && (
        <CreateBranchDialog
          alertNumbers={Array.from(selectedItems)}
          alertNumbersWithSuggestedFixes={selectedItemsWithSuggestedFixes}
          repository={repository}
          createPath={createBranchPath}
          onClose={handleCloseBranch}
          someSelectedAlertsAreClosed={someSelectedAlertsAreClosed}
          branchType={selectedBranchType}
        />
      )}
      {branchNextStep === 'local' && (
        <BranchNextStepLocal
          branch={newBranchName}
          onClose={handleBranchNextStepDialogClose}
          flashes={<BranchNextStepFlashes errorMessages={errorMessages} />}
        />
      )}
      {branchNextStep === 'desktop' && (
        <BranchNextStepDesktop
          owner={repository.ownerLogin}
          repository={repository.name}
          branch={newBranchName}
          onClose={handleBranchNextStepDialogClose}
          flashes={<BranchNextStepFlashes errorMessages={errorMessages} />}
        />
      )}
    </>
  )
}
