import {documentToReactComponents} from '@contentful/rich-text-react-renderer'
import type {PrimerComponentFaqGroup} from '../../schemas/contentful/contentTypes/primerComponentFaqGroup'
import {BLOCKS} from '@contentful/rich-text-types'
import {renderToString} from 'react-dom/server'

type FAQSeoSchemaProps = {
  faqGroup: PrimerComponentFaqGroup
  dataTestId?: string
}

export const FAQSeoSchema = ({faqGroup, dataTestId}: FAQSeoSchemaProps) => {
  const mainEntity =
    faqGroup.fields.faqs?.flatMap(faq => {
      return faq.fields.blocks?.flatMap(block => {
        return block.fields.questions?.map(question => {
          return {
            '@type': 'Question',
            name: question.fields.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: documentToReactComponents(question.fields.answer, {
                renderNode: {
                  [BLOCKS.DOCUMENT]: (_, children) => renderToString(children),
                },
              }),
            },
          }
        })
      })
    }) ?? []

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  }
  const jsonLd = JSON.stringify(structuredData)

  /* eslint-disable-next-line react/no-danger */
  return <script data-testid={dataTestId} type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLd}} />
}
