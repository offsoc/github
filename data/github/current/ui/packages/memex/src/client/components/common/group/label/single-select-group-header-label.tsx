import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {PersistedOption} from '../../../../api/columns/contracts/single-select'
import type {FieldAggregate} from '../../../../hooks/use-aggregation-settings'
import {SanitizedHtml} from '../../../dom/sanitized-html'
import {ColorDecorator} from '../../../fields/single-select/color-decorator'
import {AggregateLabels} from '../../aggregate-labels'
import {SanitizedGroupHeaderText} from '../sanitized-group-header-text'

type Props = {
  option: PersistedOption
  rowCount: number
  hideItemsCount: boolean
  aggregates: Array<FieldAggregate>
  titleSx?: BetterSystemStyleObject
}

export const SingleSelectGroupHeaderLabel = ({option, rowCount, aggregates, hideItemsCount, titleSx}: Props) => (
  <>
    <ColorDecorator color={option.color} />

    <SanitizedGroupHeaderText titleHtml={option.nameHtml} sx={titleSx} />
    <AggregateLabels
      counterSx={{color: 'fg.muted'}}
      itemsCount={rowCount}
      aggregates={aggregates}
      hideItemsCount={hideItemsCount}
    />
    {option.descriptionHtml && (
      <SanitizedHtml
        sx={{
          color: 'fg.muted',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '200ch',
          flexBasis: 0,
          flexGrow: 1,
          mb: '-2px', // make it line up with the bigger heading text
        }}
      >
        {option.descriptionHtml}
      </SanitizedHtml>
    )}
  </>
)
