import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {GitIgnoreDropdown} from '../GitIgnoreDropdown'
import {mockFetch} from '@github-ui/mock-fetch'

test('Renders the GitIgnoreDropdown', async () => {
  render(<GitIgnoreDropdown onSelect={() => undefined} />)
  await act(() => {
    mockFetch.resolvePendingRequest('/site/gitignore/templates', ['Ada', 'C++', 'Elixir', 'Python', 'Ruby'])
  })

  expect(screen.getByRole('button', {name: '.gitignore template: None'})).toBeInTheDocument()
})

test('Renders the GitIgnoreDropdown with selection', async () => {
  render(<GitIgnoreDropdown onSelect={() => undefined} selectedTemplate="Elixir" />)
  await act(() => {
    mockFetch.resolvePendingRequest('/site/gitignore/templates', ['Ada', 'C++', 'Elixir', 'Python', 'Ruby'])
  })

  expect(screen.getByRole('button', {name: '.gitignore template: Elixir'})).toBeInTheDocument()
})

test('No templates are retrieved', async () => {
  render(<GitIgnoreDropdown onSelect={() => undefined} />)
  await act(() => {
    mockFetch.resolvePendingRequest('/site/gitignore/templates', null)
  })

  expect(screen.getByRole('button', {name: '.gitignore template: None'})).toBeInTheDocument()
})
