import {screen} from '@testing-library/react'
import {renderWithClient} from '@github-ui/pull-request-page-data-tooling/render-with-query-client'
import {PullRequestHeader, type PullRequestHeaderProps} from '../components/PullRequestHeader'
import {getCommitsRoutePayload} from '../test-utils/mock-data'
import {EditTitleFormLabel} from '../components/PullRequestEditTitleForm'
import type {SafeHTMLString} from '@github-ui/safe-html'

function PullRequestHeaderTestComponent(props: PullRequestHeaderProps) {
  return <PullRequestHeader {...props} />
}

const {pullRequest, repository, urls, user, bannersData} = getCommitsRoutePayload()

describe('Pull Request Header', () => {
  test('renders pull request title', () => {
    renderWithClient(
      <PullRequestHeaderTestComponent
        user={user}
        bannersData={bannersData}
        pullRequest={pullRequest}
        repository={repository}
        urls={urls}
      />,
    )
    expect(screen.getByRole('heading')).toHaveTextContent(pullRequest.title)
  })

  test('renders a pull request html title', () => {
    pullRequest.title = 'This is my `typescript` PR'
    pullRequest.titleHtml = 'This is my <code>typescript</code> PR' as SafeHTMLString

    renderWithClient(
      <PullRequestHeaderTestComponent
        user={user}
        bannersData={bannersData}
        pullRequest={pullRequest}
        repository={repository}
        urls={urls}
      />,
    )

    expect(screen.getByRole('heading')).toHaveTextContent('This is my typescript PR')
    expect(screen.getByText('typescript')).toBeInTheDocument()
  })

  test('renders pull request state when open', () => {
    renderWithClient(
      <PullRequestHeaderTestComponent
        user={user}
        bannersData={bannersData}
        pullRequest={pullRequest}
        repository={repository}
        urls={urls}
      />,
    )
    expect(screen.getByText(/Open/)).toBeInTheDocument()
  })

  test('renders pull request state when draft', () => {
    pullRequest.state = 'draft'
    renderWithClient(
      <PullRequestHeaderTestComponent
        user={user}
        bannersData={bannersData}
        pullRequest={pullRequest}
        repository={repository}
        urls={urls}
      />,
    )
    expect(screen.getByText(/Draft/)).toBeInTheDocument()
  })

  test('renders pull request state when merged', () => {
    pullRequest.state = 'merged'
    renderWithClient(
      <PullRequestHeaderTestComponent
        user={user}
        bannersData={bannersData}
        pullRequest={pullRequest}
        repository={repository}
        urls={urls}
      />,
    )
    expect(screen.getByText(/Merged/)).toBeInTheDocument()
  })

  test('renders pull request state when closed', () => {
    pullRequest.state = 'closed'
    renderWithClient(
      <PullRequestHeaderTestComponent
        user={user}
        bannersData={bannersData}
        pullRequest={pullRequest}
        repository={repository}
        urls={urls}
      />,
    )
    expect(screen.getByText(/Closed/)).toBeInTheDocument()
  })

  test('renders pull request state when queued', () => {
    pullRequest.state = 'queued'
    renderWithClient(
      <PullRequestHeaderTestComponent
        user={user}
        bannersData={bannersData}
        pullRequest={pullRequest}
        repository={repository}
        urls={urls}
      />,
    )
    expect(screen.getByText(/Queued/)).toBeInTheDocument()
  })

  test('renders Code button', () => {
    const {user: currentUser} = getCommitsRoutePayload()

    renderWithClient(
      <PullRequestHeaderTestComponent
        user={currentUser}
        pullRequest={pullRequest}
        repository={repository}
        urls={urls}
        bannersData={bannersData}
      />,
    )

    // One for small screen, one for large screen
    expect(screen.getAllByRole('button', {name: /Code/})).toHaveLength(2)
  })

  describe('edit button', () => {
    test('does not render an edit button when user does not have edit permissions', () => {
      user.canEditTitle = false
      renderWithClient(
        <PullRequestHeaderTestComponent
          user={user}
          bannersData={bannersData}
          pullRequest={pullRequest}
          repository={repository}
          urls={urls}
        />,
      )
      expect(screen.queryByRole('button', {name: /Edit/})).not.toBeInTheDocument()
    })

    test('does not render an edit title form when user does not have edit permissions', () => {
      user.canEditTitle = false
      renderWithClient(
        <PullRequestHeaderTestComponent
          user={user}
          bannersData={bannersData}
          pullRequest={pullRequest}
          repository={repository}
          urls={urls}
        />,
      )
      expect(screen.queryByLabelText('Edit Pull Request Title')).not.toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    test('does not render an edit title form when user with correct permissions has not clicked edit button', () => {
      user.canEditTitle = true
      renderWithClient(
        <PullRequestHeaderTestComponent
          user={user}
          bannersData={bannersData}
          pullRequest={pullRequest}
          repository={repository}
          urls={urls}
        />,
      )
      expect(screen.queryByLabelText('Edit Pull Request Title')).not.toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    test('renders edit title form when user with correct permissions clicks edit button', async () => {
      const {user: currentUser} = getCommitsRoutePayload()
      currentUser.canEditTitle = true

      const {user: viewer} = renderWithClient(
        <PullRequestHeaderTestComponent
          user={currentUser}
          bannersData={bannersData}
          pullRequest={pullRequest}
          repository={repository}
          urls={urls}
        />,
      )

      const editTitleButton = screen.getAllByRole('button', {name: /Edit/})

      // One for small screen, one for large screen
      expect(editTitleButton).toHaveLength(2)
      await viewer.click(editTitleButton[0]!)

      // On click, form appears and Edit button is hidden
      expect(screen.getByLabelText(EditTitleFormLabel)).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.queryByRole('button', {name: /Edit/})).not.toBeInTheDocument()
    })

    test('hides edit title form when user clicks cancel', async () => {
      const {user: currentUser} = getCommitsRoutePayload()
      currentUser.canEditTitle = true

      const {user: viewer} = renderWithClient(
        <PullRequestHeaderTestComponent
          user={currentUser}
          bannersData={bannersData}
          pullRequest={pullRequest}
          repository={repository}
          urls={urls}
        />,
      )

      const editTitleButton = screen.getAllByRole('button', {name: /Edit/})

      // One for small screen, one for large screen
      expect(editTitleButton).toHaveLength(2)
      await viewer.click(editTitleButton[0]!)

      // On click, form appears and Edit button is hidden
      expect(screen.getByLabelText(EditTitleFormLabel)).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.queryByRole('button', {name: /Edit/})).not.toBeInTheDocument()

      const cancelButton = screen.getByRole('button', {name: /Cancel/})
      await viewer.click(cancelButton)

      // On click, Edit button appears and form is hidden
      expect(screen.queryByLabelText(EditTitleFormLabel)).not.toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.getAllByRole('button', {name: /Edit/})).toHaveLength(2)
    })
  })
})
