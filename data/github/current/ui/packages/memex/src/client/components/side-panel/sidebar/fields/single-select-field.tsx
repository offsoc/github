import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {PlusIcon} from '@primer/octicons-react'
import {Text} from '@primer/react'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList/Item'
import {useCallback, useState} from 'react'

import type {MemexColumnDataType} from '../../../../api/columns/contracts/memex-column'
import type {NewOption, PersistedOption} from '../../../../api/columns/contracts/single-select'
import {replaceShortCodesWithEmojis} from '../../../../helpers/emojis'
import {getInitialState, isOptionLimitReached} from '../../../../helpers/initial-state'
import {emptySingleSelectOption} from '../../../../helpers/new-column'
import {filterSuggestedSingleSelectOptions} from '../../../../helpers/single-select-suggester'
import {getOptionMatchingFilterValue, type SuggestedSingleSelectOption} from '../../../../helpers/suggestions'
import {convertOptionToItem, getName, useSingleSelectEditor} from '../../../../hooks/editors/use-single-select-editor'
import type {ColumnModelForDataType} from '../../../../models/column-model'
import {isAnySingleSelectColumnModel} from '../../../../models/column-model/guards'
import {FocusType} from '../../../../navigation/types'
import {useFindColumn} from '../../../../state-providers/columns/use-find-column'
import {useUpdateOptions} from '../../../../state-providers/columns/use-update-options'
import {Resources} from '../../../../strings'
import {SingleSelectOptionModal} from '../../../fields/single-select/single-select-option-modal'
import {SingleSelectToken} from '../../../fields/single-select/single-select-token'
import {moveTableFocus, useStableTableNavigation} from '../../../react_table/navigation'
import {
  type SidebarCustomFieldProps,
  SidebarField,
  type SidebarFieldEditorProps,
  type SidebarFieldRendererProps,
} from './sidebar-field'
import {SidebarSelectPanel} from './sidebar-select-panel'
import {TextValueWithFallback} from './text-value-with-fallback'

export const SingleSelectField = (
  props: SidebarCustomFieldProps<PersistedOption, ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>>,
) => <SidebarField {...props} renderer={SingleSelectRenderer} editor={SingleSelectEditor} />

const SingleSelectEditor = ({
  model,
  columnModel,
  content: matchingOption,
  onSaved,
}: SidebarFieldEditorProps<PersistedOption, ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>>) => {
  const selectedValueId = matchingOption ? matchingOption.id : null
  const {saveSelected, options, selected} = useSingleSelectEditor({columnModel, model, selectedValueId, onSaved})
  const {addColumnOption} = useUpdateOptions()
  const {findColumn} = useFindColumn()
  const {navigationDispatch} = useStableTableNavigation()
  const [initialCreatingOption, setInitialCreatingOption] = useState<NewOption | null>(null)
  const {
    projectLimits: {singleSelectColumnOptionsLimit},
  } = getInitialState()
  const allOptionsGray = options.every(option => option.color === 'GRAY')
  const convertOption = useCallback(
    (option: SuggestedSingleSelectOption) => convertOptionToItem(option, !allOptionsGray),
    [allOptionsGray],
  )
  const optionLimitReached = isOptionLimitReached(options)

  const onSaveNewOption = useCallback(
    async (option: NewOption) => {
      setInitialCreatingOption(null)

      await addColumnOption(columnModel, option)
      const column = findColumn(columnModel.id)
      // The response of addColumnOption does not have any information about the particular
      // option that was just created, it's just the entire set of options.
      // Therefore, we rely on finding the newly created option by name
      const addedOption = isAnySingleSelectColumnModel(column)
        ? column.settings.options.find(({name}) => name === option.name)
        : undefined

      if (addedOption) saveSelected([{...addedOption, selected: true}])

      navigationDispatch(moveTableFocus({focusType: FocusType.Focus}))
    },
    [addColumnOption, columnModel, findColumn, saveSelected, navigationDispatch],
  )

  const renderCreateNewOption = useCallback(
    (optionName: string): ItemProps => {
      const sanitizedOptionName = replaceShortCodesWithEmojis(optionName)
      if (optionLimitReached) {
        return {
          ...testIdProps('table-cell-editor-max-options-length-row'),
          text: Resources.singleSelectOptionLimitWarning(singleSelectColumnOptionsLimit),
          disabled: true,
        }
      }

      return {
        description: 'Create new option',
        descriptionVariant: 'block',
        leadingVisual: PlusIcon,
        children: (
          <Text
            sx={{
              color: 'accent.emphasis',
              wordBreak: 'break-all',
            }}
          >
            <strong>{sanitizedOptionName}</strong>
          </Text>
        ),
        onAction: async (_, event) => {
          event.preventDefault()
          setInitialCreatingOption({...emptySingleSelectOption, name: sanitizedOptionName})
        },
        ...testIdProps('add-column-option'),
      }
    },
    [optionLimitReached, singleSelectColumnOptionsLimit],
  )

  return initialCreatingOption ? (
    <SingleSelectOptionModal
      initialOption={initialCreatingOption}
      onSave={onSaveNewOption}
      onCancel={() => setInitialCreatingOption(null)}
    />
  ) : (
    <SidebarSelectPanel<SuggestedSingleSelectOption>
      model={model}
      columnId={columnModel.id.toString()} // TODO: make this better
      getSortAttribute={getName}
      convertOptionToItem={convertOption}
      initialFilterValue=""
      selected={selected}
      saveSelected={saveSelected}
      fetchOptions={noop}
      options={options}
      filterOptions={filterSuggestedSingleSelectOptions}
      placeholderText="Filter options"
      displayValue={<SingleSelectRenderer model={model} columnModel={columnModel} content={matchingOption} />}
      singleSelect
      renderCreateNewOption={renderCreateNewOption}
      getOptionMatchingFilterValue={getOptionMatchingFilterValue}
    />
  )
}

const SingleSelectRenderer = ({
  columnModel,
  content: matchingOption,
}: SidebarFieldRendererProps<PersistedOption, ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>>) =>
  matchingOption ? (
    <SingleSelectToken option={matchingOption} />
  ) : (
    <TextValueWithFallback columnName={columnModel.name} columnType={columnModel.dataType} />
  )
