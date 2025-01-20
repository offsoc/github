import type {RepositoryNWO} from '@github-ui/current-repository'
import {SignedCommitBadge as UiSignedCommitBadge} from '@github-ui/signed-commit-badge'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'

import {useIsDeferredDataLoading} from '../contexts/DeferredCommitDataContext'
import {useCommitsAppPayload} from '../hooks/use-commits-app-payload'
import type {DeferredCommitData} from '../types/commits-types'
import {AsyncChecksStatusBadge} from './AsyncChecksStatusBadge'

export const verifiedBadgeWidth = '62px'

export function SignedCommitBadge({deferredData}: {deferredData: DeferredCommitData | undefined}) {
  const {helpUrl} = useCommitsAppPayload()
  const isLoading = useIsDeferredDataLoading()

  return (
    <>
      {isLoading && <LoadingSkeleton variant="rounded" className="d-none d-sm-flex" width="62px" />}
      {!isLoading && deferredData === undefined && (
        <LoadingSkeleton variant="rounded" className="d-none d-sm-flex" width="62px" />
      )}
      {!isLoading && deferredData && (
        <UiSignedCommitBadge
          commitOid={deferredData.oid}
          hasSignature={true}
          verificationStatus={deferredData.verifiedStatus}
          signature={deferredData.signatureInformation ? {helpUrl, ...deferredData.signatureInformation} : undefined}
        />
      )}
    </>
  )
}

export function CommitChecksStatusBadge({
  deferredData,
  oid,
  repository,
}: {
  deferredData: DeferredCommitData | undefined
  oid: string
  repository: RepositoryNWO
}) {
  const isLoading = useIsDeferredDataLoading()

  let checkStatusCount = ''
  try {
    checkStatusCount = deferredData?.statusCheckStatus?.short_text?.split('checks')[0]?.trim() || ''
  } catch {
    //noop
  }

  return (
    <>
      {isLoading && <LoadingSkeleton variant="rounded" className="d-none d-sm-flex ml-2" width="20px" />}
      {!isLoading && deferredData === undefined && (
        <LoadingSkeleton variant="rounded" className="d-none d-sm-flex ml-2" width="20px" />
      )}
      {!isLoading && deferredData?.statusCheckStatus && <div className="d-none d-sm-flex ml-1">&middot;</div>}
      <div className="d-none d-sm-flex">
        <AsyncChecksStatusBadge
          oid={oid}
          status={deferredData?.statusCheckStatus?.state}
          descriptionString={checkStatusCount}
          repo={repository}
        />
      </div>
    </>
  )
}
