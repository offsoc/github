import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {PlusIcon} from '@primer/octicons-react'
import {Text} from '@primer/react'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList/Item'
import {memo, useCallback, useState} from 'react'

import type {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import type {NewOption, SingleSelectValue} from '../../../api/columns/contracts/single-select'
import {replaceShortCodesWithEmojis} from '../../../helpers/emojis'
import {getInitialState, isOptionLimitReached} from '../../../helpers/initial-state'
import {emptySingleSelectOption} from '../../../helpers/new-column'
import {filterSuggestedSingleSelectOptions} from '../../../helpers/single-select-suggester'
import {getOptionMatchingFilterValue, type SuggestedSingleSelectOption} from '../../../helpers/suggestions'
import {convertOptionToItem, getName, useSingleSelectEditor} from '../../../hooks/editors/use-single-select-editor'
import type {ColumnModelForDataType} from '../../../models/column-model'
import {isAnySingleSelectColumnModel} from '../../../models/column-model/guards'
import {type ColumnValue, hasValue} from '../../../models/column-value'
import {FocusType} from '../../../navigation/types'
import {useFindColumn} from '../../../state-providers/columns/use-find-column'
import {useUpdateOptions} from '../../../state-providers/columns/use-update-options'
import {Resources} from '../../../strings'
import {SingleSelectOptionModal} from '../../fields/single-select/single-select-option-modal'
import {moveTableFocus, useStableTableNavigation} from '../navigation'
import {SingleSelectRenderer} from '../renderers'
import {SelectPanelEditor, type TSelectPanelEditorProps} from './select-panel-editor'

type AdditionalProps = {
  currentValue: ColumnValue<SingleSelectValue>
  columnModel: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>
}

const SingleSelectEditorFunc: React.FC<TSelectPanelEditorProps & AdditionalProps> = memo(
  ({model, columnModel, currentValue, ...props}) => {
    const {navigationDispatch} = useStableTableNavigation()
    const {addColumnOption} = useUpdateOptions()
    const {findColumn} = useFindColumn()
    const {
      projectLimits: {singleSelectColumnOptionsLimit},
    } = getInitialState()
    const selectedValueId = hasValue(currentValue) ? currentValue.value.id : null
    const {saveSelected, options, selected} = useSingleSelectEditor({columnModel, model, selectedValueId})

    const renderButton = useCallback(() => {
      return (
        <SingleSelectRenderer
          currentValue={currentValue}
          model={model}
          columnId={props.columnId}
          options={columnModel.settings.options}
        />
      )
    }, [currentValue, model, props.columnId, columnModel])

    const optionLimitReached = isOptionLimitReached(options)

    const [initialCreatingOption, setInitialCreatingOption] = useState<NewOption | null>(null)

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

    const allOptionsGray = options.every(option => option.color === 'GRAY')

    const convertOption = useCallback(
      (option: SuggestedSingleSelectOption) => convertOptionToItem(option, !allOptionsGray),
      [allOptionsGray],
    )

    // Don't render the dialog and the editor at the same time or the clickoutside handler
    // will be triggered when the user clicks in the dialog, closing the whole thing
    return initialCreatingOption ? (
      <SingleSelectOptionModal
        initialOption={initialCreatingOption}
        onSave={onSaveNewOption}
        onCancel={() => setInitialCreatingOption(null)}
      />
    ) : (
      <SelectPanelEditor<SuggestedSingleSelectOption>
        model={model}
        fetchOptions={noop}
        placeholderText="Filter options"
        selected={selected}
        options={options}
        filterOptions={filterSuggestedSingleSelectOptions}
        getSortAttribute={getName}
        convertOptionToItem={convertOption}
        saveSelected={saveSelected}
        renderButton={renderButton}
        renderCreateNewOption={renderCreateNewOption}
        getOptionMatchingFilterValue={getOptionMatchingFilterValue}
        singleSelect
        height="initial"
        maxHeight="large"
        {...props}
      />
    )
  },
)

SingleSelectEditorFunc.displayName = 'SingleSelectEditor'

export const SingleSelectEditor = memo(SingleSelectEditorFunc)
