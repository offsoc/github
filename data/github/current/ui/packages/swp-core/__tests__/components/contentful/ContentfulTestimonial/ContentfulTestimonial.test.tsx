import {BLOCKS, type Document} from '@contentful/rich-text-types'
import {render, screen} from '@testing-library/react'

import {ContentfulTestimonial} from '../../../../components/contentful/ContentfulTestimonial/ContentfulTestimonial'
import type {PrimerComponentTestimonial} from '../../../../schemas/contentful/contentTypes/primerComponentTestimonial'

const BLANK_RICH_TEXT: Document = {
  nodeType: BLOCKS.DOCUMENT,
  data: {},
  content: [],
}

const AUTHOR: PrimerComponentTestimonial['fields']['author'] = {
  fields: {
    fullName: 'John Doe',
    position: 'CEO',
    photo: {
      fields: {
        file: {
          url: 'https://logo.of.author.com',
        },
      },
    },
  },
  sys: {
    id: 'author',
    contentType: {
      sys: {
        id: 'person',
      },
    },
  },
}

const LOGO: PrimerComponentTestimonial['fields']['logo'] = {
  fields: {
    file: {
      url: 'https://logo.of.github.com',
    },
  },
}

describe('ContentfulTestimonial', () => {
  it("renders the logo if it is available, even if the author's photo is available", async () => {
    render(
      <ContentfulTestimonial
        component={{
          fields: {
            quote: BLANK_RICH_TEXT,
            author: AUTHOR,
            logo: LOGO,
            size: 'large',
          },
          sys: {
            contentType: {
              sys: {
                id: 'primerComponentTestimonial',
              },
            },
            id: 'foo',
          },
        }}
      />,
    )

    await expect(screen.findByRole('img')).resolves.toHaveAttribute('src', 'https://logo.of.github.com')
  })

  it('renders the author photo if there is no logo', async () => {
    render(
      <ContentfulTestimonial
        component={{
          fields: {
            quote: BLANK_RICH_TEXT,
            author: AUTHOR,
            logo: undefined,
            size: 'large',
          },
          sys: {
            contentType: {
              sys: {
                id: 'primerComponentTestimonial',
              },
            },
            id: 'foo',
          },
        }}
      />,
    )

    await expect(screen.findByRole('img')).resolves.toHaveAttribute('src', 'https://logo.of.author.com')
  })

  it('does not render an image if none author nor logo are available', async () => {
    render(
      <ContentfulTestimonial
        component={{
          fields: {
            quote: BLANK_RICH_TEXT,
            author: undefined,
            logo: undefined,
            size: 'large',
          },
          sys: {
            contentType: {
              sys: {
                id: 'primerComponentTestimonial',
              },
            },
            id: 'foo',
          },
        }}
      />,
    )

    await expect(screen.findByRole('img')).rejects.toThrow()
  })
})
