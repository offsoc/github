import {Box, Text, Token, Link, TreeView} from '@primer/react'
import {RowsIcon, AlertFillIcon} from '@primer/octicons-react'
import {DatabaseDetail, TimingDetail} from './NameWithDetails'
import type {QueryLog, TraceNode} from './types'
import {getLinkFromBacktrace} from './utils'

export type SortType = 'none' | 'duration' | 'resultCount'

type DatabaseTreeItemProps = {
  title: string
  queries: QueryLog[]
  nPlusOnes: TraceNode[]
  sort?: SortType
}

export const DatabaseTreeItem = ({title, queries, nPlusOnes, sort}: DatabaseTreeItemProps) => {
  const totalTime = queries.reduce((acc, cur) => acc + cur.duration, 0)
  const totalResults = queries.reduce((acc, cur) => acc + (cur.result ?? 0), 0)

  if (queries.length === 0) {
    return null
  }

  const sortedQueries = sortQueries(queries, sort)

  return (
    <TreeView.Item id={`${title}-database-item`}>
      <Box sx={{display: 'flex', gap: 2, flexDirection: 'row', alignItems: 'center'}}>
        <Text sx={{marginRight: 'auto'}}>{title}</Text>
        <DatabaseDetail count={queries.length} />
        {nPlusOnes.length > 0 && (
          <Token
            text={`${nPlusOnes.length} N+1`}
            leadingVisual={AlertFillIcon}
            sx={{color: 'attention.fg', height: '2.3em'}}
          />
        )}
        <Token
          text={totalResults.toString()}
          leadingVisual={RowsIcon}
          sx={{
            height: '2.3em',
          }}
        />
        <TimingDetail duration={totalTime} />
      </Box>
      <TreeView.SubTree>
        {sortedQueries.map(query => (
          <TreeView.Item key={query.query} id={`${query.query}-query-item`}>
            <div>
              <Link
                target="_blank"
                href={getLinkFromBacktrace(query.backtrace)}
                muted={true}
                sx={{whiteSpace: 'pre-wrap', color: 'fg.default'}}
              >
                {query.query}
              </Link>
              <br />
              <Box sx={{display: 'flex', flexDirection: 'row', m: 1}}>
                <Text sx={{fontSize: 12, color: 'fg.muted'}}>
                  {query.duration.toFixed(2)}ms, {query.result} results, fallbacks:{' '}
                  {query.fallbacks?.length || 0 > 0 ? query.fallbacks?.join(', ') : 'unknown'}
                </Text>
                {nPlusOneHitsCount(query, nPlusOnes) > 0 && (
                  <Token
                    text={`${nPlusOneHitsCount(query, nPlusOnes)} N+1`}
                    leadingVisual={AlertFillIcon}
                    sx={{color: 'attention.fg', ml: 2}}
                  />
                )}
              </Box>
            </div>
          </TreeView.Item>
        ))}
      </TreeView.SubTree>
    </TreeView.Item>
  )
}

function sortQueries(queries: QueryLog[], sort: SortType | undefined) {
  switch (sort) {
    case 'duration':
      return queries.sort((a, b) => b.duration - a.duration)
    case 'resultCount':
      return queries.sort((a, b) => (b.result ?? 0) - (a.result ?? 0))
    default:
      return queries
  }
}

function nPlusOneHitsCount(query: QueryLog, nPlusOnes: TraceNode[]) {
  const nPlusOne = nPlusOnes?.find(n => n['sql'] === query.digested_query)
  return nPlusOne ? nPlusOne.count : 0
}
