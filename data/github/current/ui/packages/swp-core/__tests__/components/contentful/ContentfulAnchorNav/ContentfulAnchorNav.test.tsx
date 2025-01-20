import {render, screen} from '@testing-library/react'
import {ContentfulAnchorNav} from '../../../../components/contentful/ContentfulAnchorNav/ContentfulAnchorNav'

describe('ContentfulAnchorNav', () => {
  it('Renders the AnchorNav correctly', () => {
    render(
      <ContentfulAnchorNav
        component={{
          sys: {id: 'example-nav', contentType: {sys: {id: 'primerComponentAnchorNav'}}},
          fields: {
            links: [
              {
                sys: {id: 'example-link', contentType: {sys: {id: 'primerComponentAnchorLink'}}},
                fields: {id: 'foo', text: 'Example anchor link'},
              },
            ],
            action: {
              sys: {id: 'example-action', contentType: {sys: {id: 'link'}}},
              fields: {href: '#action', text: 'Example action'},
            },
          },
        }}
      />,
    )

    expect(screen.getByTestId('foo-anchor-link')).toHaveAttribute('href', '#foo')
  })
})
