import {type ExtendedItemProps, ItemPicker} from '@github-ui/item-picker/ItemPicker'
import {type SafeHTMLString, SafeHTMLText} from '@github-ui/safe-html'
import {Box, Token} from '@primer/react'
import {useCallback, useMemo, useState} from 'react'
import {graphql, readInlineData, useFragment, useRelayEnvironment} from 'react-relay'

import {LABELS} from '../../../constants/labels'
import {commitClearProjectItemFieldValueMutation} from '../../../mutations/clear-project-item-field-value'
import {commitUpdateProjectItemFieldValueMutation} from '../../../mutations/update-project-item-field-value'
import type {SingleSelectFieldConfigFragment$key} from './__generated__/SingleSelectFieldConfigFragment.graphql'
import type {SingleSelectFieldFragment$key} from './__generated__/SingleSelectFieldFragment.graphql'
import type {
  SingleSelectFieldOptionFragment$data,
  SingleSelectFieldOptionFragment$key,
} from './__generated__/SingleSelectFieldOptionFragment.graphql'
import {FieldWrapper} from './FieldWrapper'
import {type BaseFieldProps, getTokenStyle} from './Shared'
import {SingleSelectLeadingVisual, SingleSelectToken} from './SingleSelectToken'
import type {ColorName} from '@github-ui/use-named-color'
import {TriangleDownIcon} from '@primer/octicons-react'

const SingleSelectFieldFragment = graphql`
  fragment SingleSelectFieldFragment on ProjectV2ItemFieldSingleSelectValue {
    id
    optionId
    name
    nameHTML
    color
  }
`

const SingleSelectFieldOptionFragment = graphql`
  fragment SingleSelectFieldOptionFragment on ProjectV2SingleSelectFieldOption @inline {
    id
    optionId
    name
    nameHTML
    color
    descriptionHTML
  }
`

const SingleSelectFieldConfigFragment = graphql`
  fragment SingleSelectFieldConfigFragment on ProjectV2SingleSelectField {
    id
    name
    options {
      ...SingleSelectFieldOptionFragment
      # The status field has a non unique id. We leverage the getDataID method in the Relay environment, and in this
      # instance use the id, name, description and color to generate a unique ID:
      # - https://github.com/github/github/pull/305841/files#diff-7187f5ed804646bc353b5176a059d44bcd6a4cd5d5f19976aebb885d1e6997b8R155
      # eslint-disable-next-line relay/unused-fields
      id
      # eslint-disable-next-line relay/unused-fields
      name
      # eslint-disable-next-line relay/unused-fields
      description
      # eslint-disable-next-line relay/unused-fields
      color
    }
  }
`

type SingleSelectFieldProps = BaseFieldProps<SingleSelectFieldConfigFragment$key, SingleSelectFieldFragment$key>

export function SingleSelectField({
  viewerCanUpdate,
  itemId,
  projectId,
  field,
  value,
  onIssueUpdate,
  isStatusField,
}: SingleSelectFieldProps) {
  const [showInput, setShowInput] = useState(false)
  const environment = useRelayEnvironment()

  const fieldData = useFragment(SingleSelectFieldConfigFragment, field)
  const valueData = useFragment(SingleSelectFieldFragment, value)

  const fieldId = fieldData.id
  const fieldName = fieldData.name

  const [filter, setFilter] = useState('')

  const onSelectionChange = useCallback(
    (selection: SingleSelectFieldOptionFragment$data[]) => {
      if (selection.length === 1) {
        commitUpdateProjectItemFieldValueMutation({
          environment,
          input: {
            fieldId,
            itemId,
            projectId,
            value: {singleSelectOptionId: selection[0]!.optionId},
          },
          onCompleted: onIssueUpdate,
        })
      } else if (selection.length === 0) {
        commitClearProjectItemFieldValueMutation({
          environment,
          input: {
            fieldId,
            itemId,
            projectId,
          },
          onCompleted: onIssueUpdate,
        })
      }
      setShowInput(false)
    },
    [environment, fieldId, itemId, onIssueUpdate, projectId],
  )

  const filterItems = useCallback((v: string) => {
    setFilter(v)
  }, [])

  const items = useMemo(() => {
    const options = fieldData.options || []
    const optionsData = options.map(i =>
      // eslint-disable-next-line no-restricted-syntax
      readInlineData<SingleSelectFieldOptionFragment$key>(SingleSelectFieldOptionFragment, i),
    )
    if (!filter) return optionsData
    return optionsData.filter(l => l.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
  }, [fieldData.options, filter])

  const selectedItems = useMemo(() => {
    const options = fieldData.options || []
    const optionsData = options.map(i =>
      // eslint-disable-next-line no-restricted-syntax
      readInlineData<SingleSelectFieldOptionFragment$key>(SingleSelectFieldOptionFragment, i),
    )
    return optionsData.filter(i => i.optionId === valueData?.optionId)
  }, [fieldData.options, valueData?.optionId])

  const convertToItemProps = useCallback(
    (option: SingleSelectFieldOptionFragment$data): ExtendedItemProps<SingleSelectFieldOptionFragment$data> => {
      return {
        id: option.optionId,
        children: (
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <SafeHTMLText html={option.nameHTML as SafeHTMLString} />
            <SafeHTMLText sx={{color: 'fg.muted', fontSize: 0}} html={option.descriptionHTML as SafeHTMLString} />
          </Box>
        ),
        source: option,
        leadingVisual: () => <SingleSelectLeadingVisual inputColor={option.color as ColorName} />,
      }
    },
    [],
  )

  const renderAnchor = useCallback(
    (anchorProps: React.HTMLAttributes<HTMLElement>) => {
      return (
        <FieldWrapper
          showInput={showInput}
          setShowInput={setShowInput}
          name={fieldName}
          isStatusField={isStatusField}
          placeholder={
            isStatusField ? (
              <Box sx={{display: 'flex', gap: 2, alignItems: 'center', fontSize: 12, flex: '1 0 auto'}}>
                {LABELS.emptySections.status}
                <TriangleDownIcon />
              </Box>
            ) : (
              <>{LABELS.emptySections.singleSelectFilterPlaceholder}</>
            )
          }
          value={
            valueData?.name && valueData?.color ? (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  fontSize: 0,
                  flex: '1 0 auto',
                }}
              >
                <SingleSelectToken inputName={valueData.name} inputColor={valueData.color as ColorName} />
                {isStatusField && <TriangleDownIcon />}
              </Box>
            ) : null
          }
          anchorProps={anchorProps}
        />
      )
    },
    [fieldName, isStatusField, showInput, valueData?.color, valueData?.name],
  )

  if (!viewerCanUpdate)
    return (
      <FieldWrapper
        showInput={showInput}
        setShowInput={setShowInput}
        canUpdate={false}
        name={fieldName}
        placeholder={LABELS.emptySections.noValue(fieldName)}
        value={valueData?.name ? <Token sx={getTokenStyle(valueData.name)} size="large" text={valueData.name} /> : null}
        isStatusField={isStatusField}
      />
    )

  return (
    <ItemPicker
      items={items}
      initialSelectedItems={selectedItems}
      filterItems={filterItems}
      getItemKey={i => i.optionId}
      convertToItemProps={convertToItemProps}
      placeholderText={LABELS.emptySections.singleSelectFilterPlaceholder}
      selectionVariant="single"
      onSelectionChange={onSelectionChange}
      renderAnchor={renderAnchor}
      height={'large'}
    />
  )
}
