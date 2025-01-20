import {documentToReactComponents} from '@contentful/rich-text-react-renderer'
import {BLOCKS} from '@contentful/rich-text-types'
import {Button, CTABanner} from '@primer/react-brand'

import type {PrimerComponentCtaBanner} from '../../../schemas/contentful/contentTypes/primerComponentCtaBanner'
import {getAnalyticsEvent} from '../../../lib/utils/analytics'
import {ContentfulAppStoreButtonGroup} from '../ContentfulAppStoreButtonGroup/ContentfulAppStoreButtonGroup'

export type ContentfulCtaBannerProps = {
  component: PrimerComponentCtaBanner
  className?: string
}

export function ContentfulCtaBanner({component, className}: ContentfulCtaBannerProps) {
  const hasTrailingComponent = !!component.fields?.trailingComponent?.length

  return (
    <CTABanner
      className={className}
      align={component.fields.align}
      hasBorder={component.fields.hasBorder}
      hasShadow={component.fields.hasShadow}
      hasBackground={component.fields.hasBackground}
    >
      <CTABanner.Heading>{component.fields.heading}</CTABanner.Heading>

      <CTABanner.Description>
        {documentToReactComponents(component.fields.description, {
          renderNode: {
            [BLOCKS.PARAGRAPH]: (_, children) => children,
          },
        })}
      </CTABanner.Description>
      {hasTrailingComponent ? (
        <ContentfulAppStoreButtonGroup
          components={component.fields.trailingComponent}
          analyticsLabel="cta-banner"
          analyticsLocation={component.fields.heading}
        />
      ) : (
        <CTABanner.ButtonGroup>
          <Button
            as="a"
            href={component.fields.callToActionPrimary.fields.href}
            {...getAnalyticsEvent(
              {
                action: component.fields.callToActionPrimary.fields.text,
                tag: 'button',
                location: component.fields.heading,
                context: 'CTAs',
              },
              {context: false},
            )}
          >
            {component.fields.callToActionPrimary.fields.text}
          </Button>
          <Button
            as="a"
            href={component.fields.callToActionSecondary.fields.href}
            {...getAnalyticsEvent(
              {
                action: component.fields.callToActionSecondary.fields.text,
                tag: 'button',
                location: component.fields.heading,
                context: 'CTAs',
              },
              {context: false},
            )}
            data-ref={`cta-banner-secondary-action-${component.fields.callToActionSecondary.sys.id}`}
          >
            {component.fields.callToActionSecondary.fields.text}
          </Button>
        </CTABanner.ButtonGroup>
      )}
    </CTABanner>
  )
}
