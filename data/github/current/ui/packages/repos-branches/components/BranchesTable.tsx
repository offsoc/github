import {type FC, type ReactNode, lazy, Suspense, useState} from 'react'
import {Box, Label, Text} from '@primer/react'
import {Blankslate, DataTable} from '@primer/react/drafts'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {GitBranchIcon} from '@primer/octicons-react'
import {useCurrentRepository} from '@github-ui/current-repository'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import type {Branch, BranchMetadata} from '../types'
import BranchDescription from './BranchDescription'
import {AheadBehindCountWidth} from './AheadBehindCount'
import {UpdatedBy} from './UpdatedBy'
import {BranchActionMenu} from './BranchActionMenu'
import {useCurrentUser} from '../contexts/CurrentUserContext'

const StatusCheckRollup = lazy(() => import('./StatusCheckRollup'))
const PullRequestLabel = lazy(() => import('./PullRequestLabel'))
const MergeQueueLabel = lazy(() => import('./MergeQueueLabel'))
const AheadBehindCount = lazy(() => import('./AheadBehindCount'))

export default function BranchesTable({
  labelId,
  branches,
  deferredMetadata,
  showMergeQueueHeader,
  isLarge = false,
}: {
  labelId?: string
  branches: Branch[]
  deferredMetadata?: Map<string, BranchMetadata>
  showMergeQueueHeader?: boolean
  isLarge?: boolean
}) {
  const repo = useCurrentRepository()
  const currentUser = useCurrentUser()
  const [deletedBranches, setDeletedBranches] = useState<string[]>([])

  if (branches.length === 0) {
    return (
      <Blankslate border>
        <Blankslate.Visual>
          <GitBranchIcon size="medium" />
        </Blankslate.Visual>
        <Blankslate.Heading>No branches</Blankslate.Heading>
        <Blankslate.Description>No branches match the search</Blankslate.Description>
      </Blankslate>
    )
  }

  return (
    <DataTable
      aria-labelledby={labelId}
      data={branches.map(branch => {
        const metadata = deferredMetadata?.get(branch.name)

        return {
          id: branch.name,
          ...branch,
          author: branch.author ?? metadata?.author,
          oid: metadata?.oid,
          deletedAt:
            deferredMetadata && deferredMetadata.size > 0 && typeof metadata === 'undefined' && !branch.isBeingRenamed
              ? branch.authoredDate
              : undefined,
          aheadBehind: metadata?.aheadBehind,
          statusCheckRollup: metadata?.statusCheckRollup,
          pullRequest: metadata?.pullRequest,
          mergeQueue: metadata?.mergeQueue,
          maxDiverged: metadata?.maxDiverged,
          isLarge,
        }
      })}
      columns={[
        {
          header: 'Branch',
          field: 'name',
          width: 'grow',
          renderCell: row => <BranchDescription {...row} />,
        },
        {
          header: 'Updated',
          field: 'author',
          width: 180,
          renderCell: ({author, authoredDate, name, deletedAt}) => {
            const deleted = deletedBranches.includes(name)
            return (
              <VerticallyCenteredCell>
                <>
                  {!deferredMetadata && !deleted && !author ? (
                    <LoadingSkeleton variant="rounded" sx={{width: 16, height: 16, mr: 2}} />
                  ) : null}
                  <UpdatedBy
                    user={deleted ? currentUser : author}
                    updatedAt={authoredDate}
                    deletedAt={deleted ? new Date().toISOString() : deletedAt}
                  />
                </>
              </VerticallyCenteredCell>
            )
          },
        },
        {
          header: 'Check status',
          id: 'statusCheckRollup',
          width: 125,
          renderCell: ({oid, statusCheckRollup}) => {
            const skeleton = <LoadingSkeleton variant="rounded" sx={{width: '33%', maxWidth: '42px', height: '20px'}} />

            if (!deferredMetadata) {
              return <VerticallyCenteredCell>{skeleton}</VerticallyCenteredCell>
            }

            return oid && statusCheckRollup ? (
              <VerticallyCenteredCell>
                <Suspense fallback={skeleton}>
                  <StatusCheckRollup oid={oid} statusCheckRollup={statusCheckRollup} />
                </Suspense>
              </VerticallyCenteredCell>
            ) : null
          },
        },
        {
          header: () => (
            <Box sx={{display: 'flex', justifyContent: 'center', mr: '3px', flexGrow: 1}}>
              <Text
                sx={{
                  borderRight: '1px solid',
                  borderColor: 'border.default',
                  pr: 1,
                }}
              >
                Behind
              </Text>
              <Text
                sx={{
                  pl: 1,
                }}
              >
                Ahead
              </Text>
            </Box>
          ),
          field: 'aheadBehind',
          width: AheadBehindCountWidth,
          renderCell: ({isDefault, aheadBehind, maxDiverged}) => {
            const skeleton = (
              <LoadingSkeleton variant="rounded" sx={{width: AheadBehindCountWidth - 24, height: '20px'}} />
            )

            if (!deferredMetadata) {
              return <VerticallyCenteredCell>{skeleton}</VerticallyCenteredCell>
            }

            if (isDefault) {
              return (
                <VerticallyCenteredCell sx={{justifyContent: 'center', flexGrow: 1}}>
                  <Label>Default</Label>
                </VerticallyCenteredCell>
              )
            }

            if (aheadBehind) {
              return (
                <Suspense fallback={skeleton}>
                  <AheadBehindCount
                    width={AheadBehindCountWidth - 24}
                    aheadCount={aheadBehind[0]}
                    behindCount={aheadBehind[1]}
                    maxDiverged={maxDiverged}
                  />
                </Suspense>
              )
            }
            return null
          },
        },
        {
          header: showMergeQueueHeader ? 'Merge queue' : 'Pull request',
          id: 'pullRequestOrMergeQueue',
          width: 125,
          renderCell: ({mergeQueue, pullRequest}) => {
            const skeleton = <LoadingSkeleton variant="rounded" sx={{width: '33%', maxWidth: '75px', height: '20px'}} />

            if (!deferredMetadata) {
              return <VerticallyCenteredCell>{skeleton}</VerticallyCenteredCell>
            }

            if (mergeQueue) {
              return (
                <VerticallyCenteredCell>
                  <Suspense fallback={skeleton}>
                    <MergeQueueLabel mergeQueueUrl={mergeQueue.path} queueCount={mergeQueue.count} />
                  </Suspense>
                </VerticallyCenteredCell>
              )
            }

            if (pullRequest) {
              return (
                <VerticallyCenteredCell>
                  <Suspense fallback={skeleton}>
                    <PullRequestLabel repo={repo} pullRequest={pullRequest} />
                  </Suspense>
                </VerticallyCenteredCell>
              )
            }

            return null
          },
        },
        {
          header: () => (
            <Text className="sr-only" sx={{position: 'relative'}}>
              Action menu
            </Text>
          ),
          id: 'actionMenu',
          width: 70,
          renderCell: ({
            isDefault,
            name,
            rulesetsPath,
            path,
            deleteable,
            deleteProtected,
            renameable,
            isBeingRenamed,
            oid,
            pullRequest,
            deletedAt,
          }) => (
            <BranchActionMenu
              repo={repo}
              branch={{isDefault, name, rulesetsPath, path, deleteable, deleteProtected, renameable, isBeingRenamed}}
              oid={oid}
              pullRequest={pullRequest}
              deletedBranches={deletedBranches}
              onDeletedBranchesChange={setDeletedBranches}
              sx={{float: 'right'}}
              deletedAt={deletedAt}
            />
          ),
        },
      ]}
    />
  )
}

const VerticallyCenteredCell: FC<{sx?: BetterSystemStyleObject; children: ReactNode}> = ({sx, children}) => (
  <Box sx={{display: 'flex', alignItems: 'center', height: 32, ...sx}}>{children}</Box>
)
