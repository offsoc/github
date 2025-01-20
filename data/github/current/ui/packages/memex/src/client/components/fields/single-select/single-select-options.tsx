import {announce} from '@github-ui/aria-live'
import {Heading} from '@primer/react'
import {useEffect} from 'react'

import type {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import {CommitState} from '../../../hooks/use-autosave'
import {useSingleSelectOptions} from '../../../hooks/use-single-select-options'
import type {ColumnModelForDataType} from '../../../models/column-model'
import {errorStyle} from '../../common/state-style-decorators'
import {AutosaveMessage} from '../autosave-message'
import {SingleSelectForm} from './single-select-form'

type ColumnSettingsViewProps = {
  column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>
}

export const SingleSelectOptions: React.FC<ColumnSettingsViewProps> = ({column: externalColumn}) => {
  const {
    commitState,
    // column settings
    options,
    onDrop,
    addOption,
    canRemoveOption,
    removeOption,
    updateOption,
    // error message
    errorMessage,
  } = useSingleSelectOptions({externalColumn})

  useEffect(() => {
    if (commitState === CommitState.Successful) {
      announce('Saved!')
    }
  }, [commitState])

  const additionalStyle = commitState === CommitState.Failed ? errorStyle : {}

  return (
    <>
      <Heading as="h3" sx={{fontSize: 1, mt: 4, mb: 2}} aria-label={`${externalColumn.name} options`}>
        Options
      </Heading>
      <SingleSelectForm
        options={options}
        onAddOption={addOption}
        onUpdateOption={updateOption}
        onRemoveOption={removeOption}
        canRemoveOption={canRemoveOption}
        sx={additionalStyle}
        onDrop={onDrop}
      />
      <AutosaveMessage commitState={commitState} errorMessage={errorMessage} />
    </>
  )
}
