import {ContentfulAnchorNav} from '@github-ui/swp-core/components/contentful/ContentfulAnchorNav'
import {ContentfulCards, type ContentfulCardsProps} from '@github-ui/swp-core/components/contentful/ContentfulCards'
import {ContentfulCtaBanner} from '@github-ui/swp-core/components/contentful/ContentfulCtaBanner'
import {ContentfulFaq} from '@github-ui/swp-core/components/contentful/ContentfulFaq'
import {ContentfulFaqGroup} from '@github-ui/swp-core/components/contentful/ContentfulFaqGroup'
import {ContentfulHero} from '@github-ui/swp-core/components/contentful/ContentfulHero'
import {ContentfulPillars} from '@github-ui/swp-core/components/contentful/ContentfulPillars'
import {ContentfulProse} from '@github-ui/swp-core/components/contentful/ContentfulProse'
import {ContentfulRiver} from '@github-ui/swp-core/components/contentful/ContentfulRiver'
import {ContentfulRiverBreakout} from '@github-ui/swp-core/components/contentful/ContentfulRiverBreakout'
import {ContentfulSectionIntro} from '@github-ui/swp-core/components/contentful/ContentfulSectionIntro'
import {ContentfulSubnav} from '@github-ui/swp-core/components/contentful/ContentfulSubnav'
import {ContentfulTestimonials} from '@github-ui/swp-core/components/contentful/ContentfulTestimonials'
import {ContentfulTimeline} from '@github-ui/swp-core/components/contentful/ContentfulTimeline'
import {Stack, ThemeProvider} from '@primer/react-brand'

import type {FreeFormPage, TemplateFreeFormSection} from '../../lib/types/contentful'
import type {ArrayElement} from '../../lib/types/utils'
import {SectionBackgroundImage} from './components/SectionBackgroundImage'

type FreeFormSectionComponents = ArrayElement<TemplateFreeFormSection['fields']['components']>

function getReactComponentFor<T extends FreeFormSectionComponents>(component: T): React.ElementType {
  const map: Record<FreeFormSectionComponents['sys']['contentType']['sys']['id'], React.ElementType> = {
    primerComponentAnchorNav: ContentfulAnchorNav,
    primerComponentHero: ContentfulHero,
    primerComponentSectionIntro: ContentfulSectionIntro,
    primerComponentRiver: ContentfulRiver,
    primerComponentRiverBreakout: ContentfulRiverBreakout,
    primerCards: (props: Required<Pick<ContentfulCardsProps, 'component'>>) => (
      <ContentfulCards {...props} className="FreeForm__Cards" />
    ),
    primerComponentFaq: ContentfulFaq,
    primerComponentFaqGroup: ContentfulFaqGroup,
    primerComponentCtaBanner: ContentfulCtaBanner,
    primerPillars: ContentfulPillars,
    primerComponentProse: ContentfulProse,
    primerTestimonials: ContentfulTestimonials,
    primerComponentTimeline: ContentfulTimeline,
    primerComponentSubnav: ContentfulSubnav,
  }

  return map[component.sys.contentType.sys.id]
}

export type FreeFormTemplateProps = {
  page: FreeFormPage
}

export function FreeFormTemplate({page}: FreeFormTemplateProps) {
  const pageColorMode = page.fields.settings?.fields.colorMode ?? 'light'

  return (
    <ThemeProvider colorMode={pageColorMode} style={{backgroundColor: 'var(--brand-color-canvas-default)'}}>
      <Stack
        padding="none"
        gap="spacious"
        direction="vertical"
        className="MktLandingPage pb-8"
        style={{minHeight: '100vh'}}
      >
        {page.fields.template.fields.sections.map((section, index) => {
          const sectionColorMode = section.fields.colorMode === 'inherit' ? pageColorMode : section.fields.colorMode

          return (
            <ThemeProvider
              key={section.sys.id}
              colorMode={sectionColorMode}
              style={{backgroundColor: 'var(--brand-color-canvas-default)'}}
            >
              {/* This is a basic implementation to detect the HPC element, but it is likely our best chance
              considering this is a free-form template. In marketing pages, the most principal element
              is usually at the top of the page. */}
              <section data-hpc={index === 0} className="width-full position-relative" id={section.fields.id}>
                <SectionBackgroundImage fields={section.fields} />

                {section.fields.components.map(component => {
                  const ContentfulComponent = getReactComponentFor(component)

                  return ContentfulComponent === ContentfulSubnav ? (
                    <ContentfulComponent component={component} />
                  ) : (
                    <div key={component.sys.id} className="container-xl position-relative p-responsive">
                      <ContentfulComponent component={component} />
                    </div>
                  )
                })}
              </section>
            </ThemeProvider>
          )
        })}
      </Stack>
    </ThemeProvider>
  )
}
