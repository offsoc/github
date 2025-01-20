import {render, screen} from '@testing-library/react'
import {BreadcrumbSeoSchema} from '../../../components/structuredData/BreadcrumbSeoSchema'

describe('BreadcrumbSeoSchema', () => {
  const testId = 'breadcrumbs-test-id'

  it('renders one breadcrumb item', () => {
    const items = [{name: 'Resources', url: '/resources'}]

    render(<BreadcrumbSeoSchema dataTestId={testId} items={items} />)

    const script = screen.getByTestId(testId)
    expect(script).toBeInTheDocument()
    expect(script?.textContent).toContain(
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [{'@type': 'ListItem', position: 1, name: 'Resources', item: '/resources'}],
      }),
    )
  })

  it('renders multiple breadcrumb items', () => {
    const items = [
      {name: 'Resources', url: '/resources'},
      {name: 'Articles', url: '/resources/articles'},
      {name: 'Topic', url: '/resources/articles/topic'},
    ]

    render(<BreadcrumbSeoSchema dataTestId={testId} items={items} />)

    const script = screen.getByTestId(testId)
    expect(script).toBeInTheDocument()
    expect(script?.textContent).toContain(
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {'@type': 'ListItem', position: 1, name: 'Resources', item: '/resources'},
          {'@type': 'ListItem', position: 2, name: 'Articles', item: '/resources/articles'},
          {'@type': 'ListItem', position: 3, name: 'Topic', item: '/resources/articles/topic'},
        ],
      }),
    )
  })
})
