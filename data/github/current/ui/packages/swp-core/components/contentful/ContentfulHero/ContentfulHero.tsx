import {Box, Hero} from '@primer/react-brand'

import type {PrimerComponentHero} from '../../../schemas/contentful/contentTypes/primerComponentHero'
import {ContentfulAppStoreButtonGroup} from '../ContentfulAppStoreButtonGroup/ContentfulAppStoreButtonGroup'
import {getAnalyticsEvent} from '../../../lib/utils/analytics'
import styles from './ContentfulHero.module.css'

export type ContentfulHeroProps = {
  component: PrimerComponentHero

  'data-hpc'?: boolean
}

export function ContentfulHero({component, ...props}: ContentfulHeroProps) {
  const hasTrailingComponent =
    component.fields.trailingComponent !== undefined && component.fields.trailingComponent.length > 0

  return (
    <Box className={styles.contentfulHeroContainer}>
      <Hero
        data-hpc={props['data-hpc']}
        align={component.fields.align}
        trailingComponent={
          hasTrailingComponent
            ? () => (
                <ContentfulAppStoreButtonGroup
                  components={component.fields.trailingComponent}
                  analyticsLabel="hero"
                  analyticsLocation="hero"
                />
              )
            : undefined
        }
        className="pb-0"
      >
        {component.fields.label && <Hero.Label>{component.fields.label}</Hero.Label>}

        <Hero.Heading>{component.fields.heading}</Hero.Heading>

        {component.fields.description ? <Hero.Description>{component.fields.description}</Hero.Description> : null}

        {!hasTrailingComponent && component.fields.callToActionPrimary !== undefined && (
          <Hero.PrimaryAction
            href={component.fields.callToActionPrimary.fields.href}
            data-ref={`hero-primary-action-${component.fields.callToActionPrimary.sys.id}`}
            {...getAnalyticsEvent(
              {
                action: component.fields.callToActionPrimary.fields.text,
                tag: 'button',
                location: 'hero',
                context: 'CTAs',
              },
              {context: false},
            )}
          >
            {component.fields.callToActionPrimary.fields.text}
          </Hero.PrimaryAction>
        )}

        {!hasTrailingComponent && component.fields.callToActionSecondary !== undefined && (
          <Hero.SecondaryAction
            href={component.fields.callToActionSecondary.fields.href}
            {...getAnalyticsEvent(
              {
                action: component.fields.callToActionSecondary.fields.text,
                tag: 'button',
                location: 'hero',
                context: 'CTAs',
              },
              {context: false},
            )}
          >
            {component.fields.callToActionSecondary.fields.text}
          </Hero.SecondaryAction>
        )}
        {component.fields.image !== undefined ? (
          <Hero.Image
            position={component.fields.imagePosition === 'Inline' ? 'inline-end' : 'block-end'}
            src={component.fields.image.fields.file.url}
            alt={component.fields.image.fields.description || ''}
          />
        ) : null}
      </Hero>
      {component.fields.videoSrc && !component.fields.image && (
        <Box className={styles.videoContainer}>
          <iframe
            role="application"
            className="border-0 width-full height-full position-absolute top-0 left-0"
            src={component.fields.videoSrc}
            title={component.fields.heading}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </Box>
      )}
    </Box>
  )
}
