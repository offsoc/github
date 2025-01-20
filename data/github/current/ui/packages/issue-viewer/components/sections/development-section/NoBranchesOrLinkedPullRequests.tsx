import {Suspense, useCallback, useState} from 'react'
import {type BranchNextStep, CreateBranchDialog} from './CreateBranchDialog'
import {Link} from '@primer/react'

type NoBranchesOrLinkedPullRequestsProps = {
  issueId: string
  title: string
  number: number
  owner: string
  repo: string
  before?: string
  after?: string
  linkText: string
  reportCreateBranchDialogOpen: (isOpen: boolean) => void
  setBranchNextStep: (nextStep: BranchNextStep) => void
  setNewBranchName: (branchName: string | null) => void
}

export function NoBranchesOrLinkedPullRequests({
  issueId,
  title,
  number,
  owner,
  repo,
  before,
  after,
  linkText,
  reportCreateBranchDialogOpen,
  setBranchNextStep,
  setNewBranchName,
}: NoBranchesOrLinkedPullRequestsProps) {
  const [isCreateBranchDialogOpen, setCreateBranchDialogOpen] = useState(false)

  const onCreateBranchDialogClose = useCallback(
    (nextStep: BranchNextStep, branchName: string | null) => {
      setNewBranchName(branchName)
      setBranchNextStep(nextStep)
      setCreateBranchDialogOpen(false)
      reportCreateBranchDialogOpen(false)
    },
    [reportCreateBranchDialogOpen, setBranchNextStep, setNewBranchName],
  )

  return (
    <>
      {before}
      {before && ' '}
      <Link
        tabIndex={0}
        onClick={() => {
          reportCreateBranchDialogOpen(true)
          setCreateBranchDialogOpen(true)
        }}
        sx={{color: 'fg.accent', fontWeight: 400, cursor: 'pointer', '&:hover': {textDecoration: 'none'}}}
      >
        {linkText}
      </Link>
      {after && ' '}
      {after}
      {isCreateBranchDialogOpen && (
        <Suspense>
          <CreateBranchDialog
            issueId={issueId}
            title={title}
            number={number}
            owner={owner}
            repo={repo}
            onClose={onCreateBranchDialogClose}
          />
        </Suspense>
      )}
    </>
  )
}
