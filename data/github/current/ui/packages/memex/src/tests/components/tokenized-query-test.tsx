import {ThemeProvider} from '@primer/react'
import {cleanup, render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'

import {MemexColumnDataType} from '../../client/api/columns/contracts/memex-column'
import {FilterSuggestionsItemsContext} from '../../client/components/filter-bar/filter-suggestions'
import {TokenizedQuery} from '../../client/components/filter-bar/tokenized-query'
import ToastContainer from '../../client/components/toasts/toast-container'
import {META_QUALIFIERS} from '../../client/helpers/meta-qualifiers'
import {ColumnsStateProvider} from '../../client/state-providers/columns/columns-state-provider'
import {ArchiveStatusProvider} from '../../client/state-providers/workflows/archive-status-state-provider'
import {WorkflowsStateProvider} from '../../client/state-providers/workflows/workflows-state-provider'
import {FilterQueryResources} from '../../client/strings'
import {createColumn, createCustomIterationColumn, CustomDateColumnId} from '../../mocks/data/columns'
import {DefaultColumns} from '../../mocks/mock-data'
import {createMockEnvironment} from '../create-mock-environment'
import {QueryClientWrapper} from '../test-app-wrapper'

function renderTokenizedQuery(
  query: string,
  columns = DefaultColumns.concat([
    createColumn({
      dataType: MemexColumnDataType.Date,
      id: CustomDateColumnId,
      name: 'custom-dashed-due-date',
      userDefined: true,
      defaultColumn: false,
    }),
    createCustomIterationColumn(),
  ]),
) {
  createMockEnvironment({
    jsonIslandData: {
      'memex-columns-data': columns,
    },
  })

  return render(<TokenizedQuery query={query} />, {
    wrapper: ({children}) => (
      <QueryClientWrapper>
        <ThemeProvider>
          <ToastContainer>
            <MemoryRouter initialEntries={['/orgs/monalisa/projects/1']}>
              <ColumnsStateProvider>
                <ArchiveStatusProvider>
                  <WorkflowsStateProvider>
                    <FilterSuggestionsItemsContext.Provider value={{items: []}}>
                      {children}
                    </FilterSuggestionsItemsContext.Provider>
                  </WorkflowsStateProvider>
                </ArchiveStatusProvider>
              </ColumnsStateProvider>
            </MemoryRouter>
          </ToastContainer>
        </ThemeProvider>
      </QueryClientWrapper>
    ),
  })
}

describe('tokenized-query', () => {
  it.each`
    query                                        | errorMessage
    ${'foo'}                                     | ${undefined}
    ${'status:backlog'}                          | ${undefined}
    ${'status:Backlog'}                          | ${undefined}
    ${'status:"In progress"'}                    | ${undefined}
    ${'status:"In progress",backlog'}            | ${undefined}
    ${'status:"In progress" status:backlog'}     | ${undefined}
    ${'foo status:"In progress" status:backlog'} | ${undefined}
    ${'status:"In progress" status:backlog foo'} | ${undefined}
    ${'due-date:2020-01-01'}                     | ${undefined}
    ${'due-date:>2020-01-01'}                    | ${FilterQueryResources.invalidDateValue('>2020-01-01')}
    ${'due-date:<2020-01-01'}                    | ${FilterQueryResources.invalidDateValue('<2020-01-01')}
    ${'due-date:>=2020-01-01'}                   | ${FilterQueryResources.invalidDateValue('>=2020-01-01')}
    ${'due-date:<=2020-01-01'}                   | ${FilterQueryResources.invalidDateValue('<=2020-01-01')}
    ${'due-date:*..2020-01-02'}                  | ${FilterQueryResources.invalidDateValue('*..2020-01-02')}
    ${'due-date:2020-01-01..*'}                  | ${FilterQueryResources.invalidDateValue('2020-01-01..*')}
    ${'due-date:2020-01-01..2020-01-02'}         | ${FilterQueryResources.invalidDateValue('2020-01-01..2020-01-02')}
    ${'estimate:1'}                              | ${FilterQueryResources.invalidNumberValue('1')}
    ${'estimate:>1'}                             | ${FilterQueryResources.invalidNumberValue('>1')}
    ${'estimate:>=1'}                            | ${FilterQueryResources.invalidNumberValue('>=1')}
    ${'estimate:<3'}                             | ${FilterQueryResources.invalidNumberValue('<3')}
    ${'estimate:<=3'}                            | ${FilterQueryResources.invalidNumberValue('<=3')}
    ${'estimate:1..3'}                           | ${FilterQueryResources.invalidNumberValue('1..3')}
    ${'estimate:1..*'}                           | ${FilterQueryResources.invalidNumberValue('1..*')}
    ${'estimate:*..3'}                           | ${FilterQueryResources.invalidNumberValue('*..3')}
    ${'is:closed'}                               | ${undefined}
    ${'label:blocker'}                           | ${undefined}
    ${'label:blocker'}                           | ${undefined}
    ${'custom-dashed-due-date:2020-01-01'}       | ${undefined}
    ${'no:due-date,custom-dashed-due-date'}      | ${undefined}
    ${'iteration:@current,@next,@previous'}      | ${undefined}
    ${'due-date:@today'}                         | ${undefined}
    ${'due-date:>@today'}                        | ${undefined}
    ${'due-date:>=@today'}                       | ${undefined}
    ${'due-date:<@today'}                        | ${undefined}
    ${'due-date:<=@today'}                       | ${undefined}
    ${'due-date:*..@today'}                      | ${undefined}
    ${'due-date:@today..*'}                      | ${undefined}
    ${'due-date:2020-01-01..@today'}             | ${undefined}
    ${'due-date:@today..2020-01-01'}             | ${undefined}
    ${'due-date:>@today+1'}                      | ${undefined}
    ${'due-date:<@today-1'}                      | ${undefined}
    ${'iteration:>@current'}                     | ${undefined}
    ${'iteration:>@next'}                        | ${undefined}
    ${'iteration:>@previous'}                    | ${undefined}
    ${'iteration:>@current-2'}                   | ${undefined}
  `('should display a plain search query without error - query: $query', ({query, errorMessage}) => {
    renderTokenizedQuery(query)

    const tokenizedQuery = screen.getByTestId('tokenized-query')
    expect(tokenizedQuery).toHaveTextContent(query)
    if (errorMessage) {
      const error = screen.queryByLabelText(errorMessage)
      expect(error).toBeNull()
    }

    // Assert that there are no errors on tokens.
    // Disabling this lint rule for now, because there isn't really a way in @testing-library to
    // check for associated error messages right now.
    // eslint-disable-next-line testing-library/no-node-access
    const tokensWithErrors = Array.from(tokenizedQuery.querySelectorAll('[aria-errormessage]'))
    expect(tokensWithErrors).toEqual([])

    cleanup()

    const querySurroundedWithExcessSpace = `       ${query}       `
    renderTokenizedQuery(querySurroundedWithExcessSpace)

    /**
     * validate query, with spaces - replacing all space characters with a single space character
     * in order to normalize breaking spaces vs non-breaking spaces
     */
    expect(screen.getByTestId('tokenized-query').textContent?.replace(/\s/g, ' ')).toMatch(
      querySurroundedWithExcessSpace.replace?.(/\s/g, ' '),
    )
  })

  it.each`
    query                                                  | errorMessage
    ${'status:"backlog"'}                                  | ${undefined}
    ${'no:due-date,custom-dashed-due-date'}                | ${undefined}
    ${'status:"backlog'}                                   | ${FilterQueryResources.invalidFilterQuotes}
    ${'status:"non existent status"'}                      | ${FilterQueryResources.noOptionsMatch('non existent status', 'Status')}
    ${'status:"non existent status",backlog'}              | ${FilterQueryResources.noOptionsMatch('non existent status', 'Status')}
    ${'not-a-status-column:"non existent status",backlog'} | ${FilterQueryResources.unknownFieldFilter('not-a-status-column')}
    ${'estimate:abcd'}                                     | ${FilterQueryResources.invalidNumberValue('abcd')}
    ${'due-date:abcd'}                                     | ${FilterQueryResources.invalidDateValue('abcd')}
    ${'due-date:abcd..2022-01-01'}                         | ${FilterQueryResources.invalidDateValue('abcd')}
    ${'due-date:@today..abcd'}                             | ${FilterQueryResources.invalidDateValue('abcd')}
    ${'due-date:>abcd'}                                    | ${FilterQueryResources.invalidDateValue('abcd')}
    ${'due-date:>=abcd'}                                   | ${FilterQueryResources.invalidDateValue('abcd')}
    ${'due-date:<abcd'}                                    | ${FilterQueryResources.invalidDateValue('abcd')}
    ${'due-date:<=abcd'}                                   | ${FilterQueryResources.invalidDateValue('abcd')}
    ${'due-date:abcd..'}                                   | ${FilterQueryResources.invalidDateValue('abcd')}
    ${'due-date:abcd..*'}                                  | ${FilterQueryResources.invalidDateValue('abcd')}
    ${'due-date:*..abcd'}                                  | ${FilterQueryResources.invalidDateValue('abcd')}
    ${'due-date:..abcd'}                                   | ${FilterQueryResources.invalidDateValue('abcd')}
    ${'due-date:ab..cd'}                                   | ${FilterQueryResources.invalidDateValue('ab..cd')}
    ${'custom-dashed-due-date:abcd'}                       | ${FilterQueryResources.invalidDateValue('abcd')}
    ${'is:red'}                                            | ${FilterQueryResources.invalidQualifier(['red'], META_QUALIFIERS.is)}
    ${'iteration:"something-else"'}                        | ${FilterQueryResources.noIterationMatch('something-else', 'Iteration')}
    ${'iteration:>@next+10'}                               | ${FilterQueryResources.noIterationMatch('@next+10', 'Iteration')}
  `(
    'should display a plain search query with error message if necessary - query: $query',
    async ({query, errorMessage}) => {
      expect.assertions(errorMessage ? 3 : 2)
      renderTokenizedQuery(query)

      const element = screen.getByTestId('tokenized-query')
      expect(element).toBeInTheDocument()
      expect(element).toHaveTextContent(query)

      if (errorMessage) {
        expect(await screen.findByLabelText(errorMessage)).toBeInTheDocument()
      }
    },
  )
})
