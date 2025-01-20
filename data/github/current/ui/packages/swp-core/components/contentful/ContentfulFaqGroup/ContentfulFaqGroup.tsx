import {FAQGroup} from '@primer/react-brand'

import type {PrimerComponentFaqGroup} from '../../../schemas/contentful/contentTypes/primerComponentFaqGroup'
import {ContentfulFaq, renderContentfulFaq} from '../ContentfulFaq/ContentfulFaq'
import {FAQSeoSchema} from '../../structuredData/FaqSeoSchema'

export type ContentfulFaqGroupProps = {
  component: PrimerComponentFaqGroup
}

export function ContentfulFaqGroup({component}: ContentfulFaqGroupProps) {
  if (component.fields.faqs === undefined) {
    return (
      <FAQGroup>
        <FAQGroup.Heading>{component.fields.heading}</FAQGroup.Heading>
      </FAQGroup>
    )
  }

  /**
   * If there is only one FAQ, we can render it as a standalone FAQ component.
   */
  if (component.fields.faqs.length === 1 && component.fields.faqs[0] !== undefined) {
    return (
      <>
        <ContentfulFaq component={component.fields.faqs[0]} />
        <FAQSeoSchema faqGroup={component} />
      </>
    )
  }

  return (
    <>
      <FAQGroup>
        <FAQGroup.Heading>{component.fields.heading}</FAQGroup.Heading>
        {/**
         * The renderContentfulFaq function is used here instead of a ContentfulFaq component. This is due to
         * Primer Brand's restriction on rendering non-Primer Brand FAQ components within an FAQGroup.
         * For example, placing a ContentfulFaq component directly inside an FAQGroup will not render properly.
         */}
        {component.fields.faqs.map(faq => renderContentfulFaq(faq))}
      </FAQGroup>
      <FAQSeoSchema faqGroup={component} />
    </>
  )
}
