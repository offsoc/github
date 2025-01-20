import {render, screen} from '@testing-library/react'
import type {Document, BLOCKS, TopLevelBlock} from '@contentful/rich-text-types'
import {TableOfContents} from '../../components/TableOfContents/TableOfContents'

describe('TableOfContents', () => {
  const mockContent: Document = {
    nodeType: 'document' as BLOCKS.DOCUMENT,
    data: {},
    content: [
      {
        nodeType: 'heading-2' as TopLevelBlock['nodeType'],
        data: {},
        content: [
          {
            nodeType: 'text',
            value: 'Section 1',
            marks: [],
            data: {},
          },
        ],
      },
      {
        nodeType: 'heading-3' as TopLevelBlock['nodeType'],
        data: {},
        content: [
          {
            nodeType: 'text',
            value: 'Section 2',
            marks: [],
            data: {},
          },
        ],
      },
      {
        nodeType: 'heading-4' as TopLevelBlock['nodeType'],
        data: {},
        content: [
          {
            nodeType: 'text',
            value: 'Section 3',
            marks: [],
            data: {},
          },
        ],
      },
      {
        nodeType: 'heading-5' as TopLevelBlock['nodeType'],
        data: {},
        content: [
          {
            nodeType: 'text',
            value: 'Section 4',
            marks: [],
            data: {},
          },
        ],
      },
      {
        nodeType: 'heading-6' as TopLevelBlock['nodeType'],
        data: {},
        content: [
          {
            nodeType: 'text',
            value: 'Section 5',
            marks: [],
            data: {},
          },
        ],
      },
    ],
  }

  const mockFeaturedCta = {
    sys: {
      id: '1sHcOEbvtth2uPrk61SRTS',
      contentType: {
        sys: {
          id: 'genericCallToAction' as const,
        },
      },
    },
    fields: {
      heading: 'Featured Heading',
      description: {
        nodeType: 'document' as BLOCKS.DOCUMENT,
        data: {},
        content: [
          {
            data: {},
            content: [
              {
                data: {},
                marks: [],
                value: 'Featured Description',
                nodeType: 'text' as const,
              },
            ],
            nodeType: 'paragraph' as BLOCKS.PARAGRAPH,
          },
        ],
      },
      callToActionPrimary: {
        sys: {
          id: '6py9ZOHfCcUsw3k5beKrWx',
          contentType: {
            sys: {
              id: 'link' as const,
            },
          },
        },
        fields: {
          href: 'https://github.com',
          text: 'CTA Button',
          openInNewTab: true,
        },
      },
    },
  }

  test('renders list items of contents', () => {
    render(
      <TableOfContents analyticsId="mock-id" active="section-1" content={mockContent} featuredCta={mockFeaturedCta} />,
    )

    const tableOfContentsHeading = screen.getByText('Table of contents')
    expect(tableOfContentsHeading).toBeInTheDocument()

    const section1 = screen.getByText('Section 1')
    const section2 = screen.queryByText('Section 2')
    const section3 = screen.queryByText('Section 3')
    const section4 = screen.queryByText('Section 4')
    const section5 = screen.queryByText('Section 5')
    expect(section1).toBeInTheDocument()
    expect(section2).not.toBeInTheDocument()
    expect(section3).not.toBeInTheDocument()
    expect(section4).not.toBeInTheDocument()
    expect(section5).not.toBeInTheDocument()
  })

  test('renders featured heading, description, and primary cta button', () => {
    render(
      <TableOfContents analyticsId="mock-id" active="section-1" content={mockContent} featuredCta={mockFeaturedCta} />,
    )

    const featuredHeading = screen.getByText('Featured Heading')
    const featuredDescription = screen.getByText('Featured Description')
    expect(featuredHeading).toBeInTheDocument()
    expect(featuredDescription).toBeInTheDocument()

    const ctaButton = screen.getByText('CTA Button')
    expect(ctaButton).toBeInTheDocument()
  })
})
