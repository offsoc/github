import type {OnDropArgs} from '@github-ui/drag-and-drop'
import {useSyncedState} from '@github-ui/use-synced-state'
import {useCallback} from 'react'

import type {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {NewSingleOption, PersistedOption} from '../../api/columns/contracts/single-select'
import {
  SettingsFieldOptionAdd,
  SettingsFieldOptionDelete,
  SettingsFieldOptionOrder,
  type StatsSettingsFieldOption,
} from '../../api/stats/contracts'
import type {SettingsOption} from '../../helpers/new-column'
import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import {buildNewSingleSelectOption} from '../../helpers/util'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useIncrementer} from '../../hooks/use-incrementer'
import type {ColumnModelForDataType} from '../../models/column-model'
import {Resources} from '../../strings'

type ColumnSettingsContext = {
  ui: StatsSettingsFieldOption['ui']
  column?: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>
  onChangeCallback?: () => void
}

const defaultOptions: Array<PersistedOption> = []
export const useColumnSettings = ({ui, column, onChangeCallback}: ColumnSettingsContext) => {
  const [options, setOptions] = useSyncedState<Array<SettingsOption>>(() => {
    return column?.settings.options ?? defaultOptions
  })

  const [persistedOptions, setPersistedOptions] = useSyncedState<Array<SettingsOption>>(() => {
    return column?.settings.options ?? defaultOptions
  })

  const revertMutations = useCallback(() => {
    setOptions(persistedOptions)
  }, [persistedOptions, setOptions])

  const commitMutations = useCallback(() => {
    setPersistedOptions(options)
  }, [options, setPersistedOptions])

  const {postStats} = usePostStats()

  const postChangeStats = useCallback(
    (name: StatsSettingsFieldOption['name'], ctx?: string) => {
      postStats({
        name,
        ui,
        context: ctx,
        memexProjectColumnId: column?.id,
      })
    },
    [column?.id, postStats, ui],
  )

  const onDrop = useCallback(
    ({dragMetadata, dropMetadata, isBefore}: OnDropArgs<string>) => {
      if (dragMetadata.id === dropMetadata?.id) {
        return
      }

      setOptions(currentOptions => {
        const reorderedOption = not_typesafe_nonNullAssertion(currentOptions.find(({id}) => id === dragMetadata.id))

        return currentOptions.reduce<Array<SettingsOption>>((newOptions, option) => {
          if (option.id === reorderedOption.id) {
            return newOptions
          }

          if (option.id !== dropMetadata?.id) {
            newOptions.push(option)
          } else if (isBefore) {
            newOptions.push(reorderedOption, option)
          } else if (!isBefore) {
            newOptions.push(option, reorderedOption)
          }

          return newOptions
        }, [])
      })

      onChangeCallback?.()
      postChangeStats(SettingsFieldOptionOrder)
    },
    [setOptions, onChangeCallback, postChangeStats],
  )

  const getNextID = useIncrementer({start: 1})

  const addOption = useCallback(
    (option: NewSingleOption) => {
      const newOption = buildNewSingleSelectOption(getNextID(), option, options)

      // append a new numbered option to the end of the options list
      const newOptions = [...options, newOption]
      setOptions(newOptions)

      // Note that for the sake of stats the options count is the number of options
      // currently shown in the UI, not the number of non-empty options that have
      // or will be persisted.
      postChangeStats(SettingsFieldOptionAdd, `${Resources.newOptionsCount}: ${newOptions.length}`)
      onChangeCallback?.()
    },
    [options, getNextID, setOptions, postChangeStats, onChangeCallback],
  )

  const updateOption = useCallback(
    (updatedOption: SettingsOption) => {
      setOptions(currentOptions =>
        currentOptions.map(option => (option.id === updatedOption.id ? updatedOption : option)),
      )
      onChangeCallback?.()
    },
    [setOptions, onChangeCallback],
  )

  const canRemoveOption = options.length > 1

  const removeOption = useCallback(
    (id: string) => {
      if (canRemoveOption) {
        const newOptions = options.filter(option => option.id !== id)
        setOptions(newOptions)
        onChangeCallback?.()

        // Note that for the sake of stats the options count is the number of options
        // currently shown in the UI, not the number of non-empty options that have
        // or will be persisted.
        postChangeStats(SettingsFieldOptionDelete, `${Resources.newOptionsCount}: ${newOptions.length}`)
      }
    },
    [canRemoveOption, options, setOptions, onChangeCallback, postChangeStats],
  )

  return {
    options,
    persistedOptions,
    commitMutations,
    revertMutations,
    onDrop,
    canRemoveOption,
    addOption,
    updateOption,
    removeOption,
  }
}
