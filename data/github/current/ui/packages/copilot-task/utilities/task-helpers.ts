import {
  type FocusedGenerativeTaskData,
  type FocusedSuggestionTaskData,
  type FocusedTaskData,
  TaskTypes,
} from './copilot-task-types'

export function isSuggestionTask(task: FocusedTaskData | undefined): task is FocusedSuggestionTaskData {
  return task?.type === TaskTypes.Suggestion
}

export function isGenerativeTask(task: FocusedTaskData | undefined): task is FocusedGenerativeTaskData {
  return task?.type === TaskTypes.Generative
}
