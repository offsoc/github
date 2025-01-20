import {Flash, useConfirm} from '@primer/react'
import {useCallback} from 'react'

import {MemexColumnDataType} from '../api/columns/contracts/memex-column'
import type {ColumnModel} from '../models/column-model'
import {SettingsResources, WorkflowResources} from '../strings'

interface Args {
  field: ColumnModel
  values: Array<string>
  /** Number of items in the project that this will impact. */
  affectedItems: number
  /** Number of workflows that this will impact. */
  affectedWorkflows: number
}

export const useConfirmDeleteFieldValues = () => {
  const confirm = useConfirm()

  return useCallback(
    async (args: Args) =>
      args.values.length === 0 // no-op; nothing to delete
        ? false
        : confirm({
            title: SettingsResources.deleteValuesTitle(args.field.dataType, args.values.length),
            content: <Content {...args} />,
            confirmButtonContent: 'Delete',
            confirmButtonType: 'danger',
          }),
    [confirm],
  )
}

const Warning = ({children}: {children: React.ReactNode}) => (
  <Flash variant="danger" as="p" sx={{p: 2}}>
    <span className="sr-only">Warning: </span>
    {children}
  </Flash>
)

const Content = ({field, values: options, affectedItems, affectedWorkflows}: Args) => {
  const intro =
    field.dataType === MemexColumnDataType.Iteration
      ? SettingsResources.deleteIterationValuesIntro(field.name, options.length)
      : SettingsResources.deleteValuesIntro(field.dataType, field.name, options.length)
  const itemsWarning =
    affectedItems > 0
      ? field.dataType === MemexColumnDataType.Iteration
        ? SettingsResources.deleteIterationValuesAffectedItemsWarning(options.length, affectedItems)
        : SettingsResources.deleteValuesAffectedItemsWarning(field.dataType, options.length, affectedItems)
      : null
  const workflowsWarning =
    affectedWorkflows > 0
      ? WorkflowResources.deleteValuesAffectedWorkflowsWarning(field.dataType, options.length, affectedWorkflows)
      : null

  return (
    <>
      <p>
        {intro} <strong>{SettingsResources.cannotBeUndone}</strong>
      </p>
      {itemsWarning && <Warning>{itemsWarning}</Warning>}
      {workflowsWarning && <Warning>{workflowsWarning}</Warning>}
    </>
  )
}
