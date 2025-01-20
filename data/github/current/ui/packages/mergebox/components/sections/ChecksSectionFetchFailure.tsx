import {AlertIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'

import {MergeBoxSectionHeader} from './common/MergeBoxSectionHeader'
import {usePageDataContext} from '@github-ui/pull-request-page-data-tooling/page-data-context'

/**
 * Renders a failure state of the checks section when a PageData JSON fetch fails
 */
export function ChecksSectionFetchFailure() {
  const {basePageDataUrl} = usePageDataContext()
  return (
    <section aria-label="Checks" className="border-bottom borderColor-muted">
      <MergeBoxSectionHeader
        title="Checks cannot be loaded right now"
        subtitle={
          <>
            Try again or if the problem persists{' '}
            <Link href="https://support.github.com/" inline>
              contact support
            </Link>{' '}
            or{' '}
            <Link href={`${basePageDataUrl}/checks`} inline>
              view the Checks tab.
            </Link>
          </>
        }
        icon={<AlertIcon className="mx-1" size={24} />}
      />
    </section>
  )
}
