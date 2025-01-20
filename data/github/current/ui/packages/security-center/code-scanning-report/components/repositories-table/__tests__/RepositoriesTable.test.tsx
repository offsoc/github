import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import {render} from '../../../../test-utils/Render'
import RepositoriesTable from '../RepositoriesTable'
import useRepositoriesQuery from '../use-repositories-query'

jest.mock('../use-repositories-query')
function mockUseRepositoriesQuery<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useRepositoriesQuery as jest.Mock).mockReturnValue({
    isPending: false,
    isError: false,
    isSuccess: false,
    data: [],
    ...result,
  })
}

describe('RepositoriesTable', () => {
  it('should render', async () => {
    mockUseRepositoriesQuery({
      isSuccess: true,
      data: {
        items: [
          {
            displayName: 'fluffy-bunny',
            countUnresolved: 1001,
            countDismissed: 2002,
            countFixedWithoutAutofix: 3003,
            countFixedWithAutofix: 4004,
          },
        ],
      },
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      allowAutofixFeatures: true,
    }
    render(<RepositoriesTable {...props} />)

    expect(screen.getAllByRole('columnheader').map(x => x.textContent)).toStrictEqual([
      'Repository',
      'Unresolved and merged',
      'Dismissed',
      'Fixed without autofix',
      'Fixed with autofix',
    ])
    expect(screen.getAllByRole('row')).toHaveLength(2) // includes thead row
    expect(screen.getAllByRole('cell')).toHaveLength(5)

    expect(screen.getByText('fluffy-bunny')).toBeInTheDocument()
    expect(screen.getByText('1001')).toBeInTheDocument()
    expect(screen.getByText('2002')).toBeInTheDocument()
    expect(screen.getByText('3003')).toBeInTheDocument()
    expect(screen.getByText('4004')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    mockUseRepositoriesQuery({
      isPending: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      allowAutofixFeatures: true,
    }
    render(<RepositoriesTable {...props} />)

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map(x => x.textContent)).toStrictEqual([
      'Repository',
      'Unresolved and merged',
      'Dismissed',
      'Fixed without autofix',
      'Fixed with autofix',
    ])
    expect(screen.getAllByRole('row')).toHaveLength(2) // includes thead row
    expect(screen.getAllByRole('cell')).toHaveLength(5)
  })

  it('should render error state', () => {
    mockUseRepositoriesQuery({
      isError: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      allowAutofixFeatures: true,
    }
    render(<RepositoriesTable {...props} />)

    expect(screen.getByTestId('error-indicator')).toBeInTheDocument()
    expect(screen.queryByRole('row')).not.toBeInTheDocument()
    expect(screen.queryByRole('cell')).not.toBeInTheDocument()
  })

  it('should render no-data state', () => {
    mockUseRepositoriesQuery({
      isSuccess: true,
      data: {
        items: [],
      },
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      allowAutofixFeatures: true,
    }
    render(<RepositoriesTable {...props} />)

    expect(screen.getByTestId('empty-indicator')).toBeInTheDocument()
    expect(screen.queryByRole('row')).not.toBeInTheDocument()
    expect(screen.queryByRole('cell')).not.toBeInTheDocument()
  })

  describe('when autofix feature is not available', () => {
    it('should not render autofix column', () => {
      mockUseRepositoriesQuery({
        isPending: true,
      })

      const props = {
        query: '',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        allowAutofixFeatures: false,
      }
      render(<RepositoriesTable {...props} />)

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader').map(x => x.textContent)).toStrictEqual([
        'Repository',
        'Unresolved and merged',
        'Dismissed',
        'Fixed',
      ])
      expect(screen.getAllByRole('row')).toHaveLength(2) // includes thead row
      expect(screen.getAllByRole('cell')).toHaveLength(4)
    })
  })
})
