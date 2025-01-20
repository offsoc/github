import type {DirectoryItem} from '@github-ui/code-view-types'
import {render, screen, waitFor} from '@testing-library/react'

import {ItemPathName} from '../Cells'

describe('ItemPathName', () => {
  test('renders name if content has no simplified path', async () => {
    const item = {hasSimplifiedPath: false, name: 'A'} as DirectoryItem

    render(<ItemPathName item={item} />)

    expect(await screen.findByText(item.name)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryAllByTestId('path-name-segment')).toHaveLength(0)
    })
  })

  test('renders a path if content has a simplified path', async () => {
    const item = {hasSimplifiedPath: true, name: 'f1/f2/f3'} as DirectoryItem

    render(<ItemPathName item={item} />)

    await waitFor(() => {
      expect(screen.queryAllByTestId('path-name-segment')).toHaveLength(3)
    })
    await waitFor(() => {
      expect(screen.queryByText(item.name)).not.toBeInTheDocument()
    })
  })
})
