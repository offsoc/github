import type {DirectoryItem, FileTreePagePayload} from '@github-ui/code-view-types'
import {mockFetch} from '@github-ui/mock-fetch'
import type {Commit, RefInfo} from '@github-ui/repos-types'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {act, screen, waitFor} from '@testing-library/react'

import {render} from '@github-ui/react-core/test-utils'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {FilesPageInfoProvider} from '../../../../contexts/FilesPageInfoContext'
import {DirectoryContent} from '../DirectoryContent'
import {oneItemPayload} from '../../../../__tests__/test-helpers'
import {CurrentTreeProvider} from '../../../../contexts/CurrentTreeContext'

jest.mock('react', () => {
  const React = jest.requireActual('react')
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.Suspense = ({children}: {children: any}) => children
  return React
})

const commitMessage = 'Test commit message'
const commitInfo: Commit = {
  oid: '123',
  url: '',
  date: new Date('2012-12-13 5:00').toISOString(),
  shortMessageHtmlLink: `<a>${commitMessage}</a>` as SafeHTMLString,
}

const item = oneItemPayload.tree.items[0]!

const templatesSuggestionPayload = {
  ...oneItemPayload,
  tree: {...oneItemPayload.tree, templateDirectorySuggestionUrl: 'github.com/learn-more'},
}

jest.useFakeTimers()
window.requestAnimationFrame = jest.fn()

beforeEach(() => {
  ;(window.requestAnimationFrame as jest.Mock).mockReset()
})

const renderDirectoryContent = (payload: FileTreePagePayload) => {
  return render(
    <CurrentRepositoryProvider repository={payload.repo}>
      <FilesPageInfoProvider action="tree" copilotAccessAllowed={false} path={payload.path} refInfo={payload.refInfo}>
        <CurrentTreeProvider payload={payload.tree}>
          <DirectoryContent />
        </CurrentTreeProvider>
      </FilesPageInfoProvider>
    </CurrentRepositoryProvider>,
  )
}

