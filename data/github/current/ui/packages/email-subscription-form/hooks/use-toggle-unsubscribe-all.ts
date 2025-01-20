import {useCallback, type ChangeEvent, type MutableRefObject} from 'react'
import type {TopicsRef} from '../types'

export function useToggleUnsubscribeAll(
  currentSubscribedIds: string[],
  toggleSubmitDisabled: () => void,
  topicsRef: MutableRefObject<TopicsRef>,
): (ev: ChangeEvent) => void {
  return useCallback(
    (ev: ChangeEvent) => {
      const unsubAllInput = ev.target as HTMLInputElement

      if (unsubAllInput.checked) {
        // on unsub all checkbox is checked, click topicCheckbox that are checked
        for (const topicInputGroup of Object.values(topicsRef.current)) {
          if (topicInputGroup) {
            const topicCheckbox = topicInputGroup.querySelector('input[type="checkbox"]') as HTMLInputElement
            if (topicCheckbox && topicCheckbox.checked) {
              topicCheckbox.click()
            }
          }
        }
      } else {
        // on unsub all checkbox is unchecked, click topicCheckbox that are unchecked and were previously subscribed
        for (const [topicId, topicInputGroup] of Object.entries(topicsRef.current)) {
          if (topicInputGroup) {
            const topicCheckbox = topicInputGroup.querySelector('input[type="checkbox"]') as HTMLInputElement
            if (topicCheckbox && !topicCheckbox.checked && currentSubscribedIds.includes(topicId)) {
              topicCheckbox.click()
            }
          }
        }
      }

      toggleSubmitDisabled()
    },
    [currentSubscribedIds, toggleSubmitDisabled, topicsRef],
  )
}
