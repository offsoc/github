import {Dialog} from '@primer/react/experimental'
import {
  TopRepositories,
  RepositoryPickerPlaceholder,
  RepositoryPickerInternal,
} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerRepository$data} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {RepositoryPickerTopRepositories$key} from '@github-ui/item-picker/RepositoryPickerTopRepositories.graphql'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import {useRelayEnvironment, useLazyLoadQuery} from 'react-relay'
import {Suspense, useCallback, useState} from 'react'
import {commitTransferIssueMutation} from '../../mutations/transfer-issue-mutation'
import type {TransferIssueInput} from '../../mutations/__generated__/transferIssueMutation.graphql'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {BUTTON_LABELS} from '../../constants/buttons'
import {VALUES} from '../../constants/values'
import {LABELS} from '../../constants/labels'
import {ERRORS} from '../../constants/errors'

import {ssrSafeWindow} from '@github-ui/ssr-utils'
// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'
import {Box, Flash, Link} from '@primer/react'

type IssueTransferDialogProps = {
  owner: string
  repository: string
  issueId: string
  isTransferInProgress?: boolean
  isRepoPrivate?: boolean
  onClose: () => void
}
export const IssueTransferDialog = ({owner, ...rest}: IssueTransferDialogProps) => {
  const repos = useLazyLoadQuery<RepositoryPickerTopRepositoriesQuery>(TopRepositories, {
    topRepositoriesFirst: VALUES.issueTransferRepositoriesPreloadCount,
    hasIssuesEnabled: true,
    owner,
  })

  return <IssueTransferDialogInternal {...rest} owner={owner} topRepositoriesData={repos.viewer} />
}

type IssueTransferDialogPropsInternal = IssueTransferDialogProps & {
  topRepositoriesData: RepositoryPickerTopRepositories$key
}

export const IssueTransferDialogInternal = ({
  topRepositoriesData,
  owner,
  repository,
  isRepoPrivate,
  issueId,
  onClose,
  ...props
}: IssueTransferDialogPropsInternal) => {
  const [selectedRepository, setSelectedRepository] = useState<RepositoryPickerRepository$data>()
  const [isTransferring, setIsTransferring] = useState(props.isTransferInProgress)
  const [showWarningRepoUnavailable, setShowWarningRepoUnavailable] = useState(false)
  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()

  const handleTransferIssue = useCallback(() => {
    if (!selectedRepository || isTransferring) return
    setIsTransferring(true)

    const input: TransferIssueInput = {
      repositoryId: selectedRepository.id,
      issueId,
    }

    commitTransferIssueMutation({
      environment,
      input,
      onError: (e: Error) => {
        onClose()
        reportError(formatError(e.message))
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: e.message,
        })
      },
      onCompleted: response => {
        onClose()
        if (response.transferIssue?.issue) {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'info',
            message: LABELS.transfer.started,
          })
          const issue = response.transferIssue?.issue
          if (ssrSafeWindow) {
            ssrSafeWindow.location.href = issue.url
          }
          return
        } else {
          for (const e of response.transferIssue?.errors || []) {
            reportError(formatError(e.message))
          }
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.couldNotStartTransfer,
          })
        }
      },
    })
  }, [addToast, environment, isTransferring, issueId, onClose, selectedRepository])
  const onSelectedRepository = useCallback(
    (repo?: RepositoryPickerRepository$data) => {
      setShowWarningRepoUnavailable(false)
      setSelectedRepository(repo)

      if (!repo) return
      if (!repo.hasIssuesEnabled || repo.isArchived || (isRepoPrivate && !repo.isPrivate)) {
        setShowWarningRepoUnavailable(true)
      }
    },
    [isRepoPrivate],
  )

  const handleOnClose = useCallback(() => {
    setShowWarningRepoUnavailable(false)
    onClose()
  }, [onClose])

  const repositoryFilterForPrivateRepository = useCallback((repo: RepositoryPickerRepository$data) => {
    return repo.isPrivate
  }, [])
  const repositoryFilter = isRepoPrivate ? repositoryFilterForPrivateRepository : undefined

  return (
    <Dialog
      title={LABELS.transfer.title}
      subtitle={LABELS.transfer.subtitle}
      onClose={handleOnClose}
      footerButtons={[
        {content: BUTTON_LABELS.cancel, onClick: handleOnClose, disabled: isTransferring},
        {
          content: BUTTON_LABELS.transferIssue,
          buttonType: 'primary',
          onClick: handleTransferIssue,
          disabled: !selectedRepository || isTransferring,
        },
      ]}
    >
      <Suspense fallback={<RepositoryPickerPlaceholder />}>
        <RepositoryPickerInternal
          initialRepository={selectedRepository}
          topRepositoriesData={topRepositoriesData}
          onSelect={onSelectedRepository}
          organization={owner}
          options={{readonly: isTransferring}}
          exclude={`${owner}/${repository}`}
          repositoryFilter={repositoryFilter}
          customNoResultsItem={noResultsItem}
          repoNameOnly={true}
        />
      </Suspense>
      {showWarningRepoUnavailable && (
        <Flash aria-live="polite" sx={{mt: 3}}>
          {LABELS.transfer.repoUnavailable}
          &nbsp;
          <Link
            as="a"
            target="_blank"
            href="https://docs.github.com/issues/tracking-your-work-with-issues/transferring-an-issue-to-another-repository"
          >
            Learn more
          </Link>
        </Flash>
      )}
    </Dialog>
  )
}

function formatError(message: string) {
  return new Error(`Issue transfer mutation failed with error:${message}`)
}

const noResultsItem = (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      fontSize: '12px',
    }}
  >
    <span>No repositories match.</span>
    <Link href="https://docs.github.com/en/issues/tracking-your-work-with-issues/transferring-an-issue-to-another-repository">
      Some repositories may be excluded.
    </Link>
  </Box>
)
