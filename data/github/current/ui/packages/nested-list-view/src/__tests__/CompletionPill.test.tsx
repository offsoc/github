import {ThemeProvider} from '@primer/react'
import {render, screen} from '@testing-library/react'

import {NestedListViewCompletionPill} from '../CompletionPill'

describe('Completion Pill', () => {
  it('should set the appropriate accessibility properties for the progress svg', () => {
    render(
      <ThemeProvider>
        <NestedListViewCompletionPill progress={{total: 10, completed: 5, percentCompleted: 50}} />,
      </ThemeProvider>,
    )

    const completionSvg = screen.getByRole('presentation', {hidden: true})
    expect(completionSvg).toHaveAttribute('aria-hidden', 'true')
    expect(completionSvg).toHaveAttribute('focusable', 'false')
  })

  it('should correctly set the properties of the visible text', () => {
    render(<NestedListViewCompletionPill progress={{total: 10, completed: 5, percentCompleted: 50}} />)
    const completionText = screen.getByTestId('nested-list-view-completion-text')
    expect(completionText).toHaveTextContent('5 of 10')
    expect(completionText).toHaveAttribute('aria-hidden', 'true')
  })

  it('should correctly set the properties of the screen reader only text', () => {
    render(<NestedListViewCompletionPill progress={{total: 10, completed: 5, percentCompleted: 50}} />)
    const completionTextSR = screen.getByTestId('nested-list-view-completion-text-sr')
    expect(completionTextSR).toHaveTextContent('5 of 10 list items completed')
    expect(completionTextSR).toHaveClass('sr-only')
  })

  it('should render as a span by default', () => {
    render(<NestedListViewCompletionPill progress={{total: 10, completed: 5, percentCompleted: 50}} />)
    const completionPill = screen.getByTestId('nested-list-view-completion-pill')

    expect(completionPill.tagName).toBe('SPAN')
  })

  it('should render as an anchor tag when an href property is provided', () => {
    render(<NestedListViewCompletionPill href="/foo" progress={{total: 10, completed: 5, percentCompleted: 50}} />)
    const completionPill = screen.getByTestId('nested-list-view-completion-pill')

    expect(completionPill.tagName).toBe('A')
  })
})