describe('DirectoryContent', () => {
  test('correctly displays directory item', async () => {
    const mock = mockFetch.mockRouteOnce(/tree-commit-info/, {[item.name]: commitInfo})

    renderDirectoryContent(oneItemPayload)

    expect(mock).toHaveBeenCalledTimes(1)
    expect(mock).toHaveBeenCalledWith('/monalisa/smile/tree-commit-info/main/src/app', expect.any(Object))

    expect(await screen.findByText(commitMessage)).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('No commit message')).not.toBeInTheDocument())
    await waitFor(() => expect(screen.queryByTestId('repo-truncation-warning')).not.toBeInTheDocument())
    expect((await screen.findAllByText(item.name))[0]).toBeInTheDocument()
  })

  test('displays component for small screens', async () => {
    const mock = mockFetch.mockRouteOnce(/tree-commit-info/, {[item.name]: commitInfo})

    renderDirectoryContent(oneItemPayload)

    const itemElement = screen.getAllByText(item.name)[0]
    expect(itemElement).toBeInTheDocument()

    expect(mock).toHaveBeenCalledTimes(1)
    expect(mock).toHaveBeenCalledWith('/monalisa/smile/tree-commit-info/main/src/app', expect.any(Object))

    const agoElement = await screen.findByTitle('Dec 13, 2012, 5:00 AM', {exact: false})
    expect(agoElement).toBeInTheDocument()

    // Commit message cell won't be shown on small screens
    const elem = screen.queryByText(commitMessage)

    //we have to test for the class presence on the parent parent parent because that class is what has the CSS
    //class that determines visibiity
    expect(
      // eslint-disable-next-line testing-library/no-node-access
      (elem!.parentNode!.parentNode!.parentNode! as Element).classList.contains('react-directory-row-commit-cell'),
    ).toBeTruthy()
  })

  test('displays "No commit message" if commit message could not be retrieved', async () => {
    const mock = mockFetch.mockRouteOnce(/tree-commit-info/, {
      [item.name]: {...commitInfo, shortMessageHtmlLink: undefined},
    })

    renderDirectoryContent(oneItemPayload)

    expect(mock).toHaveBeenCalledTimes(1)
    expect(mock).toHaveBeenCalledWith('/monalisa/smile/tree-commit-info/main/src/app', expect.any(Object))

    expect(await screen.findByText('No commit message')).toBeInTheDocument()
    expect((await screen.findAllByText(item.name))[0]).toBeInTheDocument()
  })

  test('suggests to configure issue templates if in that directory and not configured yet', async () => {
    renderDirectoryContent(templatesSuggestionPayload)

    const learnMoreLink = await screen.findByText('Learn more about configuring a template chooser.')
    expect(learnMoreLink.getAttribute('href')).toBe('github.com/learn-more')

    expect(await screen.findByText('config.yml')).toBeInTheDocument()
  })

  test('escapes characters in go-to-parent link', async () => {
    const payload = {
      ...oneItemPayload,
      path: 'C#/lib',
      refInfo: {
        name: 'feature/#23-skidoo',
      } as RefInfo,
    }

    renderDirectoryContent(payload)
    await waitFor(() => {
      const goDirectoryUpRow = screen.queryByTestId('up-tree') as HTMLAnchorElement
      expect(goDirectoryUpRow.href).toBe('http://localhost/monalisa/smile/tree/feature/%2323-skidoo/C%23')
    })
  })

  test('incrementally renders rows when total is more than 100', async () => {
    const items: DirectoryItem[] = []
    for (let i = 0; i < 120; i++) {
      items.push({...item, name: `item${i}`, path: `item${i}`})
    }
    const payload = {
      ...oneItemPayload,
      tree: {
        totalCount: 120,
        items,
        showBranchInfobar: false,
      },
    }
    renderDirectoryContent(payload)

    expect((await screen.findAllByText('item99'))[0]).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText('item101')).not.toBeInTheDocument()
    })
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)
  })

  test('shows the "View all files" row on mobile sized screens', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const items: DirectoryItem[] = []
    for (let i = 0; i < 15; i++) {
      items.push({...item, name: `item${i}`, path: `item${i}`})
    }
    const payload = {
      ...oneItemPayload,
      tree: {
        totalCount: 15,
        items,
        showBranchInfobar: false,
      },
    }
    renderDirectoryContent(payload)

    // Shows the first 10 items as well
    expect((await screen.findAllByText('item9'))[0]).toBeInTheDocument()
    expect(screen.getByText('View all files')).toBeInTheDocument()
  })

  test('does not show "View all files" row on mobile sized screens when there are fewere than 10 items', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const items: DirectoryItem[] = []
    for (let i = 0; i < 9; i++) {
      items.push({...item, name: `item${i}`, path: `item${i}`})
    }
    const payload = {
      ...oneItemPayload,
      tree: {
        totalCount: 9,
        items,
        showBranchInfobar: false,
      },
    }
    renderDirectoryContent(payload)

    expect(screen.getByTestId('view-all-files-row').className).toContain('d-none')
  })

  test('does not show the "View all files" row on wide screens', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1012,
    })
    const items: DirectoryItem[] = []
    for (let i = 0; i < 15; i++) {
      items.push({...item, name: `item${i}`, path: `item${i}`})
    }
    const payload = {
      ...oneItemPayload,
      tree: {
        totalCount: 15,
        items,
        showBranchInfobar: false,
      },
    }
    renderDirectoryContent(payload)

    expect(screen.getByTestId('view-all-files-row').className).toContain('d-none')
  })

  test('moves focus with the j/k shortcuts', async () => {
    const items: DirectoryItem[] = []
    for (let i = 0; i < 3; i++) {
      items.push({...item, name: `item${i}`, path: `item${i}`})
    }

    const payload = {
      ...oneItemPayload,
      tree: {
        totalCount: 3,
        items,
        showBranchInfobar: false,
      },
    }
    renderDirectoryContent(payload)
    act(() => {
      screen.getByTestId('focus-next-element-button').click()
    })
    expect(screen.getByLabelText('Parent directory')).toHaveFocus()
    act(() => {
      screen.getByTestId('focus-next-element-button').click()
    })
    expect((await screen.findAllByText('item0'))[1]).toHaveFocus()
    act(() => {
      screen.getByTestId('focus-next-element-button').click()
    })
    expect((await screen.findAllByText('item1'))[1]).toHaveFocus()
    act(() => {
      screen.getByTestId('focus-previous-element-button').click()
    })
    expect((await screen.findAllByText('item0'))[1]).toHaveFocus()
    act(() => {
      screen.getByTestId('focus-previous-element-button').click()
    })
    expect(screen.getByLabelText('Parent directory')).toHaveFocus()
  })
})
