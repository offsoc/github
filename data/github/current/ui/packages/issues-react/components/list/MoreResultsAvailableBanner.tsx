import {Banner} from '@primer/react/experimental'
import {MESSAGES} from '../../constants/messages'
import {VALUES} from '../../constants/values'

export type MoreResultsAvailableBannerProps = {
  itemsLabel: string
}

export const MoreResultsAvailableBanner = ({itemsLabel}: MoreResultsAvailableBannerProps) => {
  return (
    <div className="p-2">
      <Banner
        description={MESSAGES.moreItemsAvailableDescription(VALUES.maxIssuesListItems, itemsLabel)}
        hideTitle
        title={MESSAGES.moreItemsAvailableTitle(itemsLabel)}
      />
    </div>
  )
}
