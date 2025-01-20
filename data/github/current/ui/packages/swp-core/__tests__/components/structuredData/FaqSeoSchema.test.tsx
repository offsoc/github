import {render, screen} from '@testing-library/react'
import {FAQSeoSchema} from '../../../components/structuredData/FaqSeoSchema'
import {FaqGroupPayload} from './fixtures/FaqPayload'
import type {PrimerComponentFaqGroup} from '../../../schemas/contentful/contentTypes/primerComponentFaqGroup'

describe('FAQSeoSchema', () => {
  const testId = 'faq-test-id'
  it('renders questions data', () => {
    render(<FAQSeoSchema dataTestId={testId} faqGroup={FaqGroupPayload as PrimerComponentFaqGroup} />)

    const script = screen.getByTestId(testId)
    expect(script).toBeInTheDocument()
    expect(script?.textContent).toContain(
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is the meaning of life?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '<p>42</p>',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the purpose of life?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '<p>To be happy.</p>',
            },
          },
          {
            '@type': 'Question',
            name: 'What is GitHub?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '<p>A platform for developers.</p>',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the difference between Git and GitHub?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '<p>Git is a version control system. GitHub is a platform for developers.</p>',
            },
          },
        ],
      }),
    )
  })
})
