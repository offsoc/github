import {render, screen} from '@testing-library/react'
import {ContentfulBackgroundImage} from '../../../../components/contentful/ContentfulBackgroundImage/ContentfulBackgroundImage'
import type {BackgroundImage} from '../../../../schemas/contentful/contentTypes/backgroundImage'

describe('ContentfulBackgroundImage', () => {
  it('renders an image with the correct src and srcSet', () => {
    const component: BackgroundImage = {
      fields: {
        image: {
          fields: {
            file: {
              url: '/test-image.jpg',
            },
          },
        },
      },
      sys: {id: 'foo', contentType: {sys: {id: 'backgroundImage'}}},
    }

    render(
      <ContentfulBackgroundImage component={component}>
        <p>hello, world</p>
      </ContentfulBackgroundImage>,
    )

    const image = screen.getByRole('presentation')
    const imageContainer = screen.getByTestId('contentful-bg-image-container')
    expect(imageContainer).toHaveStyle('--focus-position: center')
    expect(image).toHaveAttribute('src', `${component.fields.image.fields.file.url}?w=2400&fm=jpg&fl=progressive`)
  })

  it('sets the correct css based on focus prop', () => {
    const component: BackgroundImage = {
      fields: {
        image: {
          fields: {
            file: {
              url: '/test-image.jpg',
            },
          },
        },
        focus: 'top left',
      },
      sys: {id: 'foo', contentType: {sys: {id: 'backgroundImage'}}},
    }

    render(
      <ContentfulBackgroundImage component={component}>
        <p>hello, world</p>
      </ContentfulBackgroundImage>,
    )

    const imageContainer = screen.getByTestId('contentful-bg-image-container')
    expect(imageContainer).toHaveStyle(`--focus-position: ${component.fields.focus}`)
  })

  it('renders children, unaffected, if there is no component.', () => {
    render(
      <ContentfulBackgroundImage>
        <div data-testid="child">hello, world</div>
      </ContentfulBackgroundImage>,
    )

    const child = screen.getByTestId('child')
    expect(child).toBeInTheDocument()
  })

  it('does not set color-mode when inherit is selected.', () => {
    const component: BackgroundImage = {
      fields: {
        image: {fields: {file: {url: '/test-image.jpg'}}},
        colorMode: 'inherit',
      },
      sys: {id: 'foo', contentType: {sys: {id: 'backgroundImage'}}},
    }

    render(
      <ContentfulBackgroundImage component={component}>
        <p>hello, world</p>
      </ContentfulBackgroundImage>,
    )

    const wrapper = screen.getByTestId('contentful-bg-content')
    expect(wrapper).not.toHaveAttribute('data-color-mode')
  })

  it('sets color-mode.', () => {
    const component: BackgroundImage = {
      fields: {
        image: {fields: {file: {url: '/test-image.jpg'}}},
        colorMode: 'dark',
      },
      sys: {id: 'foo', contentType: {sys: {id: 'backgroundImage'}}},
    }
    render(
      <ContentfulBackgroundImage component={component}>
        <p>hello, world</p>
      </ContentfulBackgroundImage>,
    )

    const wrapper = screen.getByTestId('contentful-bg-content')
    expect(wrapper).toHaveAttribute('data-color-mode', 'dark')
  })
})
