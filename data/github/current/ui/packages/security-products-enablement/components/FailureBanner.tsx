import {Link} from '@primer/react'
import {Banner} from '@primer/react/drafts'
import type {FailureCounts} from '../security-products-enablement-types'
import type {FilterQuery} from '@github-ui/filter'
import {FilterQueryParser} from '@github-ui/filter/parser/v2'
import pluralize from 'pluralize'

interface FailureBannerProps {
  closeFn: (arg0: boolean) => void
  failureCounts: FailureCounts
  searchFn: (request: FilterQuery) => void
}

const FailureBanner: React.FC<FailureBannerProps> = ({closeFn, failureCounts, searchFn}) => {
  if (Object.keys(failureCounts).length === 0) {
    return <></>
  }

  const onDismiss = async () => {
    closeFn(true)
  }

  const totalFailureCount = Object.values(failureCounts).reduce((memo, failCount) => memo + failCount, 0)
  const pluralRepos = pluralize('repository', totalFailureCount, true)
  const numberOfReasons = Object.keys(failureCounts).length

  const setSearchQuery = () => {
    const parser = new FilterQueryParser()
    const parsedQuery = parser.parse('config-status:failed')
    searchFn(parsedQuery)
  }
  const viewAllLink = (
    // Include an href="#" so that hovering will render the correct pointer:
    <Link href="#" onClick={setSearchQuery}>
      View all failed repositories
    </Link>
  )

  let innerText
  let title
  let hideTitle = false
  if (numberOfReasons > 1) {
    title = `${pluralRepos} failed to apply:`
    innerText = (
      <>
        <ul className="ml-4 py-2">
          {Object.entries(failureCounts).map(([failText, count], i) => {
            return (
              <li key={i}>
                {pluralize('repository', count, true)} failed because {failText}.
              </li>
            )
          })}
        </ul>
        {viewAllLink}
      </>
    )
  } else {
    const failText = Object.keys(failureCounts)[0]
    title = `${pluralRepos} failed to apply`
    hideTitle = true
    innerText = (
      <>
        {pluralRepos} failed to apply because {failText}. {viewAllLink}.
      </>
    )
  }

  return (
    <Banner
      data-testid="failure-banner"
      onDismiss={onDismiss}
      title={title}
      hideTitle={hideTitle}
      description={innerText}
      variant="warning"
      className="mb-3"
    />
  )
}

export default FailureBanner
