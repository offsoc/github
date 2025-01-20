import type {AppStoreButton} from '../../../schemas/contentful/contentTypes/appStoreButton'
import {AppleAppStore} from './components/AppleAppStore'
import {GooglePlayStore} from './components/GooglePlayStore'

type ContentfulMobileAppStoreProps = {
  component: AppStoreButton
  analyticsLabel: string
  analyticsLocation: string
}

const mobileStoreButtonComponents = {
  Android: GooglePlayStore,
  iOS: AppleAppStore,
}

export const ContentfulMobileAppStoreLink: React.FunctionComponent<ContentfulMobileAppStoreProps> = ({
  component,
  analyticsLabel,
  analyticsLocation,
}) => {
  const MobileStoreButtonComponent = mobileStoreButtonComponents[component.fields.storeOs]

  return (
    <MobileStoreButtonComponent
      link={component.fields.link}
      analyticsLabel={analyticsLabel}
      analyticsLocation={analyticsLocation}
    />
  )
}
