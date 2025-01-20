/* eslint filenames/match-regex: "off" */

import {documentToReactComponents} from '@contentful/rich-text-react-renderer'
import {BLOCKS, INLINES} from '@contentful/rich-text-types'
import type {PrimerComponentPillar} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentPillar'
import type {PrimerComponentRiver} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentRiver'
import type {PrimerComponentSectionIntro} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentSectionIntro'
import {Text} from '@primer/react-brand'

export function renderRiverText(text: PrimerComponentRiver['fields']['text']) {
  return documentToReactComponents(text, {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_, children) => {
        return (
          <Text variant="muted" size="300" weight="light">
            {children}
          </Text>
        )
      },
      [INLINES.HYPERLINK]: (node, children) => {
        return (
          <a className="Link--inTextBlock" href={node.data.uri}>
            {children}
          </a>
        )
      },
    },
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any --
     *
     * We need to cast to `any` to avoid compilation errors between Contentful's
     * documentToReactComponents and Primer Brand's types.
     */
  }) as any
}

export function renderSectionIntroHeading(
  heading: PrimerComponentSectionIntro['fields']['heading'],
  options: {textGradient: string},
) {
  return documentToReactComponents(heading, {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_, children) => {
        return (
          <Text
            as="p"
            size="500"
            weight="semibold"
            className={`text-gradient ${options.textGradient}`}
            animate="slide-in-right"
          >
            {children}
          </Text>
        )
      },
    },
  })
}

export function renderPillarDescription(description: PrimerComponentPillar['fields']['description']) {
  return documentToReactComponents(description, {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_, children) => {
        return (
          <Text as="p" variant="muted" weight="light">
            {children}
          </Text>
        )
      },
      [INLINES.HYPERLINK]: (node, children) => {
        return (
          <a className="Link--inTextBlock" href={node.data.uri}>
            {children}
          </a>
        )
      },
    },
  })
}
