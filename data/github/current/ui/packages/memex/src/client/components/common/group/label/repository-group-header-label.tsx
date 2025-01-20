import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {ExtendedRepository} from '../../../../api/common-contracts'
import type {FieldAggregate} from '../../../../hooks/use-aggregation-settings'
import {RepositoryIcon} from '../../../fields/repository/repository-icon'
import {AggregateLabels} from '../../aggregate-labels'
import {SanitizedGroupHeaderText} from '../sanitized-group-header-text'

type Props = {
  repository: ExtendedRepository
  rowCount: number
  hideItemsCount: boolean
  aggregates: Array<FieldAggregate>
  titleSx?: BetterSystemStyleObject
}

export function RepositoryGroupHeaderLabel({repository, rowCount, aggregates, hideItemsCount, titleSx}: Props) {
  return (
    <>
      <RepositoryIcon repository={repository} />
      <SanitizedGroupHeaderText titleHtml={repository.nameWithOwner} sx={titleSx} />
      <AggregateLabels
        counterSx={{color: 'fg.muted'}}
        itemsCount={rowCount}
        aggregates={aggregates}
        hideItemsCount={hideItemsCount}
      />
    </>
  )
}
