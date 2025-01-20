import {testIdProps} from '@github-ui/test-id-props'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList'
import {useCallback, useMemo} from 'react'

import type {Iteration, IterationValue} from '../../api/columns/contracts/iteration'
import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import {SanitizedHtml} from '../../components/dom/sanitized-html'
import {CurrentIterationLabel} from '../../components/fields/iteration/iteration-label'
import {filterSuggestedIterationOptions} from '../../helpers/iteration-suggester'
import {intervalDatesDescription, isCurrentIteration} from '../../helpers/iterations'
import type {FuzzyFilterData} from '../../helpers/suggester'
import type {SuggestedIterationOption} from '../../helpers/suggestions'
import type {IterationColumnModel} from '../../models/column-model/custom/iteration'
import {useNavigate} from '../../router'
import {useProjectRouteParams} from '../../router/use-project-route-params'
import {PROJECT_SETTINGS_FIELD_ROUTE} from '../../routes'
import {useUpdateItem} from '../use-update-item'

export const convertOptionToItem = (option: SuggestedIterationOption): ItemProps & SuggestedIterationOption => {
  const ItemContent = <SanitizedHtml sx={{display: 'block'}}>{option.titleHtml}</SanitizedHtml>
  return {
    ...option,
    children: ItemContent,
    ...testIdProps('table-cell-editor-row'),
  }
}

export const getName = (option: Iteration) => {
  return option.title
}

export const getOptionMatchingFilterValue = (
  filterValue: string,
  option: SuggestedIterationOption,
): SuggestedIterationOption | null => {
  const optionLabel = option.title

  if (optionLabel.toLowerCase() !== filterValue.toLowerCase()) {
    return null
  }

  return option
}

type UseIterationEditorProps = {
  model: SidePanelItem
  iteration: Iteration | null
  columnModel: IterationColumnModel
  onSaved?: () => void
}

export function useIterationEditor({model, iteration, columnModel, onSaved}: UseIterationEditorProps) {
  const {updateItem} = useUpdateItem()
  const navigate = useNavigate()

  const {settings} = columnModel

  const selectedValue = iteration
  const selectedValueId = selectedValue?.id

  const activeOptions: Array<SuggestedIterationOption> = useMemo(() => {
    const iterations = settings.configuration.iterations
    if (iterations.length > 0) {
      const now = new Date()
      return iterations.map(option => {
        const description = intervalDatesDescription(option)
        const isCurrent = isCurrentIteration(now, option)

        return {
          ...option,
          title: option.title,
          titleHtml: option.titleHtml,
          description,
          descriptionVariant: 'block',
          selected: selectedValueId === option.id,
          groupId: 'active',
          trailingIcon: isCurrent ? CurrentIterationLabel : null,
        }
      })
    }
    return [
      {
        id: 'create-iteration',
        title: 'Create an Iteration',
        titleHtml: 'Create an iteration',
        startDate: '',
        duration: 0,
        selected: false,
        groupId: 'active',
      },
    ]
  }, [settings, selectedValueId])

  const completedOptions: Array<SuggestedIterationOption> = useMemo(() => {
    const completedIterations = settings.configuration.completedIterations
    if (completedIterations.length > 0) {
      return completedIterations.map(option => {
        const description = intervalDatesDescription(option)
        return {
          ...option,
          title: option.titleHtml,
          description,
          descriptionVariant: 'block',
          selected: selectedValueId === option.id,
          groupId: 'completed',
        }
      })
    }
    return []
  }, [settings, selectedValueId])

  const selected = useMemo(
    () =>
      // ensure the active or completed iterations are checked to find a
      // selected item
      [...activeOptions, ...completedOptions].filter(o => o.selected),
    [activeOptions, completedOptions],
  )

  const projectRouteParams = useProjectRouteParams()

  const saveSelected = useCallback(
    async (nextSelected: Array<SuggestedIterationOption>) => {
      // this is the case when user has no active iteration in drop down
      // and we want to take them to settings page so they can make one
      if (nextSelected[0]?.id === 'create-iteration') {
        navigate({
          pathname: PROJECT_SETTINGS_FIELD_ROUTE.generatePath({
            ...projectRouteParams,
            fieldId: columnModel.id,
          }),
        })
      } else {
        await updateItem(model, {
          memexProjectColumnId: columnModel.id,
          dataType: MemexColumnDataType.Iteration,
          value: {id: nextSelected[0]?.id ?? null} as IterationValue,
        })
        if (onSaved) {
          onSaved()
        }
      }
    },
    [navigate, columnModel.id, updateItem, model, onSaved, projectRouteParams],
  )

  const filterChange = useCallback(
    (
      searchQuery: string,
      suggestionsData: Array<SuggestedIterationOption>,
      maxSuggestions: number,
    ): FuzzyFilterData<SuggestedIterationOption> => {
      const options = searchQuery.length > 0 ? [...activeOptions, ...completedOptions] : suggestionsData
      return filterSuggestedIterationOptions(searchQuery, options, maxSuggestions)
    },
    [activeOptions, completedOptions],
  )

  return {
    activeOptions,
    completedOptions,
    selected,
    saveSelected,
    filterChange,
  }
}
