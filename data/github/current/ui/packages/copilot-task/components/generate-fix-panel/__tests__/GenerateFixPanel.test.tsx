import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {getGenerativeTaskData} from '../../../test-utils/mock-data'
import {GenerateFixPanel} from '../GenerateFixPanel'

function TestComponent() {
  return <GenerateFixPanel focusedGenerativeTask={getGenerativeTaskData()} onClose={() => {}} />
}

describe('GenerateFixPanel', () => {
  test('renders generate fix panel', () => {
    render(<TestComponent />)

    expect(screen.getByText('Thread by')).toBeVisible()
    expect(screen.getByText('comment 1 body')).toBeVisible()
    expect(screen.getByText('monalisa')).toBeVisible()
    expect(screen.getByText('comment 2 body')).toBeVisible()
    expect(screen.getByText('contributor')).toBeVisible()
    expect(screen.getByText('comment 3 body')).toBeVisible()
    expect(screen.getByText('rando')).toBeVisible()
    expect(screen.getByText('Dismiss')).toBeVisible()
    expect(screen.getByText('Generate a fix')).toBeVisible()
  })

  test('generating fix busy state', async () => {
    const {user} = render(<TestComponent />)

    await user.click(screen.getByText('Generate a fix'))
    expect(screen.getByText('Copilot')).toBeVisible()
    expect(screen.getByText('responding...')).toBeVisible()
    expect(screen.getByText('Thread by')).toBeVisible()
    expect(screen.getByText('comment 1 body')).toBeVisible()
    expect(screen.getByText('monalisa')).toBeVisible()

    // replies should collapse into a single line
    expect(screen.queryByText('comment 2 body')).not.toBeInTheDocument()
    expect(screen.queryByText('contributor')).not.toBeInTheDocument()
    expect(screen.getByText('2 replies')).toBeVisible()
  })
})
