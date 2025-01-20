import {BLOCKS, type Document} from '@contentful/rich-text-types'
import {render, screen} from '@testing-library/react'

import {ContentfulCtaBanner} from '../../../../components/contentful/ContentfulCtaBanner/ContentfulCtaBanner'
import type {PrimerComponentCtaBanner} from '../../../../schemas/contentful/contentTypes/primerComponentCtaBanner'

const description: Document = {
  nodeType: BLOCKS.DOCUMENT,
  data: {},
  content: [
    {
      nodeType: BLOCKS.PARAGRAPH,
      data: {},
      content: [
        {
          nodeType: 'text',
          value: 'Example CTA Banner Description',
          data: {},
          marks: [],
        },
      ],
    },
  ],
}

const contentfulCTABannerFixture: PrimerComponentCtaBanner = {
  fields: {
    heading: 'Example CTA Banner Header',
    description,
    align: 'start',
    hasBorder: false,
    hasShadow: true,
    hasBackground: true,
    callToActionPrimary: {
      sys: {
        id: 'foo',
        contentType: {
          sys: {
            id: 'link',
          },
        },
      },
      fields: {
        text: 'Primary Button',
        href: '#',
      },
    },
    callToActionSecondary: {
      sys: {
        id: 'foo',
        contentType: {
          sys: {
            id: 'link',
          },
        },
      },
      fields: {
        text: 'Secondary Button',
        href: '#',
      },
    },
  },
  sys: {
    id: 'foo',
    contentType: {
      sys: {
        id: 'primerComponentCtaBanner',
      },
    },
  },
}

const contentfulCTABannerWithAppStoreLinksFixture = {
  ...contentfulCTABannerFixture,
  sys: {
    ...contentfulCTABannerFixture.sys,
  },
  fields: {
    ...contentfulCTABannerFixture.fields,
    trailingComponent: [
      {
        sys: {
          id: '285U5ARYqS8ahrYt3sV7zM',
          contentType: {
            sys: {
              id: 'appStoreButton' as const,
            },
          },
        },
        fields: {
          storeOs: 'Android' as const,
          link: {
            sys: {
              id: '4vUtN6lig9rRDeZa6cbY4P',
              contentType: {
                sys: {
                  id: 'link' as const,
                },
              },
            },
            fields: {
              href: 'https://www.google.com',
              text: 'Get it on Google Play',
              openInNewTab: true,
            },
          },
        },
      },
      {
        sys: {
          id: '6rx1JU9RKBPFN8HEoBjWpJ',
          contentType: {
            sys: {
              id: 'appStoreButton' as const,
            },
          },
        },
        fields: {
          storeOs: 'iOS' as const,
          link: {
            sys: {
              id: '2IR15en8yP3mRsjSnnJtDl',
              contentType: {
                sys: {
                  id: 'link' as const,
                },
              },
            },
            fields: {
              href: 'https://www.apple.com',
              text: 'Download on the App Store',
              openInNewTab: false,
            },
          },
        },
      },
    ],
  },
}

describe('ContentfulCtaBanner', () => {
  it('renders the CTABanner component', () => {
    render(<ContentfulCtaBanner component={contentfulCTABannerFixture} />)

    expect(screen.getByText('Example CTA Banner Header')).toBeInTheDocument()
    expect(screen.getByText('Example CTA Banner Description')).toBeInTheDocument()
    expect(screen.getByText('Primary Button')).toBeInTheDocument()
    expect(screen.getByText('Secondary Button')).toBeInTheDocument()
  })

  it('renders the Mobile App Store links over the Primary and Secondary CTA buttons', () => {
    render(<ContentfulCtaBanner component={contentfulCTABannerWithAppStoreLinksFixture} />)

    expect(screen.queryByText('Primary Button')).not.toBeInTheDocument()
    expect(screen.queryByText('Secondary Button')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Download on the App Store')).toBeInTheDocument()
    expect(screen.getByLabelText('Get it on Google Play')).toBeInTheDocument()
  })
})
