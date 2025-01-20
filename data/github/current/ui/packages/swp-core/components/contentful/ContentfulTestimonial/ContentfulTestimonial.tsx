import {documentToReactComponents} from '@contentful/rich-text-react-renderer'
import {BLOCKS, MARKS} from '@contentful/rich-text-types'
import {Testimonial, type TestimonialProps} from '@primer/react-brand'

import type {PrimerComponentTestimonial} from '../../../schemas/contentful/contentTypes/primerComponentTestimonial'

export type ContentfulTestimonialProps = Pick<TestimonialProps, 'quoteMarkColor' | 'size'> & {
  component: PrimerComponentTestimonial
}

export function ContentfulTestimonial({component, size, quoteMarkColor}: ContentfulTestimonialProps) {
  const FALLBACK_ALT_TEXT = component.fields.author?.fields.fullName ?? 'The testimonial author'

  return (
    <Testimonial size={size ? size : component.fields.size} quoteMarkColor={quoteMarkColor}>
      <Testimonial.Quote>
        {
          documentToReactComponents(component.fields.quote, {
            renderMark: {
              /**
               * We use <em> to benefit from Primer Brand's special styling for <em> tags.
               */
              [MARKS.BOLD]: text => <em>{text}</em>,
            },
            renderNode: {
              /**
               * We don't need to wrap paragraphs in <p> tags.
               */
              [BLOCKS.PARAGRAPH]: (_, children) => children,
            },

            /* eslint-disable-next-line @typescript-eslint/no-explicit-any --
             *
             * We cast to any because types from @contentful/rich-text-react-renderer are too broad for
             * the Primer Brand's Testimonial.Quote component.
             */
          }) as any
        }
      </Testimonial.Quote>

      {component.fields.author && (
        <Testimonial.Name position={component.fields.author.fields.position}>
          {component.fields.author.fields.fullName}
        </Testimonial.Name>
      )}

      {
        /**
         * If logo exists, we always give it priority.
         */
        component.fields.logo !== undefined ? (
          <Testimonial.Logo>
            <img
              alt={component.fields.logo.fields.description ?? FALLBACK_ALT_TEXT}
              src={component.fields.logo.fields.file.url}
              width={60}
            />
          </Testimonial.Logo>
        ) : /**
         * Otherwise we use the author's photo.
         */
        component.fields.author?.fields.photo !== undefined ? (
          <Testimonial.Avatar
            alt={component.fields.author.fields.photo.fields.description ?? FALLBACK_ALT_TEXT}
            src={component.fields.author.fields.photo.fields.file.url}
          />
        ) : /**
         * If neither logo nor author's photo exist, we don't render anything.
         */
        null
      }
    </Testimonial>
  )
}
