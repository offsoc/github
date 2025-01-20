import {AnalyticsProvider} from '@github-ui/analytics-provider'
import type {DiffAnchor} from '@github-ui/diffs/types'
import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'

import {DiffContextProvider} from '../../contexts/DiffContext'
import {DiffLineContextProvider} from '../../contexts/DiffLineContext'
import {SelectedDiffRowRangeContextProvider} from '../../contexts/SelectedDiffRowRangeContext'
import type {ExpandableHunkHeaderDiffLineProps} from '../ExpandableHunkHeaderDiffLine'
import ExpandableHunkHeaderDiffLine from '../ExpandableHunkHeaderDiffLine'
import {buildDiffLine} from '../../test-utils/query-data'
import type {ClientDiffLine} from '../../types'

type TestComponentProps = ExpandableHunkHeaderDiffLineProps & {
  fileLineCount: number
  currentLine: ClientDiffLine
}

function TestComponent({fileLineCount, currentLine, ...props}: TestComponentProps) {
  const diffLineContextData = {
    fileLineCount,
    currentHunk: {startBlobLineNumber: 1, endBlobLineNumber: 5},
    nextHunk: {startBlobLineNumber: 10, endBlobLineNumber: 20},
    diffEntryId: 'stub',
    diffLine: currentLine,
    isSplit: false,
    fileAnchor: 'diff-mockfile' as DiffAnchor,
    rowId: 'mockRowId',
    filePath: 'mockfile',
  }
  return (
    <AnalyticsProvider appName="test-app" category="test-category" metadata={{}}>
      <DiffContextProvider
        addInjectedContextLines={noop}
        commentBatchPending={false}
        commentingEnabled={false}
        repositoryId="test-id"
        subject={{}}
        subjectId="subjectId"
        viewerData={{
          avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
          diffViewPreference: 'split',
          isSiteAdmin: false,
          login: 'mona',
          tabSizePreference: 1,
          viewerCanComment: false,
          viewerCanApplySuggestion: false,
        }}
      >
        <SelectedDiffRowRangeContextProvider>
          <table>
            <tbody>
              <tr>
                <DiffLineContextProvider {...diffLineContextData}>
                  <ExpandableHunkHeaderDiffLine {...props} />
                </DiffLineContextProvider>
              </tr>
            </tbody>
          </table>
        </SelectedDiffRowRangeContextProvider>
      </DiffContextProvider>
    </AnalyticsProvider>
  )
}

describe('rendering an expand all button', () => {
  test('does not render if start of diff', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 2, type: 'HUNK', html: '@@ -1,3 +1,4 @@'})}
        fileLineCount={5}
        nextLine={buildDiffLine({blobLineNumber: 3, type: 'CONTEXT', html: 'Rendered line: 3'})}
      />,
    )
    expect(screen.queryByLabelText(/Expand file from line/)).not.toBeInTheDocument()
  })

  test('does not render if end of diff', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 4, type: 'HUNK', html: '@@ -5,3 +5,4 @@'})}
        fileLineCount={5}
      />,
    )
    expect(screen.queryByLabelText(/Expand file from line/)).not.toBeInTheDocument()
  })

  test('does not render if start of file', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,3 +1,4 @@'})}
        fileLineCount={5}
        nextLine={buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: 'Rendered line: 1'})}
      />,
    )
    expect(screen.queryByLabelText(/Expand file from line/)).not.toBeInTheDocument()
  })

  test('renders if the previous line is equal to 20 lines prior', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 24, type: 'HUNK', html: '@@ -25,3 +25,4 @@'})}
        fileLineCount={45}
        nextLine={buildDiffLine({blobLineNumber: 25, type: 'CONTEXT', html: 'Rendered line: 25'})}
        prevLine={buildDiffLine({blobLineNumber: 4, type: 'CONTEXT', html: 'Rendered line: 4'})}
      />,
    )

    expect(screen.getByLabelText('Expand file from line 4 to line 25')).toBeInTheDocument()
  })

  test('renders if the previous line is less than 20 lines prior', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 24, type: 'HUNK', html: '@@ -25,3 +25,4 @@'})}
        fileLineCount={45}
        nextLine={buildDiffLine({blobLineNumber: 25, type: 'CONTEXT', html: 'Rendered line: 25'})}
        prevLine={buildDiffLine({blobLineNumber: 5, type: 'CONTEXT', html: 'Rendered line: 5'})}
      />,
    )

    expect(screen.getByLabelText('Expand file from line 5 to line 25')).toBeInTheDocument()
  })

  test('does not render if the previous line is more than 20 lines prior', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 24, type: 'HUNK', html: '@@ -25,3 +25,4 @@'})}
        fileLineCount={45}
        nextLine={buildDiffLine({blobLineNumber: 25, type: 'CONTEXT', html: 'Rendered line: 25'})}
        prevLine={buildDiffLine({blobLineNumber: 3, type: 'CONTEXT', html: 'Rendered line: 3'})}
      />,
    )

    expect(screen.queryByLabelText(/Expand file from line/)).not.toBeInTheDocument()
  })
})

