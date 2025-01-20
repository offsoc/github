import {Box, Link, Text, Flash} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {deleteBranch} from './BranchActionMenu'
import type {PullRequest} from '../types'
import type {Repository} from '@github-ui/current-repository'
import {useState} from 'react'

export interface DeleteBranchDialogProps {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
  setDeleting: (isDeleting: boolean) => void
  branchName: string
  deletedBranches: string[]
  onDeletedBranchesChange: (newBranches: string[]) => void
  pullRequest: PullRequest
  repo: Repository
}

export function DeleteBranchDialog({
  showModal,
  setShowModal,
  setDeleting,
  branchName,
  deletedBranches,
  onDeletedBranchesChange,
  pullRequest,
  repo,
}: DeleteBranchDialogProps) {
  const [showErrorBanner, setShowErrorBanner] = useState(false)

  return (
    <>
      {showModal && (
        <Dialog
          title="Delete branch"
          width="large"
          onClose={() => {
            setShowModal(false)
          }}
          footerButtons={[
            {
              content: 'Cancel',
              buttonType: 'normal',
              onClick: () => {
                setShowModal(false)
              },
            },
            {
              content: 'Delete',
              buttonType: 'danger',
              onClick: async () => {
                const ok = await deleteBranch(setDeleting, branchName, deletedBranches, onDeletedBranchesChange, repo)
                if (!ok) {
                  setShowErrorBanner(true)
                } else {
                  setShowErrorBanner(false)
                  setShowModal(false)
                }
              },
            },
          ]}
        >
          <div className="js-delete-dialog-body">
            {showErrorBanner && (
              <Flash variant="danger" aria-live="assertive" role="alert" sx={{mb: 2}}>
                Branch could not be deleted
              </Flash>
            )}
            <p>
              The branch <Text sx={{fontWeight: 'bold'}}>{branchName}</Text> is associated with an open pull request:
            </p>
            <Box as="ul" sx={{ml: 4}}>
              <li>
                <Link href={pullRequest?.permalink}>
                  #{pullRequest.number} - {pullRequest.title}
                </Link>
              </li>
            </Box>
            <Text as="p" sx={{mt: 2}}>
              If you delete this branch, the pull request will be closed.
            </Text>
            <p>Are you sure you want to delete this branch?</p>
          </div>
        </Dialog>
      )}
    </>
  )
}

export default DeleteBranchDialog
