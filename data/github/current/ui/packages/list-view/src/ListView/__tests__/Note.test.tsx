import {render} from '@github-ui/react-core/test-utils'
import {CommitIcon} from '@primer/octicons-react'
import {screen, within} from '@testing-library/react'

import {ListView} from '../ListView'
import {ListViewNote} from '../Note'
import {renderListViewNote} from './helpers'

it('renders with a title', () => {
  renderListViewNote({title: 'My Note'})

  const note = screen.getByRole('listitem', {name: 'My Note'})
  const title = screen.getByTestId('list-view-note-title')

  expect(note).toHaveAttribute('aria-labelledby', title.id)
  expect(title).toHaveTextContent('My Note')
})

it('renders with trailing content', () => {
  renderListViewNote({title: 'My Note', children: <p>note content</p>})

  const note = screen.getByTestId('list-view-note')
  expect(within(note).getByText('note content')).toBeInTheDocument()
})

it('renders with a leading icon', () => {
  renderListViewNote({title: 'My Note', leadingIcon: CommitIcon})

  const note = screen.getByTestId('list-view-note')
  const icon = within(note).getByRole('img', {hidden: true})
  expect(icon).toBeInTheDocument()
  expect(icon).toHaveClass('octicon-commit')
})

it('renders unique IDs for each note title when there are many notes in a single ListView', () => {
  render(
    <ListView title="Test list" variant="default">
      <ListViewNote title="Note 1" />
      <ListViewNote title="Note 2" />
    </ListView>,
  )

  const noteOne = screen.getByRole('listitem', {name: 'Note 1'})
  const noteTwo = screen.getByRole('listitem', {name: 'Note 2'})
  const noteOneTitle = within(noteOne).getByTestId('list-view-note-title')
  const noteTwoTitle = within(noteTwo).getByTestId('list-view-note-title')

  expect(noteOneTitle.id).toContain('list-view-note')
  expect(noteTwoTitle.id).toContain('list-view-note')
  expect(noteOneTitle.id).not.toBe(noteTwoTitle.id)
})
