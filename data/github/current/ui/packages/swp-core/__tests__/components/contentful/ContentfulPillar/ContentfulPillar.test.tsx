import {BLOCKS, type Document} from '@contentful/rich-text-types'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {ContentfulPillar} from '../../../../components/contentful/ContentfulPillar/ContentfulPillar'

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
          value: 'Text Placeholder',
          data: {},
          marks: [],
        },
      ],
    },
  ],
}

describe('Pillar', () => {
  it('Renders the correct Primer Pillar', async () => {
    render(
      <ContentfulPillar
        component={{
          sys: {
            id: 'foo',
            contentType: {
              sys: {
                id: 'primerComponentPillar',
              },
            },
          },
          fields: {
            align: 'start',
            icon: 'accessibility-inset',
            heading: 'Example Pillar Heading',
            description,
            link: {
              sys: {
                id: 'bar',
                contentType: {
                  sys: {
                    id: 'link',
                  },
                },
              },
              fields: {
                text: 'Example Link',
                href: '#',
              },
            },
          },
        }}
      />,
    )
    expect(screen.getByText('Text Placeholder')).toBeInTheDocument()
    expect(screen.getByText('Example Pillar Heading')).toBeInTheDocument()
  })
})
