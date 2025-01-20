import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {ShowApp as LegacyShowApp} from '../components/legacy/ShowApp'
import {ListingLayout} from '../components/ListingLayout'

export function ShowApp() {
  const redesignFeatureFlag = useFeatureFlag('marketplace_layout_redesign')

  return <>{redesignFeatureFlag ? <RedesignedShowApp /> : <LegacyShowApp />}</>
}

const RedesignedShowApp = () => {
  return (
    <div className="d-flex flex-column" data-testid="app-listing">
      <ListingLayout header="Header" body={<div>Body</div>} sidebar={<div>Sidebar</div>} />
    </div>
  )
}
