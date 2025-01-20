import {render, screen} from '@testing-library/react'
import {Image} from '../../../components/Image/Image'

describe('Image', () => {
  it('Renders the image correctly with lazy loading and decoding attribute along with other attributes', () => {
    render(<Image src="/images/modules/site/copilot/logos/duolingo.svg" alt="Duolingo's logo" height={40} />)

    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy')
    expect(screen.getByRole('img')).toHaveAttribute('decoding', 'async')
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/modules/site/copilot/logos/duolingo.svg')
    expect(screen.getByRole('img')).toHaveAttribute('alt', "Duolingo's logo")
    expect(screen.getByRole('img')).toHaveAttribute('height', '40')
  })
})
