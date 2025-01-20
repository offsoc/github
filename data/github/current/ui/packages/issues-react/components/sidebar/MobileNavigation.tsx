import {Dialog} from '@primer/react/experimental'
import type {PreloadedQuery} from 'react-relay'

import {LABELS} from '../../constants/labels'
import {useNavigationContext} from '../../contexts/NavigationContext'
import type {SavedViewsQuery} from './__generated__/SavedViewsQuery.graphql'
import {Sidebar} from './Sidebar'

type MobileNavigationProps = {
  customViewsRef: PreloadedQuery<SavedViewsQuery> | undefined | null
}

export default function MobileNavigation({customViewsRef}: MobileNavigationProps) {
  const {isNavigationOpen, closeNavigation} = useNavigationContext()

  return isNavigationOpen ? (
    <Dialog width="large" title={LABELS.allViews} onClose={closeNavigation}>
      <Sidebar customViewsRef={customViewsRef} />
    </Dialog>
  ) : null
}
