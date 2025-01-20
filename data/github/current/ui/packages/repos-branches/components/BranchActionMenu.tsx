import {lazy, Suspense, useState} from 'react'
import {ActionList, ActionMenu, Box, IconButton} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {
  GitPullRequestIcon,
  GitCompareIcon,
  KebabHorizontalIcon,
  PencilIcon,
  PulseIcon,
  ShieldLockIcon,
  TrashIcon,
  UndoIcon,
} from '@primer/octicons-react'
import {Link} from '@github-ui/react-core/link'
import {activityIndexPath, comparePath, newPullRequestPath, branchesPath} from '@github-ui/paths'
import type {Repository} from '@github-ui/current-repository'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {verifiedFetch} from '@github-ui/verified-fetch'
import type {Branch, PullRequest} from '../types'

const DeleteBranchDialog = lazy(() => import('./DeleteBranchDialog'))
const RenameBranchDialog = lazy(() => import('./RenameBranchDialog'))

export interface BranchActionMenuProps {
  repo: Repository
  branch: Pick<
    Branch,
    'name' | 'isDefault' | 'rulesetsPath' | 'path' | 'deleteable' | 'deleteProtected' | 'renameable' | 'isBeingRenamed'
  >
  oid?: string
  pullRequest?: PullRequest
  deletedBranches: string[]
  onDeletedBranchesChange: (newBranches: string[]) => void
  sx?: BetterSystemStyleObject
  deletedAt?: string
}

export async function deleteBranch(
  setDeleting: (isDeleting: boolean) => void,
  branchName: string,
  deletedBranches: string[],
  onDeletedBranchesChange: (newBranches: string[]) => void,
  repo: Repository,
) {
  setDeleting(true)

  const response = await verifiedFetch(`${branchesPath({repo})}/${encodeURIComponent(branchName)}`, {method: 'delete'})
  if (response.ok) {
    onDeletedBranchesChange([...deletedBranches, branchName])
  }

  setDeleting(false)
  return response.ok
}

