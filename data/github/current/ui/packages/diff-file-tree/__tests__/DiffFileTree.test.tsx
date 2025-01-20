import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {DiffFileTree} from '../DiffFileTree'

function TestComponent() {
  return (
    <DiffFileTree
      diffs={[
        {
          path: 'src/Components/Component.tsx',
          pathDigest: 'test-digest',
          changeType: 'ADDED',
        },
        {
          path: 'src/Components/Tree.tsx',
          pathDigest: 'test-digest',
          changeType: 'RENAMED',
        },
        {
          path: 'README.md',
          pathDigest: 'test-digest',
          changeType: 'MODIFIED',
          totalAnnotationsCount: 1,
        },
        {
          path: 'file.rb',
          pathDigest: 'test-digest',
          changeType: 'DELETED',
          totalAnnotationsCount: 2,
        },
      ]}
    />
  )
}

test('Renders the DiffFileTree', () => {
  render(<TestComponent />)
  expect(screen.getByLabelText('File Tree')).toBeInTheDocument()
  expect(screen.getByText('src/Components')).toBeInTheDocument()
  expect(screen.getByText('Component.tsx')).toBeInTheDocument()
  expect(screen.getByText('Tree.tsx')).toBeInTheDocument()
  expect(screen.getByText('README.md')).toBeInTheDocument()
  expect(screen.getByText('file.rb')).toBeInTheDocument()
  expect(screen.getByText('has 2 comments', {selector: '.sr-only'})).toBeInTheDocument()
  expect(screen.getByText('has 1 comment', {selector: '.sr-only'})).toBeInTheDocument()
})
