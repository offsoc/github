import {TreeView, Box, Text, Link} from '@primer/react'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {DatabaseTreeItem, type SortType} from './DatabaseTreeItem'
import {RequestType, NameWithDetails, DatabaseDetail} from './NameWithDetails'
import type {GroupedLogs, QueryLog, TraceNode} from './types'
import {
  findSqlQueries,
  groupMySqlQueriesByCluster,
  findSqlNPlusOne,
  findEsQueries,
  tryGetNumber,
  tryGetRemoteUrl,
} from './utils'

type PerformancePaneItemProps = {
  name: string
  isRoot?: boolean
  item: TraceNode
  sortType?: SortType
  threshold: number
  variables?: object
  showSubscriptionQueries?: boolean
  groupSqlByClusters?: boolean
  query_text?: string
}

export const PerformancePaneItem = ({
  name,
  isRoot,
  item,
  sortType,
  threshold,
  variables,
  showSubscriptionQueries,
  groupSqlByClusters,
  query_text,
}: PerformancePaneItemProps) => {
  const keys = Object.keys(item)

  const sqlQueries = new Array<QueryLog>()
  if (isRoot) {
    findSqlQueries(sqlQueries, item)
  }
  const allocationsCount = tryGetNumber(item, ['total/allocated_objects_count'], 0) || 0

  const groupedLogs: GroupedLogs = groupMySqlQueriesByCluster(sqlQueries)

  const sqlNPlusOne = isRoot ? findSqlNPlusOne(item) : []

  const esQueries = new Array<QueryLog>()
  if (isRoot) {
    findEsQueries(esQueries, item)
  }

  if (parseInt(name, 10).toString() === name && typeof item['name'] === 'string') {
    name = item['name']
  }

  let nameElement: JSX.Element = <span>{name}</span>
  let timing = tryGetNumber(item, ['total/duration_ms', '__trace/children_duration_ms', 'duration_ms'], threshold)

  const children = keys.filter(key => typeof item[key] === 'object' && (!timing || key !== 'total'))
  const values = getValues(item, name)

  if (!timing) {
    // If the element doesn't have timing info, try to get it by summing the duration for each **direct** child
    timing = sumChildrenTiming(children, item, threshold)
  }

  if (!timing) {
    return <></>
  }

  if (!showSubscriptionQueries && query_text?.match('subscription')) {
    return <></>
  }

  let type: RequestType | undefined
  if (name.endsWith('Query')) {
    type = RequestType.graphql_query
  } else if (name.endsWith('Mutation')) {
    type = RequestType.graphql_mutation
  } else if (name.endsWith('Subscription')) {
    type = RequestType.graphql_subscription
  } else {
    const method = item['method'] as string
    switch (method) {
      case 'GET':
        type = RequestType.http_get
        break
      case 'POST':
        type = RequestType.http_post
        break
      case 'PUT':
        type = RequestType.http_put
        break
      case 'DELETE':
        type = RequestType.http_delete
        break
    }
  }

  nameElement = (
    <NameWithDetails
      name={name}
      type={type}
      duration={timing}
      sqlQueriesCount={sqlQueries.length}
      allocationsCount={allocationsCount}
      traces={item}
    />
  )

  const valuesForSubTree = getValuesForSubtree(values)
  const subTree: Array<JSX.Element | null> =
    valuesForSubTree.length > 0 ? buildSubTree(valuesForSubTree, item, name) : []

  const childPerformancePaneItems = children
    .filter(key => shouldIncludeChildItem(item[key] as TraceNode, key, threshold))
    .map(key => <PerformancePaneItem key={key} name={key} item={item[key] as TraceNode} threshold={threshold} />)

  return (
    <TreeView.Item key={name} id={`${name}-pane-item`}>
      {nameElement}
      {(subTree.length > 0 || isRoot || childPerformancePaneItems.length > 0) && (
        <TreeView.SubTree>
          {subTree}
          {isRoot && (
            <>
              <TreeView.Item id={`${name}-pane-query-item`}>
                query
                <TreeView.SubTree>
                  <TreeView.Item id={`${name}-pane-query-text-item`}>
                    query_text
                    <TreeView.SubTree>
                      <TreeView.Item id={`${name}-pane-query-text-sub-item`}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text sx={{whiteSpace: 'pre-wrap'}}>{item['query_text'] as string}</Text>
                          <CopyToClipboardButton
                            tooltipProps={{direction: 'nw'}}
                            textToCopy={item['query_text'] as string}
                            ariaLabel="Copy to clipboard"
                            accessibleButton
                            className="px-2 pt-1"
                            sx={{height: 25, width: 25}}
                          />
                        </Box>
                      </TreeView.Item>
                    </TreeView.SubTree>
                  </TreeView.Item>
                  <TreeView.Item id={`${name}-pane-query-variable-item`}>
                    query_variables
                    <TreeView.SubTree>
                      {variables &&
                        Object.entries(variables)
                          .filter(([, value]) => !!value)
                          .map(([key, value], index) => (
                            <TreeView.Item id={`${index}-pane-query-variable-item`} key={index}>
                              {key}: {value.toString()}
                            </TreeView.Item>
                          ))}
                    </TreeView.SubTree>
                  </TreeView.Item>
                </TreeView.SubTree>
              </TreeView.Item>
              {groupSqlByClusters && (
                <TreeView.Item id={`${name}-pane-mysql-item`}>
                  <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center'}}>
                    <Text sx={{marginRight: 'auto'}}>mysql</Text>
                    <Text sx={{fontSize: 12, color: 'fg.muted'}}>{Object.entries(groupedLogs).length} clusters</Text>
                    <DatabaseDetail count={sqlQueries.length} />
                  </Box>
                  <TreeView.SubTree>
                    {Object.entries(groupedLogs).map(([key, value]) => (
                      <DatabaseTreeItem key={key} title={key} queries={value} nPlusOnes={sqlNPlusOne} sort={sortType} />
                    ))}
                  </TreeView.SubTree>
                </TreeView.Item>
              )}
            </>
          )}
          {!groupSqlByClusters && (
            <DatabaseTreeItem title="mysql" queries={sqlQueries} nPlusOnes={sqlNPlusOne} sort={sortType} />
          )}
          <DatabaseTreeItem title="elastic search" queries={esQueries} nPlusOnes={[]} sort={sortType} />
          {childPerformancePaneItems}
        </TreeView.SubTree>
      )}
    </TreeView.Item>
  )
}