describe('render an expand up and expand down button', () => {
  test('does not render both if start of diff', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 2, type: 'HUNK', html: '@@ -1,3 +1,4 @@'})}
        fileLineCount={5}
        nextLine={buildDiffLine({blobLineNumber: 3, type: 'CONTEXT', html: 'Rendered line: 3'})}
      />,
    )

    const expandDownBtn = screen.queryByLabelText(/Expand file down from line/)
    const expandUpBtn = screen.queryByLabelText(/Expand file up from line/)

    expect(expandDownBtn && expandUpBtn).toBeFalsy()
  })

  test('does not render both if is end of diff', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 4, type: 'HUNK', html: '@@ -5,3 +5,4 @@'})}
        fileLineCount={5}
      />,
    )

    const expandDownBtn = screen.queryByLabelText(/Expand file down from line/)
    const expandUpBtn = screen.queryByLabelText(/Expand file up from line/)

    expect(expandDownBtn && expandUpBtn).toBeFalsy()
  })

  test('does not render both if is end of file', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 5, type: 'HUNK', html: '@@ -5,3 +5,4 @@'})}
        fileLineCount={5}
      />,
    )

    const expandDownBtn = screen.queryByLabelText(/Expand file down from line/)
    const expandUpBtn = screen.queryByLabelText(/Expand file up from line/)

    expect(expandDownBtn && expandUpBtn).toBeFalsy()
  })

  test('renders both when currentLine.blobLineNumber - prevLine.blobLineNumber is greater than 20', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 40, type: 'HUNK', html: '@@ -41,3 +41,4 @@'})}
        fileLineCount={41}
        nextLine={buildDiffLine({blobLineNumber: 41, type: 'CONTEXT', html: 'Rendered line: 41'})}
        prevLine={buildDiffLine({blobLineNumber: 19, type: 'CONTEXT', html: 'Rendered line: 19'})}
      />,
    )

    const expandDownBtn = screen.queryByLabelText(/Expand file down from line/)
    const expandUpBtn = screen.queryByLabelText(/Expand file up from line/)

    expect(expandDownBtn && expandUpBtn).toBeTruthy()
  })

  test('does not render both when currentLine.blobLineNumber - prevLine.blobLineNumber is equal to 20', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 40, type: 'HUNK', html: '@@ -41,3 +41,4 @@'})}
        fileLineCount={41}
        nextLine={buildDiffLine({blobLineNumber: 41, type: 'CONTEXT', html: 'Rendered line: 41'})}
        prevLine={buildDiffLine({blobLineNumber: 20, type: 'CONTEXT', html: 'Rendered line: 20'})}
      />,
    )

    const expandDownBtn = screen.queryByLabelText(/Expand file down from line/)
    const expandUpBtn = screen.queryByLabelText(/Expand file up from line/)

    expect(expandDownBtn && expandUpBtn).toBeFalsy()
  })

  test('does not render both when currentLine.blobLineNumber - prevLine.blobLineNumber is less than 20', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 40, type: 'HUNK', html: '@@ -41,3 +41,4 @@'})}
        fileLineCount={41}
        nextLine={buildDiffLine({blobLineNumber: 41, type: 'CONTEXT', html: 'Rendered line: 41'})}
        prevLine={buildDiffLine({blobLineNumber: 21, type: 'CONTEXT', html: 'Rendered line: 21'})}
      />,
    )

    const expandDownBtn = screen.queryByLabelText(/Expand file down from line/)
    const expandUpBtn = screen.queryByLabelText(/Expand file up from line/)

    expect(expandDownBtn && expandUpBtn).toBeFalsy()
  })
})

describe('rendering an expand up button', () => {
  test('does not render if start of file', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,3 +1,4 @@'})}
        fileLineCount={5}
        nextLine={buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: 'Rendered line: 1'})}
      />,
    )
    expect(screen.queryByLabelText(/Expand up from line/)).not.toBeInTheDocument()
  })

  test('renders if start of diff', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 4, type: 'HUNK', html: '@@ -5,3 +5,4 @@'})}
        fileLineCount={5}
        nextLine={buildDiffLine({blobLineNumber: 5, type: 'CONTEXT', html: 'Rendered line: 4'})}
      />,
    )

    expect(screen.getByLabelText('Expand file up from line 5')).toBeInTheDocument()
  })
})

describe('rendering an expand down button', () => {
  test('does not render if start of diff', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 4, type: 'HUNK', html: '@@ -5,3 +5,4 @@'})}
        fileLineCount={5}
        nextLine={buildDiffLine({blobLineNumber: 5, type: 'CONTEXT', html: 'Rendered line: 4'})}
      />,
    )

    expect(screen.queryByLabelText(/Expand file down from line/)).not.toBeInTheDocument()
  })

  test('does not render if end of file', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 5, type: 'HUNK', html: '@@ -5,3 +5,4 @@'})}
        fileLineCount={5}
      />,
    )
    expect(screen.queryByLabelText(/Expand file down from line/)).not.toBeInTheDocument()
  })

  test('renders if end of diff', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 4, type: 'HUNK', html: '@@ -5,3 +5,4 @@'})}
        fileLineCount={5}
        prevLine={buildDiffLine({blobLineNumber: 3, type: 'HUNK', html: 'Renders line: 3'})}
      />,
    )

    expect(screen.getByLabelText('Expand file down from line 3')).toBeInTheDocument()
  })
})

describe('render a copy content button', () => {
  test('copies the hunk text to the clipboard', async () => {
    const hunkContent = '@@ -5,3 +5,4 @@'
    const {user} = render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 4, type: 'HUNK', html: hunkContent})}
        fileLineCount={5}
      />,
    )

    const hunkCell = await screen.findByText(hunkContent)
    fireEvent.contextMenu(hunkCell)
    const copyButton = screen.getByLabelText('Copy')
    await user.click(copyButton)
    await expect(navigator.clipboard.readText()).resolves.toEqual(hunkContent)
  })
})

describe('default', () => {
  it('renders 1 horiontal kebab dot when hunk is start of file', () => {
    render(
      <TestComponent
        currentLine={buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,3 +1,4 @@'})}
        fileLineCount={5}
        nextLine={buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: 'Rendered line: 1'})}
      />,
    )

    const icons = screen.getAllByRole('img', {hidden: true})
    expect(icons).toHaveLength(1)
    expect(icons[0]!.classList.contains('octicon-kebab-horizontal')).toBeTruthy()
  })
})
