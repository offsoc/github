import {useFragment, useRelayEnvironment} from 'react-relay'
import {ConnectionHandler, graphql, readInlineData} from 'relay-runtime'
import {useCallback, useMemo, useState} from 'react'
import {type SafeHTMLString, SafeHTMLText} from '@github-ui/safe-html'
import type {SingleSelectColumn$data, SingleSelectColumn$key} from './__generated__/SingleSelectColumn.graphql'
import {ItemPicker} from '@github-ui/item-picker/ItemPicker'
import {FieldWrapper} from './FieldWrapper'
import {LABELS} from '../../../constants/labels'
import {Box, Text} from '@primer/react'
import {TriangleDownIcon} from '@primer/octicons-react'
import {commitMoveProjectCardMutation} from '../../../mutations/move-project-card-mutation'
import type {SingleSelectColumnProject$key} from './__generated__/SingleSelectColumnProject.graphql'

type Props = {
  projectItem: SingleSelectColumnProject$key
  column: SingleSelectColumn$key | null | undefined
  onIssueUpdate?: () => void
  issueId: string
}

const SingleSelectColumnProjectFragment = graphql`
  fragment SingleSelectColumnProject on Project {
    id
    name
    columns(first: 10) {
      nodes {
        ...SingleSelectColumn
      }
    }
  }
`

const SingleSelectColumnFragment = graphql`
  fragment SingleSelectColumn on ProjectColumn @inline {
    id
    name
  }
`

export function SingleSelectColumn({projectItem, column, onIssueUpdate, issueId}: Props) {
  const [showInput, setShowInput] = useState(false)
  const project = useFragment(SingleSelectColumnProjectFragment, projectItem)

  const selectedColumn =
    // eslint-disable-next-line no-restricted-syntax
    column !== undefined ? readInlineData<SingleSelectColumn$key>(SingleSelectColumnFragment, column) : null

  const [filter, setFilter] = useState('')
  const environment = useRelayEnvironment()
  const connectionId = ConnectionHandler.getConnectionID(issueId, 'ProjectSection_classicProjects')

  const filterItems = useCallback((v: string) => {
    setFilter(v)
  }, [])

  const convertToItemProps = useCallback((option: SingleSelectColumn$data) => {
    return {
      id: option.id,
      children: <SafeHTMLText html={option.name as SafeHTMLString} />,
      source: option,
    }
  }, [])

  const onSelectionChange = useCallback(
    (selection: SingleSelectColumn$data[]) => {
      selection.length &&
        selection[0]?.id &&
        commitMoveProjectCardMutation({
          environment,
          issueId,
          connectionId,
          column: selection[0],
          projectId: project.id,
          projectName: project.name,
          onCompleted: onIssueUpdate,
        })
      setShowInput(false)
    },
    [connectionId, environment, issueId, onIssueUpdate, project],
  )

  const renderAnchor = useCallback(
    (anchorProps: React.HTMLAttributes<HTMLElement>) => {
      return (
        <FieldWrapper
          name={LABELS.defaultProjectFieldName}
          isStatusField={true}
          placeholder={LABELS.awaitingTriage}
          showInput={showInput}
          setShowInput={setShowInput}
          value={
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                fontSize: 0,
                flex: '1 0 auto',
              }}
            >
              {
                <>
                  <Text sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    {selectedColumn ? selectedColumn.name : LABELS.awaitingTriage}
                  </Text>
                  {<TriangleDownIcon />}
                </>
              }
            </Box>
          }
          anchorProps={anchorProps}
        />
      )
    },
    [selectedColumn, showInput],
  )

  const items: SingleSelectColumn$data[] = useMemo(() => {
    const columns = (project.columns?.nodes || []).flatMap(node =>
      node
        ? // eslint-disable-next-line no-restricted-syntax
          readInlineData<SingleSelectColumn$key>(SingleSelectColumnFragment, node)
        : [],
    )
    if (!filter) return columns
    return columns.filter(l => l.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
  }, [filter, project.columns?.nodes])

  return (
    <ItemPicker
      items={items}
      initialSelectedItems={selectedColumn ? [selectedColumn] : []}
      filterItems={filterItems}
      getItemKey={i => (i?.id ? i.id : '')}
      convertToItemProps={convertToItemProps}
      placeholderText={LABELS.emptySections.singleSelectFilterPlaceholder}
      selectionVariant="single"
      onSelectionChange={onSelectionChange}
      renderAnchor={renderAnchor}
      height={'large'}
      title={LABELS.moveCardToColumn}
    />
  )
}
