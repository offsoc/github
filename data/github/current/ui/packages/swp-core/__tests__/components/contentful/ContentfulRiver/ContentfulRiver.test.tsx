import {BLOCKS, type Document} from '@contentful/rich-text-types'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {ContentfulRiver} from '../../../../components/contentful/ContentfulRiver/ContentfulRiver'

const text: Document = {
  nodeType: BLOCKS.DOCUMENT,
  data: {},
  content: [
    {
      nodeType: BLOCKS.PARAGRAPH,
      data: {},
      content: [
        {
          nodeType: 'text',
          value: 'Text Placeholder',
          data: {},
          marks: [],
        },
      ],
    },
  ],
}

describe('River', () => {
  describe('working with different types of visuals', () => {
    it('renders an img tag instead of a frame if the visual is of type image', async () => {
      render(
        <ContentfulRiver
          component={{
            sys: {
              id: 'foo',
              contentType: {
                sys: {
                  id: 'primerComponentRiver',
                },
              },
            },
            fields: {
              imageAlt: 'placeholder image',
              align: 'start',
              imageTextRatio: '50:50',
              heading: 'Heading',
              text,
              callToAction: {
                sys: {
                  id: 'foo',
                  contentType: {
                    sys: {
                      id: 'link',
                    },
                  },
                },
                fields: {
                  text: 'CTA',
                  href: '#',
                },
              },
              image: {
                fields: {
                  description: 'placeholder image',
                  file: {
                    url: 'https://via.placeholder.com/300',
                  },
                },
              },
            },
          }}
        />,
      )

      expect(screen.getByRole('img')).toBeInTheDocument()
      expect(screen.queryByRole('application')).toBeNull()
    })

    it('renders a frame tag instead of an image if the visual is of type video', async () => {
      render(
        <ContentfulRiver
          component={{
            sys: {
              id: 'foo',
              contentType: {
                sys: {
                  id: 'primerComponentRiver',
                },
              },
            },
            fields: {
              align: 'start',
              imageTextRatio: '50:50',
              heading: 'Heading',
              text,
              callToAction: {
                sys: {
                  id: 'foo',
                  contentType: {
                    sys: {
                      id: 'link',
                    },
                  },
                },
                fields: {
                  text: 'CTA',
                  href: '#',
                },
              },
              videoSrc: 'https://www.youtube.com/embed/3yF_UA90eus',
            },
          }}
        />,
      )

      expect(screen.getByRole('application')).toBeInTheDocument()
      expect(screen.queryByRole('img')).toBeNull()
    })
  })
})
