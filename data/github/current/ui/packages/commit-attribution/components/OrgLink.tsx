import {clsx} from 'clsx'
import {Link} from '@primer/react'
import {orgHovercardPath} from '@github-ui/paths'
import type {Author} from '../commit-attribution-types'
import styles from './OrgLink.module.css'

/**
 * Renders the author of a commit.
 */
export function OrgLink({org, className}: {org: Author; className?: string}) {
  if (!org) return null

  return (
    <div className={clsx('d-flex flex-row flex-items-center', className)}>
      <Link
        muted
        href={org.path}
        aria-label={`${org.login!}'s org home page`}
        data-hovercard-url={orgHovercardPath({owner: org.login!})}
        className={styles.orgLink}
      >
        {org.login!}
      </Link>
    </div>
  )
}