export function BranchActionMenu({
  repo,
  branch,
  oid,
  pullRequest,
  deletedBranches,
  onDeletedBranchesChange,
  sx = {},
  deletedAt,
}: BranchActionMenuProps) {
  const {addToast} = useToastContext()
  const [isDeleting, setDeleting] = useState(false)
  const [isRestoring, setRestoring] = useState(false)
  const [showModal, setShowModal] = useState(false)

  async function deleteBranchOrShowModal() {
    if (!isDeleting && !isRestoring && oid) {
      if (branch.isDefault) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: "You can't delete the default branch.",
        })
      } else if (branch.deleteProtected) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: "You can't delete this protected branch.",
        })
      } else if (branch.isBeingRenamed) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: "You can't delete this branch because it is being renamed.",
        })
        // Users are only allowed to delete the branch if they're able to restore it
        // as well which they need the oid to do
      } else if (!branch.deleteable || !oid) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: "You can't delete this branch.",
        })
      } else if (pullRequest?.state === 'open') {
        setShowModal(true)
      } else {
        const ok = await deleteBranch(setDeleting, branch.name, deletedBranches, onDeletedBranchesChange, repo)
        if (!ok) {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: 'Branch could not be deleted.',
          })
        }
      }
    }
  }

  async function restoreBranch() {
    if (!isRestoring && !isDeleting && oid) {
      setRestoring(true)

      const response = await verifiedFetch(`${branchesPath({repo})}/?branch=${oid}&name=${branch.name}`, {
        method: 'post',
      })

      if (response.ok) {
        onDeletedBranchesChange(deletedBranches.filter(deletedBranch => deletedBranch !== branch.name))
      } else {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Branch could not be restored.',
        })
      }
      setRestoring(false)
    }
  }

  const [showRenameBranchModal, setShowRenameBranchModal] = useState(false)

  function handleRenameBranchModal() {
    if (branch.isBeingRenamed) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: "You can't rename this branch because it is being renamed.",
      })
    } else if (!branch.renameable) {
      // If a branch is protected by a branch protection or ruleset,
      // then only repo admins can rename the Branch
      //
      // If a branch is protected by an org ruleset,
      // then only org admins can rename a branch protected
      //
      // All other branches can be renamed by anyone with write access
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: "You don't have permission to rename this branch.",
      })
    } else {
      setShowRenameBranchModal(true)
    }
  }

  function closeRenameBranchDialog() {
    setShowRenameBranchModal(false)
  }

  return (
    <>
      <Box sx={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', ...sx}}>
        {deletedBranches.includes(branch.name) && oid ? (
          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
          <IconButton
            unsafeDisableTooltip={true}
            icon={UndoIcon}
            onClick={restoreBranch}
            size="small"
            variant="invisible"
            aria-label="Restore"
          />
        ) : (
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              icon={TrashIcon}
              variant="invisible"
              onClick={() => {
                if (!deletedAt) {
                  deleteBranchOrShowModal()
                } else {
                  // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
                  addToast({
                    type: 'error',
                    message: 'This branch no longer exists.',
                  })
                }
              }}
              aria-label="Delete branch"
              size="small"
            />
            <ActionMenu>
              <ActionMenu.Anchor>
                {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                <IconButton
                  unsafeDisableTooltip={true}
                  icon={KebabHorizontalIcon}
                  size="small"
                  variant="invisible"
                  className="color-fg-muted align-center"
                  aria-label="Branch menu"
                  name="Branch menu"
                />
              </ActionMenu.Anchor>

              <ActionMenu.Overlay>
                <ActionList>
                  {!branch.isDefault &&
                    (!deletedAt ? (
                      <ActionList.LinkItem
                        as={Link}
                        aria-label={repo.currentUserCanPush ? 'New pull request' : 'Compare'}
                        to={
                          repo.currentUserCanPush
                            ? newPullRequestPath({repo, refName: branch.name})
                            : comparePath({repo, head: branch.name})
                        }
                        className="text-decoration-skip"
                      >
                        <ActionList.LeadingVisual>
                          {repo.currentUserCanPush ? <GitPullRequestIcon size={16} /> : <GitCompareIcon size={16} />}
                        </ActionList.LeadingVisual>
                        {repo.currentUserCanPush ? 'New pull request' : 'Compare'}
                      </ActionList.LinkItem>
                    ) : (
                      <ActionList.Item
                        onSelect={() => {
                          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
                          addToast({
                            type: 'error',
                            message: 'This branch no longer exists.',
                          })
                        }}
                      >
                        <ActionList.LeadingVisual>
                          {repo.currentUserCanPush ? <GitPullRequestIcon size={16} /> : <GitCompareIcon size={16} />}
                        </ActionList.LeadingVisual>
                        {repo.currentUserCanPush ? 'New pull request' : 'Compare'}
                      </ActionList.Item>
                    ))}

                  <ActionList.LinkItem
                    as={Link}
                    aria-label={`Activity`}
                    to={activityIndexPath({repo, branch: branch.name})}
                    className="text-decoration-skip"
                  >
                    <ActionList.LeadingVisual>
                      <PulseIcon size={16} />
                    </ActionList.LeadingVisual>
                    Activity
                  </ActionList.LinkItem>
                  {branch.rulesetsPath ? (
                    <ActionList.LinkItem
                      as={Link}
                      aria-label={`View rules`}
                      to={branch.rulesetsPath}
                      className="text-decoration-skip"
                    >
                      <ActionList.LeadingVisual>
                        <ShieldLockIcon size={16} />
                      </ActionList.LeadingVisual>
                      View rules
                    </ActionList.LinkItem>
                  ) : (
                    <ActionList.Item
                      onSelect={() => {
                        // When there are no rulesets associated with a branch, we show a toast
                        // informing them of this, instead of linking to a blank page
                        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
                        addToast({
                          type: 'error',
                          message: 'There are no rulesets associated with this branch.',
                        })
                      }}
                    >
                      <ActionList.LeadingVisual>
                        <ShieldLockIcon size={16} />
                      </ActionList.LeadingVisual>
                      View rules
                    </ActionList.Item>
                  )}
                  {repo.currentUserCanPush && (
                    <>
                      <ActionList.Item
                        aria-label={`Rename branch '${branch.name}'`}
                        onSelect={() => {
                          if (!deletedAt) {
                            handleRenameBranchModal()
                          } else {
                            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
                            addToast({
                              type: 'error',
                              message: 'This branch no longer exists.',
                            })
                          }
                        }}
                      >
                        <ActionList.LeadingVisual>
                          <PencilIcon size={16} />
                        </ActionList.LeadingVisual>
                        Rename branch
                      </ActionList.Item>
                    </>
                  )}
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </Box>
        )}
      </Box>
      <Suspense>
        {showRenameBranchModal && (
          <RenameBranchDialog repo={repo} branch={branch} onDismiss={closeRenameBranchDialog} />
        )}
        {showModal && pullRequest && (
          <DeleteBranchDialog
            showModal={showModal}
            setShowModal={setShowModal}
            setDeleting={setDeleting}
            branchName={branch.name}
            onDeletedBranchesChange={onDeletedBranchesChange}
            deletedBranches={deletedBranches}
            pullRequest={pullRequest}
            repo={repo}
          />
        )}
      </Suspense>
    </>
  )
}
