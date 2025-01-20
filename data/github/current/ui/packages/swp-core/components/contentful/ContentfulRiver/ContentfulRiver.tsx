import {documentToReactComponents} from '@contentful/rich-text-react-renderer'
import {BLOCKS, INLINES} from '@contentful/rich-text-types'
import {Heading, InlineLink, Link, River, Text, type LinkProps} from '@primer/react-brand'

import type {PrimerComponentRiver} from '../../../schemas/contentful/contentTypes/primerComponentRiver'
import {ContentfulTimeline} from '../ContentfulTimeline/ContentfulTimeline'

export type ContentfulRiverProps = {
  component: PrimerComponentRiver
  linkProps?: LinkProps
}

export function ContentfulRiver({component, linkProps}: ContentfulRiverProps) {
  const {trailingComponent} = component.fields
  /**
   * We use an empty fragment if `props.content.cta` is not defined for compliance
   * with `River.Content` types (`River.Content` does not accept `null` as children).
   */
  const ctaLink =
    component.fields.callToAction !== undefined ? (
      <Link
        href={component.fields.callToAction.fields.href}
        data-ref={`river-cta-link-${component.fields.callToAction.sys.id}`}
        {...(linkProps ?? {})}
      >
        {component.fields.callToAction.fields.text}
      </Link>
    ) : (
      <></>
    )

  const getTrailingComponent = trailingComponent
    ? () => <ContentfulTimeline component={trailingComponent} />
    : undefined

  return (
    <River align={component.fields.align} imageTextRatio={component.fields.imageTextRatio}>
      <River.Visual hasShadow={component.fields.hasShadow} className="width-full">
        {component.fields.image !== undefined ? (
          <img
            src={component.fields.image.fields.file.url}
            alt={component.fields.imageAlt ?? component.fields.image.fields.description ?? ''}
          />
        ) : component.fields.videoSrc !== undefined ? (
          <div className="position-relative" style={{paddingBottom: '55%'}}>
            <iframe
              role="application"
              className="border-0 width-full height-full position-absolute top-0 left-0"
              src={component.fields.videoSrc}
              title={component.fields.heading}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : null}
      </River.Visual>

      <River.Content trailingComponent={getTrailingComponent}>
        {/* `h3` is the default heading level for River.Content */}
        <Heading as="h3">{component.fields.heading}</Heading>

        {
          documentToReactComponents(component.fields.text, {
            renderNode: {
              [BLOCKS.PARAGRAPH]: (_, children) => {
                return <Text>{children}</Text>
              },
              [INLINES.HYPERLINK]: (node, children) => {
                return (
                  <InlineLink data-ref={`river-inline-link-${component.sys.id}`} href={node.data.uri}>
                    {children}
                  </InlineLink>
                )
              },
            },
            /**
             * 2023-09-25:
             * Primer Brand's River types are very strict, and altough we're going to
             * render a fully-compliant River.Content, types from documentToReactComponents
             * are not compatible with River.Content types. We're casting to `any` so the compiler
             * doesn't complain.
             */
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }) as any
        }

        {ctaLink}
      </River.Content>
    </River>
  )
}
