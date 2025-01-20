import {type ExtendedItemProps, ItemPicker} from '@github-ui/item-picker/ItemPicker'
import type {ItemGroup} from '@github-ui/item-picker/shared'
import {useCallback, useMemo, useState} from 'react'
import {graphql, readInlineData, useFragment, useRelayEnvironment} from 'react-relay'

import {LABELS} from '../../../constants/labels'
import {commitClearProjectItemFieldValueMutation} from '../../../mutations/clear-project-item-field-value'
import {commitUpdateProjectItemFieldValueMutation} from '../../../mutations/update-project-item-field-value'
import type {IterationFieldConfigFragment$key} from './__generated__/IterationFieldConfigFragment.graphql'
import type {IterationFieldFragment$key} from './__generated__/IterationFieldFragment.graphql'
import type {
  IterationFieldIterationFragment$data,
  IterationFieldIterationFragment$key,
} from './__generated__/IterationFieldIterationFragment.graphql'
import {FieldWrapper} from './FieldWrapper'
import type {BaseFieldProps} from './Shared'
import {IterationItem} from './IterationItem'

const IterationFieldFragment = graphql`
  fragment IterationFieldFragment on ProjectV2ItemFieldIterationValue {
    iterationId
    title
    titleHTML
    startDate
    duration
    field {
      ...IterationFieldConfigFragment
    }
  }
`

const IterationFieldConfigFragment = graphql`
  fragment IterationFieldConfigFragment on ProjectV2IterationField {
    id
    name
    configuration {
      iterations {
        ...IterationFieldIterationFragment
      }
      completedIterations {
        ...IterationFieldIterationFragment
      }
    }
  }
`

const IterationFieldIterationFragment = graphql`
  fragment IterationFieldIterationFragment on ProjectV2IterationFieldIteration @inline {
    id
    title
    titleHTML
    startDate
    duration
  }
`

const completedGroup: ItemGroup = {groupId: 'completed', header: {title: 'Completed', variant: 'filled'}}
const activeGroup: ItemGroup = {groupId: 'active', header: {title: 'Active', variant: 'filled'}}

type IterationFieldProps = BaseFieldProps<IterationFieldConfigFragment$key, IterationFieldFragment$key>

export function IterationField({viewerCanUpdate, itemId, projectId, field, value, onIssueUpdate}: IterationFieldProps) {
  const [showInput, setShowInput] = useState(false)
  const environment = useRelayEnvironment()

  const fieldData = useFragment(IterationFieldConfigFragment, field)
  const valueData = useFragment(IterationFieldFragment, value)

  const fieldId = fieldData.id
  const fieldName = fieldData.name

  const [filter, setFilter] = useState('')

  const onSelectionChange = useCallback(
    (selection: IterationFieldIterationFragment$data[]) => {
      if (selection.length === 1) {
        commitUpdateProjectItemFieldValueMutation({
          environment,
          input: {
            fieldId,
            itemId,
            projectId,
            value: {iterationId: selection[0]!.id},
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
    [environment, fieldId, itemId, projectId, onIssueUpdate],
  )

  const filterItems = useCallback((v: string) => {
    setFilter(v)
  }, [])

  const items = useMemo(() => {
    const iterations = (fieldData.configuration?.iterations || []).concat(
      fieldData.configuration?.completedIterations || [],
    )

    const iterationsData = iterations.map(i =>
      // eslint-disable-next-line no-restricted-syntax
      readInlineData<IterationFieldIterationFragment$key>(IterationFieldIterationFragment, i),
    )
    if (!filter) return iterationsData
    return iterationsData.filter(l => l.title.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
  }, [fieldData.configuration?.completedIterations, fieldData.configuration?.iterations, filter])

  const completedIds = useMemo(() => {
    const iterations = fieldData.configuration?.completedIterations || []
    return new Set(
      // eslint-disable-next-line no-restricted-syntax
      iterations.map(i => readInlineData<IterationFieldIterationFragment$key>(IterationFieldIterationFragment, i).id),
    )
  }, [fieldData.configuration?.completedIterations])

  const selectedItems = useMemo(() => {
    const activeIterations = fieldData.configuration?.iterations || []
    const completedIterations = fieldData.configuration?.completedIterations || []
    const iterations = activeIterations.concat(completedIterations)

    const iterationsData = iterations.map(i =>
      // eslint-disable-next-line no-restricted-syntax
      readInlineData<IterationFieldIterationFragment$key>(IterationFieldIterationFragment, i),
    )
    return iterationsData.filter(i => i.id === valueData?.iterationId)
  }, [fieldData.configuration?.completedIterations, fieldData.configuration?.iterations, valueData?.iterationId])

  const convertToItemProps = useCallback(
    (option: IterationFieldIterationFragment$data): ExtendedItemProps<IterationFieldIterationFragment$data> => {
      return {
        id: option.id,
        children: (
          <IterationItem startDate={option.startDate} durationInDays={option.duration} titleHTML={option.titleHTML} />
        ),
        source: option,
        groupId: completedIds.has(option.id) ? completedGroup.groupId : activeGroup.groupId,
      }
    },
    [completedIds],
  )

  const renderAnchor = useCallback(
    (anchorProps: React.HTMLAttributes<HTMLElement>) => {
      return (
        <FieldWrapper
          showInput={showInput}
          setShowInput={setShowInput}
          anchorProps={anchorProps}
          placeholder={LABELS.emptySections.iterationPlaceholder}
          value={
            valueData ? (
              <IterationItem
                startDate={valueData.startDate}
                durationInDays={valueData.duration}
                titleHTML={valueData.titleHTML}
              />
            ) : null
          }
          name={fieldName}
        />
      )
    },
    [fieldName, showInput, valueData],
  )

  const groups = useMemo(() => {
    return completedIds.size > 0 ? [activeGroup, completedGroup] : [activeGroup]
  }, [completedIds.size])

  if (!viewerCanUpdate)
    return (
      <FieldWrapper
        showInput={showInput}
        setShowInput={setShowInput}
        value={
          valueData ? (
            <IterationItem
              startDate={valueData.startDate}
              durationInDays={valueData.duration}
              titleHTML={valueData.titleHTML}
            />
          ) : null
        }
        placeholder={LABELS.emptySections.noValue(fieldName)}
        canUpdate={false}
        name={fieldName}
      />
    )

  return (
    <ItemPicker
      items={items}
      groups={groups}
      initialSelectedItems={selectedItems}
      filterItems={filterItems}
      getItemKey={i => i.id}
      convertToItemProps={convertToItemProps}
      placeholderText={LABELS.emptySections.iterationFilterPlaceholder}
      selectionVariant="single"
      onSelectionChange={onSelectionChange}
      renderAnchor={renderAnchor}
    />
  )
}
