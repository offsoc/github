import {render, screen} from '@testing-library/react'
import {ArticleSeoSchema} from '../../../components/structuredData/ArticleSeoSchema'

describe('ArticleSeoSchema', () => {
  const testId = 'article-test-id'

  it('renders structured data with title and image URL', () => {
    const title = 'Test Article'
    const imageUrl = 'https://example.com/image.jpg'

    render(<ArticleSeoSchema dataTestId={testId} title={title} imageUrl={imageUrl} />)

    const script = screen.getByTestId(testId)
    expect(script).toBeInTheDocument()

    const structuredData = JSON.parse(script.textContent!)
    expect(structuredData['@type']).toBe('Article')
    expect(structuredData.headline).toBe(title)
    expect(structuredData.image).toEqual([
      `https:${imageUrl}?w=2560&h=1440&fm=webp`,
      `https:${imageUrl}?w=1280&h=960&fm=webp`,
      `https:${imageUrl}?w=1000&h=1000&fm=webp`,
    ])
    expect(structuredData.publisher).toEqual({
      '@type': 'Organization',
      name: 'GitHub',
      logo: 'https://github.githubassets.com/images/modules/open_graph/github-logo.png',
    })
    expect(structuredData.author).toEqual({
      '@type': 'Organization',
      name: 'GitHub',
      url: 'https://www.github.com',
    })
  })

  it('renders structured data without image URL', () => {
    const title = 'Test Article'

    render(<ArticleSeoSchema dataTestId={testId} title={title} imageUrl={undefined} />)

    const script = screen.getByTestId(testId)
    expect(script).toBeInTheDocument()

    const structuredData = JSON.parse(script.textContent!)
    expect(structuredData['@type']).toBe('Article')
    expect(structuredData.headline).toBe(title)
    expect(structuredData.image).toBeUndefined()
    expect(structuredData.publisher).toEqual({
      '@type': 'Organization',
      name: 'GitHub',
      logo: 'https://github.githubassets.com/images/modules/open_graph/github-logo.png',
    })
    expect(structuredData.author).toEqual({
      '@type': 'Organization',
      name: 'GitHub',
      url: 'https://www.github.com',
    })
  })
})
