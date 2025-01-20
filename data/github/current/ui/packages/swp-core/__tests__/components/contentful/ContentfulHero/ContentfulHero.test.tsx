import {render, screen} from '@testing-library/react'

import {ContentfulHero} from '../../../../components/contentful/ContentfulHero/ContentfulHero'

const contentfulHeroFixture = {
  sys: {
    id: 'foo',
    contentType: {
      sys: {
        id: 'primerComponentHero' as const,
      },
    },
  },
  fields: {
    heading: 'Example Hero Header',
    description: 'Example Hero Description',
    align: 'start' as const,
    hasBackground: true,
    hasShadow: true,
    hasBorder: false,
    callToActionPrimary: {
      sys: {
        id: 'foo',
        contentType: {
          sys: {
            id: 'link' as const,
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
            id: 'link' as const,
          },
        },
      },
      fields: {
        text: 'Secondary Button',
        href: '#',
      },
    },
  },
}

const contentfulHeroWithAppStoreLinksFixture = {
  ...contentfulHeroFixture,
  sys: {
    ...contentfulHeroFixture.sys,
  },
  fields: {
    ...contentfulHeroFixture.fields,
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

describe('ContentfulHero', () => {
  it('renders the Hero component', () => {
    render(<ContentfulHero component={contentfulHeroFixture} />)

    expect(screen.getByText('Example Hero Header')).toBeInTheDocument()
    expect(screen.getByText('Example Hero Description')).toBeInTheDocument()
  })

  it('renders the Mobile App Store links over the Primary and Secondary CTA buttons', () => {
    render(<ContentfulHero component={contentfulHeroWithAppStoreLinksFixture} />)

    expect(screen.queryByText('Primary Button')).not.toBeInTheDocument()
    expect(screen.queryByText('Secondary Button')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Download on the App Store')).toBeInTheDocument()
    expect(screen.getByLabelText('Get it on Google Play')).toBeInTheDocument()
  })
})
