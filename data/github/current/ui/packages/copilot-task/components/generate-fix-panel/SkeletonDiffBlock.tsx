import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {clsx} from 'clsx'

import styles from './SkeletonDiffBlock.module.css'

export function SkeletonDiffBlock() {
  return (
    <div className={clsx('d-flex flex-column mt-3 border', styles.container)}>
      <div className={clsx('d-flex flex-row flex-items-center gap-2 p-3 border-bottom', styles.header)}>
        <LoadingSkeleton height="sm" variant="rounded" width="140px" />
      </div>
      <div className="d-flex flex-column gap-2 p-3">
        <LoadingSkeleton height="sm" variant="rounded" width="random" />
        <LoadingSkeleton height="sm" variant="rounded" width="random" />
        <LoadingSkeleton height="sm" variant="rounded" width="random" />
      </div>
    </div>
  )
}
