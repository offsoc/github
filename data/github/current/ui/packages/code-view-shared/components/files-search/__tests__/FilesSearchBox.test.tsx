import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import type {FileTreePagePayload, RepositoryClickTarget} from '@github-ui/code-view-types'
import {fireEvent, screen} from '@testing-library/react'

import {FilesSearchBox} from '../FilesSearchBox'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {FilesPageInfoProvider} from '../../../contexts/FilesPageInfoContext'
import {testTreePayload} from '../../../__tests__/test-helpers'
import {render} from '@github-ui/react-core/test-utils'

const renderFilesSearchBox = (payload: FileTreePagePayload, onSearch: () => void) => {
  return render(
    <CurrentRepositoryProvider repository={payload.repo}>
      <FilesPageInfoProvider action="tree" copilotAccessAllowed={false} path={payload.path} refInfo={payload.refInfo}>
        <FilesSearchBox onPreload={jest.fn()} onSearch={onSearch} query="" />
      </FilesPageInfoProvider>
    </CurrentRepositoryProvider>,
  )
}

describe('FilesSearchBox', () => {
  jest.useFakeTimers()

  it('emits user event on click', async () => {
    renderFilesSearchBox(testTreePayload, jest.fn())
    fireEvent.click(screen.getByRole('textbox'))

    expectAnalyticsEvents<RepositoryClickTarget>({
      type: 'repository.click',
      target: 'FILE_TREE.SEARCH_BOX',
      data: {},
    })
  })

  it('calls on search with a debounce timeout', () => {
    const onSearch = jest.fn()
    renderFilesSearchBox(testTreePayload, onSearch)
    const textBox = screen.getByRole('textbox')
    fireEvent.click(textBox)
    fireEvent.change(textBox, {target: {value: 'a'}})

    expect(onSearch).not.toHaveBeenCalled()
    jest.runAllTimers()
    expect(onSearch).toHaveBeenCalled()
  })
})
