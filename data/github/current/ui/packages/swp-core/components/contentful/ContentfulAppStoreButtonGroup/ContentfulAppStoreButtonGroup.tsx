import {Stack} from '@primer/react-brand'

import type {AppStoreButton} from '../../../schemas/contentful/contentTypes/appStoreButton'

import {ContentfulMobileAppStoreLink} from '../ContentfulAppStoreLinks/ContentfulMobileAppStoreLinks'

type ContentfulAppStoreButtonGroupProps = {
  components?: AppStoreButton[]
  analyticsLabel: string
  analyticsLocation: string
}
type ContentfulAppStoreButtonGroupPropTypes = AppStoreButton

function getAppStoreButton(component: ContentfulAppStoreButtonGroupPropTypes) {
  const map: Record<ContentfulAppStoreButtonGroupPropTypes['sys']['contentType']['sys']['id'], React.ElementType> = {
    appStoreButton: ContentfulMobileAppStoreLink,
  }

  return map[component.sys.contentType.sys.id]
}

export function ContentfulAppStoreButtonGroup({
  components,
  analyticsLabel,
  analyticsLocation,
}: ContentfulAppStoreButtonGroupProps) {
  return (
    <Stack gap="condensed" className="p-0" direction={{narrow: 'vertical', regular: 'horizontal'}}>
      {components?.map(component => {
        const Component = getAppStoreButton(component)

        return Component !== undefined ? (
          <Component
            component={component}
            analyticsLabel={analyticsLabel}
            analyticsLocation={analyticsLocation}
            key={component.sys.id}
          />
        ) : null
      })}
    </Stack>
  )
}
