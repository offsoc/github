import {render, screen, within} from '@testing-library/react'

import {MemexColumnDataType} from '../../../../client/api/columns/contracts/memex-column'
import {createColumnModel} from '../../../../client/models/column-model'
import type {SubIssuesProgressColumnModel} from '../../../../client/models/column-model/system/sub-issues-progress'
import {ProgressConfigurationView} from '../../../../client/pages/settings/components/progress-configuration-view'
import {ColumnsContext, ColumnsStableContext} from '../../../../client/state-providers/columns/columns-state-provider'
import {createColumnsContext} from '../../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../../mocks/state-providers/columns-stable-context'

const memexColumn = {
  dataType: MemexColumnDataType.SubIssuesProgress,
  id: 1234,
  name: 'Sub Issues Progress',
  userDefined: false,
  defaultColumn: true,
  databaseId: 1234,
  position: 1,
  settings: {},
}

const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
  return (
    <ColumnsContext.Provider value={createColumnsContext()}>
      <ColumnsStableContext.Provider value={createColumnsStableContext()}>{children}</ColumnsStableContext.Provider>
    </ColumnsContext.Provider>
  )
}

describe('ProgressConfigurationView', () => {
  it('renders view and subcomponents', () => {
    const column = createColumnModel(memexColumn) as SubIssuesProgressColumnModel

    render(<ProgressConfigurationView column={column} />, {wrapper})
    expect(within(screen.getByRole('button')).getByText('Bar')).toBeInTheDocument()
    expect(screen.getByTestId('hide-numerals-checkbox-field')).toBeInTheDocument()
    expect(within(screen.getByTestId('hide-numerals-checkbox-field')).getByRole('checkbox')).toBeChecked()
    expect(screen.getByText('Color')).toBeInTheDocument()
    expect(screen.getByDisplayValue('PURPLE')).toBeChecked()
  })

  it('renders view with configuration data set', () => {
    const column = createColumnModel({
      ...memexColumn,
      settings: {
        progressConfiguration: {
          variant: 'RING',
          hideNumerals: true,
          color: 'BLUE',
        },
      },
    }) as SubIssuesProgressColumnModel

    render(<ProgressConfigurationView column={column} />, {wrapper})

    expect(within(screen.getByRole('button')).getByText('Ring')).toBeInTheDocument()
    expect(screen.getByTestId('hide-numerals-checkbox-field')).not.toBeChecked()
    expect(screen.getByText('Color')).toBeInTheDocument()
    expect(screen.getByDisplayValue('BLUE')).toBeChecked()
  })
})
