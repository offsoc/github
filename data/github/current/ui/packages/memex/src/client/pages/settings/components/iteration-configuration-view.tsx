import {useCallback} from 'react'

import type {IterationConfiguration} from '../../../api/columns/contracts/iteration'
import type {IterationColumnModel} from '../../../models/column-model/custom/iteration'
import {useUpdateIterationConfiguration} from '../../../state-providers/columns/use-update-iteration-configuration'
import {IterationFieldOptions} from './iteration-field-options'

export const IterationConfigurationView = ({column}: {column: IterationColumnModel}) => {
  const {updateIterationConfiguration} = useUpdateIterationConfiguration()

  const onUpdateConfiguration = useCallback(
    async (changes: Partial<IterationConfiguration>) => {
      await updateIterationConfiguration(column, changes)
    },
    [column, updateIterationConfiguration],
  )

  return (
    <IterationFieldOptions
      key={column.id}
      column={column}
      fieldName={column.name}
      serverConfiguration={column.settings.configuration}
      onUpdate={onUpdateConfiguration}
    />
  )
}
