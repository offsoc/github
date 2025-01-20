import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {StartThreadComment} from '../StartThreadComment'

function TestComponent({isLeftSide = false}: {isLeftSide?: boolean}) {
  return (
    <StartThreadComment
      batchingEnabled={false}
      batchPending={false}
      commentBoxConfig={{
        pasteUrlsAsPlainText: false,
        useMonospaceFont: false,
      }}
      filePath="file1.md"
      isLeftSide={isLeftSide}
      lineNumber={1}
      onAddComment={noop}
      repositoryId="mock"
      subjectId="mock"
      threadsConnectionId="mock"
      viewerData={{
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
        login: 'mona',
      }}
    />
  )
}

test('component displays a header and comment editor', async () => {
  render(<TestComponent />)

  expect(screen.getByText('Add a comment')).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Leave a comment')).toBeInTheDocument()
})
