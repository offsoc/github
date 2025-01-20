import {type HistoryItem, useSidePanel, useSidePanelBreadcrumbHistory} from '../../hooks/use-side-panel'
import {RepositoryIcon} from '../fields/repository/repository-icon'
import {SidePanelBreadcrumbs} from './breadcrumbs'

const MAX_VISIBLE_BREADCRUMBS = 5

export const SidePanelBreadcrumbsWrapper: React.FC = () => {
  const {openPaneHistoryItem} = useSidePanel()
  const breadcrumbHistory = useSidePanelBreadcrumbHistory()

  const onBreadCrumbClick = (event: React.MouseEvent): void => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (event.metaKey || event.shiftKey || event.button === 1) return
    event.preventDefault()

    const historyId = parseInt(
      // Indexing at history.length - 2 accounts for the fact that the last item in the history stack
      // is included in the breadcrumb, so we must index back two to push the correct item for a back click

      (event.currentTarget as HTMLLinkElement).getAttribute('data-id') ?? (breadcrumbHistory.length - 2).toString(),
    )

    const historyItem: HistoryItem = {
      historyIdx: historyId,
      item: breadcrumbHistory[historyId],
    }
    openPaneHistoryItem(historyItem)
  }

  const currentHistory = [...breadcrumbHistory]
  const breadcrumbs = currentHistory.map((current, index) => {
    const repository = current.getExtendedRepository()
    let repoName = repository?.name || current.getRepositoryName() || ''
    let repoIcon = repository?.url ? <RepositoryIcon repository={repository} /> : undefined

    const isFirstVisibleBreadcrumb =
      index === currentHistory.length - MAX_VISIBLE_BREADCRUMBS ||
      (currentHistory.length < MAX_VISIBLE_BREADCRUMBS && index === 0)

    const prevIssue = currentHistory[index - 1]
    const prevIssueRepoName = (prevIssue && prevIssue.getRepositoryName()) || ''
    if (!isFirstVisibleBreadcrumb && prevIssueRepoName && prevIssueRepoName === repoName) {
      repoName = ''
      repoIcon = undefined
    }

    return {
      url: current.getUrl(),
      repoName,
      repoIcon,
      issueNumber: `#${current.getItemNumber()}`,
      id: index,
    }
  })

  return <SidePanelBreadcrumbs items={breadcrumbs.slice(-MAX_VISIBLE_BREADCRUMBS)} onClick={onBreadCrumbClick} />
}
