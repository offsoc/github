import type {TaskItem as TaskItemType} from './constants/types'
import {useQuerySelectorAll as useQuerySelectorAllHook} from './use-query-selector-all'
import {useTasklistData as useTasklistDataHook} from './use-tasklist-data'

export type TaskItem = TaskItemType

export const useQuerySelectorAll = useQuerySelectorAllHook

export const useTasklistData = useTasklistDataHook
