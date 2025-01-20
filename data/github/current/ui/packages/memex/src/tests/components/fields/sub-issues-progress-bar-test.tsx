import {render, screen, waitFor} from '@testing-library/react'

import type {MemexColumn} from '../../../client/api/columns/contracts/memex-column'
import {SubIssuesProgressBar} from '../../../client/components/fields/sub-issues-progress-bar'
import {
  autoFillColumnServerProps,
  parentIssueColumn,
  statusColumn,
  subIssuesProgressColumn,
  titleColumn,
} from '../../../mocks/data/columns'
import {stubAllColumnsRef} from '../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../mocks/state-providers/columns-stable-context'
import {createWrapperWithColumnsStableContext} from '../../state-providers/columns/helpers'

const columns = [titleColumn, {...statusColumn, defaultColumn: false}, {...parentIssueColumn, defaultColumn: true}]

describe('ProgressBar', () => {
  it('should correctly render solid', () => {
    const progressColumn: MemexColumn = {
      ...subIssuesProgressColumn,
      settings: {
        progressConfiguration: {
          variant: 'SOLID',
        },
      },
      defaultColumn: true,
    }

    const allColumns = autoFillColumnServerProps([...columns, progressColumn])
    const allColumnsStub = stubAllColumnsRef(allColumns)

    render(<SubIssuesProgressBar completed={30} percentCompleted={30} total={100} />, {
      wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({allColumnsRef: allColumnsStub})),
    })

    const progress = screen.getByText('30 / 100')
    expect(progress).toBeInTheDocument()

    const percent = screen.getByText('30%')
    expect(percent).toBeInTheDocument()
  })

  it('should correctly render segmented', () => {
    const progressColumn: MemexColumn = {
      ...subIssuesProgressColumn,
      settings: {
        progressConfiguration: {
          variant: 'SEGMENTED',
        },
      },
      defaultColumn: true,
    }

    const allColumns = autoFillColumnServerProps([...columns, progressColumn])
    const allColumnsStub = stubAllColumnsRef(allColumns)

    render(<SubIssuesProgressBar completed={30} percentCompleted={30} total={100} />, {
      wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({allColumnsRef: allColumnsStub})),
    })

    const progress = screen.getByText('30 / 100')
    expect(progress).toBeInTheDocument()

    const percent = screen.getByText('30%')
    expect(percent).toBeInTheDocument()
  })

  it('should correctly render ring', async () => {
    const progressColumn: MemexColumn = {
      ...subIssuesProgressColumn,
      settings: {
        progressConfiguration: {
          variant: 'RING',
        },
      },
      defaultColumn: true,
    }

    const allColumns = autoFillColumnServerProps([...columns, progressColumn])
    const allColumnsStub = stubAllColumnsRef(allColumns)

    render(<SubIssuesProgressBar completed={30} percentCompleted={30} total={100} />, {
      wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({allColumnsRef: allColumnsStub})),
    })

    const progress = screen.getByText('30 / 100')
    expect(progress).toBeInTheDocument()

    await waitFor(() => expect(screen.queryByText('30%')).not.toBeInTheDocument())
  })
})
