import {ThemeProvider} from '@primer/react'
import {render, screen} from '@testing-library/react'

import {TracksLabel} from '../../../client/components/side-panel/header/fields/tracks-label'

describe('TracksLabel', () => {
  it('should not render when there are no tracks to show', () => {
    render(<TracksLabel />, {wrapper: ThemeProvider})
    expect(screen.queryByTestId('progress-text')).not.toBeInTheDocument()
  })

  it('should not render when the completions total is equals to 0', () => {
    render(<TracksLabel completion={{completed: 0, percent: 0, total: 0}} />)
    expect(screen.queryByTestId('progress-text')).not.toBeInTheDocument()
  })

  it.each([
    {completion: {completed: 0, percent: 0, total: 1}, expected: '1 task'},
    {completion: {completed: 0, percent: 0, total: 2}, expected: '2 tasks'},
    {completion: {completed: 0, percent: 0, total: 10}, expected: '10 tasks'},
  ])('should render $expected where there is only 1 uncompleted task', ({completion, expected}) => {
    render(<TracksLabel completion={completion} />, {wrapper: ThemeProvider})
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it.each([
    {completion: {completed: 1, percent: 0.5, total: 2}, expected: '1 of 2 tasks'},
    {completion: {completed: 2, percent: 0.6, total: 3}, expected: '2 of 3 tasks'},
    {completion: {completed: 2, percent: 1, total: 2}, expected: '2 tasks done'},
    {completion: {completed: 1, percent: 1, total: 1}, expected: '1 task done'},
  ])('should render $expected when there are tracks to show', ({completion, expected}) => {
    render(<TracksLabel completion={completion} />, {wrapper: ThemeProvider})
    expect(screen.getByTestId('progress-text')).toBeInTheDocument()
    expect(screen.queryByTestId('progress-text')).toHaveTextContent(expected)
  })
})