function sumChildrenTiming(children: string[], item: TraceNode, threshold: number) {
  let subTreeDuration = 0
  for (const key of children) {
    const duration = tryGetNumber(
      item[key] as TraceNode,
      ['total/duration_ms', '__trace/children_duration_ms'],
      threshold,
    )
    if (duration) {
      subTreeDuration += duration
    }
  }
  return subTreeDuration > 0 ? subTreeDuration : undefined
}

function getValues(item: TraceNode, name: string) {
  const keys = Object.keys(item)
  return keys.filter(key => typeof item[key] !== 'object' && item[key] !== name && key !== 'query_text')
}

function getValuesForSubtree(values: string[]): string[] {
  return values.filter(value => !(value === 'duration_ms' || value === 'children_duration_ms'))
}

function buildSubTree(values: string[], item: TraceNode, name: string): Array<JSX.Element | null> {
  return values
    .map(key => {
      let keyValue = item[key]
      if (typeof keyValue === 'number' && key.endsWith('ms')) {
        keyValue = keyValue.toFixed(1)
      } else if (typeof keyValue === 'string') {
        const url = tryGetRemoteUrl(keyValue)
        if (url) {
          keyValue = (
            <Link target="_blank" href={url.remoteUrl}>
              {url.relativePath}:{url.line}
            </Link>
          )
        }
      }

      return (
        <TreeView.Item key={key} id={`${key}-${name}-pane-sub-item`}>
          <Text sx={{whiteSpace: 'pre-wrap'}}>
            <>
              {key} {keyValue}
            </>
          </Text>
        </TreeView.Item>
      )
    })
    .filter(subTreeItem => subTreeItem !== null)
}

function shouldIncludeChildItem(item: TraceNode, name: string, threshold: number): boolean {
  const keys = Object.keys(item)
  const values = getValues(item, name)
  const timing = tryGetNumber(item, ['total/duration_ms', '__trace/children_duration_ms', 'duration_ms'], threshold)
  const children = keys.filter(key => typeof item[key] === 'object' && (!timing || key !== 'total'))

  const valuesForSubTree = getValuesForSubtree(values)
  const subTree: Array<JSX.Element | null> =
    valuesForSubTree.length > 0 ? buildSubTree(valuesForSubTree, item, name) : []

  if (name === '__trace' && subTree.length === 0 && children.length === 0) {
    return false
  }
  return true
}
